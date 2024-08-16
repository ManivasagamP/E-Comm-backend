const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel'); 
const sendEmail = require('../utils/email');
const ErrorHandler = require("../utils/errorHandler"); 
const sendToken = require('../utils/jwt')
const crypto = require('crypto')

// Register User = /api/v1/register
exports.registerUser = catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body

    let avatar;
    if(req.file){
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
    }


    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user,201,res)
})


// Login User = /api/v1/login
exports.loginUser = catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body

    if(!email || !password){
        return next(new ErrorHandler('Please enter Email and Password',400))
    }

    //finding the user database
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorHandler('Invalid Email or Password',401))
    }

    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid Email or Password',401))
    }

    sendToken(user,201,res)

})


// Logout user = /api/v1/logout
exports.logoutUser =(req,res,user)=> {
    res.cookie('token',null),{
        expires: new Date(Date.now()),
        httpOnly:true
    }

    res.status(200).json({
        success:true,
        message:"Looged out"
    })
}


//Forgot Password = /api/v1/password/forgot
exports.forgotPassword = catchAsyncError( async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler('User not found with this Email',404))
    }

    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave : false})

    //create reset Url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken} `

    const message =`Your Password reset url token as follow \n\n 
    ${resetUrl}\n\n If you have not requested this email,pls ignore it.`

    try{

        sendEmail({
            email : user.email,
            subject : " Ecom Password Recovery",
            message
        })

        res.status(200).json({
            success : true,
            message : `Email sent to ${user.email}`
        })

    }catch(error){
        user.resetPasswordToken = undefined,
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave : false});
        return next(new ErrorHandler(error.message),500)
    }
    }
)


// Reset Password = /api/v1/rpassword/reset/:token
exports.resetPassword = catchAsyncError(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne( {
        resetPasswordToken,
        resetPasswordTokenExpire :{
            $gt : Date.now()
        }
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is Invalid or Expired'))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match'))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({validateBeforeSave: false})

    sendToken(user,201,res)


})

//User Profile = /api/v1/myprofile
exports.getUserProfile = catchAsyncError( async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })
})

//Change Password = /api/v1//password/change
exports.changePassword = catchAsyncError( async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    
    //check old Password
    if(!await user.isValidPassword(req.body.oldPassword)){
        return next( new ErrorHandler('Old password is incorret'),401)
    }

    //Assinging new Password
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success : true,
    })
})

//Update Profile = /api/v1/update
exports.updateProfile = catchAsyncError( async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators: true,
    })

    res.status(200).json({
        success : true,
        user
    })
})

//Admin: Get All users = /api/v1/admin/users
exports.getAllUsers = catchAsyncError( async(req,res,next)=>{
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

//Admin: Get specific users = /api/v1/admin/user/:id
exports.getUser = catchAsyncError( async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next( new ErrorHandler(`User not fount with this id ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
    })
})

//Admin: Update Users = /api/v1/admin/user/:id
exports.UpdateUser = catchAsyncError( async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators: true,
    })

    res.status(200).json({
        success : true,
        user
    })
})

//Admin: Del User = /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError( async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next( new ErrorHandler(`User not fount with this id ${req.params.id}`))
    }
    await user.deleteOne();
    res.status(200).json({
        success : true,
    })

})
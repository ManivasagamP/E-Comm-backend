const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel'); 
const sendEmail = require('../utils/email');
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require('../utils/jwt')
const crypto = require('crypto')


exports.registerUser = catchAsyncError(async(req,res,next)=>{
    const {name,email,password,avatar}=req.body
    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user,201,res)
})

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
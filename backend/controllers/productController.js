const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures')

//Get products-/api/v1/products
exports.getProducts = catchAsyncError(async(req,res,next) =>{

    const resPerPage = 3;
    const apiFeatures = new ApiFeatures(Product.find(),req.query).search().filter().paginate(resPerPage);

    const products = await apiFeatures.query;
    const totalProductsCount = await Product.countDocuments({});
    res.status(200).json({
        success:true,
        count:totalProductsCount,
        resPerPage,
        products
    })
});


//Create Product-/api/v1/product/new
exports.newProduct = catchAsyncError(async(req,res,next)=>{

    req.body.user=req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })
});

//Get single Product - /api/v1/product/:id
exports.getSingleProduct = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found ',400));
    }
    res.status(201).json({
        success:true,
        product 
    })
});

//Update Product- /api/v1/product/:id

exports.updateProduct = catchAsyncError(async(req,res,next)=>{
    let product= await Product.findById(req.params.id)

    if(!product){
        return res.status(404).json({
            success:false,
            message: "Product not found"     
        });
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new :true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        product   
    });
});

//Delete Product- /api/v1/product/:id

exports.deleteProduct = catchAsyncError(async(req,res,next)=>{
    const product= await Product.findById(req.params.id)

    if(!product){
        return res.status(404).json({
            success:false,
            message: "Product not found"     
        });
    }
    
    await product.deleteOne();

    res.status(200).json({
        success:true,
        message: "Product deleted"
    })
});

//Create Review - api/v1/review
exports.createReview = catchAsyncError(async(req,res,next)=>{
    const {productId, rating, comment} = req.body;

    const review = {
        user: req.user.id,
        rating: rating,
        comment: comment
    }

    const product = await Product.findById(productId);
    //Finding user is already has reviewed
    const isReveiwed = product.reviews.find(review => {
        return review.user.toString() == req.user.id.toString();
    })

    if(isReveiwed){
        //updating the review
        product.reviews.forEach(review =>{
            if(review.user.toString() == req.user.id.toString()){
                review.comment = comment,
                review.rating = rating
            }
        })

    }else{
        //creating the review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    //Find the avg of product reviews
    product.ratings = product.reviews.reduce((acc, review) => {
        return review.rating + acc
    },0) / product.reviews.length;
    product.ratings = isNaN(product.ratings)?0:product.ratings

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })

})

//Get Reviews = api/v1/reviews?id={productId} 
exports.getReviews = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews    
    })
})

//Delete Review = api/v1/review
exports.deleteReview = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    //Filtering the reviews which does not match the deleting review id
    const reviews = product.reviews.filter(review => {
       return review._id.toString() !== req.query.id.toString()
    });

    //Number of reviews
    const numOfReviews = reviews.length

    //Finding the avg with the filtered reviews
    let ratings = reviews.reduce((acc, review) => {
        return review.rating + acc
    },0) / reviews.length;
    ratings = isNaN(ratings)?0:ratings;

    //Saaving the product document
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        numOfReviews,
        ratings
    })

    res.status(200).json({
        success: true,
        
    })
})
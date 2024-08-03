const Product = require('../models/productModel');

//Get products-/api/v1/products
exports.getProducts = async(req,res,next) =>{

    const products = await Product.find();
    res.status(200).json({
        success:true,
        count:products.length,
        products
    })
};


//Create Product-/api/v1/product/new
exports.newProduct = async(req,res,next)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })
};

//Get single Product
exports.getSingleProduct = async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(404).json({
            success:false,
            message: "Product not found"     
        });
    }
    res.status(201).json({
        success:true,
        product 
    })
};
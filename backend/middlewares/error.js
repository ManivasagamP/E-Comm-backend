const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV == 'development'){
        res.status(err.statusCode).json({
            success : false,
            message : err.message,
            stack : err.stack,
            error : err 
        })
    }

    if(process.env.NODE_ENV == 'production'){
        let message = err.message;
        let error = new ErrorHandler(message,400)

        if(err.name == "ValidationError"){
            message = Object.values(err.errors).map(value => value.message)
            error = new ErrorHandler(message,400)
        }

        if(err.name == 'CastError'){
            message = 'Resource is not found ';
            error = new ErrorHandler(message,400)
        }

        res.status(err.statusCode).json({
            success : false,
            message : error.message || 'Internal server Error',
            
        })
    }
}
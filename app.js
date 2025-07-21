const express = require("express");
const app = express();
const dotenv = require('dotenv');
const errorMiddleware = require('./middlewares/error') 
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config({path:path.join(__dirname,"config/config.env")});

app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(path.join(__dirname,'uploads')))

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');
const payment = require('./routes/payment');

app.use('/api/v1/',products);
app.use('/api/v1/',auth);
app.use('/api/v1/',order);
app.use('/api/v1/',payment);

app.use(errorMiddleware)

module.exports = app;
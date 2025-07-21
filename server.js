const app = require('./app');
const path = require('path');
const connectDatabase = require('./config/database');


connectDatabase();

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is running at http://localhost:${process.env.PORT} port`)
});

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled rejection error');
    server.close(()=>{
        process.exit(1);
    });
})

process.on('uncaughtException', (err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught Exception error');
    server.close(()=>{
        process.exit(1);
    });
})


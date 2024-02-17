const {logEvents} = require('./logger');

const errorHandler = (err,req,res,next) => {

    logEvents(`${err.name} : ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}` , 'errLog.log');
    //console.log(err.stack );
    
    const status = res.statusCode ? res.statusCode : 500  //server error
    res.status(status).json({messge : err.message , isError : true});   //doesnt needed for crt responses becoz by default its 200

    next();

}

module.exports = errorHandler;
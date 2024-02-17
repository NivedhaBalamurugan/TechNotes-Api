const rateLimit = require('express-rate-limit');
const { logEvents } = require('./logger');
const { options } = require('../routes/root');

const loginLimiter = rateLimit({
  
    windowMs: 60 * 1000, // 1 min
    max : 5, //limits each ip to 5 login requests per window per min
    message : { message : 'too many login requests. Try after 1 min'},
    handler : (req,res,next,options) => {

        logEvents(`too many request : ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}` , 'errLog.log')
        res.status(options.statusCode).send(options.message)

    } ,
    standardHeaders : true ,  
    legacyHeaders : false,

})

module.exports = loginLimiter
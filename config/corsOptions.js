const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) != -1 || !origin)   //present in array can accees backend api
            callback(null, true)
        else
            callback(new Error('Not allowed by cors'))
    },
    credentials : true,
    optionsSuccessStatus: 200

}
module.exports = corsOptions;
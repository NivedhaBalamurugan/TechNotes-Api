require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const {logger , logEvents} = require('./middleware/logger');
const errorHandler = require('./middleware/errrorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const dbConn = require('./config/dbConn');
const mongoose = require('mongoose');

//require('express-async-errors') - instead of asynchandler wrapped in each method

const PORT = process.env.PORT || 3500;   //localhost or deployed

//connecting to db
dbConn();

//custom middleware
app.use(logger);


//3rd party middleware
app.use(cors(corsOptions));  //allows all public servers if no arg is passed, or only those in the list of allowed origins
app.use(cookieParser());


//built in middlewares - json,static
app.use(express.json());    
app.use('/',express.static(path.join(__dirname,'public')));  //export the static file


//routing
app.use('/', require('./routes/root'));      //root page
app.use('/auth' , require('./routes/authRoutes'));
app.use('/users' , require('./routes/userRoutes'));
app.use('/notes' , require('./routes/noteRoutes'));


app.all('*', (req, res) => {        //custom 404 //instead of hvaing routes-root, give res here itself
   
    res.status(404);                
    if (req.accepts('html')) 
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    else if (req.accepts('json')) 
        res.json({ "message": "404 Not Found" });
    else 
        res.type('txt').send("404 Not Found");

});


//custom middleware
app.use(errorHandler);


//integrating mongoose with backend server
mongoose.connection.once('open' , () => {

    console.log('connected to mongo db');
    app.listen(PORT, () => console.log(`server running on Port ${PORT}`))

})

mongoose.connection.on('error' , err => {

    console.log(err);
    logEvents(`${err.no} : ${err.code}\t${err.syscall}\t${err.hostname}` , 'mongoErrLog.log');

})

//app.use foolows water fall model
// so put routes to each care carefully
//route to 404 is gn at last useing app.all

// ./ indicates going to path from current dir, since server is in base dir, we can ./

///*environmental var inside rest api - values used in server*/

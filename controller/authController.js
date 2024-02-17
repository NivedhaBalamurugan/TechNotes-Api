const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');


//post - /auth - login

const login = asyncHandler(async (req,res) => {

    const {username,password} = req.body;

    if(!username || !password)
        return res.status(400).json({"message" : "All fields are required"});

    const founduser = await User.findOne({username}).exec();
    if(!founduser || !founduser.active )
        return res.status(400).json({"message" : "Unauthorized"});
    
    const match = await bcrypt.compare(password,founduser.password);
    if(!match)
        return res.status(400).json({"message" : "Unauthorized"});

    //produce tokens

    const accessToken = jwt.sign(
        {
            "UserInfo" : {
                "username" : username,
                "roles" : founduser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : '15m'}
    );

    const refreshToken = jwt.sign(
        {   "username" : username   },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : '7d'}
    );


    //sets a secure cookie with refresh token - client doesnt handle cokie

    res.cookie('jwt', refreshToken, {
        httpOnly:true,      //accessibe only by web browser
        secure:true,        //https
        sameSite:'None',    //cross site cookie
        maxAge: 7*24*60*60*1000  //in milliseconds for 7 days-same as that of refresh token expiry 
    });

    res.json({accessToken});  //send then access token

})

//get - /auth/refresh - refreshtoken

const refresh = asyncHandler( async( req,res) => {

    const cookies = req.cookies;
    console.log(cookies)
    if(!cookies?.jwt)
        return res.status(401).json({"message" : "Unauthorized2"});

    //verify the refresh token to issue a new access token

    const refreshToken = cookies.jwt    
 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async(err,decoded) => {

            if(err)
                return res.status(403).json({"message" : "Forbidden"})

            const founduser = await User.findOne({username : decoded.username}).exec();
            if(!founduser)  
                return res.status(401).json({"message" : "Unauthorized1"})

            const accessToken = jwt.sign(
                {
                    "UserInfo" : {
                        "username" : founduser.username,
                        "roles" : founduser.roles
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn : '15m'}
            )
            
            return res.json({accessToken});

        })
    )


})

//post - /auth/logout - logout

const logout = asyncHandler( async (req,res) => {

    const cookies = req.cookies
    if(!cookies?.jwt)
        return res.sendStatus(204);     //success buyt no content

    //clear cookie
    res.clearCookie('jwt', {
        httpOnly:true,      //accessibe only by web browser
        secure:true,        //https
        sameSite:'None',    //cross site cookie
        maxAge: 7*24*60*60*1000  //in milliseconds for 7 days-same as that of refresh token expiry 
    })    

    res.json({"message" : "Cookie cleared"})

})

module.exports = {
    login ,
    refresh,
    logout
}
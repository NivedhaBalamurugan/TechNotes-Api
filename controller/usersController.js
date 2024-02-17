const User = require('../model/User');
const Note = require('../model/Note');
const asyncHandler = require('express-async-handler');  //instead of using try catch blocks
const bcrypt = require('bcrypt');

//get users GET

const getAllUsers = asyncHandler(async (req,res) => {

    const response = await User.find().select('-password').lean(); //exclude password , lean will give data like json
    if(!response?.length)
        return res.status(400).json({"message" : "No users found"});
    else
        return res.status(200).json(response);

})

//create a new user POST

const createNewUser = asyncHandler(async (req,res) => {

    const {username, password, roles} = req.body ; //getting info from req - form data
    if(!username || !password || !Array.isArray(roles) || !roles.length )    
        return res.status(400).json({"message" : "All fields are required"});

    const duplicate = await User.findOne({ username }).collation({locale : 'en', strength : 2}).lean().exec();      //use exec when findone - collstion strength check for case insentivity
    if(duplicate)
        return res.status(409).json({"message" : "Duplicate user name"});

    const hashedpwd = await bcrypt.hash(password, 10);     //db cannot see the original password

    const newuser = {
            "username" : username ,
            "password" : hashedpwd ,
            "roles" : roles
        }

  /*  const newuser = (!Array.isArray(roles) || !roles.length) 
                    ? {username , "password" : hashedpwd }
                    : {username , "password" : hashedpwd , roles}
*/
     
    
    const response = await User.create(newuser);
    if(response)
        return res.status(200).json({"message" : `User ${username} is created`});
    else
        return res.status(400).json({"message" : "Invalid user data"});
        
})


//update a user PATCH

const updateUser = asyncHandler(async (req,res) => {

    const {id, username , roles, active ,password} = req.body;
    
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean')
        return res.status(400).json({"message" : "All fields are required"});

    const upduser = await User.findById(id).exec();      //use exec when findone/findbyid - dont want lean, we want it as mongoose doc
    if(!upduser)
        return res.status(409).json({"message" : "User not found"});

    const duplicate = await User.findOne({ username }).collation({locale : 'en', strength : 2}).lean().exec();   //soem other user with same name will hv different id, so if id is not same , then dup user
    if(duplicate && duplicate?._id.toString() !== id)               //if there is some other user with the same name-> dup
        return res.status(409).json({"message" : "Duplicate user name"});

    //else > dup has the current user and also upd the cur user

    upduser.username = username
    upduser.roles = roles
    upduser.active = active 
    if(password)
        upduser.password = await bcrypt.hash(password,10);
    
    const response = await upduser.save();
    if(response)
        return res.status(200).json({"message" : `User ${username} is updated`});
    else
        return res.status(400).json({"message" : "Invalid user data"});


})

//delete a user

const deleteUser = asyncHandler(async (req,res) => {

    const {id} = req.body;
    if(!id)
        return res.status(400).json({"message" : "Id are required"});

    const notes = await Note.findOne({user : id}).lean().exec();
    if(notes)
        return res.status(400).json({"message" : "USer has notes"});

    const deluser = await User.findById(id).exec();
    if(!deluser)
        return res.status(409).json({"message" : "User not found"});

    const response = await deluser.deleteOne();
    if(response)
        return res.status(200).json({"message" : `User deleted`});
    else
        return res.status(400).json({"message" : "Invalid user data"});


})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
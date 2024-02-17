const Note = require('../model/Note');
const asyncHandler = require('express-async-handler');  //instead of using try catch blocks
const User = require('../model/User');


//get all notes

const getAllNotes = asyncHandler(async (req,res) => {

    const response = await Note.find().lean();

    if(!response?.length)
        return res.status(400).json({"message" : "No notes found"});


    //responsewithUsername contains notes nd thier user id and user name 
    const responsewithUsername = await Promise.all(response.map(async (note) => {
        const user = await User.findById(note.user).lean().exec();
        return {...note,username: user.username}
    }))

    return res.status(200).json(responsewithUsername);

});

//create  a new note

const createNewNote  = asyncHandler(async (req,res) => {

    const {user,title,text } = req.body;

    if(!user || !title || !text)
        return res.status(400).json({"message" : "All field are required"});

    const duplicate = await Note.findOne({title}).collation({locale : 'en', strength : 2}).lean().exec();
    if(duplicate)
        return res.status(400).json({"message" : "Duplicate title found"});
      
    const newnote = {
        "user" : user,
        "title" : title,
        "text" : text
    }
    const response = await Note.create(newnote);
    if(response)
        return res.status(200).json({"message" : `Note ${title} is created`});
    else
        return res.status(400).json({"message" : "Invalid note data"});


});

//update a note - PATCH

const updateNote  = asyncHandler(async (req,res) => {

    const {id, user, title, text, completed} = req.body;
    if(!id)
    return res.status(400).json({"message" : "1All field are required"});

    if(!user)
    return res.status(400).json({"message" : "2All field are required"});

    if(!title)
    return res.status(400).json({"message" : "3All field are required"});


    if(!id || !user || !title || !text || typeof completed !== 'boolean')
        return res.status(400).json({"message" : "All field are required"});

    const updnote = await Note.findById(id).exec();
    if(!updnote)
        return res.status(409).json({"message" : "Note not found"});

    const duplicate = await Note.findOne({title}).collation({locale : 'en', strength : 2}).lean().exec();
    if(duplicate && duplicate?._id.toString() !== id)
         return res.status(409).json({"message" : "Duplicate Note title"});

    updnote.user=user;
    updnote.title=title;
    updnote.text=text;
    updnote.completed=completed;

    const response = await updnote.save();
    if(response)
        return res.status(200).json({"message" : `Note ${title} is updated`});
    else
        return res.status(400).json({"message" : "Invalid note data"});



});


//delete a note

const deleteNote  = asyncHandler(async (req,res) => {

    const {id} = req.body;
    if(!id)
        return res.status(400).json({"message" : "Id are required"});

    const delnote = await Note.findById(id).exec();
    if(!delnote)
        return res.status(409).json({"message" : "User not found"});

    const response = await delnote.deleteOne();
    if(response)
        return res.status(200).json({"message" : `Note deleted`});
    else
        return res.status(400).json({"message" : "Invalid note data"});

}); 

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}
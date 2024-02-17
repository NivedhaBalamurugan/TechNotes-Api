//search for small calse plural collection name

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    username : {
        type: String,
        required: true 
    },
    password : {
        type: String,
        required: true 
    },
    roles : {
        type : [String],
        default : ["Employee"]    //to portray array use brackets
    },
    active : {
        type : Boolean,
        default : true
    }


})

module.exports = mongoose.model('User', UserSchema);
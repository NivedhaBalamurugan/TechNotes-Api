//search for small calse plural collection name

const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence')

const NoteSchema = new mongoose.Schema(
    {

        user : {
            type : mongoose.Schema.Types.ObjectId, //referring to other schema 
            required : true,
            ref : 'User'  //stroign the id of the user who owns the note
        },
        
        title : {
            type: String,
            required: true 
        },
        text : {
            type: String,
            required: true 
        },
        completed : {
            type: Boolean,
            default: false
        }
            
    },
    {
        timestamps : true   //automatically gives created nd updated time
    }

)

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

NoteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',     //it creates a col called ticket which store snum seq 
    id: 'ticketNums',       // in a sep collection called counter and adds in notes
    start_seq: 500
});


NoteSchema.virtual('userData', {
    ref: 'User',             // Reference to the User collection
    localField: 'user',      // Field in the Note collection
    foreignField: '_id',     // Field in the User collection
    justOne: true            // We're referencing a single user
});



module.exports = mongoose.model('Note', NoteSchema);


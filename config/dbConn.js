const mongoose = require('mongoose');

const dbConn = async () => {

    try {
        await mongoose.connect(process.env.DATABASE_URI , {
            dbname : 'techNotesDB'
        });
    }   catch(err)  {
        console.log(err.message);
    }

}

module.exports = dbConn
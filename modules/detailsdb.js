const mongoose = require('mongoose');

const detailsSchema = mongoose.Schema({
    UName:{
        type:String,
        required:true
    },
    EMail:{
        type:String,
        required:true
    },
    PW:{
        type:String,
        required:true
    }
});

const details = module.exports = mongoose.model('details',detailsSchema);

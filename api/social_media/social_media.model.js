const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;


const socialSchema = new Schema ({
    
    social_media:{
        type: String,
        enum: ['twitter','instagram']
    }
})

module.exports = model('socials', userSchema);
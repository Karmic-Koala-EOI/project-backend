const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    userName: String,
    avatar: String,
    email: String,
    registerDate: {
        type: String, 
        default: new Date().toISOString()
    },
    password: {
        type: String,
        required: [true, "The password is empty"],
        validate: {
            validator: (password) => {
                if(password.length >= 8){
                    return true;
                } else if(password.indexOf(/[A-Z]/) >= 1 || password.indexOf(/[0-9]/) >=1){
                    return true
                } else {
                    return false;
                }
            },
            message: 'The password required any capital letter and any number'
        }
    }
})

module.exports = model('users', userSchema);
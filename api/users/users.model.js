const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    _id: String,
    userName: {
        type: String,
        required: [true, 'The username is empty']
    },
    avatar: String,
    email: {
        type: String,
        required: [true, 'The email is required'],
        unique: [true, 'These email just exist'],
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Email no válido']
    },
    registerDate: {
        type: String, 
        default: new Date().toISOString()
    },
    provider:{
        type: String,
        enum: ['email','google']
    },
    password: {
        type: String,
        required: function(){
            
            if(this.provider === 'google'){
                return false;
            } else {
                return true;
            }
        },
        // validate: {
        //     validator: function(){
        //         if(this.password.indexOf(/[A-Z]/) >= 1 && this.password.length >= 8 || this.password.indexOf(/[0-9]/) >=1 && this.password.length >= 8){
        //             return true
        //         } else {
        //             return false;
        //         }
        //     },
        //     message: 'The password required any capital letter and any number'
        // }
    },
    company: String
})

module.exports = model('users', userSchema);
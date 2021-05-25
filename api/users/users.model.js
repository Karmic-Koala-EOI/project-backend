import mongoose, { model, Schema } from 'mongoose';

const userSchema = new Schema ({
    nombre: String,
    avatar: String,
    fechadeRegistro: {
        type: String, 
        default: new Date().toISOString()
    }
})

export default model('users', userSchema);
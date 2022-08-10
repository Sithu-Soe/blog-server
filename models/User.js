const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Please enter a name"],
    },
    username: {
        type: String,
        trim: true,
        required: [true, "Please enter a username"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Please enter an email"],
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Please enter a password"],
    },
    role: {
        type: String,
        trim: true,
        required: [true, "Please enter a role"],
    },
},{ timestamps: true });

module.exports = mongoose.model('User', UserSchema);
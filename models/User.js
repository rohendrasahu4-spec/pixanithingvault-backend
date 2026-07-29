const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        // Password is optional for Google OAuth users (they use googleId)
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple users to have no googleId
    },
    picture: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
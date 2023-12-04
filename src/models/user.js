const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    user_id: {
        type: Number,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Manager", "Reviewer", "Approver", "Applicant"],
        required: true
    },
});

const User = model('User', userSchema);

module.exports = User;

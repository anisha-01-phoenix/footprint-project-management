const mongoose = require("mongoose")
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true
    },
    provinceName: {
        type: String,
        required: true
    },
    provincialSuperiorName: {
        type: String,
        required: true
    },

    apostolate: {
        type: String,
        enum: ['social', 'education', 'health', 'others'],
        required: true
    },
    
    encrypted_password: {
        type: String,
    },
    verified: String,
    salt: String,
}, { timestamps: true })

userSchema.virtual("password")
    .set(function (password) {
        this._password = password
        this.salt = uuidv4()
        this.encrypted_password = this.securePassword(password)
    })
    .get(function () {
        return this._password
    })

userSchema.methods = {
    authenticate: function (rawPassword) {
        return this.encrypted_password === this.securePassword(rawPassword)
    },
    securePassword: function (rawPassword) {
        if (!rawPassword) return "";

        try {
            return crypto.createHmac("sha256", this.salt).update(rawPassword).digest("hex")
        } catch (e) {
            console.log(e);
            return e;
        }
    },
}

module.exports = mongoose.model("User", userSchema)
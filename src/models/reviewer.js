const mongoose = require("mongoose")
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');

const reviewerSchema = new mongoose.Schema({
    name: {
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
        trim: true,
        required: true,
        unique: true
    },
    provinceName: {
        type: String,
        required: true
    },
    encrypted_password: {
        type: String,
        required: true
    },
    salt: String,
}, { timestamps: true })

reviewerSchema.virtual("password")
    .set(function (password) {
        this._password = password
        this.salt = uuidv4()
        this.encrypted_password = this.securePassword(password)
    })
    .get(function () {
        return this._password
    })

reviewerSchema.methods = {

    authenticate: function (password) {
        return this.encrypted_password === this.securePassword(password)
    },
    securePassword: function (password) {
        if (!password) return "";

        try {
            return crypto.createHmac("sha256", this.salt).update(password).digest("hex")
        } catch (e) {
            return e;
        }
    },
}

module.exports = mongoose.model("Reviewer", reviewerSchema)
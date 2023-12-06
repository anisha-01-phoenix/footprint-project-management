const jwt = require("jsonwebtoken")
const Approver = require("../models/approver")
const Reviewer = require("../models/reviewer")
const User = require("../models/user")
require('express-jwt');

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace('Bearer ', '')
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        Approver.findOne({ '_id': decodedToken._id }, (err, approver) => {
            if (err || !approver) {
                Reviewer.findOne({ '_id': decodedToken._id }, (err, reviewer) => {
                    if (err || !reviewer) {
                        User.findOne({ '_id': decodedToken._id }, (err, user) => {
                            if (err || !user) {
                                res.status(401).send({
                                    error: "Please Authenticate"
                                })
                            } else {
                                next()
                            }
                        })
                    } else {
                        next()
                    }
                })
            } else {
                next()
            }
        })
    } catch (e) {
        res.status(401).send({
            error: "Please Authenticate"
        })
    }
}

module.exports = auth
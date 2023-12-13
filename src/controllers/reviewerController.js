const Reviewer = require("../models/reviewer")
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const util = require('util');
const jwtVerify = util.promisify(jwt.verify);
require('express-jwt');


exports.signup = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    const { name, email, mobile, provinceName, password } = req.body

    if (!email || !password || !name || !mobile || !provinceName) {
        return res.status(400).json({
            error: "Data Incomplete",
        })
    }

    Reviewer.findOne({ email }).exec()
        .then((reviewer) => {
            if (reviewer) {
                res.status(400).json({
                    message: "User Already Exists"
                })
            }

            if (!reviewer) {
                const otp = Math.floor(((Math.random() * 1000000) + 100000) % 1000000);

                const token = jwt.sign({ name: name, email: email, mobile: mobile, provinceName: provinceName, password: password, otpCoded: otp }, process.env.JWT_SECRET)

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'examplewebdevelopers@gmail.com',
                        pass: 'fzee ufkh hahq ryoe'
                    }
                });
                const mailOptions = {
                    from: 'examplewebdevelopers@gmail.com',
                    to: email,
                    subject: 'Verification Email ',
                    text: `The OTP to verify you registered email id is ${otp}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.json({
                            error: error
                        })
                    }
                    if (info) {
                        res.json({
                            message: "Email Sent Successfully. Please verify to proceed",
                            token: token
                        })
                    }
                })
            }
        })
        .catch(error => {
            console.error("Error:", error);
            res.status(500).json({
                error: error
            });
        });
}

exports.verify_email = async (req, res) => {
    const { token, otp } = req.body;

    try {
        if (!token || !otp) {
            throw new Error("Data Incomplete");
        }

        const decodedToken = await jwtVerify(token, process.env.JWT_SECRET);

        const { name, email, mobile, provinceName, password, otpCoded } = decodedToken;
        console.log(decodedToken);
        if (otp.toString() === otpCoded.toString()) {
            const reviewer = new Reviewer({ name, email, mobile, provinceName, password });

            const savedReviewer = await reviewer.save();

            return res.status(200).json({
                message: "User Registered. Wait till the Approver approves.",
                reviewer: savedReviewer
            });
        }
        else 
        {
            throw new Error("Incorrect OTP");
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: error.message || "Invalid Token",
        });
    }
};

exports.signin = (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            error: "Data Incomplete",
        })
    }
    Reviewer.findOne({ email }).exec()
        .then((reviewer) => {
            if (!reviewer) {
                return res.status(400).json({
                    error: "Email was not found"
                })
            }

            if (!reviewer.authenticate(password)) {
                return res.status(400).json({
                    error: "Email and password do not match"
                })
            }

            const token = jwt.sign({ _id: reviewer._id, userType: 'Reviewer' }, process.env.JWT_SECRET)

            res.cookie('token', token, { expire: new Date() + 1 })

            const { _id, name, email, mobile, provinceName } = reviewer
            return res.json({
                token,
                reviewer: {
                    _id,
                    name,
                    email,
                    mobile,
                    provinceName
                }
            })

        })
        .catch(error => {
            console.error("Error:", error);
            res.status(500).json({
                error: error
            });
        });
}

exports.signout = (req, res) => {
    res.clearCookie("token")
    return res.json({
        message: "User sign out successful"
    })
}
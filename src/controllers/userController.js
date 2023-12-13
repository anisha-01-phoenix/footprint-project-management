const User = require("../models/user");
const Reviewer = require("../models/reviewer");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const util = require("util");
const jwtVerify = util.promisify(jwt.verify);
const { ObjectId } = require('mongodb');


exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg,
            });
        }
        
        const user_id = new ObjectId();
        const { email, username, mobile, provinceName, apostolate, password } = req.body;

        if (!email || !password || !username || !mobile || !provinceName || !apostolate) {
            return res.status(400).json({
                error: "Data Incomplete",
            });
        }

        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            return res.status(400).json({
                message: "User Already Exists",
            });
        }

        const reviewerInProvince = await Reviewer.findOne({
            provinceName: provinceName,
        }).exec();

        console.log(reviewerInProvince);
        if(!reviewerInProvince) 
        {
            return res.status(400).json({
                error: "Province does not Exist",
            });
        }
        const provincialSuperiorName = reviewerInProvince.name;
        const reviewer_id = reviewerInProvince._id;
        const otp = Math.floor(((Math.random() * 1000000) + 100000) % 1000000);

        const token = jwt.sign({
            user_id, username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password, otpCoded: otp,
        }, process.env.JWT_SECRET);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "examplewebdevelopers@gmail.com",
                pass: "fzee ufkh hahq ryoe",
            },
        });
        const mailOptions = {
            from: "examplewebdevelopers@gmail.com",
            to: email,
            subject: "Verification Email",
            text: `The OTP to verify your registered email id is ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: "Email Sent Successfully. Please verify to proceed",
            token: token,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: error.message || "Internal Server Error",
        });
    }
};

exports.verify_email = async (req, res) => {
    const { token, otp } = req.body;

    try {
        if (!token || !otp) {
            throw new Error("Data Incomplete");
        }

        const decodedToken = await jwtVerify(token, process.env.JWT_SECRET);
        const { user_id, username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password, otpCoded } = decodedToken;
        console.log(decodedToken);
        if (otp.toString() === otpCoded.toString()) {
            const user = new User({ user_id, username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password });
            const savedUser = await user.save();
            
            return res.status(200).json({
                message: "User Registered. Sign in to Continue",
                user: savedUser,
            });
        }
        else {
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
    User.findOne({ email }).exec()
        .then((user) => {
            if (!user) {
                return res.status(400).json({
                    error: "Email was not found"
                })
            }

            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: "Email and password do not match"
                })
            }

            const token = jwt.sign({ _id: user._id, userType: 'Applicant/Manager' }, process.env.JWT_SECRET)

            res.cookie('token', token, { expire: new Date() + 1 })

            const { _id, name, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate } = user
            return res.json({
                token,
                user: {
                    _id, name, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate
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

exports.signout = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token');

        // Send a JSON response
        return res.json({
            message: 'User sign out successful',
        });
    } catch (error) {
        console.error(error);
        // Handle any errors and send an appropriate response
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
};


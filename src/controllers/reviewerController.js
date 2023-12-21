const Reviewer = require("../models/reviewer");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mysql = require('mysql');
const util = require('util');
const jwtVerify = util.promisify(jwt.verify);


const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD.replace(/%23/g, '#'),
    database: process.env.DATABASE,
});

exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg,
                success: false,
            });
        }

        const { email, name, mobile, provinceName, password } = req.body;

        if (!email || !password || !name || !mobile || !provinceName) {
            return res.status(400).json({
                error: 'Data Incomplete',
                success: false,
            });
        }

        const existingReviewerQuery = 'SELECT * FROM reviewers WHERE email = ?';
        const existingReviewerResult = await query(existingReviewerQuery, [email]);

        if (existingReviewerResult.length > 0) {
            return res.status(400).json({
                message: 'User Already Exists',
                success: false,
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const token = jwt.sign({
            name, email, mobile, provinceName, password, otpCoded: otp,
        }, process.env.JWT_SECRET);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'examplewebdevelopers@gmail.com',
                pass: 'fzee ufkh hahq ryoe',
            },
        });

        const mailOptions = {
            from: 'examplewebdevelopers@gmail.com',
            to: email,
            subject: 'Verification Email',
            text: `The OTP to verify your registered email id is ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Email Sent Successfully. Please verify to proceed',
            token: token,
            success: true,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            success: false,
        });
    }
};

exports.verify_email = async (req, res) => {
    const { token, otp } = req.body;

    try {
        if (!token || !otp) {
            throw new Error('Data Incomplete');
        }

        const decodedToken = await verifyjwt(token, process.env.JWT_SECRET);
        const { name, email, mobile, provinceName, password, otpCoded } = decodedToken;
        console.log(decodedToken);
        if (otp.toString() === otpCoded.toString()) {
            const insertReviewerQuery = 'INSERT INTO reviewers (name, email, mobile, provinceName, password) VALUES (?, ?, ?, ?, ?)';
            const insertReviewerParams = [name, email, mobile, provinceName, password];

            await query(insertReviewerQuery, insertReviewerParams);

            return res.status(200).json({
                message: 'User Registered. Sign in to Continue',
                reviewer: {
                    name,
                    email,
                    mobile,
                    provinceName
                },
                success: true,
            });
        } else {
            throw new Error('Incorrect OTP');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(400).json({
            error: error.message || 'Invalid Token',
            success: false,
        });
    }
};

function verifyjwt(token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) reject(err);
            resolve(decoded);
        });
    });
}

function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.query(sql, args, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

exports.signin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Data Incomplete',
            success: false,
        });
    }

    const getReviewerQuery = 'SELECT * FROM reviewers WHERE email = ?';
    pool.query(getReviewerQuery, [email], (error, results) => {
        if (error) {
            console.error('Error:', error);
            return res.status(500).json({
                error: error,
                success: false,
            });
        }

        const reviewer = results[0];

        if (!reviewer) {
            return res.status(400).json({
                error: 'Email was not found',
                success: false,
            });
        }

        if (reviewer.password != password) {
            return res.status(400).json({
                error: 'Email and password do not match',
                success: false,
            });
        }
        
        const token = jwt.sign({ id: reviewer.reviewer_id, userType: 'Reviewer' }, process.env.JWT_SECRET);

        res.cookie('token', token, { expire: new Date() + 1 });

        const { reviewer_id, name, mobile, provinceName } = reviewer;
        return res.json({
            token,
            reviewer: {
                reviewer_id,
                name,
                email,
                mobile,
                provinceName,
            },
            success: true,
        });
    });
};

exports.signout = async (req, res) => {
    try {
        res.clearCookie('token');

        return res.json({
            message: 'User sign out successful',
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            success: false,
        });
    }
};

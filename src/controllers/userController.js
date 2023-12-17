const User = require("../models/user");
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
            });
        }

        const { email, username, mobile, provinceName, apostolate, password } = req.body;

        if (!email || !password || !username || !mobile || !provinceName || !apostolate) {
            return res.status(400).json({
                error: 'Data Incomplete',
            });
        }

        const existingUserQuery = 'SELECT * FROM users WHERE email = ?';
        const existingUserResult = await query(existingUserQuery, [email]);

        if (existingUserResult.length > 0) {
            return res.status(400).json({
                message: 'User Already Exists',
            });
        }

        const reviewerInProvinceQuery = 'SELECT * FROM reviewers WHERE provinceName = ?';
        const reviewerInProvinceResult = await query(reviewerInProvinceQuery, [provinceName]);

        if (reviewerInProvinceResult.length === 0) {
            return res.status(400).json({
                error: 'Province does not Exist',
            });
        }

        const reviewerInProvince = reviewerInProvinceResult[0];
        const provincialSuperiorName = reviewerInProvince.name;
        const reviewer_id = reviewerInProvince.reviewer_id;
        const otp = Math.floor(((Math.random() * 1000000) + 100000) % 1000000);

        const token = jwt.sign({
            username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password, otpCoded: otp,
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
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
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
        const { username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password, otpCoded } = decodedToken;
        console.log(decodedToken);
        if (otp.toString() === otpCoded.toString()) {
            const insertUserQuery = 'INSERT INTO users (username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const insertUserParams = [username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password];

            await query(insertUserQuery, insertUserParams);

            return res.status(200).json({
                message: 'User Registered. Sign in to Continue',
                user: {
                    username,
                    email,
                    mobile,
                    provinceName,
                    provincialSuperiorName,
                    reviewer_id,
                    apostolate,
                },
            });
        } else {
            throw new Error('Incorrect OTP');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(400).json({
            error: error.message || 'Invalid Token',
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
        });
    }

    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
    pool.query(getUserQuery, [email], (error, results) => {
        if (error) {
            console.error('Error:', error);
            return res.status(500).json({
                error: error,
            });
        }

        const user = results[0];
        console.log(user);

        if (!user) {
            return res.status(400).json({
                error: 'Email was not found',
            });
        }

        if (user.password != password) {
            return res.status(400).json({
                error: 'Email and password do not match',
            });
        }

        const token = jwt.sign({ id: user.user_id, userType: 'Applicant/Manager' }, process.env.JWT_SECRET);

        res.cookie('token', token, { expire: new Date() + 1 });

        const { user_id, username, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate } = user;
        return res.json({
            token,
            user: {
                user_id,
                username,
                email,
                mobile,
                provinceName,
                provincialSuperiorName,
                reviewer_id,
                apostolate,
            },
        });
    });
};

exports.signout = async (req, res) => {
    try {
        res.clearCookie('token');

        return res.json({
            message: 'User sign out successful',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
};


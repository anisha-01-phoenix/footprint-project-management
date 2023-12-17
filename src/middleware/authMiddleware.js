const jwt = require("jsonwebtoken");
const { query } = require("../../db");
require('express-jwt');

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace('Bearer ', '');
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const getApproverQuery = 'SELECT * FROM approvers WHERE approver_id = ?';
        const getReviewerQuery = 'SELECT * FROM reviewers WHERE reviewer_id = ?';
        const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';

        const [approver] = await query(getApproverQuery, [decodedToken.id]);
        const [reviewer] = await query(getReviewerQuery, [decodedToken.id]);
        const [user] = await query(getUserQuery, [decodedToken.id]);

        if (!approver && !reviewer && !user) {
            res.status(401).send({
                error: "Please Authenticate"
            });
        } else {
            next();
        }
    } catch (e) {
        console.log(e);
        res.status(401).send({
            error: "Please Authenticate"
        });
    }
};

module.exports = auth;

const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../models/user');

async function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. Token is missing.' });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
}

async function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden. Insufficient role.' });
        }
    };
}

module.exports = { authenticateToken, authorizeRole };

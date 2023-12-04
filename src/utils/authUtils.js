const jwt = require('jsonwebtoken');
const config = require('../../config');

function generateToken(user) {
    const payload = {
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
    };

    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

module.exports = { generateToken };

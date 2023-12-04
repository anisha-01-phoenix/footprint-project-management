const User = require('../models/user');

async function getUserProfile(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password_hash');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { getUserProfile };

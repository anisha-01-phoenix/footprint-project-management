const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../utils/authUtils');

async function register(req, res) {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password_hash: hashedPassword,
            role,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(401).json({ message: 'Invalid username or password.' });

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) return res.status(401).json({ message: 'Invalid username or password.' });

        const token = generateToken(user);
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { register, login };

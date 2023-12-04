const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;

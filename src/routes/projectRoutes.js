const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const {
  submitProjectApplication,
  reviewProjectApplication,
  approveOrRejectProjectApplication,
} = require('../controllers/projectController');

const router = express.Router();

router.post('/submit', async (req, res, next) => {
  try {
    await submitProjectApplication(req, res);
  } catch (error) {
    next(error); 
  }
});

router.post('/review', async (req, res, next) => {
  try {
    await reviewProjectApplication(req, res);
  } catch (error) {
    next(error); 
  }
});

router.post('/approve-reject', async (req, res, next) => {
  try {
    await approveOrRejectProjectApplication(req, res);
  } catch (error) {
    next(error); 
  }
});

module.exports = router;

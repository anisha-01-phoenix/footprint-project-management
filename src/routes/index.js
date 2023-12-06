const express = require('express');
const approverRoutes = require('./approverRoutes');
const reviewerRoutes = require('./reviewerRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');

const router = express.Router();

router.use('/api/approver', approverRoutes);
router.use('/api/reviewer', reviewerRoutes);
router.use('/api/user', userRoutes);
router.use('/project', projectRoutes);

module.exports = router;

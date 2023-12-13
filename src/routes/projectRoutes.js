const express = require('express');
const router = express.Router();
const { 
    createProject, 
    editProject, 
    deleteProject, 
    getAllApprovedProjects,
    getAllReviewedProjects,
    getAllSubmittedProjects,
    getAllUnderApprovalProjects,
    getAllUnderReviewedProjects,
    addComments 
} = require('../controllers/projectController');
const userAuth = require('../middleware/userMiddleware');
const approverAuth = require('../middleware/approverMiddleware');
const reviewerAuth = require('../middleware/reviewerMiddleware');
const auth = require('../middleware/authMiddleware');

// Create New Project (only User)
router.post('/create', userAuth, createProject);

// Edit Project (only User)
router.put('/edit/:projectId', userAuth, editProject);

// Delete Project
router.delete('/delete/:projectId', userAuth, deleteProject);

// Get all approved Projects
router.get('/allApprovedProjects', getAllApprovedProjects);

// Get all reviewed Projects
router.get('/allReviewedProjects', approverAuth, getAllReviewedProjects);

// Get all submitted Projects
router.get('/allSubmittedProjects', reviewerAuth, getAllSubmittedProjects);

//Get all Under Reviewed Projects
router.get('/underReviewedProjects', auth, getAllUnderReviewedProjects);

//Get all Under Approved Projects
router.get('/underApprovedProjects', auth, getAllUnderApprovalProjects);

//Add comments
router.put('/addComments/:projectId', auth, addComments);


module.exports = router;

const express = require('express');
const router = express.Router();
const { 
    createProject, 
    editProject, 
    deleteProject, 
    getAllApprovedProjects,
    getAllReviewedProjects,
    getAllSubmittedProjects,
    addComments,
    getAllUserProjects, 
    getAllProjectsbyApostolate,  
    getAllProjects} = require('../controllers/projectController');
const userAuth = require('../middleware/userMiddleware');
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
router.get('/allReviewedProjects', getAllReviewedProjects);

// Get all submitted Projects
router.get('/allSubmittedProjects', getAllSubmittedProjects);

//Add comments
router.put('/addComments/:projectId', auth, addComments);


module.exports = router;

const express = require('express');
const router = express.Router();
const { 
    createProject, 
    editProject, 
    deleteProject, 
    getAllUserProjects, 
    getAllProjectsbyApostolate,  
    getAllProjects} = require('../controllers/projectController');
const userAuth = require('../middleware/userMiddleware');
const auth = require('../middleware/authMiddleware');

// Create Project
router.post('/create', userAuth, createProject);

// Edit Project
router.put('/edit/:projectId', auth, editProject);

// Delete Project
router.delete('/delete/:projectId', auth, deleteProject);

// Show all Projects for the currently logged-in user
router.get('/allUserProjects', userAuth, getAllUserProjects);

// Show all Projects for a specific apostolate 
router.post('/allProjectsByApostolate', auth, getAllProjectsbyApostolate);

router.get('/allProjects', auth, getAllProjects);

module.exports = router;

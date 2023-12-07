const Project = require('../models/project');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

exports.createProject = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const { title, description, status, documents } = req.body;
        const userId = decodedToken._id;
        console.log(decodedToken);
        const user = await User.findById(userId);
        const apostolate = user.apostolate;
        const project = new Project({ title, description, userId, status, apostolate, documents });
        await project.save();

        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.editProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { description, status, documents } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // if (project.userId.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ error: 'Unauthorized: You do not have permission to edit this project' });
        // }

        project.description = description || project.description;
        project.status = status || project.status;
        project.documents = documents || project.documents;

        await project.save();

        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken._id;
        if (project.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission to delete this project' });
        }

        await Project.findByIdAndDelete(projectId);

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllUserProjects = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken._id;

        const projects = await Project.find({ userId });

        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllProjectsbyApostolate = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken._id;

        const { apostolate } = req.body;

        const projects = await Project.find({ userId, apostolate: apostolate });

        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();

        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

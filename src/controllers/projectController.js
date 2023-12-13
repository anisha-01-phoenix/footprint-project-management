const Project = require('../models/project');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const util = require("util");
const { ObjectId } = require('mongodb');

exports.createProject = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const { title, description, budget, monthly_report } = req.body;
        const userId = decodedToken._id;
        console.log(decodedToken);
        const user = await User.findById(userId);
        const apostolate = user.apostolate;
        const project_id = new ObjectId();
        const reviewerId = user.reviewer_id;
        const project = new Project({ project_id, title, description, userId, reviewerId, status: "Submitted", apostolate, budget, monthly_report, comments: [] });
        await project.save();

        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.editProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        console.log(projectId);
        const { description, budget, monthly_report } = req.body;
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken._id;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission to edit this project' });
        }

        project.description = description || project.description;
        project.budget = budget || project.budget;
        project.monthly_report = monthly_report || project.monthly_report;

        await project.save();

        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
};

exports.getAllApprovedProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "Approved" });
        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReviewedProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "Reviewed" });
        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSubmittedProjects = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const reviewerId = decodedToken._id;
        const projects = await Project.find({ status: "Submitted", reviewerId: reviewerId });
        
        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUnderApprovalProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "Under Approval" });
        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUnderReviewedProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: "Under Review" });
        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.addComments = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { comment } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        project.comments.push(comment);
        project.status = "Under Review";
        await project.save();

        res.status(200).json({ message: 'Comment added', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
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

const Project = require('../models/project');
const User = require('../models/user');
const ProjectDocument = require('../models/projectDocument');

async function submitProjectApplication(req, res) {
    try {
        const { title, description, start_date, end_date, documents } = req.body;

        const user = await User.findById(req.user.id);

        const newProject = new Project({
            title,
            description,
            status: 'Review',
            end_date,
            manager_id: user.user_id,
            reviewer_id: null,
            approver_id: null,
        });

        await newProject.save();

        if (documents && documents.length > 0) {
            for (const document of documents) {
                const newDocument = new ProjectDocument({
                    project_id: newProject.project_id,
                    document_name: document.name,
                    document_path: document.path,
                    uploaded_by: user.user_id,
                });

                await newDocument.save();
            }
        }

        res.status(201).json({ message: 'Project application submitted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function reviewProjectApplication(req, res) {
    try {
        const { projectId, comments, status } = req.body;

        const project = await Project.findById(projectId);

        if (project.reviewer_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to review this project.' });
        }

        project.status = status;
        project.comments = comments;

        await project.save();

        res.json({ message: 'Project application reviewed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function approveOrRejectProjectApplication(req, res) {
    try {
        const { projectId, comments, status } = req.body;

        const project = await Project.findById(projectId);

        if (project.approver_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to approve or reject this project.' });
        }

        project.status = status;
        project.comments = comments;

        await project.save();

        res.json({ message: 'Project application approved or rejected successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    submitProjectApplication,
    reviewProjectApplication,
    approveOrRejectProjectApplication,
};

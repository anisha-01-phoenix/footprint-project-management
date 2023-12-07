const Project = require('../models/project');

exports.uploadProject = async (req, res) => {
    try {
        // Assuming project details are sent as part of the request body
        const { title, description, documents } = req.body;

        // Extract the uploaded file from the request
        const projectFile = req.file.buffer;

        // Get the user ID from the authenticated user
        const userId = req.user._id;

        // Check if the authenticated user is a regular user (not a reviewer or approver)
        if (req.user.role !== 'user') {
            return res.status(403).send({ error: 'Unauthorized. Only users can create projects.' });
        }

        // Create a new project instance
        const project = new Project({
            title,
            description,
            status: 'Review', // Initial status when uploading a project
            user_id: userId,
            documents: JSON.parse(documents), // Parse the documents JSON string
        });

        // Add the uploaded file to the documents array
        project.documents.push({
            name: 'Project File', // Set a default name or provide a name in the request
            file: projectFile,
        });

        // Save the project to the database
        await project.save();

        res.status(201).send({ message: 'Project uploaded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


exports.updateProject = async (req, res) => {
    try {
        // Assuming project details are sent as part of the request body
        const { projectId, title, description, status, start_date, end_date, documents } = req.body;

        // Check if the authenticated user is a reviewer or approver
        if (req.user.role !== 'reviewer' && req.user.role !== 'approver') {
            return res.status(403).send({ error: 'Unauthorized. Reviewers and Approvers can update projects.' });
        }

        // Find the project by ID
        const project = await Project.findById(projectId);

        // Check if the project exists
        if (!project) {
            return res.status(404).send({ error: 'Project not found.' });
        }

        // Update all fields
        project.title = title;
        project.description = description;
        project.status = status;
        project.start_date = start_date;
        project.end_date = end_date;
        project.documents = JSON.parse(documents); // Parse the documents JSON string

        // Save the updated project to the database
        await project.save();

        res.status(200).send({ message: 'Project updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


exports.reviewProject = async (req, res) => {
    try {
        const { projectId, reviewerId } = req.body;

        // Check if the authenticated user is a reviewer
        if (req.user.role !== 'reviewer') {
            return res.status(403).send({ error: 'Unauthorized. Only Reviewers can review projects.' });
        }

        // Find the project by ID
        const project = await Project.findById(projectId);

        // Check if the project exists
        if (!project) {
            return res.status(404).send({ error: 'Project not found.' });
        }

        // Update reviewer_id
        project.reviewer_id = reviewerId;

        // Save the updated project to the database
        await project.save();

        res.status(200).send({ message: 'Project reviewed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.approveProject = async (req, res) => {
    try {
        const { projectId, approverId } = req.body;

        // Check if the authenticated user is an approver
        if (req.user.role !== 'approver') {
            return res.status(403).send({ error: 'Unauthorized. Only Approvers can approve projects.' });
        }

        // Find the project by ID
        const project = await Project.findById(projectId);

        // Check if the project exists
        if (!project) {
            return res.status(404).send({ error: 'Project not found.' });
        }

        // Update approver_id
        project.approver_id = approverId;

        // Save the updated project to the database
        await project.save();

        res.status(200).send({ message: 'Project approved successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

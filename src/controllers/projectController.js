const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { query } = require('../../db');
const jwt = require('jsonwebtoken');

const connection = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD.replace(/%23/g, '#'),
    database: process.env.DATABASE,
});


exports.createProject = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const { title, description, budget, monthly_report_finance, monthly_report_activity } = req.body;
        const userId = decodedToken.id;

        const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
        const [user] = await query(getUserQuery, [userId]);
        // console.log(userRows);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // const user = userRows[0];
        const apostolate = user.apostolate;
        const reviewerId = user.reviewer_id;

        const createProjectQuery = `
        INSERT INTO projects 
          (title, description, userId, reviewerId, status, apostolate, budget, monthly_report_finance, monthly_report_activity, comments)
        VALUES (?, ?, ?, ?, 'Submitted', ?, ?, ?, ?, ?)
      `;

        await query(createProjectQuery, [
            title,
            description,
            userId,
            reviewerId,
            apostolate,
            budget,
            monthly_report_finance,
            monthly_report_activity,
            JSON.stringify([]),
        ]);

        res.status(201).json({ message: 'Project created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.editProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { description, budget, monthly_report_finance, monthly_report_activity } = req.body;

        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        const [projectRows] = await query('SELECT * FROM projects WHERE project_id = ? AND userId = ?', [projectId, userId]);

        if (projectRows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updateSql = `
            UPDATE projects
            SET description = COALESCE(?, description),
                budget = COALESCE(?, budget),
                monthly_report_finance = COALESCE(?, monthly_report_finance),
                monthly_report_activity = COALESCE(?, monthly_report_activity)
            WHERE project_id = ? AND userId = ?;
        `;

        await query(updateSql, [description, budget, monthly_report_finance, monthly_report_activity, projectId, userId]);

        const [updatedProjectRows] = await query('SELECT * FROM projects WHERE project_id = ? AND userId = ?', [projectId, userId]);

        const updatedProject = updatedProjectRows[0];

        res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        const [projectRows] = await query('SELECT * FROM projects WHERE project_id = ? AND userId = ?', [projectId, userId]);

        if (projectRows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await query('DELETE FROM projects WHERE project_id = ? AND userId = ?', [projectId, userId]);

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllApprovedProjects = async (req, res) => {
    try {
        const [projectsRows] = await query('SELECT * FROM projects WHERE status = ?', ['Approved']);

        res.status(200).json({ projects: projectsRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReviewedProjects = async (req, res) => {
    try {
        const [projectsRows] = await query('SELECT * FROM projects WHERE status = ?', ['Reviewed']);

        res.status(200).json({ projects: projectsRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


exports.getAllSubmittedProjects = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const reviewerId = decodedToken.id;

        const [projectsRows] = await query('SELECT * FROM projects WHERE status = ? AND reviewerId = ?', ['Submitted', reviewerId]);

        res.status(200).json({ projects: projectsRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUnderApprovalProjects = async (req, res) => {
    try {
        const [projectsRows] = await query('SELECT * FROM projects WHERE status = ?', ['Under Approval']);

        res.status(200).json({ projects: projectsRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUnderReviewedProjects = async (req, res) => {
    try {
        const [projectsRows] = await query('SELECT * FROM projects WHERE status = ?', ['Under Review']);

        res.status(200).json({ projects: projectsRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.addComments = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { comment } = req.body;

        const [project] = await query('SELECT * FROM projects WHERE project_id = ?', [projectId]);
        // const project = projectRows[0];

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        let existingComments = [];
        if (project.comments) {
            existingComments = JSON.parse(project.comments);
        }

        existingComments = [...existingComments, comment];

        await query('UPDATE projects SET comments = ?, status = ? WHERE project_id = ?', [JSON.stringify(existingComments), 'Under Review', projectId]);

        res.status(200).json({ message: 'Comment added', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUserProjects = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        const [projects] = await query('SELECT * FROM projects WHERE userId = ?', [userId]);

        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
exports.getAllProjects = async (req, res) => {
    try {
        const [projects] = await query('SELECT * FROM projects');

        res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

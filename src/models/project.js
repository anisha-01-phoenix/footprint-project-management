const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { query } = require('../../db');

const connection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD.replace(/%23/g, '#'),
  database: process.env.DATABASE,
});

const createProject = async (projectData) => {
  const {
    title,
    description,
    userId,
    reviewerId,
    status,
    apostolate,
    budget,
    monthly_report_finance,
    monthly_report_activity,
    comments,
  } = projectData;

  const sql = `
    INSERT INTO projects
      (title, description, userId, reviewerId, status, apostolate, budget, monthly_report_finance, monthly_report_activity, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query(sql, [
    title,
    description,
    userId,
    reviewerId,
    status,
    apostolate,
    budget,
    monthly_report_finance,
    monthly_report_activity,
    comments,
  ]);
};

const findProjectById = async (projectId) => {
  const sql = 'SELECT * FROM projects WHERE project_id = ?';
  const [rows] = await query(sql, [projectId]);
  return rows[0];
};

module.exports = { createProject, findProjectById };

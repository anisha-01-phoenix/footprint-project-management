const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { query } = require('../../db'); 

const connection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD.replace(/%23/g, '#'),
  database: process.env.DATABASE,
});

const hashPassword = async (password, saltRounds = 10) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { hashedPassword, salt };
};

const createReviewer = async (reviewerData) => {
    const { reviewer_id, name, email, mobile, provinceName, password } = reviewerData;
    
    const { hashedPassword, salt } = await hashPassword(password);
    
    const sql = `
      INSERT INTO reviewers 
        (reviewer_id, name, email, mobile, provinceName, password, salt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  
    await query(sql, [reviewer_id, name, email, mobile, provinceName, hashedPassword, salt]);
  };
  
  const findReviewerByEmail = async (email) => {
    const sql = 'SELECT * FROM reviewers WHERE email = ?';
    const [rows] = await query(sql, [email]);
    return rows[0];
  };
  
  module.exports = { createReviewer, findReviewerByEmail };
  
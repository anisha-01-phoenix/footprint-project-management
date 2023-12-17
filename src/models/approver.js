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

const createApprover = async (approverData) => {
    const { approver_id, name, email, mobile, password } = approverData;
    
    const { hashedPassword, salt } = await hashPassword(password);
    
    const sql = `
      INSERT INTO approvers 
        (approver_id, name, email, mobile, password, salt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    await query(sql, [approver_id, name, email, mobile, hashedPassword, salt]);
  };
  
  const findApproverByEmail = async (email) => {
    const sql = 'SELECT * FROM approvers WHERE email = ?';
    const [rows] = await query(sql, [email]);
    return rows[0];
  };
  
  module.exports = { createApprover, findApproverByEmail };
  
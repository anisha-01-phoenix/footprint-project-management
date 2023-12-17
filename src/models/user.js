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

const createUser = async (userData) => {
  const { user_id, username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password } = userData;
  
  const { hashedPassword, salt } = await hashPassword(password);
  
  const sql = `
    INSERT INTO users 
      (user_id, username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, password, salt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query(sql, [user_id, username, email, mobile, provinceName, provincialSuperiorName, reviewer_id, apostolate, hashedPassword, salt]);
};

const findUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await query(sql, [email]);
  return rows[0];
};

module.exports = { createUser, findUserByEmail };

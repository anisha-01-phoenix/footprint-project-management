const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD.replace(/%23/g, '#'),
    database: process.env.DATABASE,
});

const query = async (sql, values) => {
  try {
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error; 
  }
};

module.exports = { query };

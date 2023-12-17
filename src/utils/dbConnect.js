// const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const config = require('../../config');

async function connectToDatabase() {
    try {
        global.connection = await mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD.replace(/%23/g, '#'),
            database: process.env.DATABASE,
        });
        console.log('Connected to MySQL');
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
}

module.exports = { connectToDatabase };

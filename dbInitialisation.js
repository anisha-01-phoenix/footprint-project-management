const { query } = require('./db'); 

const initDatabase = async () => {
    await createUsersTable();
    await createReviewersTable(); 
    await createApproversTable(); 
};

const createUsersTable = async () => {
    const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            user_id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            mobile VARCHAR(15),
            provinceName VARCHAR(255),
            provincialSuperiorName VARCHAR(255),
            reviewer_id INT,
            apostolate VARCHAR(255),
            password VARCHAR(255),
            salt VARCHAR(255)
        );
    `;
    await query(createUserTableQuery);
};

const createReviewersTable = async () => {
    const createReviewerTableQuery = `
        CREATE TABLE IF NOT EXISTS reviewers (
            reviewer_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            mobile VARCHAR(15),
            provinceName VARCHAR(255),
            password VARCHAR(255),
            salt VARCHAR(255)
        );
    `;
    await query(createReviewerTableQuery);
};

const createApproversTable = async () => {
    const createApproverTableQuery = `
        CREATE TABLE IF NOT EXISTS approvers (
            approver_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            mobile VARCHAR(15),
            password VARCHAR(255),
            salt VARCHAR(255)
        );
    `;
    await query(createApproverTableQuery);
};


module.exports = { initDatabase };

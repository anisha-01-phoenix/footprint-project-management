const express = require('express');
const { connectToDatabase } = require('./src/utils/dbConnect');
const { initDatabase } = require('./dbInitialisation');
const { query } = require('./db');
const routes = require('./src/routes');

const cookieParser = require('cookie-parser');

const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use('/', routes);
const PORT = process.env.PORT || 3000;
connectToDatabase();
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database initialization error:', error);
        process.exit(1);
    });

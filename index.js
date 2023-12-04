const express = require('express');
const { connectToDatabase } = require('./src/utils/dbConnect');
const routes = require('./src/routes');

const app = express();

require('dotenv').config();

app.use(express.json());

connectToDatabase();

app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mongoose = require('mongoose');
const config = require('../../config');

async function connectToDatabase() {
    try {
        await mongoose.connect(config.mongodbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

module.exports = { connectToDatabase };

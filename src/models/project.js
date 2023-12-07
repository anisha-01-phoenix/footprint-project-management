const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    status: {
        type: String,
        enum: ["Review", "Approved", "Rejected", "Ongoing", "Completed"],
        required: true
    },
    apostolate: {
        type: String,
        required: true,
    },
    documents: 
        {
            // name: {
                type: String,
                required: true,
            // },
            // file: {
            //     type: Buffer,
            //     required: true,
            // },
        },
    
});

module.exports = mongoose.model('Project', projectSchema);;

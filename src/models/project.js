const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    project_id: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["Review", "Approved", "Rejected", "Ongoing", "Completed"],
        required: true
    },
    start_date: { type: Date },
    end_date: { type: Date },
    manager_id: { type: Number },
    reviewer_id: { type: Number },
    approver_id: { type: Number },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
        unique: true,
    },
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
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reviewer',
        required: true
    },
    status: {
        type: String,
        enum: ["Submitted", "Approved", "Under Approval", "Under Review", "Reviewed", "Rejected"],
        required: true
    },
    apostolate: {
        type: String,
        required: true,
    },
    budget: {
        type: String,
        required: true,
    },
    monthly_report: {
        finance: 
        {
            type: String
        },
        activity:
        {
            type: String
        }
    },
    comments : [{
        type: String
    }]
});

module.exports = mongoose.model('Project', projectSchema);;

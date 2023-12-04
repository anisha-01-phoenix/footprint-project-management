const mongoose = require('mongoose');

const projectDocumentSchema = new mongoose.Schema({
    document_id: {
        type: Number,
        unique: true
    },
    project_id: { type: Number },
    document_name: { type: String },
    document_path: { type: String },
    uploaded_by: { type: Number },
    upload_date: {
        type: Date,
        default: Date.now
    },
});

const ProjectDocument = mongoose.model('ProjectDocument', projectDocumentSchema);

module.exports = ProjectDocument;

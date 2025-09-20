const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// Upload a document with versioning
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const file = req.files.file;
        const { projectId } = req.body;
        const userId = req.user.id;

        // Check previous versions
        const existingVersions = await Document.find({
            project: projectId,
            originalName: file.name
        }).sort({ version: -1 });

        const version = existingVersions.length ? existingVersions[0].version + 1 : 1;
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = path.join('uploads', fileName);

        // Move the file to uploads folder
        await file.mv(filePath);

        const newDocument = new Document({
            project: projectId,
            uploadedBy: userId,
            originalName: file.name,
            filePath,
            version
        });

        const savedDoc = await newDocument.save();
        res.status(200).json(savedDoc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get documents for a project (all versions)
exports.getDocumentsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const docs = await Document.find({ project: projectId })
            .populate('uploadedBy', ['name', 'email'])
            .sort({ originalName: 1, version: -1 });

        res.status(200).json(docs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

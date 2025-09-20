const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// Upload document (with version control)
router.post('/upload', auth, documentController.uploadDocument);

// Get all documents for a project
router.get('/project/:projectId', auth, documentController.getDocumentsByProject);

module.exports = router;

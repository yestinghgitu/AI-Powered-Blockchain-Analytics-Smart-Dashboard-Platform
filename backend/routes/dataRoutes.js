const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { uploadDataset, getAllDatasets } = require('../controllers/dataController');

/**
 * @route   POST /api/data/upload
 * @desc    Upload and process a CSV dataset
 * @access  Admin Protected
 */
router.post('/upload', authMiddleware, adminMiddleware, upload.single('csvFile'), uploadDataset);

/**
 * @route   GET /api/data
 * @desc    Get all uploaded datasets (metadata only)
 * @access  Admin Protected
 */
router.get('/', authMiddleware, adminMiddleware, getAllDatasets);

module.exports = router;

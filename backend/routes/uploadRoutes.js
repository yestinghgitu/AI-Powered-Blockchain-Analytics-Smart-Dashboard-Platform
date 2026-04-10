const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
    if (isCsv) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported.'), false);
    }
  }
});

const handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message, error: err.code });
  }
  if (err.message === 'Only .csv files are supported.') {
    return res.status(415).json({ success: false, message: err.message });
  }
  next(err);
};

// Route: POST /api/upload
router.post('/', upload.single('file'), handleMulterError, (req, res, next) => {
  console.log(`[Upload Router] Endpoint /api/upload hit. File received: ${req.file ? req.file.originalname : 'None'}`);
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No CSV file provided.' });
  }
  
  // Forward to existing robust controller logic which returns the JSON response automatically
  dataController.upload(req, res, next);
});

module.exports = router;

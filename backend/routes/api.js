const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dataController = require('../controllers/dataController');
const blockchainController = require('../controllers/blockchainController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

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
  limits: { fileSize: 20 * 1024 * 1024 },
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

// --- Data Ingestion ---
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), handleMulterError, dataController.upload);

// --- AI Analytics ---
router.get('/ai/predict', authMiddleware, adminMiddleware, dataController.getAnalytics);

// --- Blockchain Integration (Solana) ---
router.post('/blockchain/store', authMiddleware, adminMiddleware, blockchainController.storeRef);
router.post('/blockchain/verify', authMiddleware, adminMiddleware, blockchainController.verifyIntegrity);

// --- Legacy Support ---
router.get('/analytics', authMiddleware, adminMiddleware, dataController.getAnalytics);
router.get('/audit-logs', authMiddleware, adminMiddleware, dataController.getAuditLogs);
router.get('/datasets', authMiddleware, adminMiddleware, dataController.getAllDatasets);

router.get('/forecast', authMiddleware, adminMiddleware, dataController.getForecast);
router.get('/health', async (req, res) => {

  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { mongodb: dbStatus }
  });
});

module.exports = router;

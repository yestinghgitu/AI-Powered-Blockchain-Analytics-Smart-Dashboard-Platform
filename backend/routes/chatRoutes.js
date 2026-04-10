const express = require('express');
const router = express.Router();
const { askAssistant } = require('../controllers/chatController');

/**
 * @desc    AI Assistant Query
 * @route   POST /api/chat/ask
 * @access  Public (for now)
 */
router.post('/ask', askAssistant);

module.exports = router;

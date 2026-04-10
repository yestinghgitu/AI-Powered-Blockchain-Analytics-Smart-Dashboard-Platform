const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiController = require('../controllers/aiController');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../middleware/schemas');

router.post('/chat', authMiddleware, validate(schemas.aiChat), aiController.handleChat);

module.exports = router;


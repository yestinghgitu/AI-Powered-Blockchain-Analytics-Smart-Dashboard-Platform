const express = require('express');
const router = express.Router();

const dataRoutes = require('./dataRoutes');
const chatRoutes = require('./chatRoutes');
const authRoutes = require('./auth');

/**
 * @desc    Health Check Endpoint
 * @route   GET /api/health
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Backend Core is healthy and running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

/**
 * @desc    Data Management Routes
 * @route   /api/data
 */
router.use('/data', dataRoutes);

/**
 * @desc    AI Assistant Routes
 * @route   /api/chat
 */
router.use('/chat', chatRoutes);

/**
 * @desc    Admin & Authentication Routes
 * @route   /api/admin
 */
router.use('/admin', authRoutes);

/**
 * @desc    Root Endpoint
 * @route   GET /
 * @access  Public
 */
router.get('/', (req, res) => {
    res.send('AI Business Analytics Backend Core is online.');
});

module.exports = router;

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const routes = require('./routes/index');

/**
 * Connect to MongoDB
 */

/**
 * Connect to MongoDB
 */
connectDB();

/**
 * Initialize Express Application
 */
const app = express();

/**
 * Create HTTP Server for Socket.io
 */
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

/**
 * Attach io to app for access in controllers
 */
app.set('io', io);

/**
 * Socket.io Connection Logic
 */
io.on('connection', (socket) => {
    console.log(`\x1b[32m%s\x1b[0m`, `[Socket] New client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`\x1b[33m%s\x1b[0m`, `[Socket] Client disconnected: ${socket.id}`);
    });
});

/**
 * Global Middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Root Route for Status Check
 */
app.get('/', (req, res) => {
    res.status(200).send('API is running with Real-time Sockets...');
});

/**
 * Error Handling Middleware (must be after routes)
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Define Server Port
 */
const PORT = process.env.PORT || 5000;

/**
 * Start Server
 */
server.listen(PORT, () => {
    console.log(`\x1b[35m%s\x1b[0m`, `[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };

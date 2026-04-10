const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
const PORT = process.env.PORT || 5000;

// Attach io to app for global access
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Request Logging Configuration
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const aiRoutes = require('./routes/ai');

// Base V1 Router
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/ai', aiRoutes);
// The apiRoutes contain /upload, /blockchain, etc. which belong on /
v1Router.use('/', apiRoutes);

app.use('/api/v1', v1Router);

// Explicit root-level /api/upload router 
// Fixes 'POST /api/upload 404' as requested without modifying other routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Legacy /api alias — frontend uses VITE_API_URL=http://localhost:5000/api
// which means AuthGate posts to /api/auth/login (no /v1 prefix)
const legacyRouter = express.Router();
legacyRouter.use('/auth', authRoutes);
legacyRouter.use('/ai', aiRoutes);
legacyRouter.use('/', apiRoutes);
app.use('/api', legacyRouter);

app.get('/', (req, res) => {
  res.send('AI Business Analytics Backend is running');
});

// Centralized Error Handling Middleware (must be after routes)
app.use(errorHandler);

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  logger.info('MongoDB connected successfully inside Express application');
  
  server.listen(PORT, () => {
    logger.info(`Server running securely on port ${PORT} with Real-time Sockets enabled`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Retrying or shutting down...`);
      process.exit(1);
    }
  });
}).catch(err => {
  logger.error('MongoDB connection error: ' + err.message);
});


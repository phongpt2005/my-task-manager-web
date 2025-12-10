/**
 * Task Management System - Backend Entry Point
 * Express server with MongoDB, JWT Auth, AI Integration
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

// Import scheduler for email reminders
const { startScheduler } = require('./services/schedulerService');

// Initialize Express app
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const { log } = require('./utils/logger');

const server = http.createServer(app);
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Make io available in routes
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  log(`User connected: ${socket.id}`);

  socket.on('join_task', (taskId) => {
    socket.join(`task_${taskId}`);
    log(`User ${socket.id} joined task ${taskId}`);
  });

  socket.on('join_user', (userId) => {
    socket.join(userId);
    log(`User ${socket.id} joined user room ${userId}`);
  });

  socket.on('disconnect', () => {
    log(`User disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger
app.use((req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(path.join(__dirname, '../server.log'), logMessage);
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activities', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Task Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.io initialized`);

  // Start email scheduler
  startScheduler();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

module.exports = app;

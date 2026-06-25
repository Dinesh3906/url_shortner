require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

// Initialize app
const app = express();
app.set('trust proxy', 1); // Trust first proxy for Vercel/Cloudflare rate limiting
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (non-blocking on startup, query buffering handles requests)
connectDB().catch(err => console.error('Database connection failed on startup:', err.message));

// Connect to Redis (graceful fallback if offline)
connectRedis();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting to API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const { getIsRedisConnected } = require('./config/redis');
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (dbErr) {
      console.error('Health check database reconnection failed:', dbErr.message);
    }
  }

  res.json({
    status: 'UP',
    hasMongoUri: !!process.env.MONGO_URI,
    mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) : 'none',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cache: getIsRedisConnected() ? 'Connected' : 'Disconnected (Fallback Active)',
    timestamp: new Date()
  });
});

// Short URL Redirection Route (Mounted AFTER API routes to prevent collision)
app.use('/', redirectRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start server (only if not running as a Vercel serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;

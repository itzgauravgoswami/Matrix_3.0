require('dotenv').config(); 
const express = require('express'); 
const cors = require('cors'); 
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth'); 
const paymentRoutes = require('./routes/payment'); 
const userRoutes = require('./routes/user'); 
const quizRoutes = require('./routes/quiz'); 
const notesRoutes = require('./routes/notes'); 
const adminRoutes = require('./routes/admin'); 
const qaTestRoutes = require('./routes/qaTest'); 
const downloadHistoryRoutes = require('./routes/downloadHistory'); 
const learningRoutes = require('./routes/learning'); 
const tutorRoutes = require('./routes/tutor'); 
const gamificationRoutes = require('./routes/gamification'); 
const debugRoutes = require('./routes/debug'); 
const couponRoutes = require('./routes/coupon'); 
const { initializeStreakMaintenance } = require('./utils/streakScheduler'); 

// Import email transporter for verification
const nodemailer = require('nodemailer'); 

const app = express(); 

// Connect to MongoDB
connectDB(); 

// Middleware
app.use(express.json()); 

// Enhanced CORS for Brave browser compatibility
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      process.env.CORS_ORIGINS,
      process.env.LOCAL_CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ].filter(Boolean); 
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS')); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
})); 

// Add headers for Brave compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('origin')); 
  res.header('Access-Control-Allow-Credentials', 'true'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); 
  }
  next(); 
}); 

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/payments', paymentRoutes); 
app.use('/api/user', userRoutes); 
app.use('/api/quizzes', quizRoutes); 
app.use('/api/notes', notesRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/qa-tests', qaTestRoutes); 
app.use('/api/download-history', downloadHistoryRoutes); 
app.use('/api/learning', learningRoutes); 
app.use('/api/tutor', tutorRoutes); 
app.use('/api/gamification', gamificationRoutes); 
app.use('/api/coupons', couponRoutes); 
app.use('/api/debug', debugRoutes); 

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', port: PORT }); 
}); 

// Diagnostic endpoint
app.get('/api/diagnostic', (req, res) => {
  res.json({
    status: 'Backend is running',
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: [
      process.env.CORS_ORIGIN,
      process.env.CORS_ORIGINS,
      process.env.LOCAL_CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ].filter(Boolean),
    jwtSecretSet: !!process.env.JWT_SECRET,
  }); 
}); 

// Debug endpoint - check JWT secret and token
app.post('/api/debug/verify-token', (req, res) => {
  const jwt = require('jsonwebtoken'); 
  const token = req.headers.authorization?.split(' ')[1]; 
  
  // console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET'); 
  // console.log('Token:', token ? 'PROVIDED' : 'NOT PROVIDED'); 
  
  if (!token) {
    return res.json({ error: 'No token provided' }); 
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production'; 
    const decoded = jwt.verify(token, secret); 
    res.json({ success: true, decoded }); 
  } catch (error) {
    res.json({ success: false, error: error.message }); 
  }
}); 

// Error handling middleware
app.use((err, req, res, next) => {
  // console.error(err.stack); 
  res.status(500).json({ message: 'Internal server error' }); 
}); 

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' }); 
}); 

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`); 
  
  // Initialize streak maintenance scheduler
  try {
    console.log('[server] Initializing streak maintenance scheduler...'); 
    initializeStreakMaintenance(); 
    console.log('[server] ✓ Streak maintenance scheduler initialized'); 
  } catch (error) {
    console.error('[server] ✗ Error initializing streak scheduler:', error); 
  }
  
  // Verify email transporter is configured
  // console.log('\n=== EMAIL TRANSPORTER VERIFICATION ==='); 
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // console.log('✓ EMAIL_USER configured:', process.env.EMAIL_USER); 
    // console.log('✓ EMAIL_PASSWORD configured: [hidden]'); 
    
    const testTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    }); 

    testTransporter.verify((error, success) => {
      if (error) {
        // console.error('✗ Email transporter verification FAILED:', error.message); 
        // console.error('   This may cause email delivery issues!'); 
      } else {
        // console.log('✓ Email transporter verified successfully'); 
        // console.log('✓ Emails can be sent from:', process.env.EMAIL_USER); 
      }
    }); 
  } else {
    // console.error('✗ EMAIL_USER or EMAIL_PASSWORD not configured!'); 
    // console.error('   Account deletion emails will NOT be sent.'); 
  }
  // console.log('=====================================\n'); 
}); 
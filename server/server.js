const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { autoSeedIfEmpty } = require('./utils/seedData');

// Initialize express app
const app = express();

// Enable trust proxy for Render / Cloudflare / Vercel reverse proxies
app.set('trust proxy', 1);

// Database Connection state tracking
let isDbConnected = false;
connectDB().then(async (connected) => {
  isDbConnected = connected;
  if (connected) {
    await autoSeedIfEmpty();
  }
});

// Middleware to inject isMockDb flag
app.use((req, res, next) => {
  req.isMockDb = !isDbConnected;
  next();
});

// Security & Optimization Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        process.env.CLIENT_URL,
        'https://aura-care-hms.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
      ].filter(Boolean);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com') ||
        origin.includes('netlify.app') ||
        origin.includes('railway.app') ||
        process.env.CLIENT_URL === '*';

      callback(null, isAllowed);
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 500, // max requests per window
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for avatar & report uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'AuraCare Backend API',
    database: isDbConnected ? 'MongoDB Live' : 'In-Memory Fallback Handler Active',
    timestamp: new Date().toISOString(),
  });
});

// Mount REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/lab', require('./routes/labRoutes'));
app.use('/api/bills', require('./routes/billingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));

// Production Static Monolith Build Fallback
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[AuraCare Server]: Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

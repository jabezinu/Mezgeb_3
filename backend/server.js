import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Request timeout (10 seconds)
const REQUEST_TIMEOUT = 10000;

// Configure CORS
const corsOptions = {
  origin: ['https://mezgebe.vercel.app', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Set timeout for all requests
app.use((req, res, next) => {
  res.setTimeout(REQUEST_TIMEOUT, () => {
    res.status(504).json({ message: 'Request timeout' });
  });
  next();
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);

// MongoDB connection with connection pooling
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const MAX_POOL_SIZE = 10; // Adjust based on your needs

let isConnected = false;
let dbConnection = null;

async function connectDB() {
  if (isConnected) return dbConnection;

  try {
    const options = {
      maxPoolSize: MAX_POOL_SIZE,
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
    };

    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    dbConnection = mongoose.connection;
    
    // Log connection events
    dbConnection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    dbConnection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    dbConnection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    return dbConnection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Set response headers for API
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    // Connect to database
    await connectDB();
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
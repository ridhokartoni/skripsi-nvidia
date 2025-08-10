const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');

// Load environment configuration
const config = require('./config/environment');

const middlewares = require('./middleware/middleware');
const api = require('./api');

const app = express();
const httpServer = http.createServer(app);

// Configure CORS based on environment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    
    // In development, also allow any localhost origin
    if (config.isDevelopment()) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(morgan(config.LOG_FORMAT));
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = httpServer;

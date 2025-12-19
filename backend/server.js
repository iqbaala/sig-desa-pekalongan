const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const logbookRoutes = require('./routes/logbook');
const checkoutRoutes = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
// ... (omitted)
// API routes


// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://labtanam.vercel.app', 'https://labtanam-frontend.vercel.app', 'https://lomba-nbpc-3o8t.vercel.app']
        : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for chat endpoint
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 chat requests per minute
    message: {
        error: 'Too many chat requests, please wait a moment before sending another message.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'LABTANAM Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/checkout', checkoutRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to LABTANAM Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            chat: '/api/chat',
            logbook: '/api/logbook'
        },
        documentation: 'https://github.com/labtanam/api-docs'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.originalUrl} does not exist.`,
        availableEndpoints: [
            '/',
            '/health',
            '/api/chat',
            '/api/logbook'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? err.message : 'Something went wrong on our end.',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🌱 LABTANAM Backend API is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 Chat API: http://localhost:${PORT}/api/chat`);
});

module.exports = app;
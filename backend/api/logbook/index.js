const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logbookRoutes = require('../../routes/logbook');

const app = express();

// CORS configuration for Vercel
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Use logbook routes
app.use('/', logbookRoutes);

module.exports = app;
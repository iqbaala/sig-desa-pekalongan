const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chatRoutes = require('../../routes/chat');

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

// Rate limiting for chat
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 chat requests per minute
    message: {
        error: 'Too many chat requests, please wait a moment before sending another message.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(chatLimiter);

// Use chat routes
app.use('/', chatRoutes);

module.exports = app;
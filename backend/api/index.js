module.exports = (req, res) => {
    res.json({
        message: 'Welcome to LABTANAM Backend API on Vercel',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            chat: '/api/chat',
            logbook: '/api/logbook'
        },
        documentation: 'https://github.com/labtanam/api-docs'
    });
};
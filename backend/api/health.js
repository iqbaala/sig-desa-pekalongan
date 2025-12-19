module.exports = (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'LABTANAM Backend API is running on Vercel',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production'
    });
};
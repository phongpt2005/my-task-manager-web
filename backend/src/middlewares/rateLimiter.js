/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Quá nhiều request, vui lòng thử lại sau 15 phút'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 1 giờ'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

// AI endpoint limiter (more restrictive)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 AI requests per minute
    message: {
        success: false,
        message: 'Quá nhiều request AI, vui lòng thử lại sau 1 phút'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// File upload limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 uploads per hour
    message: {
        success: false,
        message: 'Quá nhiều file upload, vui lòng thử lại sau'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    aiLimiter,
    uploadLimiter
};

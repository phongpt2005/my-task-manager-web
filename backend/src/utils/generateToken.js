/**
 * JWT Token Generation Utility
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
};

module.exports = { generateToken, verifyToken };

/**
 * Validation Utilities
 * Helper functions for data validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with message
 */
const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return {
            isValid: false,
            message: 'Mật khẩu phải có ít nhất 6 ký tự'
        };
    }
    return { isValid: true };
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Is valid ObjectId
 */
const isValidObjectId = (id) => {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
    if (!str) return '';
    return str.trim().replace(/<[^>]*>/g, '');
};

/**
 * Validate task priority
 * @param {string} priority - Priority to validate
 * @returns {boolean} Is valid priority
 */
const isValidPriority = (priority) => {
    return ['Low', 'Medium', 'High'].includes(priority);
};

/**
 * Validate task status
 * @param {string} status - Status to validate
 * @returns {boolean} Is valid status
 */
const isValidStatus = (status) => {
    return ['todo', 'inprogress', 'review', 'done'].includes(status);
};

module.exports = {
    isValidEmail,
    validatePassword,
    isValidObjectId,
    sanitizeString,
    isValidPriority,
    isValidStatus
};

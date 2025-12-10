/**
 * Email Service
 * Handles all email sending functionality
 */

const { createTransporter, emailTemplates } = require('../config/email');

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Task Manager <noreply@taskmanager.com>',
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send OTP for password reset
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {string} userName - User name
 */
const sendResetPasswordOTP = async (email, otp, userName) => {
    const template = emailTemplates.resetPassword(otp, userName);
    return await sendEmail(email, template.subject, template.html);
};

/**
 * Send deadline reminder
 * @param {string} email - User email
 * @param {Object} task - Task object
 * @param {string} userName - User name
 */
const sendDeadlineReminder = async (email, task, userName) => {
    const template = emailTemplates.deadlineReminder(task, userName);
    return await sendEmail(email, template.subject, template.html);
};

/**
 * Send daily summary
 * @param {string} email - User email
 * @param {Object} taskStats - Task statistics
 * @param {string} userName - User name
 */
const sendDailySummary = async (email, taskStats, userName) => {
    const template = emailTemplates.dailySummary(taskStats, userName);
    return await sendEmail(email, template.subject, template.html);
};

module.exports = {
    sendEmail,
    sendResetPasswordOTP,
    sendDeadlineReminder,
    sendDailySummary
};

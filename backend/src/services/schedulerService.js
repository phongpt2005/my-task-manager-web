/**
 * Scheduler Service
 * Cron jobs for email notifications
 */

const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDeadlineReminder, sendDailySummary } = require('./emailService');
const { createNotification } = require('../controllers/notificationController');

/**
 * Check for tasks approaching deadline and send reminders
 */
const checkDeadlineReminders = async () => {
    try {
        console.log('🔔 Checking deadline reminders...');

        // Get tasks with deadline in next 24 hours that haven't been reminded
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await Task.find({
            deadline: { $lte: tomorrow, $gte: new Date() },
            status: { $ne: 'done' },
            reminderSent: false
        }).populate('createdBy', 'name email emailNotifications');

        for (const task of tasks) {
            const user = task.createdBy;

            // Check if user wants deadline reminders
            if (user && user.emailNotifications?.deadlineReminder) {
                await sendDeadlineReminder(user.email, task, user.name);

                // Create in-app notification
                // We need access to io instance. Since this is a service, we might need to pass it or get it from app
                // For now, we'll just create the DB record. The controller's createNotification handles emitting if io is passed,
                // but here we might not have io easily.
                // Actually, let's try to get io if possible, or just save to DB and let client poll/socket update on next event.
                // A better way is to export io from index.js or attach to global, but for simplicity:

                await createNotification(null, { // Pass null for io for now, or we can require the server instance if exported
                    recipient: user._id,
                    type: 'deadline',
                    title: 'Sắp đến hạn!',
                    message: `Task "${task.title}" sẽ hết hạn vào ngày mai.`,
                    data: { taskId: task._id }
                });

                // Mark reminder as sent
                task.reminderSent = true;
                await task.save();

                console.log(`📧 Sent deadline reminder for "${task.title}" to ${user.email}`);
            }
        }
    } catch (error) {
        console.error('Deadline reminder check failed:', error);
    }
};

/**
 * Send daily summary to all users
 */
const sendDailySummaries = async () => {
    try {
        console.log('📋 Sending daily summaries...');

        const users = await User.find({
            isActive: true,
            'emailNotifications.dailySummary': true
        });

        for (const user of users) {
            // Get task stats for user
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [completed, inProgress, todo, overdue] = await Promise.all([
                Task.countDocuments({
                    createdBy: user._id,
                    status: 'done',
                    completedAt: { $gte: today }
                }),
                Task.countDocuments({
                    createdBy: user._id,
                    status: 'inprogress'
                }),
                Task.countDocuments({
                    createdBy: user._id,
                    status: 'todo'
                }),
                Task.countDocuments({
                    createdBy: user._id,
                    deadline: { $lt: new Date() },
                    status: { $ne: 'done' }
                })
            ]);

            const taskStats = { completed, inProgress, todo, overdue };

            // Only send if there are tasks
            if (completed + inProgress + todo + overdue > 0) {
                await sendDailySummary(user.email, taskStats, user.name);
                console.log(`📧 Sent daily summary to ${user.email}`);
            }
        }
    } catch (error) {
        console.error('Daily summary sending failed:', error);
    }
};

/**
 * Start all scheduled jobs
 */
const startScheduler = () => {
    console.log('⏰ Starting scheduler...');

    // Check deadline reminders every hour
    cron.schedule('0 * * * *', () => {
        checkDeadlineReminders();
    });

    // Send daily summary at 8 AM every day
    cron.schedule('0 8 * * *', () => {
        sendDailySummaries();
    });

    // Also check reminders on startup
    setTimeout(() => {
        checkDeadlineReminders();
    }, 5000);

    console.log('✅ Scheduler started successfully');
};

module.exports = {
    startScheduler,
    checkDeadlineReminders,
    sendDailySummaries
};

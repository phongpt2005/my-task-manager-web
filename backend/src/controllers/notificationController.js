const Notification = require('../models/Notification');
const { log } = require('../utils/logger');

// Get notifications for current user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông báo',
            error: error.message
        });
    }
};

// Mark notifications as read
const markRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 'all') {
            await Notification.updateMany(
                { recipient: req.user.id, isRead: false },
                { isRead: true }
            );
        } else {
            await Notification.findOneAndUpdate(
                { _id: id, recipient: req.user.id },
                { isRead: true }
            );
        }

        res.json({
            success: true,
            message: 'Đã đánh dấu đã đọc'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái',
            error: error.message
        });
    }
};

// Internal helper to create notification
const createNotification = async (io, { recipient, type, title, message, data }) => {
    try {
        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            data
        });

        // Emit real-time event if user is connected
        if (io) {
            // We can emit to a specific room if we have user-specific rooms set up
            // Assuming socket.join(userId) was done on connection
            log(`Emitting to room ${recipient.toString()}`);
            io.to(recipient.toString()).emit('new_notification', notification);
        } else {
            log('Socket.io instance not found');
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = {
    getNotifications,
    markRead,
    createNotification
};

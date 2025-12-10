/**
 * Activity Controller
 * Handles activity log operations
 */

const ActivityLog = require('../models/ActivityLog');
const { isValidObjectId } = require('../utils/validators');

/**
 * @desc    Get activity logs
 * @route   GET /api/activities
 * @access  Private
 */
const getActivities = async (req, res) => {
    try {
        const {
            entityType,
            entityId,
            page = 1,
            limit = 20
        } = req.query;

        const query = {};

        // Regular users see only their own activities
        // Admin sees all
        if (req.user.role !== 'admin') {
            query.user = req.user.id;
        }

        if (entityType) query.entityType = entityType;
        if (entityId && isValidObjectId(entityId)) query.entityId = entityId;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [activities, total] = await Promise.all([
            ActivityLog.find(query)
                .populate('user', 'name email avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ActivityLog.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Activities Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy lịch sử hoạt động'
        });
    }
};

/**
 * @desc    Get my recent activities
 * @route   GET /api/activities/my
 * @access  Private
 */
const getMyActivities = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const activities = await ActivityLog.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        console.error('Get My Activities Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy hoạt động'
        });
    }
};

/**
 * @desc    Get activities for a specific task
 * @route   GET /api/activities/task/:taskId
 * @access  Private
 */
const getTaskActivities = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!isValidObjectId(taskId)) {
            return res.status(400).json({
                success: false,
                message: 'ID task không hợp lệ'
            });
        }

        const activities = await ActivityLog.find({
            entityType: 'task',
            entityId: taskId
        })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        console.error('Get Task Activities Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy lịch sử task'
        });
    }
};

/**
 * Helper: Log activity (exported for use in other controllers)
 */
const logActivity = async (data) => {
    try {
        await ActivityLog.log(data);
    } catch (error) {
        console.error('Log Activity Error:', error);
    }
};

module.exports = {
    getActivities,
    getMyActivities,
    getTaskActivities,
    logActivity
};

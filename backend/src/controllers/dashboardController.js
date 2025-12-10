/**
 * Dashboard Controller
 * Provides statistics and analytics data
 */

const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get task counts by status
        const [
            totalTasks,
            todoCount,
            inProgressCount,
            reviewCount,
            doneCount,
            overdueCount,
            todayTasks,
            projectCount
        ] = await Promise.all([
            Task.countDocuments({ createdBy: userId }),
            Task.countDocuments({ createdBy: userId, status: 'todo' }),
            Task.countDocuments({ createdBy: userId, status: 'inprogress' }),
            Task.countDocuments({ createdBy: userId, status: 'review' }),
            Task.countDocuments({ createdBy: userId, status: 'done' }),
            Task.countDocuments({
                createdBy: userId,
                status: { $ne: 'done' },
                deadline: { $lt: new Date() }
            }),
            Task.countDocuments({
                createdBy: userId,
                deadline: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }),
            Project.countDocuments({ createdBy: userId, isActive: true })
        ]);

        // Task distribution by status for chart
        const tasksByStatus = [
            { name: 'Chờ làm', value: todoCount, color: '#64748b' },
            { name: 'Đang làm', value: inProgressCount, color: '#3b82f6' },
            { name: 'Đang review', value: reviewCount, color: '#f59e0b' },
            { name: 'Hoàn thành', value: doneCount, color: '#22c55e' }
        ];

        // Task distribution by priority
        const [highPriority, mediumPriority, lowPriority] = await Promise.all([
            Task.countDocuments({ createdBy: userId, priority: 'High', status: { $ne: 'done' } }),
            Task.countDocuments({ createdBy: userId, priority: 'Medium', status: { $ne: 'done' } }),
            Task.countDocuments({ createdBy: userId, priority: 'Low', status: { $ne: 'done' } })
        ]);

        const tasksByPriority = [
            { name: 'Cao', value: highPriority, color: '#ef4444' },
            { name: 'Trung bình', value: mediumPriority, color: '#f59e0b' },
            { name: 'Thấp', value: lowPriority, color: '#22c55e' }
        ];

        // Completion rate
        const completionRate = totalTasks > 0
            ? Math.round((doneCount / totalTasks) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                overview: {
                    totalTasks,
                    todoCount,
                    inProgressCount,
                    reviewCount,
                    doneCount,
                    overdueCount,
                    todayTasks,
                    projectCount,
                    completionRate
                },
                tasksByStatus,
                tasksByPriority
            }
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thống kê'
        });
    }
};

/**
 * @desc    Get weekly progress
 * @route   GET /api/dashboard/weekly-progress
 * @access  Private
 */
const getWeeklyProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();

        // Get data for the last 7 days
        const weeklyData = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [created, completed] = await Promise.all([
                Task.countDocuments({
                    createdBy: userId,
                    createdAt: { $gte: date, $lt: nextDate }
                }),
                Task.countDocuments({
                    createdBy: userId,
                    status: 'done',
                    completedAt: { $gte: date, $lt: nextDate }
                })
            ]);

            weeklyData.push({
                day: dayNames[date.getDay()],
                date: date.toISOString().split('T')[0],
                created,
                completed
            });
        }

        // Calculate weekly totals
        const weeklyTotals = {
            created: weeklyData.reduce((sum, d) => sum + d.created, 0),
            completed: weeklyData.reduce((sum, d) => sum + d.completed, 0)
        };

        res.json({
            success: true,
            data: {
                weeklyData,
                weeklyTotals
            }
        });
    } catch (error) {
        console.error('Get Weekly Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy tiến độ tuần'
        });
    }
};

/**
 * @desc    Get recent tasks
 * @route   GET /api/dashboard/recent-tasks
 * @access  Private
 */
const getRecentTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        const recentTasks = await Task.find({ createdBy: userId })
            .populate('project', 'name color icon')
            .sort({ updatedAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: { tasks: recentTasks }
        });
    } catch (error) {
        console.error('Get Recent Tasks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy tasks gần đây'
        });
    }
};

/**
 * @desc    Get upcoming deadlines
 * @route   GET /api/dashboard/upcoming-deadlines
 * @access  Private
 */
const getUpcomingDeadlines = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        const upcomingTasks = await Task.find({
            createdBy: userId,
            status: { $ne: 'done' },
            deadline: { $gte: new Date() }
        })
            .populate('project', 'name color icon')
            .sort({ deadline: 1 })
            .limit(limit);

        res.json({
            success: true,
            data: { tasks: upcomingTasks }
        });
    } catch (error) {
        console.error('Get Upcoming Deadlines Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy deadlines sắp tới'
        });
    }
};

module.exports = {
    getStats,
    getWeeklyProgress,
    // ... existing exports
    getRecentTasks,
    getUpcomingDeadlines,

    /**
     * @desc    Get heatmap data (GitHub style)
     * @route   GET /api/dashboard/heatmap
     */
    getHeatmapData: async (req, res) => {
        try {
            const userId = req.user.id;
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            const tasks = await Task.aggregate([
                {
                    $match: {
                        createdBy: new mongoose.Types.ObjectId(userId),
                        status: 'done',
                        completedAt: { $gte: oneYearAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.json({
                success: true,
                data: { heatmap: tasks.map(t => ({ date: t._id, count: t.count })) }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * @desc    Get Weekly Focus Score
     * @route   GET /api/dashboard/focus-score
     */
    getFocusScore: async (req, res) => {
        try {
            const userId = req.user.id;
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - 7); // Last 7 days

            const completedTasks = await Task.find({
                createdBy: userId,
                status: 'done',
                completedAt: { $gte: startOfWeek }
            });

            const totalCreatedInPeriod = await Task.countDocuments({
                createdBy: userId,
                createdAt: { $gte: startOfWeek }
            });

            // Calculate metrics (0-100)

            // 1. Productivity: Tasks completed vs Goal (say 20/week is 100)
            const count = completedTasks.length;
            const productivity = Math.min(100, (count / 15) * 100);

            // 2. Timeliness: % of tasks completed on time
            const onTimeCount = completedTasks.filter(t => !t.deadline || new Date(t.completedAt) <= new Date(t.deadline)).length;
            const timeliness = count > 0 ? (onTimeCount / count) * 100 : 0;

            // 3. Efficiency: Completed vs Created (Keep up with income)
            const efficiency = totalCreatedInPeriod > 0 ? Math.min(100, (count / totalCreatedInPeriod) * 100) : 100;

            // 4. Focus: High priority tasks completed ratio
            const highPriorityCount = completedTasks.filter(t => t.priority === 'High').length;
            const focus = count > 0 ? (highPriorityCount / count) * 100 * 1.5 : 0; // Bonus for high priority

            // 5. Consistency: Days with at least 1 task
            const activeDays = new Set(completedTasks.map(t => new Date(t.completedAt).toDateString())).size;
            const consistency = (activeDays / 7) * 100;

            const scores = [
                { subject: 'Hiệu suất', A: Math.round(productivity), fullMark: 100 },
                { subject: 'Đúng hạn', A: Math.round(timeliness), fullMark: 100 },
                { subject: 'Tốc độ', A: Math.round(efficiency), fullMark: 100 },
                { subject: 'Tập trung', A: Math.round(Math.min(100, focus)), fullMark: 100 },
                { subject: 'Đều đặn', A: Math.round(consistency), fullMark: 100 }
            ];

            res.json({
                success: true,
                data: { scores }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

/**
 * Admin Controller
 * Handles admin-only operations for user and system management
 */

const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { isValidObjectId } = require('../utils/validators');
const { createNotification } = require('./notificationController');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -resetPasswordOTP -resetPasswordExpire')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        // Get stats for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const [taskCount, projectCount] = await Promise.all([
                    Task.countDocuments({ createdBy: user._id }),
                    Project.countDocuments({ createdBy: user._id })
                ]);
                return {
                    ...user.toObject(),
                    taskCount,
                    projectCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách người dùng'
        });
    }
};

/**
 * @desc    Get single user details (Admin only)
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        const user = await User.findById(id)
            .select('-password -resetPasswordOTP -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Get user's stats
        const [taskCount, projectCount, completedTasks] = await Promise.all([
            Task.countDocuments({ createdBy: id }),
            Project.countDocuments({ createdBy: id }),
            Task.countDocuments({ createdBy: id, status: 'done' })
        ]);

        res.json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    taskCount,
                    projectCount,
                    completedTasks
                }
            }
        });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin người dùng'
        });
    }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ. Chỉ có thể là "user" hoặc "admin".'
            });
        }

        // Prevent admin from demoting themselves
        if (id === req.user.id && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể tự hạ cấp chính mình'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Notify user about role change
        await createNotification(req.app.get('io'), {
            recipient: id,
            type: 'stats',
            title: role === 'admin' ? 'Bạn đã được nâng cấp! 👑' : 'Vai trò đã thay đổi',
            message: role === 'admin'
                ? 'Bạn đã được nâng cấp thành Admin với toàn quyền hệ thống.'
                : 'Vai trò hệ thống của bạn đã được thay đổi thành User.',
            data: {}
        });

        res.json({
            success: true,
            message: `Đã cập nhật vai trò thành ${role}`,
            data: { user }
        });
    } catch (error) {
        console.error('Update User Role Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật vai trò'
        });
    }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PUT /api/admin/users/:id/status
 * @access  Admin
 */
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        // Prevent admin from deactivating themselves
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể vô hiệu hóa chính mình'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản',
            data: { user }
        });
    } catch (error) {
        console.error('Toggle User Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật trạng thái'
        });
    }
};

/**
 * @desc    Get system statistics (Admin only)
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getSystemStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            adminUsers,
            totalTasks,
            completedTasks,
            totalProjects
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'admin' }),
            Task.countDocuments(),
            Task.countDocuments({ status: 'done' }),
            Project.countDocuments({ isActive: true })
        ]);

        // Get tasks by status
        const tasksByStatus = await Task.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get recent activities (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentTasks = await Task.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    admins: adminUsers,
                    newThisWeek: recentUsers
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    byStatus: tasksByStatus,
                    newThisWeek: recentTasks
                },
                projects: {
                    total: totalProjects
                }
            }
        });
    } catch (error) {
        console.error('Get System Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thống kê hệ thống'
        });
    }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        // Prevent admin from deleting themselves
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể xóa chính mình'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Soft delete - just deactivate
        user.isActive = false;
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();

        res.json({
            success: true,
            message: 'Đã xóa người dùng'
        });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa người dùng'
        });
    }
};

module.exports = {
    getAllUsers,
    getUser,
    updateUserRole,
    toggleUserStatus,
    getSystemStats,
    deleteUser
};

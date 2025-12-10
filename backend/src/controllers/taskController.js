/**
 * Task Controller
 * Handles all task CRUD operations
 */

const Task = require('../models/Task');
const User = require('../models/User');
const { isValidObjectId, isValidPriority, isValidStatus } = require('../utils/validators');
const { createNotification } = require('./notificationController');

/**
 * @desc    Get all tasks with filters
 * @route   GET /api/tasks
 * @access  Private
 * @query   viewAll=true (admin only) - View all tasks
 * @query   userId (admin only) - Filter by specific user
 */
const getTasks = async (req, res) => {
    try {
        const {
            status,
            priority,
            project,
            search,
            tags,
            startDate,
            endDate,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            viewAll,      // Admin: view all tasks
            userId        // Admin: filter by user
        } = req.query;

        const isAdmin = req.user.role === 'admin';

        // Build query
        const query = {};

        // Admin can view all or filter by user
        if (isAdmin && viewAll === 'true') {
            // View all tasks
            if (userId && isValidObjectId(userId)) {
                query.createdBy = userId;
            }
            // If no userId, show all tasks
        } else {
            // Regular user: only their own tasks
            query.createdBy = req.user.id;
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (project) query.project = project;
        if (tags) query.tags = { $in: tags.split(',') };

        // Date range filter
        if (startDate || endDate) {
            query.deadline = {};
            if (startDate) query.deadline.$gte = new Date(startDate);
            if (endDate) query.deadline.$lte = new Date(endDate);
        }

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .populate('project', 'name color icon')
                .populate('createdBy', 'name email avatar') // Include creator info for admin
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Task.countDocuments(query)
        ]);

        // For admin, also return list of users for filter dropdown
        let users = [];
        if (isAdmin && viewAll === 'true') {
            users = await User.find({ isActive: true })
                .select('name email avatar')
                .sort({ name: 1 });
        }

        res.json({
            success: true,
            data: {
                tasks,
                users: isAdmin ? users : undefined,
                isAdmin,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Tasks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách task'
        });
    }
};


/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID task không hợp lệ'
            });
        }

        const task = await Task.findOne({
            _id: id,
            createdBy: req.user.id
        }).populate('project', 'name color icon');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        res.json({
            success: true,
            data: { task }
        });
    } catch (error) {
        console.error('Get Task Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin task'
        });
    }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            deadline,
            project,
            tags,
            estimatedTime,
            difficulty,
            notes
        } = req.body;

        // Validate required fields
        if (!title || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tiêu đề và deadline'
            });
        }

        // Validate priority
        if (priority && !isValidPriority(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Mức ưu tiên không hợp lệ'
            });
        }

        // Get max order for status column
        const maxOrderTask = await Task.findOne({
            createdBy: req.user.id,
            status: 'todo'
        }).sort({ order: -1 });

        const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

        const task = await Task.create({
            title,
            description,
            priority: priority || 'Medium',
            deadline: new Date(deadline),
            project,
            tags: tags || [],
            estimatedTime,
            difficulty,
            notes,
            createdBy: req.user.id,
            order
        });

        const populatedTask = await Task.findById(task._id)
            .populate('project', 'name color icon');

        // Send notification for new task created
        await createNotification(req.app.get('io'), {
            recipient: req.user.id,
            type: 'stats',
            title: 'Task mới! 📝',
            message: `Bạn vừa tạo task "${task.title}".`,
            data: { taskId: task._id, link: '/tasks' }
        });

        res.status(201).json({
            success: true,
            message: 'Tạo task thành công',
            data: { task: populatedTask }
        });
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi tạo task'
        });
    }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID task không hợp lệ'
            });
        }

        // Validate priority if provided
        if (updateData.priority && !isValidPriority(updateData.priority)) {
            return res.status(400).json({
                success: false,
                message: 'Mức ưu tiên không hợp lệ'
            });
        }

        // Validate status if provided
        if (updateData.status && !isValidStatus(updateData.status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Convert deadline to Date
        if (updateData.deadline) {
            updateData.deadline = new Date(updateData.deadline);
        }

        const task = await Task.findOneAndUpdate(
            { _id: id, createdBy: req.user.id },
            updateData,
            { new: true, runValidators: true }
        ).populate('project', 'name color icon');

        // If task is marked as done, send congratulatory notification
        if (updateData.status === 'done' && task.status === 'done') {
            await createNotification(req.app.get('io'), {
                recipient: req.user.id,
                type: 'stats', // Shows in Dashboard/Stats tab
                title: 'Xuất sắc! 🎉',
                message: `Bạn vừa hoàn thành task "${task.title}".`,
                data: { taskId: task._id }
            });
        } else if (!updateData.status) {
            // Task was edited (not status change)
            await createNotification(req.app.get('io'), {
                recipient: req.user.id,
                type: 'calendar',
                title: 'Đã cập nhật! ✏️',
                message: `Task "${task.title}" đã được cập nhật.`,
                data: { taskId: task._id, link: '/tasks' }
            });
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật task thành công',
            data: { task }
        });
    } catch (error) {
        console.error('Update Task Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật task'
        });
    }
};

/**
 * @desc    Update task status (for Kanban drag & drop)
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, order } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID task không hợp lệ'
            });
        }

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updateData = { status };
        if (typeof order === 'number') {
            updateData.order = order;
        }

        const task = await Task.findOneAndUpdate(
            { _id: id, createdBy: req.user.id },
            updateData,
            { new: true }
        ).populate('project', 'name color icon');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: { task }
        });

        // Send notification for Kanban status change (after response to not block)
        const statusLabels = {
            todo: 'Chờ làm',
            inprogress: 'Đang làm',
            review: 'Đang review',
            done: 'Hoàn thành'
        };
        await createNotification(req.app.get('io'), {
            recipient: req.user.id,
            type: 'deadline',
            title: 'Di chuyển task! 🔄',
            message: `Task "${task.title}" chuyển sang "${statusLabels[status] || status}".`,
            data: { taskId: task._id, link: '/kanban' }
        });
    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật trạng thái'
        });
    }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID task không hợp lệ'
            });
        }

        const task = await Task.findOneAndDelete({
            _id: id,
            createdBy: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        // Save task title before deleting for notification
        const taskTitle = task.title;

        res.json({
            success: true,
            message: 'Xóa task thành công'
        });

        // Send notification after response
        await createNotification(req.app.get('io'), {
            recipient: req.user.id,
            type: 'stats',
            title: 'Đã xóa! 🗑️',
            message: `Task "${taskTitle}" đã được xóa.`,
            data: { link: '/tasks' }
        });
    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa task'
        });
    }
};

/**
 * @desc    Get tasks by date (for Calendar)
 * @route   GET /api/tasks/calendar/:date
 * @access  Private
 */
const getTasksByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const { view = 'month' } = req.query;

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(date);

        switch (view) {
            case 'day':
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                endDate.setDate(endDate.getDate() + 7);
                break;
            case 'month':
            default:
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
                // Also get from start of month
                startDate.setDate(1);
                break;
        }

        const tasks = await Task.find({
            createdBy: req.user.id,
            deadline: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .populate('project', 'name color icon')
            .sort({ deadline: 1 });

        res.json({
            success: true,
            data: { tasks }
        });
    } catch (error) {
        console.error('Get Tasks By Date Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy tasks theo ngày'
        });
    }
};

/**
 * @desc    Upload file attachment
 * @route   POST /api/tasks/:id/upload
 * @access  Private
 */
const uploadAttachment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID task không hợp lệ'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file'
            });
        }

        const attachment = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: `/uploads/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        const task = await Task.findOneAndUpdate(
            { _id: id, createdBy: req.user.id },
            { $push: { attachments: attachment } },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        res.json({
            success: true,
            message: 'Upload file thành công',
            data: { attachment, task }
        });
    } catch (error) {
        console.error('Upload Attachment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi upload file'
        });
    }
};

/**
 * @desc    Reorder tasks in Kanban (bulk update)
 * @route   PATCH /api/tasks/reorder
 * @access  Private
 */
const reorderTasks = async (req, res) => {
    try {
        const { tasks } = req.body;

        if (!Array.isArray(tasks)) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ'
            });
        }

        // Bulk update tasks
        const bulkOps = tasks.map(({ id, status, order }) => ({
            updateOne: {
                filter: { _id: id, createdBy: req.user.id },
                update: { status, order }
            }
        }));

        await Task.bulkWrite(bulkOps);

        res.json({
            success: true,
            message: 'Cập nhật vị trí thành công'
        });
    } catch (error) {
        console.error('Reorder Tasks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật vị trí'
        });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksByDate,
    uploadAttachment,
    // ... existing exports
    uploadAttachment,
    reorderTasks,

    /**
     * @desc    Start timer for a task
     * @route   POST /api/tasks/:id/start-timer
     */
    startTimer: async (req, res) => {
        try {
            const { id } = req.params;
            const task = await Task.findOne({ _id: id, createdBy: req.user.id });

            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            // Check if already running
            const activeLog = task.timeLogs.find(log => !log.endTime);
            if (activeLog) {
                return res.status(400).json({ success: false, message: 'Timer is already running' });
            }

            task.timeLogs.push({ startTime: new Date() });

            // Auto move to inprogress if todo
            if (task.status === 'todo') {
                task.status = 'inprogress';
            }

            await task.save();

            res.json({ success: true, message: 'Timer started', data: { task } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * @desc    Stop timer for a task
     * @route   POST /api/tasks/:id/stop-timer
     */
    stopTimer: async (req, res) => {
        try {
            const { id } = req.params;
            const task = await Task.findOne({ _id: id, createdBy: req.user.id });

            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            const activeLogIndex = task.timeLogs.findIndex(log => !log.endTime);
            if (activeLogIndex === -1) {
                return res.status(400).json({ success: false, message: 'No active timer found' });
            }

            const endTime = new Date();
            const startTime = new Date(task.timeLogs[activeLogIndex].startTime);
            const durationSeconds = (endTime - startTime) / 1000;

            task.timeLogs[activeLogIndex].endTime = endTime;
            task.timeLogs[activeLogIndex].duration = durationSeconds;

            // Update total actual time in hours
            task.actualTime = (task.actualTime || 0) + (durationSeconds / 3600);

            await task.save();

            res.json({ success: true, message: 'Timer stopped', data: { task } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * @desc    Log Pomodoro session
     * @route   POST /api/tasks/:id/pomodoro
     */
    logPomodoro: async (req, res) => {
        try {
            const { id } = req.params;
            const { duration } = req.body; // minutes

            const task = await Task.findOne({ _id: id, createdBy: req.user.id });

            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            task.pomodoroSessions.count = (task.pomodoroSessions.count || 0) + 1;
            task.pomodoroSessions.totalDuration = (task.pomodoroSessions.totalDuration || 0) + (duration || 25);

            // Also log to actualTime
            task.actualTime = (task.actualTime || 0) + ((duration || 25) / 60);

            await task.save();

            res.json({ success: true, message: 'Pomodoro logged', data: { task } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

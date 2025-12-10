/**
 * AI Controller
 * Handles all AI-powered features
 */

const aiService = require('../services/aiService');
const Task = require('../models/Task');
const { createNotification } = require('./notificationController');
const { log } = require('../utils/logger');

/**
 * @desc    Generate daily work plan
 * @route   POST /api/ai/generate-plan
 * @access  Private
 */
const generatePlan = async (req, res) => {
    try {
        const { availableTime } = req.body;

        // Get user's pending tasks
        const tasks = await Task.find({
            createdBy: req.user.id,
            status: { $in: ['todo', 'inprogress'] },
            deadline: { $gte: new Date() }
        }).sort({ deadline: 1, priority: -1 });

        if (tasks.length === 0) {
            return res.json({
                success: true,
                data: {
                    plan: '🎉 Tuyệt vời! Bạn không có task nào cần làm hôm nay. Hãy nghỉ ngơi hoặc tạo task mới!'
                }
            });
        }

        const plan = await aiService.generateDailyPlan(tasks, availableTime || {
            startTime: '08:00',
            endTime: '17:00',
            breakTime: '12:00-13:00'
        });

        // Create notification
        log(`Creating notification for user: ${req.user.id}`);
        await createNotification(req.app.get('io'), {
            recipient: req.user.id,
            type: 'ai',
            title: 'Kế hoạch đã sẵn sàng! 🤖',
            message: 'AI vừa tạo xong lịch làm việc cho ngày hôm nay của bạn.',
            data: { link: '/ai-assistant' }
        });

        res.json({
            success: true,
            data: { plan }
        });
    } catch (error) {
        console.error('Generate Plan Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi tạo kế hoạch'
        });
    }
};

/**
 * @desc    Summarize task description
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarize = async (req, res) => {
    try {
        const { description, taskId } = req.body;

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung cần tóm tắt'
            });
        }

        const summary = await aiService.summarizeDescription(description);

        // Optionally save summary to task
        if (taskId) {
            await Task.findOneAndUpdate(
                { _id: taskId, createdBy: req.user.id },
                { aiSummary: summary }
            );
        }

        res.json({
            success: true,
            data: { summary }
        });
    } catch (error) {
        console.error('Summarize Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi tóm tắt'
        });
    }
};

/**
 * @desc    Suggest task priority
 * @route   POST /api/ai/suggest-priority
 * @access  Private
 */
const suggestPriority = async (req, res) => {
    try {
        const { title, description, deadline, difficulty, estimatedTime } = req.body;

        if (!deadline) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập deadline'
            });
        }

        const suggestion = await aiService.suggestPriority({
            title,
            description,
            deadline,
            difficulty,
            estimatedTime
        });

        res.json({
            success: true,
            data: { suggestion }
        });
    } catch (error) {
        console.error('Suggest Priority Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi đề xuất độ ưu tiên'
        });
    }
};

/**
 * @desc    Rewrite notes professionally
 * @route   POST /api/ai/rewrite-notes
 * @access  Private
 */
const rewriteNotes = async (req, res) => {
    try {
        const { notes, taskId } = req.body;

        if (!notes) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập ghi chú'
            });
        }

        const rewrittenNotes = await aiService.rewriteNotes(notes);

        // Optionally save notes to task
        if (taskId) {
            await Task.findOneAndUpdate(
                { _id: taskId, createdBy: req.user.id },
                { notes: rewrittenNotes }
            );
        }

        res.json({
            success: true,
            data: { notes: rewrittenNotes }
        });
    } catch (error) {
        console.error('Rewrite Notes Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi viết lại ghi chú'
        });
    }
};

module.exports = {
    generatePlan,
    summarize,
    suggestPriority,
    // ... existing exports
    rewriteNotes,

    /**
     * @desc    Break down task into subtasks
     * @route   POST /api/ai/breakdown
     */
    breakdownTask: async (req, res) => {
        try {
            const { description } = req.body;
            if (!description) return res.status(400).json({ success: false, message: 'Thiếu mô tả task' });

            const result = await aiService.breakdownTask(description);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * @desc    Predict deadline risk
     * @route   POST /api/ai/predict-deadline
     */
    predictDeadline: async (req, res) => {
        try {
            const taskData = req.body;
            const result = await aiService.predictDeadline(taskData);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * @desc    Analyze work habits
     * @route   POST /api/ai/analyze-habits
     */
    analyzeHabits: async (req, res) => {
        try {
            // Fetch completed tasks for the user from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const completedTasks = await Task.find({
                createdBy: req.user.id,
                status: 'done',
                updatedAt: { $gte: thirtyDaysAgo }
            }).select('title completedAt updatedAt aiSummary');

            // Format for analysis
            const formattedTasks = completedTasks.map(t => ({
                title: t.title,
                completedAt: t.updatedAt, // Using updatedAt as completion time approximation
                // In real app, we should have a dedicated completedAt field or check history
            }));

            if (formattedTasks.length < 5) {
                return res.json({
                    success: true,
                    data: {
                        peakProductivityHours: "Chưa đủ dữ liệu",
                        habits: ["Cần hoàn thành ít nhất 5 task để phân tích"],
                        suggestions: ["Hãy tích cực hoàn thành task hơn nhé!"]
                    }
                });
            }

            const result = await aiService.analyzeHabits(formattedTasks);

            // Send notification when AI analysis is complete
            await createNotification(req.app.get('io'), {
                recipient: req.user.id,
                type: 'ai',
                title: 'Phân tích hoàn tất! 📊',
                message: 'AI đã phân tích xong thói quen làm việc của bạn.',
                data: { link: '/ai-assistant' }
            });

            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * @desc    OCR Image to Text
     * @route   POST /api/ai/ocr
     */
    handleOCR: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Vui lòng upload ảnh' });
            }

            const result = await aiService.processOCR(req.file.buffer, req.file.mimetype);
            res.json({ success: true, data: { text: result } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

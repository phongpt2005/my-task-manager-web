/**
 * Comment Controller
 */

const Comment = require('../models/Comment');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @desc    Get comments for a task
 * @route   GET /api/comments/task/:taskId
 * @access  Private
 */
const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate('user', 'name avatar email')
            .sort({ createdAt: -1 }); // Newest first

        res.json({
            success: true,
            data: { comments }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Add a comment
 * @route   POST /api/comments
 * @access  Private
 */
const addComment = async (req, res) => {
    try {
        const { taskId, content } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const comment = await Comment.create({
            task: taskId,
            user: req.user.id,
            content
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'name avatar email');

        // Socket.io Realtime Update
        const io = req.app.get('io');
        if (io) {
            io.to(`task_${taskId}`).emit('new_comment', populatedComment);
            // Also notify task update
            io.to(`task_${taskId}`).emit('task_updated', { taskId });
        }

        res.status(201).json({
            success: true,
            data: { comment: populatedComment }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findOne({ _id: id });
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Only owner can delete
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await comment.deleteOne();

        res.json({ success: true, message: 'Deleted comment' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTaskComments,
    addComment,
    deleteComment
};

/**
 * Comment Model
 */

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung bình luận'],
        trim: true,
        maxlength: [1000, 'Bình luận không được quá 1000 ký tự']
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);

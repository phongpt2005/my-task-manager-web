/**
 * Task Model
 * Schema for task management with all required fields
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề task'],
        trim: true,
        maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Mô tả không được quá 2000 ký tự']
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['todo', 'inprogress', 'review', 'done'],
        default: 'todo'
    },
    deadline: {
        type: Date,
        required: [true, 'Vui lòng chọn deadline']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // File attachments
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimetype: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Estimated time in hours
    estimatedTime: {
        type: Number,
        min: 0
    },
    // Actual time spent in hours (auto-calculated from logs or manual)
    actualTime: {
        type: Number,
        min: 0,
        default: 0
    },
    // Time tracking logs
    timeLogs: [{
        startTime: {
            type: Date,
            required: true
        },
        endTime: Date,
        duration: Number // in seconds
    }],
    // Pomodoro sessions
    pomodoroSessions: {
        count: {
            type: Number,
            default: 0
        },
        totalDuration: {
            type: Number,
            default: 0 // in minutes
        }
    },
    // Difficulty level (for AI priority suggestion)
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    // AI generated summary
    aiSummary: {
        type: String
    },
    // Notes
    notes: {
        type: String,
        maxlength: [5000, 'Ghi chú không được quá 5000 ký tự']
    },
    // Completion date
    completedAt: {
        type: Date
    },
    // Reminder sent flag
    reminderSent: {
        type: Boolean,
        default: false
    },
    // Order in Kanban column
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ createdBy: 1, deadline: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function () {
    return this.deadline < new Date() && this.status !== 'done';
});

// Set completedAt when status changes to done
taskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

// Ensure virtuals are included in JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);

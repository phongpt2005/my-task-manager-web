/**
 * Activity Log Model
 * Tracks all user activities in the system
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'task_created',
            'task_updated',
            'task_deleted',
            'task_status_changed',
            'task_completed',
            'project_created',
            'project_updated',
            'project_deleted',
            'member_added',
            'member_removed',
            'member_role_changed',
            'comment_added',
            'file_uploaded',
            'user_login',
            'user_registered'
        ]
    },
    entityType: {
        type: String,
        enum: ['task', 'project', 'user', 'comment'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    entityName: {
        type: String // Store name for display even if entity is deleted
    },
    details: {
        type: mongoose.Schema.Types.Mixed // Flexible field for additional info
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Indexes for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index - auto delete after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to log activity
activityLogSchema.statics.log = async function (data) {
    try {
        return await this.create(data);
    } catch (error) {
        console.error('Activity Log Error:', error);
        // Don't throw - logging should not break main operations
    }
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);

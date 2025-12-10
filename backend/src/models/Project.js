/**
 * Project Model
 * Schema for organizing tasks into projects with role-based permissions
 */

const mongoose = require('mongoose');

/**
 * Project Roles:
 * - owner: Full control, can delete project, manage all members
 * - manager: Can create/edit/delete tasks, invite members
 * - member: Can create tasks, edit own tasks
 * - viewer: Can only view project and tasks
 */

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'manager', 'member', 'viewer'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên dự án'],
        trim: true,
        maxlength: [100, 'Tên dự án không được quá 100 ký tự']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả không được quá 500 ký tự']
    },
    color: {
        type: String,
        default: '#667eea'
    },
    icon: {
        type: String,
        default: '📁'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Role-based members
    members: [memberSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for query performance
projectSchema.index({ createdBy: 1, isActive: 1 });
projectSchema.index({ 'members.user': 1 });

// Virtual to get member count
projectSchema.virtual('memberCount').get(function () {
    return this.members ? this.members.length : 0;
});

// Method to check if user has specific role(s)
projectSchema.methods.hasRole = function (userId, roles) {
    if (!Array.isArray(roles)) roles = [roles];
    const member = this.members.find(m => m.user.toString() === userId.toString());
    return member && roles.includes(member.role);
};

// Method to get user's role in project
projectSchema.methods.getUserRole = function (userId) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    return member ? member.role : null;
};

// Method to check if user can access project
projectSchema.methods.canAccess = function (userId) {
    return this.createdBy.toString() === userId.toString() ||
        this.members.some(m => m.user.toString() === userId.toString());
};

// Ensure virtuals are included
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);


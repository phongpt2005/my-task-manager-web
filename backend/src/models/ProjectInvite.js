/**
 * Project Invite Model
 * Schema for pending project invitations
 */

const mongoose = require('mongoose');

const projectInviteSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['manager', 'member', 'viewer'],
        default: 'member'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
}, {
    timestamps: true
});

// Index for faster lookups
projectInviteSchema.index({ token: 1 });
projectInviteSchema.index({ email: 1, project: 1 });
projectInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Check if invite is still valid
projectInviteSchema.methods.isValid = function () {
    return this.status === 'pending' && new Date() < this.expiresAt;
};

module.exports = mongoose.model('ProjectInvite', projectInviteSchema);

/**
 * User Model
 * Schema for user authentication and profile
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        trim: true,
        maxlength: [50, 'Tên không được quá 50 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false // Don't return password by default
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // OTP for password reset
    resetPasswordOTP: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    },
    // Email notification preferences
    emailNotifications: {
        deadlineReminder: {
            type: Boolean,
            default: true
        },
        dailySummary: {
            type: Boolean,
            default: true
        }
    },
    // Theme preference
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP for password reset
userSchema.methods.generateResetOTP = function () {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP and set expiry (10 minutes)
    this.resetPasswordOTP = otp;
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return otp;
};

module.exports = mongoose.model('User', userSchema);

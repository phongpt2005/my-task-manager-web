/**
 * Seed Admin Account
 * Creates or updates admin user with full system privileges
 * Run: node src/scripts/seedAdmin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const ADMIN_EMAIL = 'tienphongp74@gmail.com';
const ADMIN_PASSWORD = 'phong@18205';
const ADMIN_NAME = 'Admin';

const seedAdmin = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (admin) {
            console.log('👤 Admin account found, resetting password...');

            // Hash password manually
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

            // Use updateOne to bypass pre-save hook
            await User.updateOne(
                { _id: admin._id },
                {
                    $set: {
                        role: 'admin',
                        password: hashedPassword,
                        isActive: true
                    }
                }
            );

            console.log('✅ Admin password reset successfully!');
        } else {
            console.log('👤 Creating new admin account...');

            admin = await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL.toLowerCase(),
                password: ADMIN_PASSWORD, // Will be hashed by pre-save hook
                role: 'admin',
                isActive: true,
                emailNotifications: {
                    deadlineReminder: true,
                    dailySummary: true
                }
            });

            console.log('✅ Admin account created successfully!');
        }

        console.log('');
        console.log('📋 Admin Account Details:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Role: admin`);
        console.log(`   ID: ${admin._id}`);
        console.log('');
        console.log('🎉 Admin setup complete!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();

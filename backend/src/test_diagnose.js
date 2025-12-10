
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { createTransporter } = require('./config/email');
const Notification = require('./models/Notification');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const test = async () => {
    console.log('🔍 Starting Diagnostics...');
    console.log('--------------------------------');

    // 1. Test DB Connection
    console.log('1️⃣ Testing MongoDB Connection...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }

    // 2. Test Notification Model
    console.log('\n2️⃣ Testing Notification Creation...');
    try {
        // Find a user to test with
        const User = require('./models/User');
        const user = await User.findOne();
        if (!user) {
            console.log('⚠️ No users found to test notification');
        } else {
            const notif = await Notification.create({
                recipient: user._id,
                type: 'system',
                title: 'Test Notification',
                message: 'This is a test notification',
                data: { meta: 'test' }
            });
            console.log('✅ Notification Created:', notif._id);
            // Clean up
            await Notification.findByIdAndDelete(notif._id);
            console.log('✅ Notification Deleted');
        }
    } catch (error) {
        console.error('❌ Notification Test Failed:', error.message);
    }

    // 3. Test Email
    console.log('\n3️⃣ Testing Email Configuration...');
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ SMTP Connection Verified');
    } catch (error) {
        console.error('❌ SMTP Verification Failed:', error.message);
    }

    console.log('\n--------------------------------');
    console.log('🏁 Diagnostics Complete');
    process.exit(0);
};

test();

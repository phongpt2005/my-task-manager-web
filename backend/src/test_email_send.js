
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const testSend = async () => {
    console.log('📧 Testing Email Sending...');
    console.log('User:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email from Debugger',
            html: '<h1>It works!</h1><p>This is a test email.</p>'
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email sending failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
    }
};

testSend();

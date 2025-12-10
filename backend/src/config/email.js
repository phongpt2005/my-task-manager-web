/**
 * Email Configuration using Nodemailer
 * Supports SMTP (Gmail, Outlook, etc.)
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Email templates
 */
const emailTemplates = {
  // OTP Reset Password Template
  resetPassword: (otp, userName) => ({
    subject: '🔐 Mã OTP đặt lại mật khẩu - Task Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">🔐 Đặt lại mật khẩu</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">Bạn đã yêu cầu đặt lại mật khẩu. Đây là mã OTP của bạn:</p>
          <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666;">⏰ Mã này sẽ hết hạn sau 10 phút.</p>
          <p style="font-size: 14px; color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Task Manager. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Task Deadline Reminder Template
  deadlineReminder: (task, userName) => ({
    subject: `⚠️ Nhắc nhở: Task "${task.title}" sắp đến deadline!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">⏰ Nhắc nhở Deadline</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">Task sau đây sắp đến deadline:</p>
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #f5576c; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
            <p style="margin: 5px 0; color: #666;">📝 ${task.description || 'Không có mô tả'}</p>
            <p style="margin: 5px 0; color: #f5576c; font-weight: bold;">📅 Deadline: ${new Date(task.deadline).toLocaleString('vi-VN')}</p>
            <p style="margin: 5px 0; color: #666;">🏷️ Ưu tiên: ${task.priority}</p>
          </div>
          <p style="font-size: 14px; color: #666;">Hãy hoàn thành task này trước deadline nhé!</p>
        </div>
      </div>
    `
  }),

  // Daily Summary Template
  dailySummary: (tasks, userName) => ({
    subject: '📋 Tổng hợp công việc hàng ngày - Task Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">📋 Tổng hợp công việc</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">Đây là tổng hợp công việc của bạn hôm nay:</p>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #4facfe;">📊 Thống kê:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                ✅ Hoàn thành: <strong>${tasks.completed}</strong>
              </li>
              <li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                🔄 Đang làm: <strong>${tasks.inProgress}</strong>
              </li>
              <li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                📝 Chờ xử lý: <strong>${tasks.todo}</strong>
              </li>
              <li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                ⚠️ Quá hạn: <strong style="color: #f5576c;">${tasks.overdue}</strong>
              </li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #666;">Chúc bạn một ngày làm việc hiệu quả! 💪</p>
        </div>
      </div>
    `
  }),

  // Project Invitation Template
  projectInvite: (inviterName, projectName, role, inviteLink) => ({
    subject: `📂 Lời mời tham gia dự án "${projectName}" - Task Manager`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">📂 Lời mời tham gia dự án</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Xin chào,</p>
          <p style="font-size: 16px;"><strong>${inviterName}</strong> đã mời bạn tham gia dự án:</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #333;">📁 ${projectName}</h2>
            <p style="margin: 5px 0; color: #666;">
              🏷️ Vai trò: <strong style="color: #667eea;">${role === 'manager' ? 'Quản lý' : role === 'member' ? 'Thành viên' : 'Người xem'}</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              ✅ Chấp nhận lời mời
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">Hoặc sao chép link này vào trình duyệt:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${inviteLink}</p>
          
          <p style="font-size: 14px; color: #666;">⏰ Lời mời này sẽ hết hạn sau 7 ngày.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Task Manager. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Member Added Notification Template
  memberAdded: (projectName, role, projectLink) => ({
    subject: `✅ Bạn đã được thêm vào dự án "${projectName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">✅ Chào mừng bạn!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Xin chào,</p>
          <p style="font-size: 16px;">Bạn đã được thêm vào dự án <strong>${projectName}</strong> với vai trò <strong>${role}</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${projectLink}" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 15px 40px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              📂 Xem dự án
            </a>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Task Manager. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

module.exports = { createTransporter, emailTemplates };

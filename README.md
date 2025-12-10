# 🚀 Task Management System

Hệ thống quản lý công việc thông minh với AI, real-time notifications, và project collaboration.

## ✨ Tính năng nổi bật

### 👤 Quản lý người dùng
- Đăng ký, đăng nhập với JWT authentication
- Quên mật khẩu với OTP qua email
- Phân quyền Admin/User
- Avatar và cài đặt cá nhân

### 📋 Quản lý Task
- CRUD tasks với nhiều thuộc tính (priority, status, deadline, tags)
- Kanban board với drag & drop
- Calendar view
- Timer/Pomodoro tracking
- File attachments

### 📁 Quản lý Project & Team
- Tạo và quản lý dự án
- Mời thành viên qua email
- Phân quyền dự án: Owner, Manager, Member, Viewer
- Activity log

### 🤖 AI Features
- AI Assistant với Groq LLM
- Phân tích thói quen làm việc
- Gợi ý tối ưu năng suất
- Tạo task plan thông minh

### 🔔 Real-time Features
- Notifications với Socket.io
- Email reminders cho deadline
- Live updates khi team làm việc

### 🛡️ Admin Dashboard
- Quản lý tất cả users
- Thống kê hệ thống
- Nâng/hạ cấp quyền user
- Xem tất cả tasks

---

## 🛠️ Cài đặt

### Yêu cầu
- Node.js >= 18
- MongoDB
- NPM hoặc Yarn

### 1. Clone repository
```bash
git clone <repo-url>
cd task-management
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
```

### 3. Cấu hình Environment
Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskdb
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI (Groq)
GROQ_API_KEY=your_groq_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Tạo Admin Account
```bash
npm run seed:admin
```

### 5. Chạy Backend
```bash
npm run dev
```

### 6. Cài đặt Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Thông tin user |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |

### Tasks
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/tasks` | Danh sách tasks |
| POST | `/api/tasks` | Tạo task |
| GET | `/api/tasks/:id` | Chi tiết task |
| PUT | `/api/tasks/:id` | Cập nhật task |
| DELETE | `/api/tasks/:id` | Xóa task |

### Projects
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/projects` | Danh sách projects |
| POST | `/api/projects` | Tạo project |
| GET | `/api/projects/:id/members` | Thành viên |
| POST | `/api/projects/:id/invite` | Mời thành viên |

### Admin (Requires admin role)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Danh sách users |
| GET | `/api/admin/stats` | Thống kê hệ thống |
| PUT | `/api/admin/users/:id/role` | Đổi vai trò |

---

## 👥 Roles & Permissions

### System Roles
| Role | Quyền |
|------|-------|
| **admin** | Toàn quyền hệ thống, xem/sửa mọi thứ |
| **user** | Chỉ quản lý dữ liệu của mình |

### Project Roles
| Role | Quyền |
|------|-------|
| **owner** | Toàn quyền dự án, xóa dự án |
| **manager** | Quản lý tasks, mời thành viên |
| **member** | Tạo/sửa task của mình |
| **viewer** | Chỉ xem |

---

## 🔐 Admin Account

```
Email: tienphongp74@gmail.com
Password: phong@18205
```

---

## 📦 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Nodemailer
- Groq AI SDK

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand (State Management)
- React Router v6
- Framer Motion
- React Hot Toast
- jsPDF + xlsx (Export)

---

## 🚀 Scripts

### Backend
```bash
npm run dev      # Development
npm run start    # Production
npm run seed:admin  # Create admin account
```

### Frontend
```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview production
```

---

## 📄 License

MIT License - Free to use and modify

---

Made with ❤️ by Task Management Team

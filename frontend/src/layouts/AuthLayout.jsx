/**
 * Auth Layout Component
 * For login, register, forgot password pages
 */

import { Outlet } from 'react-router-dom'
import ThemeToggle from '../components/common/ThemeToggle'

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">T</span>
                        </div>
                        <span className="text-2xl font-bold text-white">TaskPro</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Quản lý công việc <br />
                        thông minh với AI
                    </h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Tăng năng suất làm việc với Dashboard trực quan, Kanban Board linh hoạt
                        và trợ lý AI thông minh.
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400"
                                />
                            ))}
                        </div>
                        <p className="text-white/80 text-sm">
                            <span className="font-semibold text-white">1,000+</span> người dùng tin tưởng
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8 text-white/60 text-sm">
                    <span>© 2024 TaskPro</span>
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Service</a>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                {/* Theme toggle */}
                <div className="flex justify-end p-4">
                    <ThemeToggle />
                </div>

                {/* Form container */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

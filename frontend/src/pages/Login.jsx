/**
 * Login Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }

        setIsLoading(true)
        const result = await login({ email, password })
        setIsLoading(false)

        if (result.success) {
            toast.success('Đăng nhập thành công!')
            navigate('/')
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="lg:hidden flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">T</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">TaskPro</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Chào mừng trở lại! 👋
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Đăng nhập để tiếp tục quản lý công việc
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    type="email"
                    label="Email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<HiMail className="w-5 h-5" />}
                />

                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Mật khẩu"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<HiLockClosed className="w-5 h-5" />}
                    rightIcon={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                        >
                            {showPassword ? (
                                <HiEyeOff className="w-5 h-5" />
                            ) : (
                                <HiEye className="w-5 h-5" />
                            )}
                        </button>
                    }
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Ghi nhớ đăng nhập
                        </span>
                    </label>
                    <Link
                        to="/forgot-password"
                        className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                >
                    Đăng nhập
                </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900">
                        hoặc
                    </span>
                </div>
            </div>

            {/* Register link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
                Chưa có tài khoản?{' '}
                <Link
                    to="/register"
                    className="text-primary-500 hover:text-primary-600 font-medium"
                >
                    Đăng ký ngay
                </Link>
            </p>
        </div>
    )
}

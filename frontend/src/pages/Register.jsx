/**
 * Register Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { register } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name || !email || !password || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setIsLoading(true)
        const result = await register({ name, email, password })
        setIsLoading(false)

        if (result.success) {
            toast.success('Đăng ký thành công!')
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
                    Tạo tài khoản mới 🚀
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Bắt đầu quản lý công việc hiệu quả ngay hôm nay
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    type="text"
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<HiUser className="w-5 h-5" />}
                />

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

                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Xác nhận mật khẩu"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<HiLockClosed className="w-5 h-5" />}
                />

                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        required
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tôi đồng ý với{' '}
                        <a href="#" className="text-primary-500 hover:text-primary-600">
                            Điều khoản sử dụng
                        </a>{' '}
                        và{' '}
                        <a href="#" className="text-primary-500 hover:text-primary-600">
                            Chính sách bảo mật
                        </a>
                    </span>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                >
                    Đăng ký
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

            {/* Login link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
                Đã có tài khoản?{' '}
                <Link
                    to="/login"
                    className="text-primary-500 hover:text-primary-600 font-medium"
                >
                    Đăng nhập
                </Link>
            </p>
        </div>
    )
}

/**
 * Forgot Password Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMail, HiLockClosed, HiArrowLeft } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

export default function ForgotPassword() {
    const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault()

        if (!email) {
            toast.error('Vui lòng nhập email')
            return
        }

        setIsLoading(true)
        try {
            await authApi.forgotPassword(email)
            toast.success('Mã OTP đã được gửi đến email của bạn')
            setStep(2)
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Không thể gửi OTP')
        }
        setIsLoading(false)
    }

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!otp || !newPassword || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setIsLoading(true)
        try {
            await authApi.resetPassword({ email, otp, newPassword })
            toast.success('Đặt lại mật khẩu thành công!')
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu')
        }
        setIsLoading(false)
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
                    {step === 1 ? 'Quên mật khẩu? 🔑' : 'Đặt lại mật khẩu 🔐'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {step === 1
                        ? 'Nhập email để nhận mã OTP'
                        : 'Nhập mã OTP và mật khẩu mới'}
                </p>
            </div>

            {step === 1 ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleRequestOTP} className="space-y-5">
                    <Input
                        type="email"
                        label="Email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={<HiMail className="w-5 h-5" />}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Gửi mã OTP
                    </Button>
                </form>
            ) : (
                /* Step 2: Reset Password */
                <form onSubmit={handleResetPassword} className="space-y-5">
                    <Input
                        type="text"
                        label="Mã OTP"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                    />

                    <Input
                        type="password"
                        label="Mật khẩu mới"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        leftIcon={<HiLockClosed className="w-5 h-5" />}
                    />

                    <Input
                        type="password"
                        label="Xác nhận mật khẩu mới"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        leftIcon={<HiLockClosed className="w-5 h-5" />}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Đặt lại mật khẩu
                    </Button>

                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center justify-center gap-2 w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Quay lại
                    </button>
                </form>
            )}

            {/* Login link */}
            <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
                Đã nhớ mật khẩu?{' '}
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

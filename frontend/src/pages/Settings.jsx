/**
 * Settings Page
 */

import { useState, useEffect } from 'react'
import { HiUser, HiBell, HiLockClosed, HiColorSwatch } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { authApi } from '../api/authApi'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

// Settings Section Component
function SettingsSection({ icon: Icon, title, children }) {
    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    )
}

export default function Settings() {
    const { user, updateUser } = useAuthStore()
    const { theme, setTheme } = useThemeStore()

    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [notifications, setNotifications] = useState({
        deadlineReminder: true,
        dailySummary: true
    })

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            })
            setNotifications({
                deadlineReminder: user.emailNotifications?.deadlineReminder ?? true,
                dailySummary: user.emailNotifications?.dailySummary ?? true
            })
        }
    }, [user])

    // Update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault()

        if (!profileData.name.trim()) {
            toast.error('Vui lòng nhập tên')
            return
        }

        setIsUpdatingProfile(true)
        try {
            const response = await authApi.updateProfile({ name: profileData.name })
            updateUser(response.data.user)
            toast.success('Cập nhật thông tin thành công')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật thông tin')
        }
        setIsUpdatingProfile(false)
    }

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
            return
        }

        setIsUpdatingPassword(true)
        try {
            await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            toast.success('Đổi mật khẩu thành công')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu')
        }
        setIsUpdatingPassword(false)
    }

    // Update notifications
    const handleUpdateNotifications = async () => {
        setIsUpdatingNotifications(true)
        try {
            const response = await authApi.updateProfile({
                emailNotifications: notifications
            })
            updateUser(response.data.user)
            toast.success('Cập nhật cài đặt thông báo thành công')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật thông báo')
        }
        setIsUpdatingNotifications(false)
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Cài đặt
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý tài khoản và tùy chỉnh ứng dụng
                </p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <SettingsSection icon={HiUser} title="Thông tin cá nhân">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <Input
                            label="Họ và tên"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                            label="Email"
                            value={profileData.email}
                            disabled
                            className="opacity-60"
                        />
                        <Button type="submit" isLoading={isUpdatingProfile}>
                            Lưu thay đổi
                        </Button>
                    </form>
                </SettingsSection>

                {/* Password Section */}
                <SettingsSection icon={HiLockClosed} title="Đổi mật khẩu">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <Input
                            type="password"
                            label="Mật khẩu hiện tại"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <Input
                            type="password"
                            label="Mật khẩu mới"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <Input
                            type="password"
                            label="Xác nhận mật khẩu mới"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <Button type="submit" isLoading={isUpdatingPassword}>
                            Đổi mật khẩu
                        </Button>
                    </form>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection icon={HiBell} title="Thông báo email">
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Nhắc nhở deadline
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Nhận email khi task sắp đến deadline
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.deadlineReminder}
                                onChange={(e) => setNotifications(prev => ({
                                    ...prev,
                                    deadlineReminder: e.target.checked
                                }))}
                                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Tổng hợp hàng ngày
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Nhận email tổng hợp tasks mỗi ngày lúc 8h sáng
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.dailySummary}
                                onChange={(e) => setNotifications(prev => ({
                                    ...prev,
                                    dailySummary: e.target.checked
                                }))}
                                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            />
                        </label>

                        <Button
                            onClick={handleUpdateNotifications}
                            isLoading={isUpdatingNotifications}
                        >
                            Lưu cài đặt thông báo
                        </Button>
                    </div>
                </SettingsSection>

                {/* Theme Section */}
                <SettingsSection icon={HiColorSwatch} title="Giao diện">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'light'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="w-full h-24 bg-white rounded-lg border border-gray-200 mb-3 flex items-center justify-center">
                                <span className="text-3xl">☀️</span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">Sáng</p>
                        </button>

                        <button
                            onClick={() => setTheme('dark')}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="w-full h-24 bg-gray-800 rounded-lg border border-gray-700 mb-3 flex items-center justify-center">
                                <span className="text-3xl">🌙</span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">Tối</p>
                        </button>
                    </div>
                </SettingsSection>
            </div>
        </div>
    )
}

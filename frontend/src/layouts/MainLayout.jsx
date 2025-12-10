/**
 * Main Layout Component
 * Sidebar + Header + Main Content
 */

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
    HiHome,
    HiViewBoards,
    HiCalendar,
    HiClipboardList,
    HiLightningBolt,
    HiCog,
    HiLogout,
    HiMenuAlt2,
    HiX,
    HiBell,
    HiShieldCheck
} from 'react-icons/hi'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/common/ThemeToggle'
import NotificationDropdown from '../components/common/NotificationDropdown'
import logo from '../assets/logo.png'

// Base navigation links
const baseNavLinks = [
    { to: '/', icon: HiHome, label: 'Dashboard' },
    { to: '/kanban', icon: HiViewBoards, label: 'Kanban Board' },
    { to: '/calendar', icon: HiCalendar, label: 'Lịch' },
    { to: '/tasks', icon: HiClipboardList, label: 'Tasks' },
    { to: '/ai-assistant', icon: HiLightningBolt, label: 'AI Assistant' },
    { to: '/settings', icon: HiCog, label: 'Cài đặt' },
]

// Admin-only link
const adminLink = { to: '/admin', icon: HiShieldCheck, label: 'Admin Panel', adminOnly: true }

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="relative flex items-center h-20 px-6 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" />
                    <div className="relative flex items-center gap-3 w-full">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                            <img
                                src={logo}
                                alt="Task Manager"
                                className="relative w-10 h-10 rounded-lg object-contain bg-white dark:bg-gray-800 shadow-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 leading-none mb-1">
                                Task Manager
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                                Workflow AI
                            </span>
                        </div>
                    </div>
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {/* Base links */}
                    {baseNavLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}

                    {/* Admin link - only for admins */}
                    {user?.role === 'admin' && (
                        <NavLink
                            to={adminLink.to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''} bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <adminLink.icon className="w-5 h-5" />
                            <span>{adminLink.label}</span>
                        </NavLink>
                    )}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <HiLogout className="w-5 h-5" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between h-full px-4 lg:px-6">
                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <HiMenuAlt2 className="w-6 h-6" />
                        </button>

                        {/* Search (optional) */}
                        <div className="hidden md:flex flex-1 max-w-md mx-4">
                            {/* Can add search here */}
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <NotificationDropdown />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

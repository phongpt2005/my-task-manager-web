import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiBell, HiCheck, HiTrash } from 'react-icons/hi'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('all') // 'all' or 'context'
    const dropdownRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()

    const { user } = useAuthStore()
    const {
        notifications,
        unreadCount,
        isConnected,
        fetchNotifications,
        markRead,
        connectSocket,
        disconnectSocket
    } = useNotificationStore()

    // Connect socket on mount
    useEffect(() => {
        // Use user.id since authStore stores id, not _id
        const userId = user?.id || user?._id
        console.log('NotificationDropdown mounted. User:', userId)
        if (userId) {
            console.log('Initiating socket connection for:', userId)
            connectSocket(userId)
            fetchNotifications()
        }
        return () => disconnectSocket()
    }, [user])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Determine context based on path
    const getContext = () => {
        const path = location.pathname
        if (path.includes('calendar')) return 'calendar'
        if (path.includes('kanban')) return 'deadline' // Kanban users care about deadlines
        if (path.includes('dashboard')) return 'stats'
        if (path.includes('ai')) return 'ai'
        return null
    }

    const currentContext = getContext()
    const contextLabel = {
        calendar: 'Lịch',
        deadline: 'Deadline',
        stats: 'Thống kê',
        ai: 'AI'
    }[currentContext] || 'Liên quan'

    // Filter notifications
    const filteredNotifications = activeTab === 'context' && currentContext
        ? notifications.filter(n => n.type === currentContext || (currentContext === 'deadline' && n.type === 'deadline'))
        : notifications

    const handleNotificationClick = (notification) => {
        markRead(notification._id)
        if (notification.data?.link) {
            navigate(notification.data.link)
        } else if (notification.data?.taskId) {
            // Navigate to task detail (assuming we have a route or modal)
            // For now, maybe just go to tasks page
            navigate('/tasks')
        }
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isConnected ? "Real-time connected" : "Real-time disconnected"}
            >
                <HiBell className="w-6 h-6" />
                {/* Connection Status Dot */}
                <span className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ring-1 ring-white ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-down">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markRead('all')}
                                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1"
                            >
                                <HiCheck className="w-4 h-4" /> Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    {currentContext && (
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'all'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setActiveTab('context')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'context'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                {contextLabel}
                            </button>
                        </div>
                    )}

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <HiBell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Không có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'
                                                }`} />
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium mb-1 ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                                    {notification.message}
                                                </p>
                                                <span className="text-[10px] text-gray-400">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

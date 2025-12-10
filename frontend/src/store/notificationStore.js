import { create } from 'zustand'
import { io } from 'socket.io-client'
import api from '../api/axios'

const SOCKET_URL = 'http://localhost:5000'

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    socket: null,
    isConnected: false,
    isLoading: false,

    // Connect to Socket.io
    connectSocket: (userId) => {
        if (get().socket) return // Already connected

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        })

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id)
            set({ isConnected: true })
            // Join user room
            console.log('Joining user room:', userId)
            socket.emit('join_user', userId)
        })

        socket.on('disconnect', () => {
            set({ isConnected: false })
        })

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err)
            set({ isConnected: false })
        })

        socket.on('new_notification', (notification) => {
            console.log('Received new_notification:', notification)
            set((state) => ({
                notifications: [notification, ...state.notifications],
                unreadCount: state.unreadCount + 1
            }))

            // Play sound (optional)
            const audio = new Audio('/notification.mp3')
            audio.play().catch(e => console.log('Audio play failed', e))
        })

        set({ socket })
    },

    disconnectSocket: () => {
        const { socket } = get()
        if (socket) {
            socket.disconnect()
            set({ socket: null })
        }
    },

    // Fetch notifications
    fetchNotifications: async () => {
        set({ isLoading: true })
        try {
            const response = await api.get('/notifications')
            set({
                notifications: response.data.data.notifications,
                unreadCount: response.data.data.unreadCount,
                isLoading: false
            })
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            set({ isLoading: false })
        }
    },

    // Mark as read
    markRead: async (id) => {
        try {
            // Optimistic update
            set((state) => {
                const newNotifications = state.notifications.map(n =>
                    (id === 'all' || n._id === id) ? { ...n, isRead: true } : n
                )
                const newUnreadCount = id === 'all' ? 0 : Math.max(0, state.unreadCount - 1)

                return {
                    notifications: newNotifications,
                    unreadCount: newUnreadCount
                }
            })

            await api.put(`/notifications/${id}/read`)
        } catch (error) {
            console.error('Failed to mark read:', error)
            // Revert if needed (omitted for simplicity)
        }
    }
}))

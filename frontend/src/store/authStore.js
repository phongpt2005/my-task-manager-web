/**
 * Auth Store (Zustand)
 */

import { create } from 'zustand'
import { authApi } from '../api/authApi'

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    error: null,

    // Check authentication on app load
    checkAuth: async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            set({ isLoading: false, user: null })
            return
        }

        try {
            const response = await authApi.getMe()
            set({
                user: response.data.user,
                token,
                isLoading: false
            })
        } catch (error) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            set({ user: null, token: null, isLoading: false })
        }
    },

    // Register
    register: async (data) => {
        try {
            set({ error: null })
            const response = await authApi.register(data)

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            set({
                user: response.data.user,
                token: response.data.token
            })

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Đăng ký thất bại'
            set({ error: message })
            return { success: false, message }
        }
    },

    // Login
    login: async (data) => {
        try {
            set({ error: null })
            const response = await authApi.login(data)

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            set({
                user: response.data.user,
                token: response.data.token
            })

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Đăng nhập thất bại'
            set({ error: message })
            return { success: false, message }
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null })
    },

    // Update user
    updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
        localStorage.setItem('user', JSON.stringify({ ...get().user, ...userData }))
    },

    // Clear error
    clearError: () => set({ error: null })
}))

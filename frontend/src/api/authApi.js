/**
 * Authentication API
 */

import api from './axios'

export const authApi = {
    // Register new user
    register: async (data) => {
        const response = await api.post('/auth/register', data)
        return response.data
    },

    // Login user
    login: async (data) => {
        const response = await api.post('/auth/login', data)
        return response.data
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me')
        return response.data
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data)
        return response.data
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email })
        return response.data
    },

    // Reset password
    resetPassword: async (data) => {
        const response = await api.post('/auth/reset-password', data)
        return response.data
    },

    // Change password
    changePassword: async (data) => {
        const response = await api.put('/auth/change-password', data)
        return response.data
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout')
        return response.data
    }
}

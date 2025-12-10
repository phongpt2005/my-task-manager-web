/**
 * Admin API Service
 */

import api from './axios';

export const adminApi = {
    // Get all users
    getUsers: (params = {}) => api.get('/admin/users', { params }),

    // Get single user
    getUser: (id) => api.get(`/admin/users/${id}`),

    // Update user role
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),

    // Toggle user status (active/inactive)
    toggleUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),

    // Delete user
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Get system statistics
    getStats: () => api.get('/admin/stats')
};

export const activityApi = {
    // Get activities
    getActivities: (params = {}) => api.get('/activities', { params }),

    // Get my activities
    getMyActivities: (limit = 10) => api.get('/activities/my', { params: { limit } }),

    // Get task activities
    getTaskActivities: (taskId) => api.get(`/activities/task/${taskId}`)
};

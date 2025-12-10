/**
 * Task API
 */

import api from './axios'

export const taskApi = {
    // Get all tasks with filters
    getTasks: async (params = {}) => {
        const response = await api.get('/tasks', { params })
        return response.data
    },

    // Get single task
    getTask: async (id) => {
        const response = await api.get(`/tasks/${id}`)
        return response.data
    },

    // Create task
    createTask: async (data) => {
        const response = await api.post('/tasks', data)
        return response.data
    },

    // Update task
    updateTask: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data)
        return response.data
    },

    // Update task status (for Kanban)
    updateTaskStatus: async (id, status, order) => {
        const response = await api.patch(`/tasks/${id}/status`, { status, order })
        return response.data
    },

    // Delete task
    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`)
        return response.data
    },

    // Get tasks by date (for Calendar)
    getTasksByDate: async (date, view = 'month') => {
        const response = await api.get(`/tasks/calendar/${date}`, { params: { view } })
        return response.data
    },

    // Upload file attachment
    uploadAttachment: async (id, file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post(`/tasks/${id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    // Reorder tasks (bulk update for Kanban)
    reorderTasks: async (tasks) => {
        const response = await api.patch('/tasks/reorder', { tasks })
        return response.data
    },

    // Timer endpoints
    startTimer: async (id) => {
        const response = await api.post(`/tasks/${id}/start-timer`)
        return response.data
    },

    stopTimer: async (id) => {
        const response = await api.post(`/tasks/${id}/stop-timer`)
        return response.data
    },

    logPomodoro: async (id, duration) => {
        const response = await api.post(`/tasks/${id}/pomodoro`, { duration })
        return response.data
    }
}

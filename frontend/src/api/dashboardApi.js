/**
 * Dashboard API
 */

import api from './axios'

export const dashboardApi = {
    // Get dashboard statistics
    getStats: async () => {
        const response = await api.get('/dashboard/stats')
        return response.data
    },

    // Get weekly progress
    getWeeklyProgress: async () => {
        const response = await api.get('/dashboard/weekly-progress')
        return response.data
    },

    // Get recent tasks
    getRecentTasks: async (limit = 5) => {
        const response = await api.get('/dashboard/recent-tasks', { params: { limit } })
        return response.data
    },

    // Get upcoming deadlines
    getUpcomingDeadlines: async (limit = 5) => {
        const response = await api.get('/dashboard/upcoming-deadlines', { params: { limit } })
        return response.data
    },

    // Get heatmap data
    getHeatmapData: async () => {
        const response = await api.get('/dashboard/heatmap')
        return response.data
    },

    // Get focus score
    getFocusScore: async () => {
        const response = await api.get('/dashboard/focus-score')
        return response.data
    }
}

/**
 * Comment API
 */

import api from './axios'

export const commentApi = {
    // Get comments for a task
    getComments: async (taskId) => {
        const response = await api.get(`/comments/task/${taskId}`)
        return response.data
    },

    // Add a comment
    addComment: async (taskId, content) => {
        const response = await api.post('/comments', { taskId, content })
        return response.data
    },

    // Delete a comment
    deleteComment: async (commentId) => {
        const response = await api.delete(`/comments/${commentId}`)
        return response.data
    }
}

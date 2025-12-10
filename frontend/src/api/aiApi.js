/**
 * AI API
 */

import api from './axios'

export const aiApi = {
    // Generate daily work plan
    generatePlan: async (availableTime) => {
        const response = await api.post('/ai/generate-plan', { availableTime })
        return response.data
    },

    // Summarize task description
    summarize: async (description, taskId = null) => {
        const response = await api.post('/ai/summarize', { description, taskId })
        return response.data
    },

    // Suggest task priority
    suggestPriority: async (taskDetails) => {
        const response = await api.post('/ai/suggest-priority', taskDetails)
        return response.data
    },

    // Rewrite notes professionally
    rewriteNotes: async (notes, taskId = null) => {
        const response = await api.post('/ai/rewrite-notes', { notes, taskId })
        return response.data
    },

    // Break down task
    breakdownTask: async (description) => {
        const response = await api.post('/ai/breakdown', { description })
        return response.data
    },

    // Predict deadline risk
    predictDeadline: async (taskData) => {
        const response = await api.post('/ai/predict-deadline', taskData)
        return response.data
    },

    // Analyze habits
    analyzeHabits: async () => {
        const response = await api.get('/ai/analyze-habits')
        return response.data
    },

    // OCR
    processOCR: async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        const response = await api.post('/ai/ocr', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }
}

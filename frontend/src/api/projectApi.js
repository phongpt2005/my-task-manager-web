/**
 * Project API
 */

import api from './axios'

export const projectApi = {
    // Get all projects
    getProjects: async () => {
        const response = await api.get('/projects')
        return response.data
    },

    // Get single project
    getProject: async (id) => {
        const response = await api.get(`/projects/${id}`)
        return response.data
    },

    // Create project
    createProject: async (data) => {
        const response = await api.post('/projects', data)
        return response.data
    },

    // Update project
    updateProject: async (id, data) => {
        const response = await api.put(`/projects/${id}`, data)
        return response.data
    },

    // Delete project
    deleteProject: async (id) => {
        const response = await api.delete(`/projects/${id}`)
        return response.data
    }
}

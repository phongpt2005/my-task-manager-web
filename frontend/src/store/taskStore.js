/**
 * Task Store (Zustand)
 */

import { create } from 'zustand'
import { taskApi } from '../api/taskApi'

export const useTaskStore = create((set, get) => ({
    tasks: [],
    currentTask: null,
    isLoading: false,
    error: null,
    filters: {
        status: '',
        priority: '',
        search: '',
        project: ''
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    },

    // Fetch tasks
    fetchTasks: async (params = {}) => {
        try {
            set({ isLoading: true, error: null })
            const filters = get().filters
            const pagination = get().pagination

            const response = await taskApi.getTasks({
                ...filters,
                ...params,
                page: params.page || pagination.page,
                limit: params.limit || pagination.limit
            })

            set({
                tasks: response.data.tasks,
                pagination: response.data.pagination,
                isLoading: false
            })

            // Return full data including isAdmin and users for admin view
            return {
                tasks: response.data.tasks,
                isAdmin: response.data.isAdmin,
                users: response.data.users
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Lỗi tải danh sách task',
                isLoading: false
            })
            return { tasks: [], isAdmin: false }
        }
    },

    // Get task by ID
    fetchTask: async (id) => {
        try {
            set({ isLoading: true, error: null })
            const response = await taskApi.getTask(id)
            set({ currentTask: response.data.task, isLoading: false })
            return response.data.task
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Lỗi tải task',
                isLoading: false
            })
            return null
        }
    },

    // Create task
    createTask: async (data) => {
        try {
            set({ error: null })
            const response = await taskApi.createTask(data)
            set({ tasks: [response.data.task, ...get().tasks] })
            return { success: true, task: response.data.task }
        } catch (error) {
            const message = error.response?.data?.message || 'Lỗi tạo task'
            set({ error: message })
            return { success: false, message }
        }
    },

    // Update task
    updateTask: async (id, data) => {
        try {
            set({ error: null })
            const response = await taskApi.updateTask(id, data)

            // Update in tasks list
            set({
                tasks: get().tasks.map(t =>
                    t._id === id ? response.data.task : t
                ),
                currentTask: response.data.task
            })

            return { success: true, task: response.data.task }
        } catch (error) {
            const message = error.response?.data?.message || 'Lỗi cập nhật task'
            set({ error: message })
            return { success: false, message }
        }
    },

    // Update task status (for Kanban)
    updateTaskStatus: async (id, status, order) => {
        try {
            // Optimistic update
            set({
                tasks: get().tasks.map(t =>
                    t._id === id ? { ...t, status, order } : t
                )
            })

            await taskApi.updateTaskStatus(id, status, order)
            return { success: true }
        } catch (error) {
            // Revert on error
            get().fetchTasks()
            return { success: false, message: error.response?.data?.message }
        }
    },

    // Delete task
    deleteTask: async (id) => {
        try {
            await taskApi.deleteTask(id)
            set({ tasks: get().tasks.filter(t => t._id !== id) })
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Lỗi xóa task'
            set({ error: message })
            return { success: false, message }
        }
    },

    // Get tasks grouped by status (for Kanban)
    getTasksByStatus: () => {
        const tasks = get().tasks
        return {
            todo: tasks.filter(t => t.status === 'todo').sort((a, b) => a.order - b.order),
            inprogress: tasks.filter(t => t.status === 'inprogress').sort((a, b) => a.order - b.order),
            review: tasks.filter(t => t.status === 'review').sort((a, b) => a.order - b.order),
            done: tasks.filter(t => t.status === 'done').sort((a, b) => a.order - b.order)
        }
    },

    // Set filters
    setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } })
    },

    // Reset filters
    resetFilters: () => {
        set({
            filters: {
                status: '',
                priority: '',
                search: '',
                project: ''
            }
        })
    },

    // Set current task
    setCurrentTask: (task) => set({ currentTask: task }),

    // Clear error
    clearError: () => set({ error: null })
}))

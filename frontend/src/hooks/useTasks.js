/**
 * useTasks Hook
 * Custom hook for task management
 */

import { useTaskStore } from '../store/taskStore'

export const useTasks = () => {
    const {
        tasks,
        currentTask,
        isLoading,
        error,
        filters,
        pagination,
        fetchTasks,
        fetchTask,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTasksByStatus,
        setFilters,
        resetFilters,
        setCurrentTask,
        clearError
    } = useTaskStore()

    return {
        tasks,
        currentTask,
        isLoading,
        error,
        filters,
        pagination,
        fetchTasks,
        fetchTask,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTasksByStatus,
        setFilters,
        resetFilters,
        setCurrentTask,
        clearError
    }
}

/**
 * useAuth Hook
 * Custom hook for authentication
 */

import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
    const { user, token, isLoading, error, login, logout, register, clearError } = useAuthStore()

    return {
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        clearError
    }
}

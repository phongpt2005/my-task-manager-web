/**
 * useTheme Hook
 * Custom hook for theme management
 */

import { useThemeStore } from '../store/themeStore'

export const useTheme = () => {
    const { theme, toggleTheme, setTheme, initTheme } = useThemeStore()

    return {
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
        initTheme
    }
}

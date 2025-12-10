/**
 * Theme Store (Zustand)
 */

import { create } from 'zustand'

export const useThemeStore = create((set, get) => ({
    theme: 'light',

    // Initialize theme from localStorage or system preference
    initTheme: () => {
        const savedTheme = localStorage.getItem('theme')

        if (savedTheme) {
            set({ theme: savedTheme })
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            set({ theme: prefersDark ? 'dark' : 'light' })
        }
    },

    // Toggle theme
    toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', newTheme)
        set({ theme: newTheme })
    },

    // Set specific theme
    setTheme: (theme) => {
        localStorage.setItem('theme', theme)
        set({ theme })
    }
}))

/**
 * Theme Toggle Component
 */

import { HiSun, HiMoon } from 'react-icons/hi'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${className}`}
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
            {theme === 'dark' ? (
                <HiSun className="w-5 h-5" />
            ) : (
                <HiMoon className="w-5 h-5" />
            )}
        </button>
    )
}

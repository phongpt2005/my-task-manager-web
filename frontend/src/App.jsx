import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Kanban from './pages/Kanban'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import AIAssistant from './pages/AIAssistant'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'

// Components
import Loading from './components/common/Loading'

function App() {
    const { user, isLoading, checkAuth } = useAuthStore()
    const { theme, initTheme } = useThemeStore()

    useEffect(() => {
        // Initialize theme
        initTheme()

        // Check authentication
        checkAuth()
    }, [])

    // Apply theme class to document
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loading size="lg" />
            </div>
        )
    }

    return (
        <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
            </Route>

            {/* Protected routes */}
            <Route element={user ? <MainLayout /> : <Navigate to="/login" />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/settings" element={<Settings />} />
                {/* Admin routes */}
                <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App

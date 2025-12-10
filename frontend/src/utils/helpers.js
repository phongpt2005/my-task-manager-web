/**
 * Helper Functions
 */

import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format date for display
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    if (!date) return ''
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, formatStr, { locale: vi })
}

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
    return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
    if (!date) return ''
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: vi })
}

/**
 * Check if task is overdue
 */
export const isOverdue = (deadline) => {
    if (!deadline) return false
    const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
    return isBefore(d, new Date())
}

/**
 * Check if deadline is approaching (within 24 hours)
 */
export const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false
    const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return isAfter(d, new Date()) && isBefore(d, tomorrow)
}

/**
 * Get days until deadline
 */
export const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null
    const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
    const now = new Date()
    const diffTime = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

/**
 * Get priority badge class
 */
export const getPriorityClass = (priority) => {
    const classes = {
        High: 'badge-high',
        Medium: 'badge-medium',
        Low: 'badge-low'
    }
    return classes[priority] || 'badge-medium'
}

/**
 * Get status badge class
 */
export const getStatusClass = (status) => {
    const classes = {
        todo: 'badge-todo',
        inprogress: 'badge-inprogress',
        review: 'badge-review',
        done: 'badge-done'
    }
    return classes[status] || 'badge-todo'
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

/**
 * Generate random color
 */
export const getRandomColor = () => {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#fa709a'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Classname helper
 */
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ')
}

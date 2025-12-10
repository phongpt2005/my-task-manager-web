/**
 * Constants - Application-wide constants
 */

// Task status options
export const TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'inprogress',
    REVIEW: 'review',
    DONE: 'done'
}

export const TASK_STATUS_LABELS = {
    todo: 'Chờ làm',
    inprogress: 'Đang làm',
    review: 'Đang review',
    done: 'Hoàn thành'
}

export const TASK_STATUS_COLORS = {
    todo: 'gray',
    inprogress: 'blue',
    review: 'orange',
    done: 'green'
}

// Priority options
export const PRIORITIES = [
    { value: 'Low', label: 'Thấp', color: 'green' },
    { value: 'Medium', label: 'Trung bình', color: 'yellow' },
    { value: 'High', label: 'Cao', color: 'red' }
]

export const PRIORITY_COLORS = {
    Low: 'green',
    Medium: 'yellow',
    High: 'red'
}

// Difficulty options
export const DIFFICULTIES = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' }
]

// Project colors
export const PROJECT_COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#f5576c',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0'
]

// Project icons
export const PROJECT_ICONS = [
    '📁', '📂', '📋', '📌', '🎯', '🚀', '💡', '⭐',
    '🔥', '💎', '🎨', '📱', '💻', '🌐', '📊', '📈'
]

// Date formats
export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    CALENDAR: 'yyyy-MM-dd'
}

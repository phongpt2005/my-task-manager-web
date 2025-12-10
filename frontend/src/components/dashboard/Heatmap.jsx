/**
 * Activity Heatmap Component
 * GitHub-style contribution heatmap
 */

import { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'

// Color intensity based on activity count
const getColor = (count, isDark) => {
    if (count === 0) return isDark ? 'bg-gray-800' : 'bg-gray-100'
    if (count <= 2) return isDark ? 'bg-green-900/50' : 'bg-green-200'
    if (count <= 4) return isDark ? 'bg-green-700' : 'bg-green-400'
    if (count <= 6) return isDark ? 'bg-green-600' : 'bg-green-500'
    return isDark ? 'bg-green-500' : 'bg-green-600'
}

export default function Heatmap({
    data = [], // [{ date: '2024-01-01', count: 5 }, ...]
    weeks = 12,
    isDarkMode = false,
    onDayClick = () => { }
}) {
    // Generate calendar grid
    const calendarData = useMemo(() => {
        const today = new Date()
        const days = weeks * 7
        const grid = []

        // Create a map for quick lookup
        const dataMap = new Map()
        data.forEach(item => {
            dataMap.set(item.date, item.count)
        })

        // Generate days
        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i)
            const dateStr = format(date, 'yyyy-MM-dd')
            grid.push({
                date,
                dateStr,
                count: dataMap.get(dateStr) || 0,
                dayOfWeek: date.getDay()
            })
        }

        // Group by weeks
        const weekGroups = []
        let currentWeek = []
        grid.forEach((day, index) => {
            currentWeek.push(day)
            if (currentWeek.length === 7 || index === grid.length - 1) {
                weekGroups.push(currentWeek)
                currentWeek = []
            }
        })

        return weekGroups
    }, [data, weeks])

    // Calculate stats
    const stats = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.count, 0)
        const activeDays = data.filter(item => item.count > 0).length
        const maxStreak = calculateStreak(data)
        return { total, activeDays, maxStreak }
    }, [data])

    // Day labels
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📅 Hoạt động trong {weeks} tuần qua
            </h3>

            {/* Stats */}
            <div className="flex gap-6 mb-4 text-sm">
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Tổng tasks: </span>
                    <span className="font-bold text-primary-600">{stats.total}</span>
                </div>
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Ngày hoạt động: </span>
                    <span className="font-bold text-green-600">{stats.activeDays}</span>
                </div>
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Streak dài nhất: </span>
                    <span className="font-bold text-orange-600">{stats.maxStreak} ngày</span>
                </div>
            </div>

            {/* Heatmap grid */}
            <div className="overflow-x-auto">
                <div className="flex gap-1">
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 mr-2 text-xs text-gray-400">
                        {dayLabels.map((label, i) => (
                            <div
                                key={i}
                                className="h-3 leading-3"
                                style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    {calendarData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    onClick={() => onDayClick(day)}
                                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-primary-500 ${getColor(day.count, isDarkMode)}`}
                                    title={`${format(day.date, 'dd/MM/yyyy', { locale: vi })}: ${day.count} tasks`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Ít</span>
                {[0, 2, 4, 6, 8].map(count => (
                    <div
                        key={count}
                        className={`w-3 h-3 rounded-sm ${getColor(count, isDarkMode)}`}
                    />
                ))}
                <span>Nhiều</span>
            </div>
        </div>
    )
}

// Calculate longest streak
function calculateStreak(data) {
    if (!data.length) return 0

    // Sort by date
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

    let maxStreak = 0
    let currentStreak = 0
    let prevDate = null

    sorted.forEach(item => {
        if (item.count > 0) {
            const currentDate = new Date(item.date)
            if (prevDate) {
                const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24))
                if (diff === 1) {
                    currentStreak++
                } else {
                    currentStreak = 1
                }
            } else {
                currentStreak = 1
            }
            maxStreak = Math.max(maxStreak, currentStreak)
            prevDate = currentDate
        } else {
            currentStreak = 0
            prevDate = null
        }
    })

    return maxStreak
}

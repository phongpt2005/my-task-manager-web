import { useEffect, useState } from 'react'
import { dashboardApi } from '../../api/dashboardApi'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, getDay, startOfMonth, endOfMonth, isSameMonth } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function ContributionHeatmap() {
    const [heatmapData, setHeatmapData] = useState([])
    const [calendarData, setCalendarData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardApi.getHeatmapData()
                setHeatmapData(response.data.heatmap)
                generateCalendarData(response.data.heatmap)
            } catch (error) {
                console.error('Heatmap error', error)
            }
        }
        fetchData()
    }, [])

    const generateCalendarData = (data) => {
        // Generate current month data
        const today = new Date()
        const startDate = startOfMonth(today)
        const endDate = endOfMonth(today)

        // Create map for O(1) lookup
        const countMap = {}
        data.forEach(d => {
            countMap[d.date] = d.count
        })

        const days = eachDayOfInterval({ start: startDate, end: endDate })

        // Group by weeks
        const weeks = []
        let currentWeek = []

        // Pad start if needed to align with Sunday/Monday
        // Let's assume we start on Sunday (0)
        const startDay = getDay(startDate)
        for (let i = 0; i < startDay; i++) {
            currentWeek.push(null)
        }

        days.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            currentWeek.push({
                date: dateStr,
                count: countMap[dateStr] || 0,
                obj: day
            })

            if (currentWeek.length === 7) {
                weeks.push(currentWeek)
                currentWeek = []
            }
        })

        if (currentWeek.length > 0) {
            weeks.push(currentWeek)
        }

        setCalendarData(weeks)
    }

    const getColor = (count) => {
        // Using Primary Color (Indigo/Blue) scale
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
        if (count <= 2) return 'bg-indigo-200 dark:bg-indigo-900/40'
        if (count <= 4) return 'bg-indigo-400 dark:bg-indigo-700/60'
        if (count <= 6) return 'bg-indigo-600 dark:bg-indigo-500'
        return 'bg-indigo-800 dark:bg-indigo-400'
    }

    const months = [
        'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
        'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'
    ]

    return (
        <div className="card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hoạt động đóng góp
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tháng {format(new Date(), 'MM/yyyy')}
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="min-w-max">
                    {/* Month Labels - Removed for monthly view as it's redundant */}

                    <div className="flex gap-2">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-1 text-[10px] text-gray-400 pt-1">
                            <div className="h-3"></div> {/* Sun */}
                            <div className="h-3 leading-3">T2</div>
                            <div className="h-3"></div>
                            <div className="h-3 leading-3">T4</div>
                            <div className="h-3"></div>
                            <div className="h-3 leading-3">T6</div>
                            <div className="h-3"></div>
                        </div>

                        {/* Grid */}
                        <div className="flex gap-1">
                            {calendarData.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-1">
                                    {week.map((day, dIdx) => (
                                        <div
                                            key={dIdx}
                                            className={`w-3 h-3 rounded-[2px] transition-colors hover:ring-1 hover:ring-gray-400 ${day ? getColor(day.count) : 'bg-transparent'
                                                }`}
                                            data-tooltip-id="heatmap-tooltip"
                                            data-tooltip-content={
                                                day
                                                    ? `${format(day.obj, 'dd/MM/yyyy')}: ${day.count} tasks`
                                                    : ''
                                            }
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ReactTooltip
                id="heatmap-tooltip"
                className="z-50 !bg-gray-900 !text-white !px-3 !py-1 !rounded-lg !text-xs"
            />

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400 justify-end">
                <span>Ít</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-[2px]"></div>
                    <div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-900/40 rounded-[2px]"></div>
                    <div className="w-3 h-3 bg-indigo-400 dark:bg-indigo-700/60 rounded-[2px]"></div>
                    <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-500 rounded-[2px]"></div>
                    <div className="w-3 h-3 bg-indigo-800 dark:bg-indigo-400 rounded-[2px]"></div>
                </div>
                <span>Nhiều</span>
            </div>
        </div>
    )
}

/**
 * Calendar Page
 * Using FullCalendar React
 */

import { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { taskApi } from '../api/taskApi'
import { formatDate } from '../utils/helpers'
import { TASK_STATUS_LABELS } from '../utils/constants'
import Loading from '../components/common/Loading'
import Modal from '../components/common/Modal'
import TaskForm from '../components/task/TaskForm'

// Priority colors for events
const PRIORITY_COLORS = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#22c55e'
}

export default function Calendar() {
    const calendarRef = useRef(null)
    const [events, setEvents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => {
        fetchTasks(new Date())
    }, [])

    const fetchTasks = async (date) => {
        try {
            setIsLoading(true)
            const dateStr = date.toISOString().split('T')[0]
            const response = await taskApi.getTasksByDate(dateStr, 'month')

            // Convert tasks to calendar events
            const calendarEvents = response.data.tasks.map(task => ({
                id: task._id,
                title: task.title,
                start: task.deadline,
                end: task.deadline,
                backgroundColor: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium,
                borderColor: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium,
                extendedProps: {
                    task: task
                }
            }))

            setEvents(calendarEvents)
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle date click - create new task
    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr)
        setSelectedTask(null)
        setShowTaskModal(true)
    }

    // Handle event click - edit task
    const handleEventClick = (info) => {
        const task = info.event.extendedProps.task
        setSelectedTask(task)
        setSelectedDate(null)
        setShowTaskModal(true)
    }

    // Handle date change (month navigation)
    const handleDatesSet = (info) => {
        const midDate = new Date((info.start.getTime() + info.end.getTime()) / 2)
        fetchTasks(midDate)
    }

    // Handle task saved
    const handleTaskSaved = () => {
        setShowTaskModal(false)
        setSelectedTask(null)
        setSelectedDate(null)

        // Refresh current view
        const calendarApi = calendarRef.current?.getApi()
        if (calendarApi) {
            fetchTasks(calendarApi.getDate())
        }
    }

    if (isLoading && events.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" />
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Lịch
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Xem và quản lý tasks theo ngày
                </p>
            </div>

            {/* Calendar legend */}
            <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cao</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trung bình</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Thấp</span>
                </div>
            </div>

            {/* Calendar */}
            <div className="card p-4">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    locale="vi"
                    firstDay={1}
                    height="auto"
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    editable={false}
                    selectable={true}
                    dayMaxEvents={3}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    buttonText={{
                        today: 'Hôm nay',
                        month: 'Tháng',
                        week: 'Tuần',
                        day: 'Ngày'
                    }}
                />
            </div>

            {/* Task Modal */}
            <Modal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                title={selectedTask ? 'Chỉnh sửa task' : 'Tạo task mới'}
                size="lg"
            >
                <TaskForm
                    task={selectedTask}
                    defaultDeadline={selectedDate}
                    onSave={handleTaskSaved}
                    onCancel={() => setShowTaskModal(false)}
                />
            </Modal>
        </div>
    )
}

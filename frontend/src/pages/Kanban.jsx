/**
 * Kanban Board Page
 * Drag and drop task management
 */

import { useEffect, useState } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HiPlus, HiDotsVertical } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useTaskStore } from '../store/taskStore'
import { taskApi } from '../api/taskApi'
import { formatDate, isOverdue, getPriorityClass } from '../utils/helpers'
import { TASK_STATUS_LABELS } from '../utils/constants'
import { exportTasksToPDF, exportTasksToExcel } from '../utils/exportUtils'
import { HiDownload, HiDocumentText, HiTable } from 'react-icons/hi'
import Loading from '../components/common/Loading'
import Modal from '../components/common/Modal'
import TaskForm from '../components/task/TaskForm'

// Column colors
const COLUMN_COLORS = {
    todo: 'border-gray-400',
    inprogress: 'border-blue-500',
    review: 'border-yellow-500',
    done: 'border-green-500'
}

// Sortable Task Card
function SortableTaskCard({ task, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="task-card"
            onClick={() => onClick(task)}
        >
            {/* Priority badge */}
            <div className="flex items-center justify-between mb-2">
                <span className={`badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                </span>
                {task.project && (
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                        title={task.project.name}
                    />
                )}
            </div>

            {/* Title */}
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {task.title}
            </h4>

            {/* Description preview */}
            {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                    <span className={`${isOverdue(task.deadline) && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        📅 {formatDate(task.deadline)}
                    </span>
                    {task.tags?.length > 0 && (
                        <div className="flex gap-1">
                            {task.tags.slice(0, 2).map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {task.project && (
                    <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                        <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs truncate max-w-[120px]"
                            style={{
                                borderLeft: `3px solid ${task.project.color}`
                            }}
                            title={task.project.name}
                        >
                            {task.project.name}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick(task) // Open modal
                                // Ideally we should open members modal directly, but Kanban prop drilling is tricky.
                                // For now, let's keep it simple or implement a way to trigger members modal.
                            }}
                            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600"
                            title="Thành viên dự án"
                        >
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Team
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Task Card for Drag Overlay
function TaskCard({ task }) {
    return (
        <div className="task-card shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <span className={`badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">
                {task.title}
            </h4>
        </div>
    )
}

// Kanban Column
function KanbanColumn({ status, tasks, onAddTask, onTaskClick }) {
    const { setNodeRef } = useSortable({
        id: status,
        data: { type: 'column' }
    })

    return (
        <div className="kanban-column">
            {/* Column header */}
            <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${COLUMN_COLORS[status]}`}>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {TASK_STATUS_LABELS[status]}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => onAddTask(status)}
                    className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <HiPlus className="w-5 h-5" />
                </button>
            </div>

            {/* Tasks */}
            <div
                ref={setNodeRef}
                className="space-y-3 min-h-[200px]"
            >
                <SortableContext
                    items={tasks.map(t => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task._id}
                            task={task}
                            onClick={onTaskClick}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}

export default function Kanban() {
    const { tasks, fetchTasks, getTasksByStatus, updateTaskStatus } = useTaskStore()
    const [isLoading, setIsLoading] = useState(true)
    const [activeTask, setActiveTask] = useState(null)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [defaultStatus, setDefaultStatus] = useState('todo')
    const [showExportMenu, setShowExportMenu] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    useEffect(() => {
        loadTasks()
    }, [])

    const loadTasks = async () => {
        setIsLoading(true)
        await fetchTasks({ limit: 100 })
        setIsLoading(false)
    }

    const tasksByStatus = getTasksByStatus()

    const handleDragStart = (event) => {
        const { active } = event
        const task = tasks.find(t => t._id === active.id)
        setActiveTask(task)
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event
        setActiveTask(null)

        if (!over) return

        const activeId = active.id
        const overId = over.id

        // Find the task being dragged
        const task = tasks.find(t => t._id === activeId)
        if (!task) return

        // Determine new status
        let newStatus = task.status

        // Check if dropped on a column
        if (['todo', 'inprogress', 'review', 'done'].includes(overId)) {
            newStatus = overId
        } else {
            // Dropped on another task - get that task's status
            const overTask = tasks.find(t => t._id === overId)
            if (overTask) {
                newStatus = overTask.status
            }
        }

        // Update if status changed
        if (newStatus !== task.status) {
            const result = await updateTaskStatus(activeId, newStatus)
            if (result.success) {
                toast.success('Cập nhật trạng thái thành công')
            } else {
                toast.error('Lỗi cập nhật trạng thái')
            }
        }
    }

    const handleAddTask = (status) => {
        setDefaultStatus(status)
        setSelectedTask(null)
        setShowTaskModal(true)
    }

    const handleTaskClick = (task) => {
        setSelectedTask(task)
        setShowTaskModal(true)
    }

    const handleTaskSaved = () => {
        setShowTaskModal(false)
        setSelectedTask(null)
        loadTasks()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" />
            </div>
        )
    }

    return (
        <div className="h-full animate-fade-in">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kanban Board
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Kéo thả task để thay đổi trạng thái
                </p>
                <div className="mt-4 flex justify-end">
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <HiDownload className="w-5 h-5" />
                            Xuất file
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                                <button
                                    onClick={() => {
                                        exportTasksToPDF(tasks)
                                        setShowExportMenu(false)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <HiDocumentText className="w-4 h-4 text-red-500" /> Xuất PDF
                                </button>
                                <button
                                    onClick={() => {
                                        exportTasksToExcel(tasks)
                                        setShowExportMenu(false)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <HiTable className="w-4 h-4 text-green-500" /> Xuất Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Kanban board */}
            <div className="overflow-x-auto pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 min-w-max">
                        {['todo', 'inprogress', 'review', 'done'].map((status) => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                tasks={tasksByStatus[status] || []}
                                onAddTask={handleAddTask}
                                onTaskClick={handleTaskClick}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask && <TaskCard task={activeTask} />}
                    </DragOverlay>
                </DndContext>
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
                    defaultStatus={defaultStatus}
                    onSave={handleTaskSaved}
                    onCancel={() => setShowTaskModal(false)}
                />
            </Modal>
        </div>
    )
}

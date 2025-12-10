/**
 * Tasks Page
 * List view with filters
 */

import { useEffect, useState } from 'react'
import {
    HiPlus,
    HiSearch,
    HiFilter,
    HiX,
    HiDotsVertical,
    HiPencil,
    HiTrash,
    HiCheck,
    HiDownload,
    HiDocumentText,
    HiTable,
    HiUsers
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useTaskStore } from '../store/taskStore'
import { projectApi } from '../api/projectApi'
import { formatDate, isOverdue, getPriorityClass, getStatusClass, debounce } from '../utils/helpers'
import { TASK_STATUS_LABELS, PRIORITIES } from '../utils/constants'
import { exportTasksToPDF, exportTasksToExcel } from '../utils/exportUtils'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loading from '../components/common/Loading'
import Modal from '../components/common/Modal'
import TaskForm from '../components/task/TaskForm'
import ProjectMembersModal from '../components/project/ProjectMembersModal'

export default function Tasks() {
    const {
        tasks,
        isLoading,
        pagination,
        fetchTasks,
        deleteTask,
        updateTaskStatus,
        filters,
        setFilters,
        resetFilters
    } = useTaskStore()

    const [projects, setProjects] = useState([])
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showMembersModal, setShowMembersModal] = useState(false)

    // Admin view all feature
    const [isAdmin, setIsAdmin] = useState(false)
    const [viewAll, setViewAll] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState('')

    useEffect(() => {
        loadTasks()
        fetchProjects()
    }, [viewAll, selectedUserId])

    const loadTasks = async () => {
        const params = viewAll ? { viewAll: 'true', userId: selectedUserId || '' } : {}
        const response = await fetchTasks(params)
        if (response?.isAdmin !== undefined) {
            setIsAdmin(response.isAdmin)
            if (response.users) {
                setUsers(response.users)
            }
        }
    }

    const fetchProjects = async () => {
        try {
            const response = await projectApi.getProjects()
            setProjects(response.data.projects)
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        }
    }

    // Debounced search
    const handleSearch = debounce((value) => {
        setFilters({ search: value })
        fetchTasks({ search: value, page: 1 })
    }, 300)

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
        handleSearch(e.target.value)
    }

    const handleFilterChange = (key, value) => {
        setFilters({ [key]: value })
        fetchTasks({ [key]: value, page: 1 })
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        resetFilters()
        fetchTasks({ status: '', priority: '', project: '', search: '', page: 1 })
    }

    const handleCreateTask = () => {
        setSelectedTask(null)
        setShowTaskModal(true)
    }

    const handleEditTask = (task) => {
        setSelectedTask(task)
        setShowTaskModal(true)
    }

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Bạn có chắc muốn xóa task này?')) {
            return
        }

        const result = await deleteTask(taskId)
        if (result.success) {
            toast.success('Xóa task thành công')
        } else {
            toast.error(result.message)
        }
    }

    const handleMarkDone = async (task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done'
        const result = await updateTaskStatus(task._id, newStatus)
        if (result.success) {
            toast.success(newStatus === 'done' ? 'Đã hoàn thành!' : 'Đã chuyển về Todo')
            fetchTasks()
        }
    }

    const handleTaskSaved = () => {
        setShowTaskModal(false)
        setSelectedTask(null)
        fetchTasks()
    }

    const handlePageChange = (page) => {
        fetchTasks({ page })
    }

    const hasActiveFilters = filters.status || filters.priority || filters.project || filters.search

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Tasks
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Quản lý tất cả công việc của bạn
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Project Members Button - Only show when filtering by specific project */}
                    {filters.project && (
                        <Button
                            variant="secondary"
                            onClick={() => setShowMembersModal(true)}
                            leftIcon={<HiUsers className="w-5 h-5" />}
                        >
                            Thành viên
                        </Button>
                    )}

                    {/* Export Dropdown */}
                    <div className="relative">
                        <Button
                            variant="secondary"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            leftIcon={<HiDownload className="w-5 h-5" />}
                        >
                            Xuất file
                        </Button>
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

                    <Button onClick={handleCreateTask} leftIcon={<HiPlus className="w-5 h-5" />}>
                        Tạo task mới
                    </Button>
                </div>
            </div >

            {/* Admin View All Toggle */}
            {
                isAdmin && (
                    <div className="card p-4 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-purple-600 dark:text-purple-400 font-medium">👑 Chế độ Admin</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={viewAll}
                                        onChange={(e) => {
                                            setViewAll(e.target.checked)
                                            if (!e.target.checked) setSelectedUserId('')
                                        }}
                                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Xem tất cả tasks</span>
                                </label>
                            </div>

                            {viewAll && users.length > 0 && (
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="input py-2 px-3 text-sm max-w-xs"
                                >
                                    <option value="">👥 Tất cả người dùng ({users.length})</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            )}

                            {viewAll && (
                                <span className="text-sm text-gray-500">
                                    Hiển thị {tasks.length} / {pagination.total} tasks
                                </span>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Search and filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm task..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            leftIcon={<HiSearch className="w-5 h-5" />}
                        />
                    </div>

                    {/* Filter toggle */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        leftIcon={<HiFilter className="w-5 h-5" />}
                        className={hasActiveFilters ? 'ring-2 ring-primary-500' : ''}
                    >
                        Bộ lọc {hasActiveFilters && '(Đang lọc)'}
                    </Button>
                </div>

                {/* Filter options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="label">Trạng thái</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="input"
                                >
                                    <option value="">Tất cả</option>
                                    {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Độ ưu tiên</label>
                                <select
                                    value={filters.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="input"
                                >
                                    <option value="">Tất cả</option>
                                    {PRIORITIES.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Dự án</label>
                                <select
                                    value={filters.project}
                                    onChange={(e) => handleFilterChange('project', e.target.value)}
                                    className="input"
                                >
                                    <option value="">Tất cả</option>
                                    {projects.map((p) => (
                                        <option key={p._id} value={p._id}>{p.icon} {p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="mt-4 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                            >
                                <HiX className="w-4 h-4" /> Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tasks list */}
            {
                isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loading size="lg" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Chưa có task nào
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {hasActiveFilters
                                ? 'Không tìm thấy task phù hợp với bộ lọc'
                                : 'Bắt đầu tạo task đầu tiên của bạn'}
                        </p>
                        {!hasActiveFilters && (
                            <Button onClick={handleCreateTask}>
                                Tạo task mới
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div
                                    key={task._id}
                                    className={`card p-4 hover:shadow-lg transition-all ${task.status === 'done' ? 'opacity-75' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => handleMarkDone(task)}
                                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'done'
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                                                }`}
                                        >
                                            {task.status === 'done' && <HiCheck className="w-3 h-3" />}
                                        </button>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className={`font-medium text-gray-900 dark:text-white ${task.status === 'done' ? 'line-through' : ''
                                                        }`}>
                                                        {task.title}
                                                    </h3>
                                                    {task.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions dropdown */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditTask(task)}
                                                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    >
                                                        <HiPencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Meta info */}
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span className={`badge ${getPriorityClass(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`badge ${getStatusClass(task.status)}`}>
                                                    {TASK_STATUS_LABELS[task.status]}
                                                </span>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>
                                                        📅 {formatDate(task.deadline)}
                                                    </span>
                                                    {isOverdue(task.deadline) && task.status !== 'done' && (
                                                        <span className="text-red-500 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                                                            Quá hạn
                                                        </span>
                                                    )}
                                                    {task.project && (
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs"
                                                                style={{
                                                                    borderLeft: `3px solid ${task.project.color}`
                                                                }}
                                                            >
                                                                {task.project.name}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setFilters({ project: task.project._id })
                                                                    setShowMembersModal(true)
                                                                }}
                                                                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 hover:underline"
                                                                title="Xem thành viên"
                                                            >
                                                                <HiUsers className="w-3 h-3" />
                                                                Thành viên
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Show creator for admin view all */}
                                                {viewAll && task.createdBy && (
                                                    <span className="flex items-center gap-1.5 text-sm text-purple-500 dark:text-purple-400">
                                                        👤 {task.createdBy.name || task.createdBy.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${pagination.page === page
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )
            }

            {/* Task Modal */}
            <Modal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                title={selectedTask ? 'Chỉnh sửa task' : 'Tạo task mới'}
                size="lg"
            >
                <TaskForm
                    task={selectedTask}
                    onSave={handleTaskSaved}
                    onCancel={() => setShowTaskModal(false)}
                />
            </Modal>

            {/* Project Members Modal */}
            {showMembersModal && filters.project && (
                <ProjectMembersModal
                    isOpen={showMembersModal}
                    onClose={() => setShowMembersModal(false)}
                    project={projects.find(p => p._id === filters.project)}
                    userRole={projects.find(p => p._id === filters.project)?.userRole}
                    onMembersChange={fetchProjects}
                />
            )}
        </div >
    )
}

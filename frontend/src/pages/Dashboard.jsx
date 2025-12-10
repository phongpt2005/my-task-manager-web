/**
 * Dashboard Page
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HabitAnalysis from '../components/dashboard/HabitAnalysis'
import ContributionHeatmap from '../components/dashboard/ContributionHeatmap'
import FocusChart from '../components/dashboard/FocusChart'
import {
    HiClipboardList,
    HiClock,
    HiCheckCircle,
    HiExclamation,
    HiChartBar,
    HiCalendar,
    HiArrowRight,
    HiPlus
} from 'react-icons/hi'
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { dashboardApi } from '../api/dashboardApi'
import { projectApi } from '../api/projectApi'
import { formatDate, formatRelativeTime, isOverdue } from '../utils/helpers'
import { TASK_STATUS_LABELS } from '../utils/constants'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import MyInvitations from '../components/project/MyInvitations'
import toast from 'react-hot-toast'

// Stats Card Component
function StatsCard({ icon: Icon, label, value, color, trend }) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500'
    }

    return (
        <div className="card p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {value}
                    </p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}% so với tuần trước
                        </p>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${colorClasses[color]} bg-opacity-10`}>
                    <Icon className={`w-8 h-8 ${colorClasses[color].replace('bg-', 'text-')}`} />
                </div>
            </div>
        </div>
    )
}

// Recent Tasks Component
function RecentTasks({ tasks }) {
    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tasks gần đây
                </h3>
                <Link
                    to="/tasks"
                    className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                >
                    Xem tất cả <HiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-3">
                {tasks.length > 0 ? tasks.map((task) => (
                    <div
                        key={task._id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' :
                            task.status === 'inprogress' ? 'bg-blue-500' :
                                task.status === 'review' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {task.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatRelativeTime(task.updatedAt)}
                            </p>
                        </div>
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                            {task.priority}
                        </span>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Chưa có task nào
                    </p>
                )}
            </div>
        </div>
    )
}

// Upcoming Deadlines Component
function UpcomingDeadlines({ tasks }) {
    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Deadline sắp tới
                </h3>
                <Link
                    to="/calendar"
                    className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                >
                    Xem lịch <HiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-3">
                {tasks.length > 0 ? tasks.map((task) => (
                    <div
                        key={task._id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className={`p-2 rounded-lg ${isOverdue(task.deadline)
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                            }`}>
                            <HiCalendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {task.title}
                            </p>
                            <p className={`text-xs ${isOverdue(task.deadline)
                                ? 'text-red-500'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {formatDate(task.deadline, 'dd/MM/yyyy HH:mm')}
                            </p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Không có deadline sắp tới
                    </p>
                )}
            </div>
        </div>
    )
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                {label && <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>}
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [weeklyData, setWeeklyData] = useState([])
    const [recentTasks, setRecentTasks] = useState([])
    const [upcomingTasks, setUpcomingTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Create Project State
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '📁'
    })

    const handleCreateProject = async (e) => {
        e.preventDefault()
        if (!newProject.name.trim()) {
            toast.error('Vui lòng nhập tên dự án')
            return
        }

        try {
            setIsCreatingProject(true)
            await projectApi.createProject(newProject)
            toast.success('Tạo dự án thành công')
            setShowCreateProjectModal(false)
            setNewProject({
                name: '',
                description: '',
                color: '#3b82f6',
                icon: '📁'
            })
            // Optionally refresh stats
            fetchDashboardData()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi tạo dự án')
        } finally {
            setIsCreatingProject(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true)
            const [statsRes, weeklyRes, recentRes, upcomingRes] = await Promise.all([
                dashboardApi.getStats(),
                dashboardApi.getWeeklyProgress(),
                dashboardApi.getRecentTasks(5),
                dashboardApi.getUpcomingDeadlines(5)
            ])

            setStats(statsRes.data)
            setWeeklyData(weeklyRes.data.weeklyData)
            setRecentTasks(recentRes.data.tasks)
            setUpcomingTasks(upcomingRes.data.tasks)
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" />
            </div>
        )
    }

    const overview = stats?.overview || {}

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tổng quan về công việc của bạn
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateProjectModal(true)}
                    leftIcon={<HiPlus className="w-5 h-5" />}
                >
                    Tạo dự án
                </Button>
            </div>

            {/* Invitations Section */}
            <MyInvitations />

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={HiClipboardList}
                    label="Tổng số tasks"
                    value={overview.totalTasks || 0}
                    color="blue"
                />
                <StatsCard
                    icon={HiClock}
                    label="Đang thực hiện"
                    value={overview.inProgressCount || 0}
                    color="yellow"
                />
                <StatsCard
                    icon={HiCheckCircle}
                    label="Hoàn thành"
                    value={overview.doneCount || 0}
                    color="green"
                />
                <StatsCard
                    icon={HiExclamation}
                    label="Quá hạn"
                    value={overview.overdueCount || 0}
                    color="red"
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task distribution pie chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Phân bố tasks theo trạng thái
                    </h3>
                    <div className="h-64">
                        {(() => {
                            // Filter out status with 0 value
                            const chartData = (stats?.tasksByStatus || []).filter(item => item.value > 0);

                            if (chartData.length === 0) {
                                return (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">📋</div>
                                            <p className="text-gray-500 dark:text-gray-400">Chưa có task nào</p>
                                            <Link
                                                to="/tasks"
                                                className="text-primary-500 hover:text-primary-600 text-sm mt-2 inline-block"
                                            >
                                                Tạo task đầu tiên →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={chartData.length > 1 ? 5 : 0}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                                            }
                                            labelLine={chartData.length > 1}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </div>

                {/* Weekly progress bar chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tiến độ trong tuần
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="created" name="Tạo mới" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed" name="Hoàn thành" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Advanced Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContributionHeatmap />
                <FocusChart />
            </div>

            {/* Recent tasks and upcoming deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentTasks tasks={recentTasks} />
                <div className="space-y-6">
                    <UpcomingDeadlines tasks={upcomingTasks} />
                    <HabitAnalysis />
                </div>
            </div>

            {/* Completion rate */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tỷ lệ hoàn thành
                    </h3>
                    <span className="text-2xl font-bold text-primary-600">
                        {overview.completionRate || 0}%
                    </span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                        style={{ width: `${overview.completionRate || 0}%` }}
                    />
                </div>
            </div>

            <Modal
                isOpen={showCreateProjectModal}
                onClose={() => setShowCreateProjectModal(false)}
                title="Tạo dự án mới"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <Input
                        label="Tên dự án *"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="Nhập tên dự án..."
                        autoFocus
                    />

                    <div>
                        <label className="label">Mô tả</label>
                        <textarea
                            className="input w-full"
                            rows={3}
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            placeholder="Mô tả về dự án..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Màu sắc"
                            type="color"
                            value={newProject.color}
                            onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                            className="h-10 p-1"
                        />
                        <Input
                            label="Icon (Emoji)"
                            value={newProject.icon}
                            onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })}
                            placeholder="📁"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateProjectModal(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isCreatingProject}
                        >
                            Tạo dự án
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

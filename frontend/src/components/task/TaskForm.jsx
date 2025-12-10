/**
 * Task Form Component
 */

import { useState, useEffect } from 'react'
import { DescriptionAI, DeadlineAI } from './AIHelpers'
import TaskTimer from './TaskTimer'
import CommentsSection from './CommentsSection'
import { HiCalendar, HiFlag, HiTag, HiClock } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useTaskStore } from '../../store/taskStore'
import { projectApi } from '../../api/projectApi'
import { PRIORITIES, DIFFICULTIES } from '../../utils/constants'
import Button from '../common/Button'
import Input from '../common/Input'
import ProjectMembersModal from '../project/ProjectMembersModal'
import { HiUsers } from 'react-icons/hi'

export default function TaskForm({ task, defaultStatus = 'todo', onSave, onCancel }) {
    const { createTask, updateTask, deleteTask } = useTaskStore()
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showMembersModal, setShowMembersModal] = useState(false)

    // Default project options
    const defaultProjects = [
        { _id: 'personal', name: 'Công việc cá nhân', icon: '📋', color: '#667eea' },
        { _id: 'web', name: 'Dự án Web', icon: '🌐', color: '#f5576c' },
        { _id: 'marketing', name: 'Marketing', icon: '📢', color: '#4facfe' },
        { _id: 'learning', name: 'Học tập', icon: '📚', color: '#43e97b' },
        { _id: 'design', name: 'Thiết kế', icon: '🎨', color: '#fa709a' },
        { _id: 'bugfix', name: 'Bug & Fix', icon: '🐛', color: '#f093fb' },
        { _id: 'meeting', name: 'Họp & Thảo luận', icon: '👥', color: '#00f2fe' },
        { _id: 'other', name: 'Khác', icon: '📁', color: '#764ba2' }
    ]

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: defaultStatus,
        deadline: '',
        project: 'personal', // Default to Personal
        tags: '',
        estimatedTime: '',
        difficulty: 'medium',
        notes: ''
    })

    useEffect(() => {
        fetchProjects()

        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                status: task.status || defaultStatus,
                deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
                project: task.project?._id || task.project || 'personal',
                tags: task.tags?.join(', ') || '',
                estimatedTime: task.estimatedTime || '',
                difficulty: task.difficulty || 'medium',
                notes: task.notes || ''
            })
        }
    }, [task, defaultStatus])

    // Auto-detect project type based on title keywords
    useEffect(() => {
        if (!formData.title) return

        const titleLower = formData.title.toLowerCase()
        let detectedProject = ''

        const keywords = {
            bugfix: ['bug', 'fix', 'lỗi', 'sửa'],
            web: ['web', 'api', 'frontend', 'backend', 'db', 'database'],
            design: ['design', 'thiết kế', 'ui', 'ux', 'banner', 'logo'],
            meeting: ['họp', 'meet', 'call', 'thảo luận'],
            marketing: ['seo', 'post', 'content', 'quảng cáo'],
            learning: ['học', 'learn', 'nghiên cứu', 'đọc'],
            personal: ['mua', 'nhà', 'cá nhân']
        }

        for (const [project, terms] of Object.entries(keywords)) {
            if (terms.some(term => titleLower.includes(term))) {
                detectedProject = project
                break
            }
        }

        // Only update if a keyword is found and it's different from current
        // And we only auto-switch to default projects, not overwriting if user selected a custom project (ID length 24)
        if (detectedProject && formData.project !== detectedProject) {
            // Check if current project is a custom one (length 24 usually means MongoDB ObjectId)
            // If it's a custom project, we might want to keep it? 
            // But user asked for auto-fill type. Let's prioritize the auto-detection for now as it's a "Project Type" field.
            setFormData(prev => ({ ...prev, project: detectedProject }))
        }
    }, [formData.title])

    const fetchProjects = async () => {
        try {
            const response = await projectApi.getProjects()
            // Combine default projects with API projects
            const apiProjects = response.data.projects || []
            setProjects([...defaultProjects, ...apiProjects])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
            // If API fails, use default projects
            setProjects(defaultProjects)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề')
            return
        }

        if (!formData.deadline) {
            toast.error('Vui lòng chọn deadline')
            return
        }

        setIsLoading(true)

        const data = {
            ...formData,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
            estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime.toString().replace(',', '.')) : undefined,
            project: (formData.project && formData.project.length === 24) ? formData.project : undefined
        }

        // If selecting a default project (not a real DB project), add it as a tag if not present
        if (formData.project && formData.project.length !== 24) {
            const defaultProj = defaultProjects.find(p => p._id === formData.project)
            if (defaultProj && !data.tags.includes(defaultProj.name)) {
                data.tags.push(defaultProj.name)
            }
        }

        let result
        if (task) {
            result = await updateTask(task._id, data)
        } else {
            result = await createTask(data)
        }

        setIsLoading(false)

        if (result.success) {
            toast.success(task ? 'Cập nhật task thành công' : 'Tạo task thành công')
            onSave()
        } else {
            toast.error(result.message)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa task này?')) {
            return
        }

        setIsDeleting(true)
        const result = await deleteTask(task._id)
        setIsDeleting(false)

        if (result.success) {
            toast.success('Xóa task thành công')
            onSave()
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="space-y-5">
            {task && <TaskTimer task={task} onUpdate={onSave} />}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <Input
                    label="Tiêu đề *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề task..."
                />

                {/* Description */}
                <div>
                    <label className="label">Mô tả</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="input resize-none"
                        placeholder="Mô tả chi tiết task..."
                    />
                    <DescriptionAI
                        description={formData.description}
                        onUpdate={(val) => setFormData(prev => ({ ...prev, description: val }))}
                    />
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Độ ưu tiên</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="input"
                        >
                            {PRIORITIES.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="todo">Chờ làm</option>
                            <option value="inprogress">Đang làm</option>
                            <option value="review">Đang review</option>
                            <option value="done">Hoàn thành</option>
                        </select>
                    </div>
                </div>

                {/* Deadline & Estimated Time */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="datetime-local"
                        label="Deadline *"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        leftIcon={<HiCalendar className="w-5 h-5" />}
                    />
                    <DeadlineAI formData={formData} />

                    <Input
                        type="number"
                        label="Thời gian ước tính (giờ)"
                        name="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        leftIcon={<HiClock className="w-5 h-5" />}
                    />
                </div>

                {/* Project & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="label mb-0">Loại dự án</label>
                            {/* Project Members Button - Show if project is selected and NOT a default one */}
                            {formData.project &&
                                !['personal', 'web', 'marketing', 'learning', 'design', 'bugfix', 'meeting', 'other'].includes(typeof formData.project === 'string' ? formData.project : formData.project._id) && (
                                    <button
                                        type="button"
                                        onClick={() => setShowMembersModal(true)}
                                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        <HiUsers className="w-3 h-3" />
                                        Thành viên & Phân quyền
                                    </button>
                                )}
                        </div>
                        <select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            className="input"
                        >
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.icon} {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <ProjectMembersModal
                        isOpen={showMembersModal}
                        onClose={() => setShowMembersModal(false)}
                        // Helper to find the project object whether formData.project is string ID or object
                        project={projects.find(p => p._id === (typeof formData.project === 'string' ? formData.project : formData.project?._id))}
                        userRole={projects.find(p => p._id === (typeof formData.project === 'string' ? formData.project : formData.project?._id))?.userRole}
                        onMembersChange={fetchProjects}
                    />

                    <div>
                        <label className="label">Độ khó</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="input"
                        >
                            {DIFFICULTIES.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <Input
                    label="Tags (phân cách bằng dấu phẩy)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="urgent, frontend, bug..."
                    leftIcon={<HiTag className="w-5 h-5" />}
                />

                {/* Notes */}
                <div>
                    <label className="label">Ghi chú</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="input resize-none"
                        placeholder="Ghi chú thêm..."
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    {task ? (
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                        >
                            Xóa task
                        </Button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                        >
                            {task ? 'Cập nhật' : 'Tạo task'}
                        </Button>
                    </div>
                </div>

                {task && <CommentsSection taskId={task._id} />}
            </form>
        </div>
    )
}

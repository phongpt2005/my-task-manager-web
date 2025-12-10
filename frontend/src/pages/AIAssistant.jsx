/**
 * AI Assistant Page
 * All AI-powered features
 */

import { useState } from 'react'
import {
    HiLightningBolt,
    HiDocumentText,
    HiFlag,
    HiPencilAlt,
    HiClock,
    HiSparkles
} from 'react-icons/hi'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { aiApi } from '../api/aiApi'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loading from '../components/common/Loading'

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`card p-6 text-left transition-all hover:scale-[1.02] ${isActive
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
        >
            <div className={`inline-flex p-3 rounded-xl mb-4 ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
            </p>
        </button>
    )
}

// AI Feature Components
function PlanGenerator() {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState('')
    const [startTime, setStartTime] = useState('08:00')
    const [endTime, setEndTime] = useState('17:00')
    const [breakTime, setBreakTime] = useState('12:00-13:00')

    const handleGenerate = async () => {
        setIsLoading(true)
        try {
            const response = await aiApi.generatePlan({
                startTime,
                endTime,
                breakTime
            })
            setResult(response.data.plan)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi tạo kế hoạch')
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    type="time"
                    label="Giờ bắt đầu"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    leftIcon={<HiClock className="w-5 h-5" />}
                />
                <Input
                    type="time"
                    label="Giờ kết thúc"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    leftIcon={<HiClock className="w-5 h-5" />}
                />
                <Input
                    label="Thời gian nghỉ"
                    value={breakTime}
                    onChange={(e) => setBreakTime(e.target.value)}
                    placeholder="12:00-13:00"
                />
            </div>

            <Button onClick={handleGenerate} isLoading={isLoading} leftIcon={<HiSparkles className="w-5 h-5" />}>
                Tạo kế hoạch
            </Button>

            {result && (
                <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                    <ReactMarkdown className="prose dark:prose-invert max-w-none">
                        {result}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    )
}

function Summarizer() {
    const [isLoading, setIsLoading] = useState(false)
    const [description, setDescription] = useState('')
    const [result, setResult] = useState('')

    const handleSummarize = async () => {
        if (!description.trim()) {
            toast.error('Vui lòng nhập nội dung')
            return
        }

        setIsLoading(true)
        try {
            const response = await aiApi.summarize(description)
            setResult(response.data.summary)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi tóm tắt')
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="label">Nội dung cần tóm tắt</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="input resize-none"
                    placeholder="Nhập mô tả công việc dài cần tóm tắt..."
                />
            </div>

            <Button onClick={handleSummarize} isLoading={isLoading} leftIcon={<HiSparkles className="w-5 h-5" />}>
                Tóm tắt
            </Button>

            {result && (
                <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📝 Tóm tắt:</h4>
                    <ReactMarkdown className="prose dark:prose-invert max-w-none">
                        {result}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    )
}

function PrioritySuggestion() {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        difficulty: 'medium',
        estimatedTime: ''
    })
    const [result, setResult] = useState(null)

    const handleSuggest = async () => {
        if (!formData.deadline) {
            toast.error('Vui lòng chọn deadline')
            return
        }

        setIsLoading(true)
        try {
            const response = await aiApi.suggestPriority(formData)
            setResult(response.data.suggestion)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi đề xuất')
        }
        setIsLoading(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const priorityColors = {
        High: 'bg-red-500',
        Medium: 'bg-yellow-500',
        Low: 'bg-green-500'
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Tiêu đề task"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Tên công việc..."
                />
                <Input
                    type="datetime-local"
                    label="Deadline *"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="label">Mô tả</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="input resize-none"
                    placeholder="Mô tả công việc..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Độ khó</label>
                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="input"
                    >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                    </select>
                </div>
                <Input
                    type="number"
                    label="Thời gian ước tính (giờ)"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                />
            </div>

            <Button onClick={handleSuggest} isLoading={isLoading} leftIcon={<HiSparkles className="w-5 h-5" />}>
                Đề xuất độ ưu tiên
            </Button>

            {result && (
                <div className="card p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`px-4 py-2 rounded-lg text-white font-bold text-lg ${priorityColors[result.priority] || 'bg-gray-500'}`}>
                            {result.priority}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">📋 Lý do:</h4>
                            <p className="text-gray-600 dark:text-gray-400">{result.reason}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">💡 Gợi ý:</h4>
                            <p className="text-gray-600 dark:text-gray-400">{result.tips}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function NotesRewriter() {
    const [isLoading, setIsLoading] = useState(false)
    const [notes, setNotes] = useState('')
    const [result, setResult] = useState('')

    const handleRewrite = async () => {
        if (!notes.trim()) {
            toast.error('Vui lòng nhập ghi chú')
            return
        }

        setIsLoading(true)
        try {
            const response = await aiApi.rewriteNotes(notes)
            setResult(response.data.notes)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi viết lại')
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="label">Ghi chú thô</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="input resize-none"
                    placeholder="Nhập ghi chú thô, ý tưởng, notes nhanh..."
                />
            </div>

            <Button onClick={handleRewrite} isLoading={isLoading} leftIcon={<HiSparkles className="w-5 h-5" />}>
                Viết lại chuyên nghiệp
            </Button>

            {result && (
                <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">✨ Ghi chú đã được viết lại:</h4>
                    <ReactMarkdown className="prose dark:prose-invert max-w-none">
                        {result}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    )
}

export default function AIAssistant() {
    const [activeFeature, setActiveFeature] = useState('plan')

    const features = [
        {
            id: 'plan',
            icon: HiLightningBolt,
            title: 'Tạo kế hoạch làm việc',
            description: 'AI phân tích tasks và tạo lịch làm việc tối ưu cho ngày của bạn'
        },
        {
            id: 'summarize',
            icon: HiDocumentText,
            title: 'Tóm tắt công việc',
            description: 'Tóm tắt mô tả dài thành 3-5 dòng ngắn gọn, súc tích'
        },
        {
            id: 'priority',
            icon: HiFlag,
            title: 'Gợi ý độ ưu tiên',
            description: 'AI đề xuất mức độ ưu tiên dựa trên deadline và độ khó'
        },
        {
            id: 'notes',
            icon: HiPencilAlt,
            title: 'Viết ghi chú thông minh',
            description: 'Biến ghi chú thô thành văn bản chuyên nghiệp'
        }
    ]

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'plan':
                return <PlanGenerator />
            case 'summarize':
                return <Summarizer />
            case 'priority':
                return <PrioritySuggestion />
            case 'notes':
                return <NotesRewriter />
            default:
                return null
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                        <HiSparkles className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        AI Assistant
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Sử dụng sức mạnh AI để tăng năng suất làm việc
                </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {features.map((feature) => (
                    <FeatureCard
                        key={feature.id}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        isActive={activeFeature === feature.id}
                        onClick={() => setActiveFeature(feature.id)}
                    />
                ))}
            </div>

            {/* Active feature content */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {features.find(f => f.id === activeFeature)?.title}
                </h2>
                {renderFeatureContent()}
            </div>
        </div>
    )
}

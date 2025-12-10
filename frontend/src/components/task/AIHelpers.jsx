import { useState, useRef } from 'react'
import { HiSparkles, HiLightningBolt, HiPhotograph, HiDocumentText } from 'react-icons/hi'
import { aiApi } from '../../api/aiApi'
import toast from 'react-hot-toast'

export const AIButton = ({ onClick, icon: Icon, label, isLoading, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors 
        bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50 ${className}`}
    >
        {isLoading ? (
            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        ) : (
            <Icon className="w-3.5 h-3.5" />
        )}
        {label}
    </button>
)

export const DescriptionAI = ({ description, onUpdate }) => {
    const [loading, setLoading] = useState({
        breakdown: false,
        summary: false,
        ocr: false
    })
    const fileInputRef = useRef(null)

    const handleBreakdown = async () => {
        if (!description) return toast.error('Vui lòng nhập mô tả trước')

        try {
            setLoading(prev => ({ ...prev, breakdown: true }))
            const result = await aiApi.breakdownTask(description)

            const checklist = "\n\n### 📋 Subtasks (AI Suggested):\n" +
                result.subtasks.map(s => `- [ ] ${s.title} (${s.estimatedTime})`).join('\n')

            onUpdate(description + checklist)
            toast.success('Đã tạo danh sách công việc con')
        } catch (error) {
            toast.error(error.message || 'Lỗi phân chia công việc')
        } finally {
            setLoading(prev => ({ ...prev, breakdown: false }))
        }
    }

    const handleSummarize = async () => {
        if (!description) return toast.error('Vui lòng nhập mô tả trước')

        try {
            setLoading(prev => ({ ...prev, summary: true }))
            const result = await aiApi.summarize(description)

            toast.success('Đã tóm tắt nội dung', {
                duration: 5000,
                icon: '📝'
            })
            // Optionally just show it or append? Let's append formatted
            onUpdate(description + "\n\n### 💡 Summary:\n" + result.summary)
        } catch (error) {
            toast.error('Lỗi tóm tắt')
        } finally {
            setLoading(prev => ({ ...prev, summary: false }))
        }
    }

    const handleOCR = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setLoading(prev => ({ ...prev, ocr: true }))
            const result = await aiApi.processOCR(file)

            onUpdate((description ? description + "\n\n" : "") + result.text)
            toast.success('Đã nhận diện văn bản')
        } catch (error) {
            toast.error('Lỗi nhận diện ảnh')
        } finally {
            setLoading(prev => ({ ...prev, ocr: false }))
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex gap-2 mt-2">
            <AIButton
                onClick={handleBreakdown}
                icon={HiSparkles}
                label="Phân nhỏ Task"
                isLoading={loading.breakdown}
            />
            <AIButton
                onClick={handleSummarize}
                icon={HiDocumentText}
                label="Tóm tắt"
                isLoading={loading.summary}
            />
            <div className="relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleOCR}
                    accept="image/*"
                    className="hidden"
                />
                <AIButton
                    onClick={() => fileInputRef.current?.click()}
                    icon={HiPhotograph}
                    label="Scan ảnh (OCR)"
                    isLoading={loading.ocr}
                />
            </div>
        </div>
    )
}

export const DeadlineAI = ({ formData }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handlePredict = async () => {
        if (!formData.title || !formData.deadline) {
            return toast.error('Cần có tiêu đề và deadline')
        }

        try {
            setIsLoading(true)
            const result = await aiApi.predictDeadline(formData)

            const color = result.riskLevel === 'High' ? 'red' : result.riskLevel === 'Medium' ? 'yellow' : 'green'
            const icon = result.riskLevel === 'High' ? '🔴' : result.riskLevel === 'Medium' ? '🟡' : '🟢'

            toast((t) => (
                <div className="text-sm">
                    <b className="block mb-1">{icon} Rủi ro: {result.riskLevel}</b>
                    <p className="mb-1">{result.reason}</p>
                    <i className="text-gray-500">{result.suggestedAction}</i>
                </div>
            ), { duration: 6000 })

        } catch (error) {
            toast.error('Lỗi dự đoán')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AIButton
            onClick={handlePredict}
            icon={HiLightningBolt}
            label="Dự đoán rủi ro"
            isLoading={isLoading}
            className="mt-1"
        />
    )
}

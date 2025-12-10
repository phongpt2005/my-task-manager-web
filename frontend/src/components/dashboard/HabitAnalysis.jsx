import { useState } from 'react'
import { HiLightningBolt, HiLightBulb, HiClock, HiChartPie } from 'react-icons/hi'
import { aiApi } from '../../api/aiApi'
import Button from '../common/Button'
import Loading from '../common/Loading'

export default function HabitAnalysis() {
    const [analysis, setAnalysis] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleAnalyze = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await aiApi.analyzeHabits()
            if (result.success) {
                setAnalysis(result.data)
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('Không thể phân tích thói quen lúc này.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!analysis && !isLoading) {
        return (
            <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-none">
                <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <HiLightningBolt className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Phân tích thói quen làm việc
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Sử dụng AI để tìm ra khung giờ làm việc hiệu quả nhất và nhận lời khuyên cải thiện năng suất.
                    </p>
                    <Button onClick={handleAnalyze} variant="primary">
                        ✨ Phân tích ngay
                    </Button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="card p-6 flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <Loading />
                    <p className="mt-3 text-sm text-gray-500 animate-pulse">Đang phân tích dữ liệu làm việc...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card p-6 text-center text-red-500">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="text-sm underline mt-2">Thử lại</button>
            </div>
        )
    }

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <HiChartPie className="text-indigo-500" /> Kết quả phân tích AI
            </h3>

            <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-medium">
                        <HiClock className="w-5 h-5" />
                        Khung giờ vàng
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analysis.peakProductivityHours}
                    </p>
                </div>

                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <HiLightBulb className="text-yellow-500" /> Thói quen
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {analysis.habits?.map((habit, idx) => (
                            <li key={idx}>{habit}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        💡 Lời khuyên
                    </h4>
                    <div className="space-y-2">
                        {analysis.suggestions?.map((suggestion, idx) => (
                            <div key={idx} className="bg-green-50 dark:bg-green-900/10 p-3 rounded text-sm text-green-800 dark:text-green-300">
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setAnalysis(null)}
                    className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600"
                >
                    Phân tích lại
                </button>
            </div>
        </div>
    )
}

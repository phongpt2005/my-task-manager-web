import { useEffect, useState } from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts'
import { dashboardApi } from '../../api/dashboardApi'
import Loading from '../common/Loading'

export default function FocusChart() {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardApi.getFocusScore()
                setData(response.data.scores)
            } catch (error) {
                console.error('Focus Score error', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) return <div className="h-64 flex items-center justify-center"><Loading /></div>

    return (
        <div className="card p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Weekly Focus Score
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Điểm số hiệu suất tuần này của bạn
            </p>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="My Score"
                            dataKey="A"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-5 gap-1 mt-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col">
                        <span>{d.subject}</span>
                        <span className="text-primary-600">{d.A}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

import { useState, useEffect, useRef } from 'react'
import { HiPlay, HiStop, HiClock, HiPause } from 'react-icons/hi'
import { taskApi } from '../../api/taskApi'
import toast from 'react-hot-toast'
import Button from '../common/Button'

export default function TaskTimer({ task, onUpdate }) {
    const [mode, setMode] = useState('manual') // 'manual' or 'pomodoro'
    const [isRunning, setIsRunning] = useState(false)
    const [elapsed, setElapsed] = useState(0) // seconds for manual
    const [timeLeft, setTimeLeft] = useState(25 * 60) // seconds for pomodoro
    const timerRef = useRef(null)

    // Check if task has running timer
    useEffect(() => {
        if (task && task.timeLogs) {
            const activeLog = task.timeLogs.find(l => !l.endTime)
            if (activeLog) {
                setMode('manual')
                setIsRunning(true)
                // Calculate initial elapsed
                const start = new Date(activeLog.startTime).getTime()
                const now = new Date().getTime()
                setElapsed(Math.floor((now - start) / 1000))
            }
        }
    }, [task])

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                if (mode === 'manual') {
                    setElapsed(prev => prev + 1)
                } else {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            handlePomodoroComplete()
                            return 25 * 60
                        }
                        return prev - 1
                    })
                }
            }, 1000)
        } else {
            clearInterval(timerRef.current)
        }
        return () => clearInterval(timerRef.current)
    }, [isRunning, mode])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartManual = async () => {
        try {
            await taskApi.startTimer(task._id)
            setIsRunning(true)
            setMode('manual')
            toast.success('Bắt đầu tính giờ')
            if (onUpdate) onUpdate()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleStopManual = async () => {
        try {
            await taskApi.stopTimer(task._id)
            setIsRunning(false)
            setElapsed(0)
            toast.success('Đã dừng và lưu thời gian')
            if (onUpdate) onUpdate()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const togglePomodoro = () => {
        setIsRunning(!isRunning)
        setMode('pomodoro')
    }

    const handlePomodoroComplete = async () => {
        setIsRunning(false)
        try {
            // Play sound?
            new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => { })

            await taskApi.logPomodoro(task._id, 25)
            toast.success('🎉 Hoàn thành 1 Pomodoro!', { icon: '🍅' })
            if (onUpdate) onUpdate()
        } catch (error) {
            console.error(error)
        }
    }

    if (!task) return null

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <HiClock className="text-primary-500" />
                    Time Tracking
                </h4>
                <div className="flex bg-gray-200 dark:bg-gray-800 rounded p-1 text-xs">
                    <button
                        onClick={() => { setIsRunning(false); setMode('manual') }}
                        className={`px-3 py-1 rounded transition-colors ${mode === 'manual' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : ''}`}
                    >
                        Manual
                    </button>
                    <button
                        onClick={() => { setIsRunning(false); setMode('pomodoro') }}
                        className={`px-3 py-1 rounded transition-colors ${mode === 'pomodoro' ? 'bg-white dark:bg-gray-600 shadow text-red-500' : ''}`}
                    >
                        Pomodoro
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-3xl font-mono font-bold text-gray-800 dark:text-gray-100">
                    {mode === 'manual' ? formatTime(elapsed) : formatTime(timeLeft)}
                </div>

                {mode === 'manual' ? (
                    isRunning ? (
                        <Button variant="danger" size="sm" onClick={handleStopManual} leftIcon={<HiStop />}>
                            Stop
                        </Button>
                    ) : (
                        <Button variant="primary" size="sm" onClick={handleStartManual} leftIcon={<HiPlay />}>
                            Start
                        </Button>
                    )
                ) : (
                    <Button
                        variant={isRunning ? "secondary" : "primary"}
                        className={isRunning ? "" : "bg-red-500 hover:bg-red-600 text-white"}
                        size="sm"
                        onClick={togglePomodoro}
                        leftIcon={isRunning ? <HiPause /> : <HiPlay />}
                    >
                        {isRunning ? 'Pause' : 'Start'}
                    </Button>
                )}
            </div>

            <div className="mt-3 text-xs text-gray-500 flex gap-4">
                <span>Đã làm: {(task.actualTime || 0).toFixed(1)}h</span>
                <span>Pomodoros: {task.pomodoroSessions?.count || 0}</span>
            </div>
        </div>
    )
}

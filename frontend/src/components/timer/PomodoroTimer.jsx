/**
 * Pomodoro Timer Component
 * 25min work / 5min break timer with task integration
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { HiPlay, HiPause, HiRefresh, HiCog, HiVolumeUp, HiVolumeOff } from 'react-icons/hi'
import toast from 'react-hot-toast'

// Timer modes
const MODES = {
    WORK: { name: 'Làm việc', duration: 25 * 60, color: 'from-red-500 to-orange-500' },
    SHORT_BREAK: { name: 'Nghỉ ngắn', duration: 5 * 60, color: 'from-green-500 to-teal-500' },
    LONG_BREAK: { name: 'Nghỉ dài', duration: 15 * 60, color: 'from-blue-500 to-purple-500' }
}

// Format seconds to MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function PomodoroTimer({
    task = null,
    onSessionComplete = () => { },
    minimal = false
}) {
    const [mode, setMode] = useState('WORK')
    const [timeLeft, setTimeLeft] = useState(MODES.WORK.duration)
    const [isRunning, setIsRunning] = useState(false)
    const [sessionsCompleted, setSessionsCompleted] = useState(0)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showSettings, setShowSettings] = useState(false)
    const [customDurations, setCustomDurations] = useState({
        WORK: 25,
        SHORT_BREAK: 5,
        LONG_BREAK: 15
    })

    const intervalRef = useRef(null)
    const audioRef = useRef(null)

    // Play notification sound
    const playSound = useCallback(() => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => { })
        }
    }, [soundEnabled])

    // Handle timer completion
    const handleComplete = useCallback(() => {
        playSound()

        if (mode === 'WORK') {
            const newSessions = sessionsCompleted + 1
            setSessionsCompleted(newSessions)
            onSessionComplete({ duration: customDurations.WORK * 60, task })

            // After 4 work sessions, take a long break
            if (newSessions % 4 === 0) {
                setMode('LONG_BREAK')
                setTimeLeft(customDurations.LONG_BREAK * 60)
                toast.success('🎉 Tuyệt vời! Nghỉ dài thôi!')
            } else {
                setMode('SHORT_BREAK')
                setTimeLeft(customDurations.SHORT_BREAK * 60)
                toast.success('✅ Hoàn thành! Nghỉ ngắn nhé!')
            }
        } else {
            setMode('WORK')
            setTimeLeft(customDurations.WORK * 60)
            toast('💪 Quay lại làm việc!', { icon: '⏰' })
        }

        setIsRunning(false)
    }, [mode, sessionsCompleted, customDurations, playSound, onSessionComplete, task])

    // Timer tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            handleComplete()
        }

        return () => clearInterval(intervalRef.current)
    }, [isRunning, timeLeft, handleComplete])

    // Toggle timer
    const toggleTimer = () => {
        setIsRunning(!isRunning)
        if (!isRunning) {
            toast(`▶️ Bắt đầu ${MODES[mode].name}`, { duration: 1500 })
        }
    }

    // Reset timer
    const resetTimer = () => {
        setIsRunning(false)
        setTimeLeft(customDurations[mode] * 60)
    }

    // Switch mode
    const switchMode = (newMode) => {
        setIsRunning(false)
        setMode(newMode)
        setTimeLeft(customDurations[newMode] * 60)
    }

    // Calculate progress percentage
    const progress = ((customDurations[mode] * 60 - timeLeft) / (customDurations[mode] * 60)) * 100

    // Update document title
    useEffect(() => {
        if (isRunning) {
            document.title = `${formatTime(timeLeft)} - ${MODES[mode].name}`
        } else {
            document.title = 'Task Manager'
        }
        return () => { document.title = 'Task Manager' }
    }, [timeLeft, isRunning, mode])

    // Minimal version for sidebar
    if (minimal) {
        return (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className={`text-lg font-mono font-bold bg-gradient-to-r ${MODES[mode].color} bg-clip-text text-transparent`}>
                    {formatTime(timeLeft)}
                </div>
                <button
                    onClick={toggleTimer}
                    className="p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600"
                >
                    {isRunning ? <HiPause className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
                </button>
            </div>
        )
    }

    return (
        <div className="card p-6">
            {/* Hidden audio element */}
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🍅 Pomodoro Timer
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                    >
                        {soundEnabled ? <HiVolumeUp className="w-5 h-5" /> : <HiVolumeOff className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                        <HiCog className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-2 mb-6">
                {Object.entries(MODES).map(([key, value]) => (
                    <button
                        key={key}
                        onClick={() => switchMode(key)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === key
                                ? `bg-gradient-to-r ${value.color} text-white`
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {value.name}
                    </button>
                ))}
            </div>

            {/* Timer display */}
            <div className="relative mb-6">
                {/* Progress ring */}
                <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={553}
                            strokeDashoffset={553 - (553 * progress) / 100}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={mode === 'WORK' ? '#ef4444' : mode === 'SHORT_BREAK' ? '#22c55e' : '#3b82f6'} />
                                <stop offset="100%" stopColor={mode === 'WORK' ? '#f97316' : mode === 'SHORT_BREAK' ? '#14b8a6' : '#8b5cf6'} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold font-mono bg-gradient-to-r ${MODES[mode].color} bg-clip-text text-transparent`}>
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {MODES[mode].name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Current task */}
            {task && (
                <div className="mb-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Đang làm:</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Reset"
                >
                    <HiRefresh className="w-6 h-6" />
                </button>
                <button
                    onClick={toggleTimer}
                    className={`p-5 rounded-full bg-gradient-to-r ${MODES[mode].color} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
                >
                    {isRunning ? <HiPause className="w-8 h-8" /> : <HiPlay className="w-8 h-8" />}
                </button>
            </div>

            {/* Sessions counter */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phiên làm việc hôm nay: <span className="font-bold text-primary-600">{sessionsCompleted}</span>
                </p>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">⚙️ Cài đặt thời gian (phút)</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(MODES).map(([key, value]) => (
                            <div key={key}>
                                <label className="text-xs text-gray-500 dark:text-gray-400">{value.name}</label>
                                <input
                                    type="number"
                                    value={customDurations[key]}
                                    onChange={(e) => {
                                        const newVal = Math.max(1, parseInt(e.target.value) || 1)
                                        setCustomDurations(prev => ({ ...prev, [key]: newVal }))
                                        if (mode === key && !isRunning) {
                                            setTimeLeft(newVal * 60)
                                        }
                                    }}
                                    className="input mt-1 text-center"
                                    min="1"
                                    max="60"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

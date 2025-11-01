'use client'

import { useState, useEffect } from 'react'

interface TimerProps {
  startTime: Date | null
  isActive: boolean
}

export default function Timer({ startTime, isActive }: TimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsed(0)
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      const start = new Date(startTime)
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000)
      setElapsed(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isActive])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="text-center">
      <div className="text-6xl font-bold text-gray-800 mb-2">
        {formatTime(elapsed)}
      </div>
      {isActive && (
        <div className="text-sm text-green-600 font-medium">
          開発中...
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Timer from '@/components/Timer'
import SessionModal from '@/components/SessionModal'
import Ranking from '@/components/Ranking'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeSession, setActiveSession] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchActiveSession()
      fetchRanking()
    }
  }, [status])

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      setActiveSession(data.session)
    } catch (error) {
      console.error('Failed to fetch active session:', error)
    }
  }

  const fetchRanking = async () => {
    try {
      const response = await fetch('/api/ranking')
      const data = await response.json()
      setRanking(data)
    } catch (error) {
      console.error('Failed to fetch ranking:', error)
    }
  }

  const handleStartSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setActiveSession(data)
      } else {
        const error = await response.json()
        alert(error.error || '開発開始に失敗しました')
      }
    } catch (error) {
      alert('開発開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = () => {
    setIsModalOpen(true)
  }

  const handleSubmitDescription = async (description: string) => {
    if (!activeSession) return

    setLoading(true)
    try {
      const response = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      })

      if (response.ok) {
        setActiveSession(null)
        setIsModalOpen(false)
        fetchRanking()
      } else {
        const error = await response.json()
        alert(error.error || '開発終了に失敗しました')
      }
    } catch (error) {
      alert('開発終了に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dev Timer</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/schools')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              スクール管理
            </button>
            <span className="text-sm text-gray-600">
              {session.user?.name}さん
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {formatCurrentTime(currentTime)}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>

          {activeSession && (
            <div className="mb-8">
              <Timer startTime={activeSession.startTime} isActive={true} />
            </div>
          )}

          <div className="flex justify-center">
            {!activeSession ? (
              <button
                onClick={handleStartSession}
                disabled={loading}
                className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition shadow-lg"
              >
                {loading ? '開始中...' : '開発開始'}
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                disabled={loading}
                className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition shadow-lg"
              >
                開発終了
              </button>
            )}
          </div>
        </div>

        <Ranking
          users={ranking}
          currentUserId={(session.user as any)?.id || ''}
        />
      </main>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitDescription}
        loading={loading}
      />
    </div>
  )
}

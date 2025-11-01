'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

interface UserSession {
  id: string
  startTime: string
  endTime: string | null
  duration: number | null
  description: string | null
  isActive: boolean
}

interface UserDetail {
  id: string
  userId: string
  name: string
  course: string
  avatar: string | null
  school: {
    name: string
  }
  sessions: UserSession[]
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserDetail()
  }, [userId])

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}時間${minutes}分`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">ユーザーが見つかりません</div>
      </div>
    )
  }

  const completedSessions = user.sessions
    .filter(s => !s.isActive && s.duration)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          ← 戻る
        </button>

        {/* ユーザー情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-white text-3xl font-bold">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.userId}</p>
              <p className="text-sm text-gray-500">{user.course} | {user.school.name}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">総開発時間</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(totalDuration)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {completedSessions.length}セッション
            </div>
          </div>
        </div>

        {/* 開発履歴 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">開発履歴</h2>
          </div>

          {completedSessions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              まだ開発履歴がありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {completedSessions.map((session) => (
                <div key={session.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {session.description || '（説明なし）'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDateTime(session.startTime)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-lg text-blue-600">
                        {formatDuration(session.duration || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import SessionDetailModal from '@/components/SessionDetailModal'
import ManualSessionModal from '@/components/ManualSessionModal'

interface UserSession {
  id: string
  startTime: string
  endTime: string | null
  duration: number | null
  description: string | null
  isActive: boolean
  goal: string | null
  achievement: number | null
  whatIDid: string | null
  whatILearned: string | null
  whatIWantToDo: string | null
}

interface Badge {
  id: string
  name: string
  icon: string
  rarity: string
}

interface UserBadge {
  id: string
  badge: Badge
  obtainedAt: string
}

interface UserDetail {
  id: string
  userId: string
  name: string
  courses: string[]
  avatar: string | null
  schoolLinks: Array<{
    school: {
      id: string
      name: string
    }
  }>
  sessions: UserSession[]
  userBadges: UserBadge[]
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { data: session } = useSession()
  const { toast } = useToast()

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)

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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-200 text-gray-800'
      case 'rare':
        return 'bg-blue-200 text-blue-800'
      case 'epic':
        return 'bg-purple-200 text-purple-800'
      case 'legendary':
        return 'bg-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'コモン'
      case 'rare':
        return 'レア'
      case 'epic':
        return 'エピック'
      case 'legendary':
        return '伝説'
      default:
        return rarity
    }
  }

  const handleSessionClick = (session: UserSession) => {
    setSelectedSession(session)
    setIsDetailModalOpen(true)
  }

  const handleManualSubmit = async (data: {
    startTime: string
    endTime: string
    goal: string
    achievement: number
    whatIDid: string
    whatILearned: string
    whatIWantToDo: string
  }) => {
    setManualLoading(true)
    try {
      const response = await fetch('/api/sessions/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...data
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'セッション追加に失敗しました')
      }

      toast({
        title: "追加完了",
        description: `開発記録を追加しました${responseData.ticketsEarned > 0 ? `（ガチャ券 +${responseData.ticketsEarned}枚）` : ''}`,
      })

      setIsManualModalOpen(false)
      fetchUserDetail()
    } catch (error: any) {
      toast({
        title: "追加失敗",
        description: error.message || '開発記録の追加に失敗しました',
        variant: "destructive",
      })
    } finally {
      setManualLoading(false)
    }
  }

  const canAddManualSession = () => {
    if (!session?.user) return false
    const currentUserRole = (session.user as any).role
    const currentUserId = (session.user as any).id
    return currentUserRole === 'admin' || currentUserId === userId
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

  const activeSession = user.sessions.find(s => s.isActive)
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
              <p className="text-sm text-gray-500">
                {user.courses.join(', ')} | {user.schoolLinks.map(link => link.school.name).join(', ')}
              </p>
            </div>
          </div>

          {/* 現在開発中の目標 */}
          {activeSession && activeSession.goal && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-sm font-semibold text-green-700">現在開発中</div>
              </div>
              <div className="text-sm text-gray-600 mb-1">今日の目標</div>
              <div className="text-lg font-medium text-gray-900">
                {activeSession.goal}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                開始: {formatDateTime(activeSession.startTime)}
              </div>
            </div>
          )}

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

        {/* 獲得バッヂ */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">獲得バッヂ</h2>
          </div>

          {user.userBadges.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              まだバッヂを獲得していません
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.userBadges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <div className="text-5xl mb-3">{userBadge.badge.icon}</div>
                    <div className="text-sm font-semibold text-gray-900 text-center mb-2">
                      {userBadge.badge.name}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(userBadge.badge.rarity)}`}>
                      {getRarityName(userBadge.badge.rarity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 開発履歴 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold">開発履歴</h2>
            {canAddManualSession() && (
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                + 開発記録を追加
              </button>
            )}
          </div>

          {completedSessions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              まだ開発履歴がありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {session.whatIDid || session.description || '（説明なし）'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDateTime(session.startTime)}
                        {session.achievement !== null && session.achievement !== undefined && (
                          <span className="ml-3 text-green-600 font-medium">
                            達成度: {session.achievement}%
                          </span>
                        )}
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

      {/* モーダル */}
      <SessionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        session={selectedSession}
      />

      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleManualSubmit}
        loading={manualLoading}
      />
    </div>
  )
}

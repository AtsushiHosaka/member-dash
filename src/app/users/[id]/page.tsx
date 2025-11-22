'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import SessionDetailModal from '@/components/SessionDetailModal'
import ManualSessionModal from '@/components/ManualSessionModal'
import SessionEditModal from '@/components/SessionEditModal'
import SessionHistoryModal from '@/components/SessionHistoryModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// 利用可能なアイコン一覧（絵文字と画像パス）
const AVAILABLE_ICONS = [
  // 絵文字
  { type: 'emoji', data: '😀' },
  { type: 'emoji', data: '😎' },
  { type: 'emoji', data: '🤓' },
  { type: 'emoji', data: '😊' },
  { type: 'emoji', data: '🥳' },
  { type: 'emoji', data: '🤔' },
  { type: 'emoji', data: '😴' },
  { type: 'emoji', data: '🤖' },
  { type: 'emoji', data: '👻' },
  { type: 'emoji', data: '🦄' },
  { type: 'emoji', data: '❤️' },
  { type: 'emoji', data: '🚀' },
  { type: 'emoji', data: '⭐' },
  { type: 'emoji', data: '🏆' },
  { type: 'emoji', data: '🔥' },
  { type: 'emoji', data: '👍' },
  { type: 'emoji', data: '✨' },
  { type: 'emoji', data: '🌈' },
  { type: 'emoji', data: '🍕' },
  { type: 'emoji', data: '☕' },
  { type: 'emoji', data: '📚' },
  { type: 'emoji', data: '💻' },
  { type: 'emoji', data: '🎮' },
  { type: 'emoji', data: '🎵' },
  { type: 'emoji', data: '⚽' },
  { type: 'emoji', data: '🏀' },
  { type: 'emoji', data: '📷' },
  { type: 'emoji', data: '🎨' },
  { type: 'emoji', data: '🐱' },
  { type: 'emoji', data: '🐶' },
  // 画像アイコン（例: public/icons/ 以下に配置した画像）
  // { type: 'image', data: '/icons/example.png' },
  { type: 'image', data: '/icons/meimei.png' },
] as const

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
  _count?: {
    editHistory: number
  }
}

interface Badge {
  id: string
  name: string
  icon: string
}

interface UserBadge {
  id: string
  badge: Badge
  obtainedAt: string
}

interface MentorInfo {
  id: string
  userId: string
  name: string
}

interface MentorLink {
  id: string
  mentorId: string
  mentor: MentorInfo
}

interface UserDetail {
  id: string
  userId: string
  name: string
  courses: string[]
  avatar: string | null
  role: string
  mentorLinks: MentorLink[]
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [mentorLoading, setMentorLoading] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)

  useEffect(() => {
    fetchUserDetail()
  }, [userId])

  // アバターモーダルが開かれたときに現在のアバターを設定
  useEffect(() => {
    if (isAvatarModalOpen) {
      setSelectedAvatar(user?.avatar || null)
    }
  }, [isAvatarModalOpen, user?.avatar])

  // 現在開発中の場合、1秒ごとに時間を更新
  useEffect(() => {
    const activeSession = user?.sessions.find(s => s.isActive)
    if (activeSession) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else if (response.status === 401 || response.status === 403) {
        // 認証エラーの場合はログインページに遷移
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error)
      // エラーの場合もログインページに遷移
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleMentorToggle = async (mentorId: string) => {
    setMentorLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'メンター設定に失敗しました')
      }

      const result = await response.json()

      toast({
        title: "設定完了",
        description: result.action === 'added' ? "メンバーを追加しました" : "メンバーを削除しました",
      })

      fetchUserDetail()
    } catch (error: any) {
      toast({
        title: "設定失敗",
        description: error.message || 'メンター設定に失敗しました',
        variant: "destructive",
      })
    } finally {
      setMentorLoading(false)
    }
  }

  const isMentorAssigned = (mentorId: string) => {
    return user?.mentorLinks?.some(link => link.mentorId === mentorId) || false
  }


  const handleAvatarSave = async () => {
    setAvatarSaving(true)
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user?.name,
          avatar: selectedAvatar,
          courses: user?.courses,
          schoolIds: user?.schoolLinks.map(link => link.school.id)
        })
      })

      if (response.ok) {
        toast({
          title: "アイコン変更完了",
          description: "アイコンを変更しました",
        })
        setIsAvatarModalOpen(false)
        fetchUserDetail()
      } else {
        const error = await response.json()
        toast({
          title: "アイコン変更失敗",
          description: error.error || 'アイコン変更に失敗しました',
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "アイコン変更失敗",
        description: error.message || 'アイコン変更に失敗しました',
        variant: "destructive",
      })
    } finally {
      setAvatarSaving(false)
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

  const canEditSession = () => {
    if (!session?.user) return false
    const currentUserRole = (session.user as any).role
    const currentUserId = (session.user as any).id
    return currentUserRole === 'admin' || currentUserId === userId
  }

  const canManageMentor = () => {
    if (!session?.user) return false
    const currentUserRole = (session.user as any).role
    const currentUserId = (session.user as any).id

    // 自分自身のページでは表示しない
    if (currentUserId === userId) return false

    // adminは他の全員のメンターを設定可能
    if (currentUserRole === 'admin') return true

    // mentorは他のユーザー（メンバー）のページでのみ設定可能
    if (currentUserRole === 'mentor') return true

    return false
  }

  const handleEditSession = () => {
    setIsDetailModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleViewHistory = () => {
    setIsDetailModalOpen(false)
    setIsHistoryModalOpen(true)
  }

  const handleEditSubmit = async (data: {
    startTime: string
    endTime: string
    goal: string
    achievement: number
    whatIDid: string
    whatILearned: string
    whatIWantToDo: string
  }) => {
    if (!selectedSession) return

    setEditLoading(true)
    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'セッション編集に失敗しました')
      }

      toast({
        title: "編集完了",
        description: "開発記録を更新しました",
      })

      setIsEditModalOpen(false)
      fetchUserDetail()
    } catch (error: any) {
      toast({
        title: "編集失敗",
        description: error.message || '開発記録の編集に失敗しました',
        variant: "destructive",
      })
    } finally {
      setEditLoading(false)
    }
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

  // 完了済みセッションの合計時間
  const completedDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)

  // 現在開発中のセッションの時間を計算（currentTimeを使用してリアルタイム更新）
  const activeDuration = activeSession
    ? Math.floor((currentTime - new Date(activeSession.startTime).getTime()) / 1000)
    : 0

  // 合計時間（完了 + 現在開発中）
  const totalDuration = completedDuration + activeDuration

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
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {user.avatar ? (
                  user.avatar.startsWith('/') ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{user.avatar}</span>
                  )
                ) : (
                  <span className="text-white">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {(session?.user as any)?.id === userId && (
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  アイコンを編集
                </button>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.userId}</p>
              <p className="text-sm text-gray-500">
                {user.courses.join(', ')} | {user.schoolLinks.map(link => link.school.name).join(', ')}
              </p>
            </div>
          </div>

          {/* 獲得バッジ (自分のページの場合のみ表示) */}
          {(session?.user as any)?.id === userId && user.userBadges && user.userBadges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">獲得バッジ</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {user.userBadges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="p-3 rounded-lg border-2 bg-gray-100 border-gray-300"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">{userBadge.badge.icon}</div>
                      <div className="text-xs font-semibold">{userBadge.badge.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* メンター設定 (mentor/admin のみ表示) */}
          {canManageMentor() && session?.user && (session.user as any).role === 'mentor' && (
            <div className="mt-6">
              <label className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition">
                <input
                  type="checkbox"
                  checked={isMentorAssigned((session.user as any).id)}
                  onChange={() => handleMentorToggle((session.user as any).id)}
                  disabled={mentorLoading}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">私のメンバーである</div>
                  <div className="text-sm text-gray-600 mt-0.5">このユーザーを自分の担当メンバーにする</div>
                </div>
              </label>
            </div>
          )}

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
                    <div className="text-sm font-semibold text-gray-900 text-center">
                      {userBadge.badge.name}
                    </div>
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
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">
                          {session.whatIDid || session.description || '（説明なし）'}
                        </div>
                        {session._count && session._count.editHistory > 0 && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            (編集済み)
                          </span>
                        )}
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
        onEdit={canEditSession() ? handleEditSession : undefined}
        onViewHistory={selectedSession?._count && selectedSession._count.editHistory > 0 ? handleViewHistory : undefined}
        session={selectedSession}
        hasEditHistory={selectedSession?._count ? selectedSession._count.editHistory > 0 : false}
        canEdit={canEditSession()}
      />

      <SessionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        session={selectedSession}
        loading={editLoading}
      />

      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        sessionId={selectedSession?.id || null}
      />

      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleManualSubmit}
        loading={manualLoading}
      />

      {/* アイコン変更モーダル */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>アイコンを変更</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedAvatar && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedAvatar.startsWith('/') ? (
                    <img src={selectedAvatar} alt="Selected" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{selectedAvatar}</span>
                  )}
                </div>
                <span className="text-sm text-gray-600">選択中のアイコン</span>
              </div>
            )}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {AVAILABLE_ICONS.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(icon.data)}
                  className={`p-3 rounded-lg transition hover:bg-gray-100 ${
                    selectedAvatar === icon.data
                      ? 'bg-blue-100 ring-2 ring-blue-500'
                      : 'bg-gray-50'
                  }`}
                >
                  {icon.type === 'emoji' ? (
                    <span className="text-4xl">{icon.data}</span>
                  ) : (
                    <img src={icon.data} alt="Icon" className="w-12 h-12 object-cover rounded" />
                  )}
                </button>
              ))}
            </div>
            {selectedAvatar && (
              <button
                type="button"
                onClick={() => setSelectedAvatar(null)}
                className="text-sm text-red-600 hover:text-red-800 mb-4"
              >
                クリア
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleAvatarSave}
                disabled={avatarSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {avatarSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
              >
                キャンセル
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Pencil, Check, X, History, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import Timer from '@/components/Timer'
import SessionModal from '@/components/SessionModal'
import StartSessionModal from '@/components/StartSessionModal'
import Ranking from '@/components/Ranking'
import ActiveMembers from '@/components/ActiveMembers'
import MentorMembers from '@/components/MentorMembers'
import ChristmasLoginBonusModal from '@/components/ChristmasLoginBonusModal'
import Snowfall from '@/components/Snowfall'
// import NamingPoll from '@/components/NamingPoll'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeSession, setActiveSession] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStartModalOpen, setIsStartModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ranking, setRanking] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [mentorMembers, setMentorMembers] = useState([])
  const [gachaTickets, setGachaTickets] = useState(0)
  const [rankingLoading, setRankingLoading] = useState(true)
  const [goal, setGoal] = useState('')
  const [userRole, setUserRole] = useState<string>('')

  // 初期ローディング状態の管理
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState({
    session: true,
    ranking: true,
    activeMembers: true,
    userTickets: true,
    mentorMembers: true
  })
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editedGoal, setEditedGoal] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [seasonGoal, setSeasonGoal] = useState<string | null>(null)
  const [seasonGoalInput, setSeasonGoalInput] = useState('')
  const [isSubmittingSeasonGoal, setIsSubmittingSeasonGoal] = useState(false)
  const [showChristmasBonus, setShowChristmasBonus] = useState(false)
  const [christmasBonusChecked, setChristmasBonusChecked] = useState(false)

  // 全てのローディングが完了したかチェック
  useEffect(() => {
    const role = (session?.user as any)?.role || ''
    const isMentorOrAdmin = role === 'mentor' || role === 'admin'

    // メンター/管理者でない場合はmentorMembersのロードは不要
    const requiredLoads = isMentorOrAdmin
      ? Object.values(loadingStates)
      : [loadingStates.session, loadingStates.ranking, loadingStates.activeMembers, loadingStates.userTickets]

    const allLoaded = requiredLoads.every(state => !state)
    if (allLoaded && status === 'authenticated') {
      setInitialLoading(false)
    }
  }, [loadingStates, status, session])

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
      const role = (session?.user as any)?.role || ''
      setUserRole(role)
      fetchActiveSession()
      fetchRanking(null, true) // 初期ロード
      fetchActiveMembers()
      fetchUserTickets()

      // メンターまたは管理者の場合、担当メンバーを取得
      if (role === 'mentor' || role === 'admin') {
        fetchMentorMembers()
      } else {
        // メンター/管理者でない場合はmentorMembersのロードをスキップ
        setLoadingStates(prev => ({ ...prev, mentorMembers: false }))
      }

      // クリスマスログインボーナスをチェック
      checkChristmasBonus()
    }
  }, [status, session])

  const checkChristmasBonus = async () => {
    if (christmasBonusChecked) return
    setChristmasBonusChecked(true)

    try {
      const response = await fetch('/api/christmas-bonus')
      if (response.ok) {
        const data = await response.json()
        // イベント期間中で、まだ今日のボーナスを受け取っていない場合
        if (data.isEventPeriod && !data.alreadyClaimed) {
          setShowChristmasBonus(true)
        }
      }
    } catch (error) {
      console.error('Failed to check Christmas bonus:', error)
    }
  }

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setActiveSession(data.session)
    } catch (error) {
      console.error('Failed to fetch active session:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, session: false }))
    }
  }

  const fetchRanking = async (schoolId?: string | null, isInitial = false) => {
    setRankingLoading(true)
    try {
      const url = schoolId
        ? `/api/ranking?schoolId=${schoolId}`
        : '/api/ranking'
      const response = await fetch(url)
      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }
      const data = await response.json()
      // APIがエラーを返した場合や配列でない場合は空配列をセット
      if (Array.isArray(data)) {
        setRanking(data)
      } else {
        console.error('Ranking API returned non-array:', data)
        setRanking([])
      }
    } catch (error) {
      console.error('Failed to fetch ranking:', error)
      setRanking([])
    } finally {
      setRankingLoading(false)
      if (isInitial) {
        setLoadingStates(prev => ({ ...prev, ranking: false }))
      }
    }
  }

  const handleSchoolChange = (schoolId: string | null) => {
    fetchRanking(schoolId)
  }

  const fetchActiveMembers = async () => {
    try {
      const response = await fetch('/api/active-members')
      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setActiveMembers(data)
    } catch (error) {
      console.error('Failed to fetch active members:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, activeMembers: false }))
    }
  }

  const fetchUserTickets = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setGachaTickets(data.gachaTickets || 0)

        // 今期の目標を設定（有効期限チェック）
        if (data.seasonGoal && data.seasonGoalExpiresAt) {
          const expiresAt = new Date(data.seasonGoalExpiresAt)
          if (expiresAt > new Date()) {
            setSeasonGoal(data.seasonGoal)
          } else {
            setSeasonGoal(null)
          }
        } else {
          setSeasonGoal(null)
        }
      } else if (response.status === 401 || response.status === 403) {
        // 認証エラーの場合はログインページに遷移
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user tickets:', error)
      router.push('/login')
    } finally {
      setLoadingStates(prev => ({ ...prev, userTickets: false }))
    }
  }

  const fetchMentorMembers = async () => {
    try {
      const response = await fetch('/api/mentor/members')
      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }
      if (response.ok) {
        const data = await response.json()
        setMentorMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch mentor members:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, mentorMembers: false }))
    }
  }

  const handleStartSession = () => {
    setIsStartModalOpen(true)
  }

  const handleSubmitGoal = async (goalText: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal: goalText })
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setActiveSession(data)
        setIsStartModalOpen(false)
        setGoal('')
        fetchActiveMembers()
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

  const handleSubmitSession = async (data: {
    achievement: number
    whatIDid: string
    whatILearned: string
    whatIWantToDo: string
  }) => {
    if (!activeSession) return

    setLoading(true)
    try {
      const response = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const responseData = await response.json()
        setActiveSession(null)
        setIsModalOpen(false)
        fetchRanking()
        fetchActiveMembers()
        fetchUserTickets()

        // メンターの場合、担当メンバーも更新
        if (userRole === 'mentor' || userRole === 'admin') {
          fetchMentorMembers()
        }

        // ガチャ券を獲得した場合は通知
        if (responseData.ticketsEarned > 0) {
          alert(`おめでとうございます！ガチャ券を${responseData.ticketsEarned}枚獲得しました！`)
        }
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

  const handleEditGoal = () => {
    if (activeSession?.goal) {
      setEditedGoal(activeSession.goal)
      setIsEditingGoal(true)
    }
  }

  const handleSaveGoal = async () => {
    if (!activeSession || !editedGoal.trim()) {
      alert('目標を入力してください')
      return
    }

    try {
      const response = await fetch(`/api/sessions/${activeSession.id}/goal`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal: editedGoal })
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setActiveSession(data.session)
        setIsEditingGoal(false)
        setEditedGoal('')
        // 履歴を更新
        if (showHistory) {
          fetchEditHistory(activeSession.id)
        }
      } else {
        const error = await response.json()
        alert(error.error || '目標の更新に失敗しました')
      }
    } catch (error) {
      alert('目標の更新に失敗しました')
    }
  }

  const handleCancelEditGoal = () => {
    setIsEditingGoal(false)
    setEditedGoal('')
  }

  const fetchEditHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/history`)

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setEditHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to fetch edit history:', error)
    }
  }

  const toggleHistory = () => {
    if (!showHistory && activeSession && editHistory.length === 0) {
      fetchEditHistory(activeSession.id)
    }
    setShowHistory(!showHistory)
  }

  const handleSubmitSeasonGoal = async () => {
    if (!seasonGoalInput.trim()) {
      alert('今期の目標を入力してください')
      return
    }

    setIsSubmittingSeasonGoal(true)
    try {
      const response = await fetch('/api/user/season-goal', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seasonGoal: seasonGoalInput })
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setSeasonGoal(data.seasonGoal)
        setSeasonGoalInput('')
      } else {
        const error = await response.json()
        alert(error.error || '今期の目標の設定に失敗しました')
      }
    } catch (error) {
      alert('今期の目標の設定に失敗しました')
    } finally {
      setIsSubmittingSeasonGoal(false)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && initialLoading)) {
    return (
      <div className="min-h-screen bg-christmas-red-bg flex items-center justify-center relative overflow-hidden">
        <Snowfall isAccumulating={false} />
        <div className="text-center relative z-10">
          {/* ローディングアニメーション */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* 外側のリング */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            {/* アニメーションするリング */}
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
            {/* 中央のドット */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          {/* テキスト */}
          <div className="text-lg font-medium text-white mb-2">
            Loading...
          </div>
          <div className="text-sm text-white/70">
            データを読み込んでいます
          </div>
          {/* プログレスドット */}
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
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
    <div className="min-h-screen bg-christmas-red-bg relative overflow-hidden">
      <Snowfall isAccumulating={!!activeSession} />
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 relative z-10">
        <ActiveMembers members={activeMembers} />

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 md:p-10 mb-8">
          <div className="text-center mb-10">
            <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              {formatCurrentTime(currentTime)}
            </div>
            <div className="text-base text-gray-500">
              {currentTime.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>

          {activeSession && (
            <div className="mb-10">
              <Timer startTime={activeSession.startTime} isActive={true} />

              {/* 目標の表示と編集 */}
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-christmas-red mb-2">
                        今日の目標
                      </div>
                      {isEditingGoal ? (
                        <div className="space-y-3">
                          <textarea
                            value={editedGoal}
                            onChange={(e) => setEditedGoal(e.target.value)}
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-red resize-none"
                            rows={3}
                            placeholder="目標を入力してください"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveGoal}
                              className="flex items-center gap-1 px-3 py-1.5 bg-christmas-red text-white text-sm rounded-lg hover:bg-christmas-red-dark transition"
                            >
                              <Check className="w-4 h-4" />
                              保存
                            </button>
                            <button
                              onClick={handleCancelEditGoal}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
                            >
                              <X className="w-4 h-4" />
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-christmas-red-darker whitespace-pre-wrap">
                          {activeSession.goal}
                        </p>
                      )}
                    </div>
                    {!isEditingGoal && (
                      <button
                        onClick={handleEditGoal}
                        className="p-2 hover:bg-red-100 rounded-lg transition flex-shrink-0"
                        title="目標を編集"
                      >
                        <Pencil className="w-4 h-4 text-christmas-red" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 編集履歴 */}
                <div className="mt-3">
                  <button
                    onClick={toggleHistory}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition"
                  >
                    <History className="w-4 h-4" />
                    編集履歴
                    {showHistory ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showHistory && (
                    <div className="mt-3 space-y-2">
                      {editHistory.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          編集履歴はありません
                        </p>
                      ) : (
                        editHistory.map((history) => (
                          <div
                            key={history.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
                          >
                            <div className="text-xs text-gray-500 mb-2">
                              {new Date(history.editedAt).toLocaleString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="space-y-1">
                              {history.oldGoal && (
                                <div>
                                  <span className="text-gray-500">変更前:</span>{' '}
                                  <span className="text-gray-700 line-through">
                                    {history.oldGoal}
                                  </span>
                                </div>
                              )}
                              {history.newGoal && (
                                <div>
                                  <span className="text-gray-500">変更後:</span>{' '}
                                  <span className="text-green-700 font-medium">
                                    {history.newGoal}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 今期の目標 */}
          {!activeSession && (
            <div className="mb-8 max-w-2xl mx-auto">
              {seasonGoal ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    今期の目標（2026/3/31まで）
                  </div>
                  <p className="text-blue-900 whitespace-pre-wrap">
                    {seasonGoal}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    今期の目標を設定しましょう（2026/3/31まで有効）
                  </div>
                  <textarea
                    value={seasonGoalInput}
                    onChange={(e) => setSeasonGoalInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                    rows={3}
                    placeholder="今期の目標を入力してください"
                  />
                  <button
                    onClick={handleSubmitSeasonGoal}
                    disabled={isSubmittingSeasonGoal || !seasonGoalInput.trim()}
                    className="w-full px-4 py-2 bg-christmas-red text-white font-medium rounded-lg hover:bg-christmas-red-dark disabled:bg-gray-400 transition"
                  >
                    {isSubmittingSeasonGoal ? '設定中...' : '目標を設定'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center">
            {!activeSession ? (
              <motion.button
                onClick={handleStartSession}
                disabled={loading}
                className="group relative px-10 py-5 bg-gradient-to-r from-christmas-red to-christmas-red-light text-white text-xl font-bold rounded-xl hover:from-christmas-red-dark hover:to-christmas-red disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="relative z-10">{loading ? '開始中...' : '開発開始'}</span>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.2 }}
                ></motion.div>
              </motion.button>
            ) : (
              <motion.button
                onClick={handleEndSession}
                disabled={loading}
                className="group relative px-10 py-5 bg-gradient-to-r from-christmas-red-darker to-christmas-red-dark text-white text-xl font-bold rounded-xl hover:from-christmas-red-bg hover:to-christmas-red-darker disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="relative z-10">開発終了</span>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.2 }}
                ></motion.div>
              </motion.button>
            )}
          </div>
        </div>

        {/* 命名投票 */}
        {/* <NamingPoll /> */}

        {/* メンター向け担当メンバー一覧 */}
        {(userRole === 'mentor' || userRole === 'admin') && (
          <MentorMembers members={mentorMembers} />
        )}

        <Ranking
          users={ranking}
          currentUserId={(session.user as any)?.id || ''}
          userSchools={(session.user as any)?.schools || []}
          onSchoolChange={handleSchoolChange}
          loading={rankingLoading}
        />
      </main>

      <StartSessionModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSubmit={handleSubmitGoal}
        loading={loading}
        seasonGoal={seasonGoal}
      />

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSession}
        loading={loading}
        goal={activeSession?.goal}
      />

      <ChristmasLoginBonusModal
        isOpen={showChristmasBonus}
        onClose={() => {
          setShowChristmasBonus(false)
          fetchUserTickets() // チケット数を更新
        }}
      />
    </div>
  )
}

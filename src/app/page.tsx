'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Timer from '@/components/Timer'
import SessionModal from '@/components/SessionModal'
import StartSessionModal from '@/components/StartSessionModal'
import Ranking from '@/components/Ranking'
import ActiveMembers from '@/components/ActiveMembers'
import MentorMembers from '@/components/MentorMembers'

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
      fetchRanking()
      fetchActiveMembers()
      fetchUserTickets()

      // メンターまたは管理者の場合、担当メンバーを取得
      if (role === 'mentor' || role === 'admin') {
        fetchMentorMembers()
      }
    }
  }, [status, session])

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      setActiveSession(data.session)
    } catch (error) {
      console.error('Failed to fetch active session:', error)
    }
  }

  const fetchRanking = async (schoolId?: string | null) => {
    setRankingLoading(true)
    try {
      const url = schoolId
        ? `/api/ranking?schoolId=${schoolId}`
        : '/api/ranking'
      const response = await fetch(url)
      const data = await response.json()
      setRanking(data)
    } catch (error) {
      console.error('Failed to fetch ranking:', error)
    } finally {
      setRankingLoading(false)
    }
  }

  const handleSchoolChange = (schoolId: string | null) => {
    fetchRanking(schoolId)
  }

  const fetchActiveMembers = async () => {
    try {
      const response = await fetch('/api/active-members')
      const data = await response.json()
      setActiveMembers(data)
    } catch (error) {
      console.error('Failed to fetch active members:', error)
    }
  }

  const fetchUserTickets = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      setGachaTickets(data.gachaTickets || 0)
    } catch (error) {
      console.error('Failed to fetch user tickets:', error)
    }
  }

  const fetchMentorMembers = async () => {
    try {
      const response = await fetch('/api/mentor/members')
      if (response.ok) {
        const data = await response.json()
        setMentorMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch mentor members:', error)
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <ActiveMembers members={activeMembers} />

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-10 mb-8">
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
            </div>
          )}

          <div className="flex justify-center">
            {!activeSession ? (
              <motion.button
                onClick={handleStartSession}
                disabled={loading}
                className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-green-500 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl"
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
                className="group relative px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white text-xl font-bold rounded-xl hover:from-red-700 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl"
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
      />

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSession}
        loading={loading}
        goal={activeSession?.goal}
      />
    </div>
  )
}

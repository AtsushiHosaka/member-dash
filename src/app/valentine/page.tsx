'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import ValentineProgress from '@/components/ValentineProgress'
import ValentineDecorations from '@/components/ValentineDecorations'

interface BadgeInfo {
  id: string
  name: string
  icon: string
}

interface ProgressData {
  isEventPeriod: boolean
  isResultPeriod: boolean
  totalSeconds: number
  totalHours: number
  chocolateCount: number
  progressStage: string
  nextStageHours: number | null
  eventStartDate: string
  eventEndDate: string
  message?: string
  badges?: {
    chocolate1?: BadgeInfo
    chocolate10?: BadgeInfo
    chocolate20?: BadgeInfo
  }
}

export default function ValentinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProgress()
    }
  }, [status])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/valentine/progress')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setProgress(data)
    } catch (err) {
      setError('進捗の取得に失敗しました')
      console.error('Failed to fetch valentine progress:', err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#FFF5EB]">
        <ValentineDecorations />
        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 rounded-full border-[#D4A574]"></div>
            <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin border-t-[#8A0000]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🍫</span>
            </div>
          </div>
          <div className="text-lg font-medium mb-2 text-[#3B060A]">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // イベント期間外の場合
  if (progress && !progress.isEventPeriod && !progress.isResultPeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#FFF5EB]">
        <ValentineDecorations />
        <div className="text-center relative z-10 p-8 bg-white/90 rounded-xl shadow-lg max-w-md mx-4">
          <span className="text-6xl mb-4 block">🍫</span>
          <h1 className="text-2xl font-bold text-[#3B060A] mb-4">
            バレンタインイベント
          </h1>
          <p className="text-[#8A0000]/70 mb-6">
            イベント期間外です。<br />
            2026年1月31日〜2月14日に開催予定です。
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#8A0000] text-white rounded-lg hover:bg-[#6A0000] transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FFF5EB]">
      <ValentineDecorations />

      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-[#8A0000] shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg hover:bg-[#6A0000] transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍫</span>
            <h1 className="text-xl font-bold text-white">
              バレンタイン2026
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* イベント説明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 rounded-xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-bold text-[#3B060A] mb-4 text-center">
            {progress?.isResultPeriod ? 'イベント結果' : 'チョコを作ろう！'}
          </h2>
          {progress?.isEventPeriod && (
            <div className="text-center text-[#8A0000]/80">
              <p className="mb-2">
                開発時間に応じてチョコ作りが進みます！
              </p>
              <p className="text-sm">
                期間: 1月31日〜2月14日
              </p>
            </div>
          )}
          {progress?.isResultPeriod && (
            <div className="text-center text-[#8A0000]/80">
              <p className="mb-2">
                イベントは終了しました。
              </p>
              <p className="text-sm">
                バッジとガチャチケットが付与されます！
              </p>
            </div>
          )}
        </motion.div>

        {/* 現在のチョコ数 */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#8A0000]/70 mb-1">
                  現在のチョコストック
                </div>
                <div className="text-3xl font-bold text-[#3B060A]">
                  {progress.chocolateCount} 個
                </div>
              </div>
              <div className="text-4xl">🍫</div>
            </div>
          </motion.div>
        )}

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : progress ? (
          <ValentineProgress
            totalHours={progress.totalHours}
            chocolateCount={progress.chocolateCount}
            progressStage={progress.progressStage}
            isEventPeriod={progress.isEventPeriod}
            isResultPeriod={progress.isResultPeriod}
            badges={progress.badges}
          />
        ) : null}
      </main>
    </div>
  )
}

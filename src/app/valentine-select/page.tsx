'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Heart } from 'lucide-react'

type GiftType = 'chocolate' | 'cookie'

interface MentorDto {
  key: string
  name: string
  image: string
}

interface SelectionDto extends MentorDto {
  giftType: GiftType
  message?: string
}

interface ValentineDayResponse {
  isActiveWindow: boolean
  hasSelected: boolean
  selection: SelectionDto | MentorDto | null
  chocolateCount: number
  loveLetterImage: string
  mentors: MentorDto[]
  kamimu: MentorDto | null
}

export default function ValentineSelectPage() {
  const { status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ValentineDayResponse | null>(null)
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [showKamimuModal, setShowKamimuModal] = useState(false)
  const [rewardSelection, setRewardSelection] = useState<SelectionDto | null>(null)
  const [isLetterFlying, setIsLetterFlying] = useState(false)

  const fetchValentineDay = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/valentine/day')
      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('バレンタイン当日データの取得に失敗しました')
      }

      const json = (await response.json()) as ValentineDayResponse
      setData(json)
    } catch (fetchError) {
      console.error(fetchError)
      setError('データの取得に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchValentineDay()
    }
  }, [status, router, fetchValentineDay])

  const hasSelected = data?.hasSelected || false
  const selectedMentor = data?.selection || null

  const giftMessage = useMemo(() => {
    if (!selectedMentor || !('giftType' in selectedMentor)) return null
    return selectedMentor.giftType === 'cookie'
      ? 'かみむーからクッキーをもらう'
      : `${selectedMentor.name}からチョコをもらう`
  }, [selectedMentor])

  const selectMentor = async (mentorKey: string) => {
    if (submitting || !data) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/valentine/day/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorKey }),
      })

      const json = await response.json()

      if (response.status === 409) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                hasSelected: true,
                selection: json.selection || prev.selection,
              }
            : prev
        )
        setShowMentorModal(false)
        setShowKamimuModal(false)
        setRewardSelection(json.selection || null)
        return
      }

      if (!response.ok) {
        throw new Error(json.error || 'メンター選択に失敗しました')
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              hasSelected: true,
              selection: json.selection,
              mentors: [],
            }
          : prev
      )
      setShowMentorModal(false)
      setShowKamimuModal(false)
      setRewardSelection(json.selection)
    } catch (submitError: any) {
      console.error(submitError)
      setError(submitError?.message || 'メンター選択に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRewardOk = () => {
    setRewardSelection(null)
    setIsLetterFlying(true)
    window.setTimeout(() => {
      setIsLetterFlying(false)
    }, 1200)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB]">
        <div className="text-[#3B060A] font-semibold">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB] px-4">
        <div className="bg-white rounded-xl p-6 text-center max-w-md w-full shadow-md">
          <p className="text-[#8A0000] mb-4">{error || 'データを読み込めませんでした。'}</p>
          <button
            onClick={fetchValentineDay}
            className="px-4 py-2 bg-[#8A0000] text-white rounded-lg hover:bg-[#6A0000] transition"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  if (!data.isActiveWindow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB] px-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-lg w-full shadow-lg">
          <div className="text-5xl mb-4">💌</div>
          <h1 className="text-2xl font-bold text-[#3B060A] mb-3">バレンタイン当日機能</h1>
          <p className="text-[#8A0000]/80 mb-6">
            表示期間外です。<br />
            2/14 19:50〜23:59（JST）に公開されます。
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#8A0000] text-white rounded-lg hover:bg-[#6A0000] transition"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5EB] relative overflow-hidden">
      <header className="sticky top-0 z-30 bg-[#8A0000] shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg hover:bg-[#6A0000] transition"
            aria-label="戻る"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">バレンタインセレクト</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <section className="bg-white/90 rounded-xl p-6 shadow-lg mb-6">
          <div className="text-sm text-[#8A0000]/70 mb-2">バレンタイン期間のチョコ個数</div>
          <div className="text-4xl font-bold text-[#3B060A]">{data.chocolateCount} 個</div>
        </section>

        <section className="bg-white/90 rounded-xl p-6 shadow-lg mb-6 text-center">
          <p className="text-[#8A0000]/80 mb-4">ラブレターをクリックするとメンター候補が表示されます</p>
          <button
            onClick={() => !hasSelected && setShowMentorModal(true)}
            disabled={hasSelected}
            className="inline-flex items-center justify-center rounded-xl border-2 border-[#D4A574] p-2 hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Image
              src={data.loveLetterImage}
              alt="ラブレター"
              width={260}
              height={180}
              className="rounded-lg object-cover"
            />
          </button>
        </section>

        {hasSelected && selectedMentor && (
          <section className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#D4A574]">
            <div className="text-sm text-[#8A0000]/70 mb-2">選択済みメンター</div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Image
                src={selectedMentor.image}
                alt={selectedMentor.name}
                width={120}
                height={120}
                className="rounded-xl object-cover border border-[#D4A574]"
              />
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-[#3B060A]">{selectedMentor.name}</div>
                <div className="text-[#8A0000] mt-1">{giftMessage || `${selectedMentor.name}を選択しました`}</div>
              </div>
            </div>
          </section>
        )}

        {error && (
          <section className="mt-6 bg-red-100 border border-red-300 rounded-lg px-4 py-3 text-red-700">
            {error}
          </section>
        )}
      </main>

      {!hasSelected && data.kamimu && (
        <button
          onClick={() => setShowKamimuModal(true)}
          className="fixed right-4 bottom-4 z-40 text-sm font-semibold text-[#8A0000] underline underline-offset-4 hover:text-[#6A0000] bg-white/90 px-4 py-2 rounded-full shadow-md"
        >
          チョコが食べられない人はこちら
        </button>
      )}

      <AnimatePresence>
        {showMentorModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-3xl bg-white rounded-xl p-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#3B060A]">メンター候補（ランダム3人）</h2>
                <button
                  onClick={() => setShowMentorModal(false)}
                  className="text-sm text-[#8A0000] hover:underline"
                >
                  閉じる
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.mentors.map((mentor) => (
                  <div key={mentor.key} className="border border-[#D4A574] rounded-xl p-4 text-center">
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      width={140}
                      height={140}
                      className="mx-auto rounded-lg object-cover mb-3"
                    />
                    <div className="font-bold text-[#3B060A] mb-3">{mentor.name}</div>
                    <button
                      disabled={submitting}
                      onClick={() => selectMentor(mentor.key)}
                      className="w-full px-3 py-2 rounded-lg bg-[#8A0000] text-white hover:bg-[#6A0000] disabled:bg-gray-400 transition"
                    >
                      {submitting ? '選択中...' : 'このメンターを選ぶ'}
                    </button>
                  </div>
                ))}
              </div>
              {data.mentors.length === 0 && (
                <p className="text-center text-[#8A0000]/70 mt-3">
                  候補は表示済みです。選択内容は画面下部で確認できます。
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showKamimuModal && data.kamimu && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-xl p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 className="text-xl font-bold text-[#3B060A] mb-4">かみむーを選ぶ</h2>
              <Image
                src={data.kamimu.image}
                alt={data.kamimu.name}
                width={220}
                height={220}
                className="mx-auto rounded-xl object-cover mb-4"
              />
              <p className="text-[#8A0000]/80 text-center mb-4">
                チョコの代わりにクッキーを受け取れます
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowKamimuModal(false)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
                <button
                  disabled={submitting}
                  onClick={() => selectMentor('kamimu')}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#8A0000] text-white hover:bg-[#6A0000] disabled:bg-gray-400 transition"
                >
                  {submitting ? '選択中...' : '選択する'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rewardSelection && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-xl p-6 text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-center mb-3">
                <Heart className="w-8 h-8 text-[#8A0000]" />
              </div>
              <h2 className="text-xl font-bold text-[#3B060A] mb-3">
                {rewardSelection.giftType === 'cookie'
                  ? 'かみむーからクッキーをもらう'
                  : `${rewardSelection.name}からチョコをもらう`}
              </h2>
              <Image
                src={rewardSelection.image}
                alt={rewardSelection.name}
                width={160}
                height={160}
                className="mx-auto rounded-xl object-cover mb-4"
              />
              <button
                onClick={handleRewardOk}
                className="w-full px-4 py-2 bg-[#8A0000] text-white rounded-lg hover:bg-[#6A0000] transition"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLetterFlying && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[70] flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 0, x: 0, scale: 1, rotate: -8, opacity: 1 }}
              animate={{ y: -320, x: 180, scale: 0.5, rotate: 18, opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            >
              <Image
                src={data.loveLetterImage}
                alt="飛んでいくラブレター"
                width={140}
                height={100}
                className="rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

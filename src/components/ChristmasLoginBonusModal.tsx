'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Badge {
  id: string
  name: string
  icon: string
}

interface ChristmasLoginBonusModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChristmasLoginBonusModal({ isOpen, onClose }: ChristmasLoginBonusModalProps) {
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [ticketsEarned, setTicketsEarned] = useState(0)
  const [consecutiveDays, setConsecutiveDays] = useState(0)
  const [totalTickets, setTotalTickets] = useState(0)
  const [badgeAwarded, setBadgeAwarded] = useState<Badge | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && !claimed) {
      claimBonus()
    }
  }, [isOpen])

  const claimBonus = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/christmas-bonus', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setClaimed(true)
        setTicketsEarned(data.ticketsEarned)
        setConsecutiveDays(data.consecutiveDays)
        setTotalTickets(data.totalTickets)
        setBadgeAwarded(data.badgeAwarded)
      } else {
        setError(data.error || 'エラーが発生しました')
      }
    } catch (err) {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-red-50 to-green-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border-4 border-red-500 relative overflow-hidden">
        {/* 装飾 */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-red-500" />

        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎄</div>
          <h2 className="text-2xl font-bold text-red-700">
            クリスマスログインボーナス
          </h2>
          <p className="text-sm text-gray-600 mt-1">12/6〜12/25 限定イベント</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
            <p className="mt-4 text-gray-600">ボーナスを取得中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              閉じる
            </button>
          </div>
        ) : claimed ? (
          <div className="text-center">
            {/* 継続日数 */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">{consecutiveDays}</div>
                  <div className="text-xs">日目</div>
                </div>
              </div>
            </div>

            {/* チケット獲得 */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">🎟️</span>
                <span className="text-4xl font-bold text-yellow-600">×{ticketsEarned}</span>
              </div>
              <p className="text-lg font-medium text-gray-800">
                ガチャチケットをゲット！
              </p>
              <p className="text-sm text-gray-500 mt-1">
                所持チケット: {totalTickets}枚
              </p>
            </div>

            {/* 継続日数の説明 */}
            <div className="bg-white/70 rounded-lg p-3 mb-4 text-sm">
              <p className="text-gray-700">
                {consecutiveDays < 5 ? (
                  <>明日もログインすると<span className="font-bold text-red-600">{Math.min(consecutiveDays + 1, 5)}枚</span>もらえます！</>
                ) : (
                  <>最大ボーナス継続中！毎日5枚もらえます🎉</>
                )}
              </p>
            </div>

            {/* バッジ獲得 */}
            {badgeAwarded && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-4 border-2 border-yellow-400">
                <div className="text-lg font-bold text-yellow-700 mb-2">
                  🏆 7日継続バッジ獲得！
                </div>
                <div className="flex items-center justify-center gap-3">
                  {badgeAwarded.icon.startsWith('/') || badgeAwarded.icon.startsWith('http') ? (
                    <Image
                      src={badgeAwarded.icon}
                      alt={badgeAwarded.name}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                  ) : (
                    <span className="text-5xl">{badgeAwarded.icon}</span>
                  )}
                  <span className="font-medium text-gray-800">{badgeAwarded.name}</span>
                </div>
              </div>
            )}

            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-green-600 transition shadow-lg"
            >
              開発を始める！
            </button>
          </div>
        ) : null}

        {/* 装飾：雪の結晶 */}
        <div className="absolute -top-4 -right-4 text-6xl opacity-20 pointer-events-none">❄️</div>
        <div className="absolute -bottom-4 -left-4 text-6xl opacity-20 pointer-events-none">❄️</div>
      </div>
    </div>
  )
}

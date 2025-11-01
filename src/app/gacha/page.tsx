'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Badge {
  id: string
  name: string
  icon: string
  rarity: string
}

interface GachaResult {
  success: boolean
  badge: Badge
  remainingTickets: number
  error?: string
}

export default function GachaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Badge | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserTickets()
    }
  }, [status])

  const fetchUserTickets = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      setTickets(data.gachaTickets || 0)
    } catch (error) {
      console.error('Failed to fetch user tickets:', error)
    }
  }

  const handleDrawGacha = async () => {
    if (tickets < 1) {
      alert('ガチャ券が足りません')
      return
    }

    setLoading(true)
    setIsAnimating(true)
    setResult(null)

    try {
      // アニメーション効果のために少し待つ
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await fetch('/api/gacha/draw', {
        method: 'POST'
      })

      const data: GachaResult = await response.json()

      if (response.ok && data.success) {
        setResult(data.badge)
        setTickets(data.remainingTickets)

        // アニメーション完了後に結果を表示
        setTimeout(() => {
          setIsAnimating(false)
        }, 500)
      } else {
        alert(data.error || 'ガチャの実行に失敗しました')
        setIsAnimating(false)
      }
    } catch (error) {
      console.error('Gacha draw error:', error)
      alert('ガチャの実行に失敗しました')
      setIsAnimating(false)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">ガチャ</h1>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ホームに戻る
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎫</div>
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {tickets}枚
            </div>
            <div className="text-sm text-gray-600">
              所持ガチャ券
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-4">
              開発時間3時間ごとにガチャ券を1枚獲得できます
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleDrawGacha}
              disabled={loading || tickets < 1}
              className="px-12 py-6 bg-blue-600 text-white text-2xl font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg"
            >
              {loading ? 'ガチャ中...' : 'ガチャを引く'}
            </button>
          </div>
        </div>

        {isAnimating && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center">
              <div className="text-6xl animate-bounce mb-4">✨</div>
              <div className="text-xl text-gray-600">抽選中...</div>
            </div>
          </div>
        )}

        {!isAnimating && result && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8 animate-fade-in">
            <div className="text-center">
              <div className="text-8xl mb-4">{result.icon}</div>
              <div className="text-3xl font-bold text-gray-800 mb-4">
                {result.name}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${getRarityColor(result.rarity)}`}>
                {getRarityName(result.rarity)}
              </div>
              <div className="text-lg text-gray-600 mt-4">
                おめでとうございます！
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">レアリティ</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityColor('common')}`}>
                コモン
              </span>
              <span className="text-gray-600">60%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityColor('rare')}`}>
                レア
              </span>
              <span className="text-gray-600">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityColor('epic')}`}>
                エピック
              </span>
              <span className="text-gray-600">12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityColor('legendary')}`}>
                伝説
              </span>
              <span className="text-gray-600">3%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

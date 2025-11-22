'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  _count: {
    votes: number
  }
}

interface Poll {
  id: string
  isActive: boolean
  options: PollOption[]
}

export default function NamingPollSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [newOptionText, setNewOptionText] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'admin' && userRole !== 'mentor') {
        router.push('/')
        return
      }
      fetchPoll()
    }
  }, [status, session, router])

  const fetchPoll = async () => {
    try {
      const response = await fetch('/api/admin/naming-poll')
      if (response.ok) {
        const data = await response.json()
        setPoll(data)
      }
    } catch (error) {
      console.error('Failed to fetch poll:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async () => {
    if (!poll) return

    try {
      const response = await fetch('/api/admin/naming-poll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !poll.isActive })
      })

      if (response.ok) {
        await fetchPoll()
      }
    } catch (error) {
      console.error('Failed to toggle poll:', error)
    }
  }

  const addOption = async () => {
    if (!newOptionText.trim()) return

    try {
      const response = await fetch('/api/admin/naming-poll/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newOptionText })
      })

      if (response.ok) {
        setNewOptionText('')
        await fetchPoll()
      } else {
        const error = await response.json()
        alert(error.error || '選択肢の追加に失敗しました')
      }
    } catch (error) {
      console.error('Failed to add option:', error)
      alert('選択肢の追加に失敗しました')
    }
  }

  const deleteOption = async (optionId: string) => {
    if (!confirm('この選択肢を削除しますか？関連する投票も削除されます。')) return

    try {
      const response = await fetch(`/api/admin/naming-poll/options/${optionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPoll()
      } else {
        const error = await response.json()
        alert(error.error || '選択肢の削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete option:', error)
      alert('選択肢の削除に失敗しました')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  // 投票数でソート
  const sortedOptions = poll?.options
    ? [...poll.options].sort((a, b) => b._count.votes - a._count.votes)
    : []

  const totalVotes = sortedOptions.reduce((sum, option) => sum + option._count.votes, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">命名投票設定</h1>
        </div>

        {/* 投票の表示/非表示 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">投票の表示設定</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={poll?.isActive ?? false}
              onChange={toggleActive}
              className="w-5 h-5 rounded"
            />
            <div>
              <div className="font-medium text-gray-900">投票を表示する</div>
              <div className="text-sm text-gray-600">
                チェックを入れると、すべてのユーザーに投票が表示されます
              </div>
            </div>
          </label>
        </div>

        {/* 選択肢の追加 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">選択肢を追加</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
              placeholder="選択肢のテキストを入力"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addOption}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              追加
            </button>
          </div>
        </div>

        {/* 投票ランキング */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            投票結果ランキング（全{totalVotes}票）
          </h2>
          <div className="space-y-3">
            {sortedOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                選択肢がありません。上のフォームから追加してください。
              </div>
            ) : (
              sortedOptions.map((option, index) => (
                <div
                  key={option.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{option.text}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: totalVotes > 0 ? `${(option._count.votes / totalVotes) * 100}%` : '0%'
                          }}
                        ></div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700 w-16 text-right">
                        {option._count.votes}票
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOption(option.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  _count: {
    votes: number
  }
}

interface Poll {
  id: string
  options: PollOption[]
}

interface PollProps {
  // アンケートのタイトル（例: "命名投票", "次回イベントアンケート"）
  title: string

  // APIエンドポイント（例: "/api/naming-poll", "/api/event-poll"）
  apiEndpoint: string

  // 1人あたりの投票可能数（デフォルト: 2）
  maxVotes?: number

  // 投票完了時のコールバック
  onVoteComplete?: () => void

  // 選択肢をランダムに表示するか（デフォルト: true）
  shuffleOptions?: boolean

  // 各投票のラベル（例: ["1票目", "2票目"]）
  voteLabels?: string[]

  // 各投票のボタンテキスト（例: ["1票目を投票する", "2票目を投票する"]）
  voteButtonTexts?: string[]

  // 各投票のカラーテーマ（例: ["blue", "green"]）
  voteColors?: Array<'blue' | 'green' | 'purple' | 'orange'>
}

export default function Poll({
  title,
  apiEndpoint,
  maxVotes = 2,
  onVoteComplete,
  shuffleOptions = true,
  voteLabels,
  voteButtonTexts,
  voteColors = ['blue', 'green']
}: PollProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [voteCount, setVoteCount] = useState(0)
  const [votes, setVotes] = useState<Array<{ optionId: string; voteNumber: number }>>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<PollOption[]>([])

  // デフォルトのラベルとボタンテキストを生成
  const defaultVoteLabels = Array.from({ length: maxVotes }, (_, i) => `${i + 1}票目`)
  const defaultVoteButtonTexts = Array.from({ length: maxVotes }, (_, i) => `${i + 1}票目を投票する`)

  const labels = voteLabels || defaultVoteLabels
  const buttonTexts = voteButtonTexts || defaultVoteButtonTexts

  useEffect(() => {
    fetchPoll()
  }, [])

  // 配列をシャッフルする関数
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const fetchPoll = async () => {
    try {
      const response = await fetch(apiEndpoint)
      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setVoteCount(data.voteCount || 0)
        setVotes(data.votes || [])

        // 投票前かつシャッフルが有効な場合のみ、選択肢をシャッフル
        if (data.poll && data.voteCount < maxVotes && shuffleOptions) {
          setShuffledOptions(shuffleArray(data.poll.options))
        } else if (data.poll) {
          setShuffledOptions(data.poll.options)
        }
      }
    } catch (error) {
      console.error('Failed to fetch poll:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedOption || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption })
      })

      if (response.ok) {
        setSelectedOption(null)
        await fetchPoll()
        onVoteComplete?.()
      } else {
        const error = await response.json()
        alert(error.error || '投票に失敗しました')
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      alert('投票に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  // カラーマッピング
  const colorClasses = {
    blue: {
      border: 'border-blue-600',
      bg: 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-600'
    },
    green: {
      border: 'border-green-600',
      bg: 'bg-green-50',
      button: 'bg-green-600 hover:bg-green-700',
      badge: 'bg-green-600'
    },
    purple: {
      border: 'border-purple-600',
      bg: 'bg-purple-50',
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-600'
    },
    orange: {
      border: 'border-orange-600',
      bg: 'bg-orange-50',
      button: 'bg-orange-600 hover:bg-orange-700',
      badge: 'bg-orange-600'
    }
  }

  if (loading) {
    return null
  }

  if (!poll || poll.options.length === 0) {
    return null
  }

  // 投票中の処理（voteCount < maxVotes）
  if (voteCount < maxVotes) {
    const currentVoteIndex = voteCount
    const currentColor = voteColors[currentVoteIndex] || 'blue'
    const colors = colorClasses[currentColor]

    // これまでの投票履歴を表示
    const previousVotes = votes.slice(0, currentVoteIndex).map((vote, index) => {
      const option = poll.options.find(o => o.id === vote.optionId)
      return option ? `${labels[index]}: ${option.text}` : null
    }).filter(Boolean)

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {title} ({labels[currentVoteIndex]})
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          次の候補から1つ選んで投票してください（{maxVotes}票まで投票できます）
        </p>

        {/* これまでの投票履歴 */}
        {previousVotes.length > 0 && (
          <div className="mb-4">
            {previousVotes.map((voteText, idx) => (
              <p key={idx} className="text-xs text-gray-500">
                {voteText}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {shuffledOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedOption === option.id
                  ? `${colors.border} ${colors.bg}`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`poll-option-${currentVoteIndex}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="w-5 h-5"
              />
              <span className="font-medium text-gray-900">{option.text}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={!selectedOption || submitting}
          className={`w-full px-6 py-3 ${colors.button} text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition`}
        >
          {submitting ? '投票中...' : buttonTexts[currentVoteIndex]}
        </button>
      </div>
    )
  }

  // 投票結果表示（全投票完了後）
  const totalVotes = poll.options.reduce((sum, option) => sum + option._count.votes, 0)
  const sortedOptions = [...poll.options].sort((a, b) => b._count.votes - a._count.votes)

  // カラーパレット
  const resultColors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-red-600',
    'bg-yellow-600'
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900">投票結果</h2>
        <span className="text-sm text-gray-600">（全{totalVotes}票）</span>
      </div>

      {/* 横棒グラフ */}
      <div className="mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {sortedOptions.map((option, index) => {
            const percentage = totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0
            return (
              percentage > 0 && (
                <div
                  key={option.id}
                  className={`${resultColors[index % resultColors.length]} relative group`}
                  style={{ width: `${percentage}%` }}
                  title={`${option.text}: ${option._count.votes}票 (${percentage.toFixed(1)}%)`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {percentage >= 10 && `${percentage.toFixed(0)}%`}
                  </div>
                </div>
              )
            )
          })}
        </div>
      </div>

      {/* 詳細リスト */}
      <div className="space-y-2">
        {sortedOptions.map((option, index) => {
          const percentage = totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0
          const isVoted = votes.some(v => v.optionId === option.id)

          return (
            <div
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isVoted ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 rounded ${resultColors[index % resultColors.length]}`}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{option.text}</span>
                  {isVoted && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      あなたの投票
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {option._count.votes}票 ({percentage.toFixed(1)}%)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

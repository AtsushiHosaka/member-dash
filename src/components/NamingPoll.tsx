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

interface NamingPollProps {
  onVoteComplete?: () => void
}

export default function NamingPoll({ onVoteComplete }: NamingPollProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [voteCount, setVoteCount] = useState(0) // 0, 1, or 2
  const [votes, setVotes] = useState<Array<{ optionId: string; voteNumber: number }>>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<PollOption[]>([])

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
      const response = await fetch('/api/naming-poll')
      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setVoteCount(data.voteCount || 0)
        setVotes(data.votes || [])

        // 投票前（voteCount < 2）の場合のみ、選択肢をシャッフル
        if (data.poll && data.voteCount < 2) {
          setShuffledOptions(shuffleArray(data.poll.options))
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
      const response = await fetch('/api/naming-poll', {
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

  if (loading) {
    return null
  }

  if (!poll || poll.options.length === 0) {
    return null
  }

  // 1回目の投票
  if (voteCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">命名投票 (1票目)</h2>
        <p className="text-sm text-gray-600 mb-4">
          次の候補から1つ選んで投票してください（2票まで投票できます）
        </p>
        <div className="space-y-2 mb-4">
          {poll.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedOption === option.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="poll-option"
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
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {submitting ? '投票中...' : '1票目を投票する'}
        </button>
      </div>
    )
  }

  // 2回目の投票
  if (voteCount === 1) {
    const firstVote = votes[0]
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">命名投票 (2票目)</h2>
        <p className="text-sm text-gray-600 mb-2">
          もう1票投票してください
        </p>
        <p className="text-xs text-gray-500 mb-4">
          1票目: {poll.options.find(o => o.id === firstVote.optionId)?.text}
        </p>
        <div className="space-y-2 mb-4">
          {poll.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedOption === option.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="poll-option-2"
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
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {submitting ? '投票中...' : '2票目を投票する'}
        </button>
      </div>
    )
  }

  // 投票結果表示 (2票投票済み)
  const totalVotes = poll.options.reduce((sum, option) => sum + option._count.votes, 0)
  const sortedOptions = [...poll.options].sort((a, b) => b._count.votes - a._count.votes)

  // カラーパレット
  const colors = [
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
                  className={`${colors[index % colors.length]} relative group`}
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
              <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
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

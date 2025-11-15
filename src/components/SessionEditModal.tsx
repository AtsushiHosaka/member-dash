'use client'

import { useState, useEffect } from 'react'

interface SessionEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    startTime: string
    endTime: string
    goal: string
    achievement: number
    whatIDid: string
    whatILearned: string
    whatIWantToDo: string
  }) => void
  loading: boolean
  session: {
    startTime: string
    endTime: string | null
    goal: string | null
    achievement: number | null
    whatIDid: string | null
    whatILearned: string | null
    whatIWantToDo: string | null
  } | null
}

export default function SessionEditModal({ isOpen, onClose, onSubmit, loading, session }: SessionEditModalProps) {
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [goal, setGoal] = useState('')
  const [achievement, setAchievement] = useState('')
  const [whatIDid, setWhatIDid] = useState('')
  const [whatILearned, setWhatILearned] = useState('')
  const [whatIWantToDo, setWhatIWantToDo] = useState('')

  useEffect(() => {
    if (session && isOpen) {
      const start = new Date(session.startTime)
      const end = session.endTime ? new Date(session.endTime) : new Date()

      setStartDate(start.toISOString().split('T')[0])
      setStartTime(start.toTimeString().slice(0, 5))
      setEndDate(end.toISOString().split('T')[0])
      setEndTime(end.toTimeString().slice(0, 5))
      setGoal(session.goal || '')
      setAchievement(session.achievement?.toString() || '')
      setWhatIDid(session.whatIDid || '')
      setWhatILearned(session.whatILearned || '')
      setWhatIWantToDo(session.whatIWantToDo || '')
    }
  }, [session, isOpen])

  if (!isOpen || !session) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !startTime || !endDate || !endTime) {
      alert('開始・終了の日時を入力してください')
      return
    }

    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)

    if (endDateTime <= startDateTime) {
      alert('終了時間は開始時間より後にしてください')
      return
    }

    const achievementNum = parseInt(achievement)
    if (isNaN(achievementNum) || achievementNum < 0) {
      alert('達成度は0以上の数字を入力してください')
      return
    }

    if (!whatIDid.trim() || !whatILearned.trim() || !whatIWantToDo.trim()) {
      alert('すべての項目を入力してください')
      return
    }

    onSubmit({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      goal: goal.trim(),
      achievement: achievementNum,
      whatIDid: whatIDid.trim(),
      whatILearned: whatILearned.trim(),
      whatIWantToDo: whatIWantToDo.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">開発記録を編集</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 開始時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始時間 <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 終了時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              終了時間 <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 目標 */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              今日の目標
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 達成度 */}
          <div>
            <label htmlFor="achievement" className="block text-sm font-medium text-gray-700 mb-2">
              達成度 <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="achievement"
                type="number"
                min="0"
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                required
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-lg font-medium">%</span>
            </div>
          </div>

          {/* やったこと */}
          <div>
            <label htmlFor="whatIDid" className="block text-sm font-medium text-gray-700 mb-2">
              やったこと <span className="text-red-600">*</span>
            </label>
            <textarea
              id="whatIDid"
              value={whatIDid}
              onChange={(e) => setWhatIDid(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* わかったこと、学んだこと */}
          <div>
            <label htmlFor="whatILearned" className="block text-sm font-medium text-gray-700 mb-2">
              わかったこと、学んだこと <span className="text-red-600">*</span>
            </label>
            <textarea
              id="whatILearned"
              value={whatILearned}
              onChange={(e) => setWhatILearned(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 次にやりたいこと */}
          <div>
            <label htmlFor="whatIWantToDo" className="block text-sm font-medium text-gray-700 mb-2">
              次にやりたいこと <span className="text-red-600">*</span>
            </label>
            <textarea
              id="whatIWantToDo"
              value={whatIWantToDo}
              onChange={(e) => setWhatIWantToDo(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:bg-gray-200 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface ManualSessionModalProps {
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
}

export default function ManualSessionModal({ isOpen, onClose, onSubmit, loading }: ManualSessionModalProps) {
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [goal, setGoal] = useState('')
  const [achievement, setAchievement] = useState('')
  const [whatIDid, setWhatIDid] = useState('')
  const [whatILearned, setWhatILearned] = useState('')
  const [whatIWantToDo, setWhatIWantToDo] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 日時の検証
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

    // リセット
    setStartDate('')
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setGoal('')
    setAchievement('')
    setWhatIDid('')
    setWhatILearned('')
    setWhatIWantToDo('')
  }

  const handleClose = () => {
    setStartDate('')
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setGoal('')
    setAchievement('')
    setWhatIDid('')
    setWhatILearned('')
    setWhatIWantToDo('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">開発記録を追加</h2>

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
              placeholder="例: ログイン機能を完成させる"
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
                placeholder="0"
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
              placeholder="例: ログイン機能の実装、バグ修正..."
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
              placeholder="例: ReactのuseEffectの使い方が理解できた..."
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
              placeholder="例: 認証機能を実装する..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

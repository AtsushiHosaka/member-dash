'use client'

import { useState } from 'react'

interface StartSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: string) => void
  loading: boolean
}

export default function StartSessionModal({ isOpen, onClose, onSubmit, loading }: StartSessionModalProps) {
  const [goal, setGoal] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (goal.trim()) {
      onSubmit(goal)
      setGoal('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">今日の目標を書こう！</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              今日は何を達成したいですか？ <span className="text-red-600">*</span>
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: ログイン機能を完成させる、認証のバグを修正する..."
              autoFocus
            />
          </div>

          <div className="flex gap-3">
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
              disabled={loading || !goal.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {loading ? '開始中...' : '開発開始'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (description: string) => void
  loading: boolean
}

export default function SessionModal({ isOpen, onClose, onSubmit, loading }: SessionModalProps) {
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim()) {
      onSubmit(description)
      setDescription('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">開発の記録</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              どのような開発をしましたか？
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: ログイン機能の実装、バグ修正..."
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
              disabled={loading || !description.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? '記録中...' : '記録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

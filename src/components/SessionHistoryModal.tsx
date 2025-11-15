'use client'

import { useState, useEffect } from 'react'

interface EditHistory {
  id: string
  editedAt: string
  editor: {
    id: string
    name: string
    userId: string
  } | null
  oldStartTime: string | null
  oldEndTime: string | null
  oldDuration: number | null
  oldGoal: string | null
  oldAchievement: number | null
  oldWhatIDid: string | null
  oldWhatILearned: string | null
  oldWhatIWantToDo: string | null
  newStartTime: string | null
  newEndTime: string | null
  newDuration: number | null
  newGoal: string | null
  newAchievement: number | null
  newWhatIDid: string | null
  newWhatILearned: string | null
  newWhatIWantToDo: string | null
}

interface SessionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string | null
}

export default function SessionHistoryModal({ isOpen, onClose, sessionId }: SessionHistoryModalProps) {
  const [history, setHistory] = useState<EditHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchHistory()
    }
  }, [isOpen, sessionId])

  const fetchHistory = async () => {
    if (!sessionId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/history`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch edit history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  const renderChange = (oldValue: any, newValue: any, label: string) => {
    if (oldValue === newValue) return null

    return (
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-600 line-through">{oldValue || '(なし)'}</span>
          <span className="text-gray-400">→</span>
          <span className="text-green-600">{newValue || '(なし)'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">編集履歴</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">編集履歴はありません</div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      編集 #{history.length - index}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(item.editedAt)} by {item.editor?.name || '不明'}
                  </div>
                </div>

                <div className="space-y-2">
                  {renderChange(
                    formatDateTime(item.oldStartTime),
                    formatDateTime(item.newStartTime),
                    '開始時間'
                  )}
                  {renderChange(
                    formatDateTime(item.oldEndTime),
                    formatDateTime(item.newEndTime),
                    '終了時間'
                  )}
                  {renderChange(
                    item.oldGoal,
                    item.newGoal,
                    '目標'
                  )}
                  {renderChange(
                    item.oldAchievement !== null ? `${item.oldAchievement}%` : null,
                    item.newAchievement !== null ? `${item.newAchievement}%` : null,
                    '達成度'
                  )}
                  {renderChange(
                    item.oldWhatIDid,
                    item.newWhatIDid,
                    'やったこと'
                  )}
                  {renderChange(
                    item.oldWhatILearned,
                    item.newWhatILearned,
                    'わかったこと、学んだこと'
                  )}
                  {renderChange(
                    item.oldWhatIWantToDo,
                    item.newWhatIWantToDo,
                    '次にやりたいこと'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

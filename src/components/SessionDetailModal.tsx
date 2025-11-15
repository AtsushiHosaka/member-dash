'use client'

interface SessionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  session: {
    startTime: string
    endTime: string | null
    duration: number | null
    goal: string | null
    achievement: number | null
    whatIDid: string | null
    whatILearned: string | null
    whatIWantToDo: string | null
  } | null
}

export default function SessionDetailModal({ isOpen, onClose, session }: SessionDetailModalProps) {
  if (!isOpen || !session) return null

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0時間0分'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}時間${minutes}分`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">開発記録の詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* 時間情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">開始時間</p>
                <p className="font-medium">{formatDateTime(session.startTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">終了時間</p>
                <p className="font-medium">
                  {session.endTime ? formatDateTime(session.endTime) : '進行中'}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">開発時間</p>
              <p className="font-medium text-lg text-blue-600">
                {formatDuration(session.duration)}
              </p>
            </div>
          </div>

          {/* 目標 */}
          {session.goal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今日の目標
              </label>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-gray-900 whitespace-pre-wrap">{session.goal}</p>
              </div>
            </div>
          )}

          {/* 達成度 */}
          {session.achievement !== null && session.achievement !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                達成度
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(session.achievement, 100)}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-green-600">
                  {session.achievement}%
                </span>
              </div>
            </div>
          )}

          {/* やったこと */}
          {session.whatIDid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                やったこと
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 whitespace-pre-wrap">{session.whatIDid}</p>
              </div>
            </div>
          )}

          {/* わかったこと、学んだこと */}
          {session.whatILearned && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                わかったこと、学んだこと
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 whitespace-pre-wrap">{session.whatILearned}</p>
              </div>
            </div>
          )}

          {/* 次にやりたいこと */}
          {session.whatIWantToDo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                次にやりたいこと
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 whitespace-pre-wrap">{session.whatIWantToDo}</p>
              </div>
            </div>
          )}
        </div>

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

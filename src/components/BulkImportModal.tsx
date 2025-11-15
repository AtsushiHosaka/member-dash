'use client'

import { useState } from 'react'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [csvText, setCsvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    message: string
    results: {
      success: string[]
      errors: { line: number; userId: string; error: string }[]
    }
  } | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // CSVをパース
      const lines = csvText.trim().split('\n')
      const users = lines.map((line, index) => {
        const [userId, password, name, coursesStr, schoolName] = line.split(',').map(s => s.trim())

        if (!userId || !password || !name || !coursesStr || !schoolName) {
          throw new Error(`${index + 1}行目: データが不足しています`)
        }

        return {
          userId,
          password,
          name,
          courses: coursesStr.split('/').map(c => c.trim()),
          schoolName
        }
      })

      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'インポートに失敗しました')
      }

      setResult(data)

      if (data.results.success.length > 0) {
        setTimeout(() => {
          onSuccess()
          if (data.results.errors.length === 0) {
            handleClose()
          }
        }, 2000)
      }
    } catch (error: any) {
      alert(error.message || 'CSVの解析に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCsvText('')
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">ユーザー一括追加</h2>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">CSV形式について</h3>
          <p className="text-sm text-gray-700 mb-2">各行に以下の形式で入力してください（カンマ区切り）:</p>
          <code className="text-xs bg-white px-2 py-1 rounded block mb-2">
            ユーザーID,パスワード,名前,コース1/コース2,スクール名
          </code>
          <p className="text-sm text-gray-700 mb-1">例:</p>
          <code className="text-xs bg-white px-2 py-1 rounded block">
            user001,password123,山田太郎,iPhone/WebS,火曜白金
          </code>
          <p className="text-xs text-gray-600 mt-2">
            ※ コースは「/」で区切って複数指定可能<br />
            ※ 使用可能なコース: iPhone, WebS, WebD, Unity, AI, Movie<br />
            ※ 使用可能なスクール: 火曜白金, 水曜白金, 金曜白金, 土曜白金
          </p>
        </div>

        {result && (
          <div className="mb-4">
            {result.results.success.length > 0 && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-2">
                <p className="font-semibold">{result.message}</p>
                <p className="text-sm mt-1">成功: {result.results.success.join(', ')}</p>
              </div>
            )}
            {result.results.errors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-semibold mb-2">エラー ({result.results.errors.length}件):</p>
                <ul className="text-sm space-y-1">
                  {result.results.errors.map((err, idx) => (
                    <li key={idx}>
                      {err.line}行目 ({err.userId}): {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="csvText" className="block text-sm font-medium text-gray-700 mb-2">
              CSVデータ <span className="text-red-600">*</span>
            </label>
            <textarea
              id="csvText"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              required
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="user001,password123,山田太郎,iPhone/WebS,火曜白金&#10;user002,password456,佐藤花子,WebD/Unity,水曜白金"
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
              disabled={loading || !csvText.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'インポート中...' : 'インポート'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

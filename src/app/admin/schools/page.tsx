'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface School {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function SchoolsAdminPage() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      } else if (response.status === 401 || response.status === 403) {
        // 認証エラーの場合はログインページに遷移
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error)
      router.push('/login')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSchoolName.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSchoolName })
      })

      if (response.ok) {
        setNewSchoolName('')
        fetchSchools()
      } else {
        const error = await response.json()
        alert(error.error || 'スクールの作成に失敗しました')
      }
    } catch (error) {
      alert('スクールの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName })
      })

      if (response.ok) {
        setEditingId(null)
        setEditingName('')
        fetchSchools()
      } else {
        const error = await response.json()
        alert(error.error || 'スクールの更新に失敗しました')
      }
    } catch (error) {
      alert('スクールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除してもよろしいですか？\n所属するユーザーも削除されます。`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSchools()
      } else {
        const error = await response.json()
        alert(error.error || 'スクールの削除に失敗しました')
      }
    } catch (error) {
      alert('スクールの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (school: School) => {
    setEditingId(school.id)
    setEditingName(school.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">スクール管理</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← ダッシュボードに戻る
          </button>
        </div>

        {/* 新規作成フォーム */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">新しいスクールを追加</h2>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="スクール名を入力"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              追加
            </button>
          </form>
        </div>

        {/* スクール一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">スクール一覧</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {schools.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                スクールがありません
              </div>
            ) : (
              schools.map((school) => (
                <div key={school.id} className="px-6 py-4 hover:bg-gray-50">
                  {editingId === school.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdate(school.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:bg-gray-400"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">
                          作成日: {new Date(school.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(school)}
                          disabled={loading}
                          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded disabled:text-gray-400"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(school.id, school.name)}
                          disabled={loading}
                          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded disabled:text-gray-400"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

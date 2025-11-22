'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Edit2, X } from 'lucide-react'

interface Badge {
  id: string
  name: string
  icon: string
  isPublic: boolean
  allowedUserIds: string[]
  createdAt: string
  _count?: {
    userBadges: number
  }
}

interface User {
  id: string
  userId: string
  name: string
}

export default function BadgesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [badges, setBadges] = useState<Badge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    isPublic: true,
    allowedUserIds: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'admin' && userRole !== 'mentor') {
        router.push('/')
        return
      }
      fetchBadges()
      fetchUsers()
    }
  }, [status, session, router])

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/admin/badges')
      if (response.ok) {
        const data = await response.json()
        setBadges(data)
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const openEditModal = (badge: Badge) => {
    setEditingBadge(badge)
    setEditForm({
      name: badge.name,
      isPublic: badge.isPublic,
      allowedUserIds: badge.allowedUserIds
    })
  }

  const closeEditModal = () => {
    setEditingBadge(null)
    setEditForm({
      name: '',
      isPublic: true,
      allowedUserIds: []
    })
  }

  const handleUpdateBadge = async () => {
    if (!editingBadge) return

    try {
      const response = await fetch(`/api/admin/badges/${editingBadge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          isPublic: editForm.isPublic,
          allowedUserIds: editForm.allowedUserIds
        })
      })

      if (response.ok) {
        await fetchBadges()
        closeEditModal()
      } else {
        const error = await response.json()
        alert(error.error || 'バッジの更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update badge:', error)
      alert('バッジの更新に失敗しました')
    }
  }

  const toggleUserSelection = (userId: string) => {
    setEditForm(prev => ({
      ...prev,
      allowedUserIds: prev.allowedUserIds.includes(userId)
        ? prev.allowedUserIds.filter(id => id !== userId)
        : [...prev.allowedUserIds, userId]
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">バッジ一覧</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            登録済みバッジ ({badges.length}個)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 relative"
              >
                <button
                  onClick={() => openEditModal(badge)}
                  className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {badge.icon.startsWith('/') ? (
                      <img src={badge.icon} alt={badge.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <span className="text-4xl">{badge.icon}</span>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{badge.name}</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {badge.isPublic ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      公開バッジ
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      限定バッジ ({badge.allowedUserIds?.length || 0}人)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 編集モーダル */}
        {editingBadge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">バッジ編集</h2>
                  <button
                    onClick={closeEditModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* バッジ名 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      バッジ名
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 公開設定 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公開設定
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          checked={editForm.isPublic}
                          onChange={() => setEditForm({ ...editForm, isPublic: true, allowedUserIds: [] })}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">公開バッジ</div>
                          <div className="text-xs text-gray-600">すべてのユーザーに表示されます</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          checked={!editForm.isPublic}
                          onChange={() => setEditForm({ ...editForm, isPublic: false })}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">限定バッジ</div>
                          <div className="text-xs text-gray-600">特定のユーザーのみに表示されます</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ユーザー選択（限定バッジの場合のみ） */}
                  {!editForm.isPublic && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        表示対象ユーザー ({editForm.allowedUserIds.length}人選択中)
                      </label>
                      <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                        {users.map((user) => (
                          <label
                            key={user.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={editForm.allowedUserIds.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4 rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-600">{user.userId}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 保存ボタン */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateBadge}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      保存
                    </button>
                    <button
                      onClick={closeEditModal}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

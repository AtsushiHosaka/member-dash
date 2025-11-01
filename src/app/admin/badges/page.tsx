'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Badge {
  id: string
  name: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  createdAt: string
  _count: {
    userBadges: number
  }
}

export default function BadgesAdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [filterRarity, setFilterRarity] = useState<string>('all')

  // フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    rarity: 'common' as Badge['rarity']
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const userRole = (session.user as any)?.role
      if (userRole !== 'admin') {
        router.push('/')
        return
      }
      fetchBadges()
    }
  }, [status, router, session])

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/admin/badges')
      if (response.ok) {
        const data = await response.json()
        setBadges(data)
      } else if (response.status === 403) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.icon.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', icon: '', rarity: 'common' })
        setIsAddModalOpen(false)
        fetchBadges()
      } else {
        const error = await response.json()
        alert(error.error || 'バッジの作成に失敗しました')
      }
    } catch (error) {
      alert('バッジの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBadge || !formData.name.trim() || !formData.icon.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/badges/${editingBadge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setEditingBadge(null)
        setFormData({ name: '', icon: '', rarity: 'common' })
        fetchBadges()
      } else {
        const error = await response.json()
        alert(error.error || 'バッジの更新に失敗しました')
      }
    } catch (error) {
      alert('バッジの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (badge: Badge) => {
    if (!confirm(`「${badge.name}」を削除してもよろしいですか？\nこのバッジを持っているユーザーからも削除されます。`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/badges/${badge.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBadges()
      } else {
        const error = await response.json()
        alert(error.error || 'バッジの削除に失敗しました')
      }
    } catch (error) {
      alert('バッジの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (badge: Badge) => {
    setEditingBadge(badge)
    setFormData({
      name: badge.name,
      icon: badge.icon,
      rarity: badge.rarity
    })
  }

  const cancelEdit = () => {
    setEditingBadge(null)
    setFormData({ name: '', icon: '', rarity: 'common' })
  }

  const openAddModal = () => {
    setFormData({ name: '', icon: '', rarity: 'common' })
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setFormData({ name: '', icon: '', rarity: 'common' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'コモン'
      case 'rare':
        return 'レア'
      case 'epic':
        return 'エピック'
      case 'legendary':
        return 'レジェンダリー'
      default:
        return rarity
    }
  }

  const filteredBadges = filterRarity === 'all'
    ? badges
    : badges.filter(b => b.rarity === filterRarity)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">バッジ管理</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← ダッシュボードに戻る
          </button>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">レアリティで絞り込み:</label>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="common">コモン</option>
              <option value="rare">レア</option>
              <option value="epic">エピック</option>
              <option value="legendary">レジェンダリー</option>
            </select>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + 新規追加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">バッジ一覧</h2>
          </div>

          {filteredBadges.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {filterRarity === 'all' ? 'バッジがありません' : 'このレアリティのバッジがありません'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アイコン
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      レアリティ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      所有者数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBadges.map((badge) => (
                    <tr key={badge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-2xl">{badge.icon}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{badge.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                          {getRarityLabel(badge.rarity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {badge._count.userBadges}人
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(badge.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => startEdit(badge)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 mr-3"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(badge)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 新規追加モーダル */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">新しいバッジを追加</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  バッジ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: はじめの一歩"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン（絵文字） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="例: 🏆"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  レアリティ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Badge['rarity'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="common">コモン</option>
                  <option value="rare">レア</option>
                  <option value="epic">エピック</option>
                  <option value="legendary">レジェンダリー</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {loading ? '追加中...' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">バッジを編集</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  バッジ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン（絵文字） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  レアリティ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Badge['rarity'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="common">コモン</option>
                  <option value="rare">レア</option>
                  <option value="epic">エピック</option>
                  <option value="legendary">レジェンダリー</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {loading ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

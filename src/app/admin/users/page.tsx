'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import BulkImportModal from '@/components/BulkImportModal'

interface School {
  id: string
  name: string
}

interface User {
  id: string
  userId: string
  name: string
  courses: string[]
  role: string
  schoolLinks: {
    school: {
      id: string
      name: string
    }
  }[]
  _count: {
    sessions: number
  }
  createdAt: string
}

interface EditingUser {
  name: string
  courses: string[]
  schoolIds: string[]
  role: string
}

const AVAILABLE_COURSES = ['iPhone', 'WebS', 'WebD', 'Unity', 'AI', 'Movie']

export default function UsersAdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingUser | null>(null)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)

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
      fetchUsers()
      fetchSchools()
    }
  }, [status, router, session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else if (response.status === 403) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditingData({
      name: user.name,
      courses: user.courses,
      schoolIds: user.schoolLinks.map(link => link.school.id),
      role: user.role
    })
  }

  const handleSave = async (userId: string) => {
    if (!editingData) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData)
      })

      if (response.ok) {
        setEditingId(null)
        setEditingData(null)
        fetchUsers()
        toast({
          title: "更新完了",
          description: "ユーザー情報を更新しました",
        })
      } else {
        const error = await response.json()
        toast({
          title: "更新失敗",
          description: error.error || 'ユーザー情報の更新に失敗しました',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "更新失敗",
        description: 'ユーザー情報の更新に失敗しました',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const toggleCourse = (course: string) => {
    if (!editingData) return
    const courses = editingData.courses.includes(course)
      ? editingData.courses.filter(c => c !== course)
      : [...editingData.courses, course]
    setEditingData({ ...editingData, courses })
  }

  const toggleSchool = (schoolId: string) => {
    if (!editingData) return
    const schoolIds = editingData.schoolIds.includes(schoolId)
      ? editingData.schoolIds.filter(id => id !== schoolId)
      : [...editingData.schoolIds, schoolId]
    setEditingData({ ...editingData, schoolIds })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← ダッシュボードに戻る
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">全ユーザー一覧</h2>
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              + 一括追加
            </button>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              ユーザーがいません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      スクール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コース
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      セッション数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ロール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const isEditing = editingId === user.id
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {isEditing && editingData ? (
                            <input
                              type="text"
                              value={editingData.name}
                              onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="ユーザー名"
                            />
                          ) : (
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">@{user.userId}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing && editingData ? (
                            <div className="space-y-1">
                              {schools.map(school => (
                                <label key={school.id} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editingData.schoolIds.includes(school.id)}
                                    onChange={() => toggleSchool(school.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{school.name}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              {user.schoolLinks.map(link => link.school.name).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing && editingData ? (
                            <div className="space-y-1">
                              {AVAILABLE_COURSES.map(course => (
                                <label key={course} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editingData.courses.includes(course)}
                                    onChange={() => toggleCourse(course)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{course}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              {user.courses.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user._count.sessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing && editingData ? (
                            <select
                              value={editingData.role}
                              onChange={(e) => setEditingData({ ...editingData, role: e.target.value })}
                              disabled={loading}
                              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="member">member</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(user.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                              >
                                保存
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(user)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                            >
                              編集
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          fetchUsers()
          toast({
            title: "一括追加完了",
            description: "ユーザーを追加しました",
          })
        }}
      />
    </div>
  )
}

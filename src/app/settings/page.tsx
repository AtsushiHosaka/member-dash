'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// コース一覧
const COURSES = ['iPhone', 'WebS', 'WebD', 'Unity', 'AI', 'Movie']

// アバター絵文字一覧
const AVATAR_EMOJIS = ['😀', '😎', '🤓', '😊', '🥳', '🤔', '😴', '🤖', '👻', '🦄']

interface School {
  id: string
  name: string
}

interface Badge {
  id: string
  name: string
  icon: string
  rarity: string
}

interface UserBadge {
  id: string
  badge: Badge
  obtainedAt: string
}

interface UserData {
  name: string
  avatar: string | null
  courses: string[]
  schoolLinks: Array<{
    schoolId: string
    school: School
  }>
  userBadges: UserBadge[]
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // フォームの状態
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedSchools, setSelectedSchools] = useState<string[]>([])

  // パスワード変更の状態
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData()
      fetchSchools()
    }
  }, [status])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setName(data.name)
        setAvatar(data.avatar)
        setSelectedCourses(data.courses || [])
        setSelectedSchools(data.schoolLinks.map((link: any) => link.schoolId))
      } else if (response.status === 401 || response.status === 403) {
        // 認証エラーの場合はログインページに遷移
        router.push('/login')
      } else {
        alert('ユーザー情報の取得に失敗しました')
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
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


  const handleCourseToggle = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    )
  }

  const handleSchoolToggle = (schoolId: string) => {
    setSelectedSchools(prev =>
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('名前を入力してください')
      return
    }

    if (selectedCourses.length === 0) {
      alert('少なくとも1つのコースを選択してください')
      return
    }

    if (selectedSchools.length === 0) {
      alert('少なくとも1つの校舎を選択してください')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          avatar,
          courses: selectedCourses,
          schoolIds: selectedSchools
        })
      })

      if (response.ok) {
        alert('保存しました')
        router.push('/')
      } else {
        const error = await response.json()
        alert(error.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    signOut()
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('すべてのパスワードフィールドを入力してください')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('新しいパスワードと確認用パスワードが一致しません')
      return
    }

    if (newPassword.length < 6) {
      alert('新しいパスワードは6文字以上にしてください')
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('パスワードを変更しました')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert(data.error || 'パスワード変更に失敗しました')
      }
    } catch (error) {
      console.error('Password change error:', error)
      alert('パスワード変更に失敗しました')
    } finally {
      setChangingPassword(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-200 text-gray-800'
      case 'rare':
        return 'bg-blue-200 text-blue-800'
      case 'epic':
        return 'bg-purple-200 text-purple-800'
      case 'legendary':
        return 'bg-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'コモン'
      case 'rare':
        return 'レア'
      case 'epic':
        return 'エピック'
      case 'legendary':
        return '伝説'
      default:
        return rarity
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!session || !userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">設定</h2>

          {/* 名前 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="名前を入力"
            />
          </div>

          {/* コース */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コース <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COURSES.map((course) => (
                <label
                  key={course}
                  className="flex items-center gap-2 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course)}
                    onChange={() => handleCourseToggle(course)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{course}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 校舎 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              校舎 <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {schools.map((school) => (
                <label
                  key={school.id}
                  className="flex items-center gap-2 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(school.id)}
                    onChange={() => handleSchoolToggle(school.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{school.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
            >
              キャンセル
            </button>
          </div>

        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">パスワード変更</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在のパスワード <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="現在のパスワードを入力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="新しいパスワードを入力（6文字以上）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード（確認） <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="新しいパスワードを再入力"
              />
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {changingPassword ? 'パスワード変更中...' : 'パスワードを変更'}
            </button>
          </div>

          {/* ログアウト */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              ログアウト
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

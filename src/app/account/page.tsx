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
      } else {
        alert('ユーザー情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      alert('ユーザー情報の取得に失敗しました')
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
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dash β</h1>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ホームに戻る
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">アカウント設定</h2>

          {/* アイコン */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アイコン絵文字
            </label>
            <div className="mb-4">
              {avatar && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-3xl">{avatar}</span>
                  </div>
                  <span className="text-sm text-gray-600">選択中: {avatar}</span>
                </div>
              )}
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`text-4xl p-3 rounded-lg transition hover:bg-gray-100 ${
                      avatar === emoji
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  クリア
                </button>
              )}
            </div>
          </div>

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

          {/* ログアウト */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* 獲得バッヂ */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">獲得バッヂ</h2>
          <div className="text-center py-8 text-gray-500">
            現在実装中...
          </div>
        </div>
      </main>
    </div>
  )
}

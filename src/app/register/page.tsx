'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedSchools, setSelectedSchools] = useState<string[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState('')
  const [schools, setSchools] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const courses = ['iPhone', 'WebS', 'WebD', 'Unity', 'AI', 'Movie']
  const avatarEmojis = ['😀', '😎', '🤓', '😊', '🥳', '🤔', '😴', '🤖', '👻', '🦄']

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    )
  }

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev =>
      prev.includes(schoolId)
        ? prev.filter(s => s !== schoolId)
        : [...prev, schoolId]
    )
  }

  useEffect(() => {
    // APIからスクール一覧を取得
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
    fetchSchools()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (selectedCourses.length === 0) {
      setError('少なくとも1つのコースを選択してください')
      return
    }
    if (selectedSchools.length === 0) {
      setError('少なくとも1つのスクールを選択してください')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          password,
          name,
          courses: selectedCourses,
          schoolIds: selectedSchools,
          avatar: selectedEmoji
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '登録中にエラーが発生しました')
      } else {
        router.push('/login?registered=true')
      }
    } catch (error) {
      setError('登録中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Member&apos; 新規登録</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              ユーザーID
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              placeholder="半角英数字（重複不可）"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              名前
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スクール（複数選択可）
            </label>
            <div className="space-y-2">
              {schools.map((school) => (
                <label key={school.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(school.id)}
                    onChange={() => toggleSchool(school.id)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{school.name}</span>
                </label>
              ))}
            </div>
            {selectedSchools.length === 0 && (
              <p className="mt-1 text-xs text-red-500">少なくとも1つ選択してください</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コース（複数選択可）
            </label>
            <div className="space-y-2">
              {courses.map((course) => (
                <label key={course} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course)}
                    onChange={() => toggleCourse(course)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{course}</span>
                </label>
              ))}
            </div>
            {selectedCourses.length === 0 && (
              <p className="mt-1 text-xs text-red-500">少なくとも1つ選択してください</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アイコン絵文字（任意）
            </label>
            <div className="grid grid-cols-5 gap-2">
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-4xl p-3 rounded-lg transition hover:bg-gray-100 ${
                    selectedEmoji === emoji
                      ? 'bg-blue-100 ring-2 ring-blue-500'
                      : 'bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedEmoji && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">選択中: {selectedEmoji}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          既にアカウントをお持ちの方は
          <Link href="/login" className="text-blue-600 hover:underline ml-1">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}

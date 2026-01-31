'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeDecorations from '@/components/ThemeDecorations'
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const router = useRouter()
  const { isValentine } = useTheme()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // テーマに応じたスタイル
  const themeEmoji = isValentine ? '🍫' : '🎍'
  const bgColor = isValentine ? 'bg-[#FFF5EB]' : 'bg-white'
  const borderColor = isValentine ? 'border-[#D4A574]' : 'border-red-100'
  const titleColor = isValentine ? 'text-[#8A0000]' : 'text-red-600'
  const buttonBg = isValentine ? 'bg-[#8A0000] hover:bg-[#6A0000]' : 'bg-red-600 hover:bg-red-700'
  const focusRing = isValentine ? 'focus:ring-[#8A0000]' : 'focus:ring-red-600'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        userId,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('ユーザーIDまたはパスワードが正しくありません')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${bgColor}`}>
      <ThemeDecorations isAccumulating={false} />
      <div className={`p-8 rounded-lg shadow-xl w-full max-w-md relative z-10 bg-white border-2 ${borderColor}`}>
        <h1 className={`text-2xl font-bold text-center mb-6 ${titleColor}`}>
          {themeEmoji} Hash ログイン
        </h1>

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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${focusRing}`}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${focusRing}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md disabled:bg-gray-400 transition ${buttonBg}`}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}

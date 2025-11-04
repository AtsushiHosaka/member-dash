'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface School {
  id: string
  name: string
}

interface RankingUser {
  id: string
  name: string
  courses: string[]
  avatar: string | null
  totalDuration: number
  isActive: boolean
}

interface RankingProps {
  users: RankingUser[]
  currentUserId: string
  userSchools: School[]
  onSchoolChange: (schoolId: string | null) => void
  loading?: boolean
}

export default function Ranking({ users, currentUserId, userSchools, onSchoolChange, loading = false }: RankingProps) {
  const router = useRouter()
  const [selectedSchool, setSelectedSchool] = useState<string>('')

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}時間${minutes}分`
  }

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = e.target.value
    setSelectedSchool(schoolId)
    onSchoolChange(schoolId || null)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">今週のランキング</h2>
        {userSchools.length > 1 && (
          <select
            value={selectedSchool}
            onChange={handleSchoolChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全てのスクール</option>
            {userSchools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">ランキング読み込み中...</p>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center py-4">まだデータがありません</p>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition hover:shadow-md ${
                user.id === currentUserId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0 w-8 text-center">
                <span className="font-bold text-lg">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `${index + 1}`}
                </span>
              </div>

              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold ${
                    user.isActive ? 'ring-4 ring-green-400' : ''
                  }`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {user.isActive && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="font-semibold">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="text-blue-600 text-sm ml-2">(あなた)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{user.courses.join(', ')}</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg">{formatDuration(user.totalDuration)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

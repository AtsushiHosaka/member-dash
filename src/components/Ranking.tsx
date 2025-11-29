'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Avatar from './Avatar'

interface School {
  id: string
  name: string
}

interface RankingUser {
  id: string
  name: string
  courses: string[]
  avatar: string | null
  avatarBadgeName?: string | null
  daysCount: number
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

  const formatDaysCount = (days: number) => {
    return `${days}日`
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
        <h2 className="text-xl font-bold">今週の開発日数</h2>
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
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center py-4">今週開発したメンバーはまだいません</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition hover:shadow-md ${
                user.id === currentUserId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Avatar
                avatar={user.avatar}
                name={user.name}
                size="md"
                isActive={user.isActive}
                showActiveIndicator={user.isActive}
                badgeName={user.avatarBadgeName}
              />

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
                <div className="font-bold text-lg">{formatDaysCount(user.daysCount)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

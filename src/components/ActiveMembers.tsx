'use client'

import { useRouter } from 'next/navigation'

interface ActiveMember {
  id: string
  name: string
  courses: string[]
  avatar: string | null
  startTime: string
}

interface ActiveMembersProps {
  members: ActiveMember[]
}

export default function ActiveMembers({ members }: ActiveMembersProps) {
  const router = useRouter()
  const formatStartTime = (startTime: string) => {
    const date = new Date(startTime)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}~`
  }

  if (members.length === 0) {
    return null
  }

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">開発中</h3>
      <div className="flex flex-wrap gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => handleUserClick(member.id)}
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
          >
            {/* アイコン */}
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center font-bold ring-4 ring-green-400 mb-2">
              {member.avatar ? (
                <span className="text-4xl">{member.avatar}</span>
              ) : (
                <span className="text-white text-2xl">{member.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* 開発開始時間 */}
            <div className="text-xs text-gray-600 font-medium mb-1">
              {formatStartTime(member.startTime)}
            </div>

            {/* 名前とコース */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">
                {member.name}
              </p>
              <p className="text-xs text-gray-500">
                {member.courses.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

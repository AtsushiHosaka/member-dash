'use client'

import { useRouter } from 'next/navigation'
import Avatar from './Avatar'

interface ActiveMember {
  id: string
  name: string
  courses: string[]
  avatar: string | null
  avatarBadgeName?: string | null
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

  // membersが配列でない場合やundefinedの場合の安全チェック
  if (!members || !Array.isArray(members) || members.length === 0) {
    return null
  }

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">開発中</h3>
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-6 py-2" style={{ minWidth: 'min-content' }}>
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => handleUserClick(member.id)}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition flex-shrink-0"
              style={{ minWidth: '120px' }}
            >
              {/* アイコン */}
              <div className="mb-2">
                <Avatar
                  avatar={member.avatar}
                  name={member.name}
                  size="xl"
                  isActive={true}
                  badgeName={member.avatarBadgeName}
                />
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
    </div>
  )
}

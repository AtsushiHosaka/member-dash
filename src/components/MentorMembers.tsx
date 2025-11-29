'use client'

import { useRouter } from 'next/navigation'
import Avatar from './Avatar'

interface MentorMember {
  id: string
  userId: string
  name: string
  avatar: string | null
  avatarBadgeName?: string | null
  courses: string[]
  schools: string[]
  isActive: boolean
  activeSession: {
    id: string
    goal: string | null
  } | null
  weeklyDuration: number
}

interface MentorMembersProps {
  members: MentorMember[]
}

export default function MentorMembers({ members }: MentorMembersProps) {
  const router = useRouter()

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}時間${minutes}分`
  }

  const handleMemberClick = (memberId: string) => {
    router.push(`/users/${memberId}`)
  }

  if (members.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">担当メンバー一覧</h2>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => handleMemberClick(member.id)}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* アバター */}
              <div className="flex-shrink-0">
                <Avatar
                  avatar={member.avatar}
                  name={member.name}
                  size="md"
                  isActive={member.isActive}
                  showActiveIndicator={member.isActive}
                  badgeName={member.avatarBadgeName}
                />
              </div>

              {/* 情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {member.name}
                  </div>
                  {member.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">
                      開発中
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {member.courses.join(', ')} | {member.schools.join(', ')}
                </div>

                {/* 開発中の目標 */}
                {member.isActive && member.activeSession?.goal && (
                  <div className="mt-2 text-xs text-gray-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                    目標: {member.activeSession.goal}
                  </div>
                )}
              </div>

              {/* 今週の開発時間 */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-gray-500">今週</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatDuration(member.weeklyDuration)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

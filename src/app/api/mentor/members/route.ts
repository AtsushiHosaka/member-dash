import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// メンターの担当メンバー一覧を取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const currentUserRole = (session.user as any).role

    // メンターまたは管理者のみアクセス可能
    if (currentUserRole !== 'mentor' && currentUserRole !== 'admin') {
      return NextResponse.json(
        { error: 'メンターまたは管理者のみアクセスできます' },
        { status: 403 }
      )
    }

    // メンターの担当メンバーを取得
    const members = await prisma.user.findMany({
      where: {
        mentorId: currentUserId
      },
      include: {
        schoolLinks: {
          include: {
            school: true
          }
        },
        sessions: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            startTime: true,
            goal: true,
            isActive: true
          }
        },
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // 週の開始（月曜日0:00）を計算
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)

    // 各メンバーの今週の開発時間を計算
    const membersWithWeeklyTime = await Promise.all(
      members.map(async (member) => {
        const weeklySessions = await prisma.session.findMany({
          where: {
            userId: member.id,
            startTime: {
              gte: weekStart
            },
            isActive: false,
            duration: {
              not: null
            }
          },
          select: {
            duration: true
          }
        })

        const weeklyDuration = weeklySessions.reduce(
          (sum, session) => sum + (session.duration || 0),
          0
        )

        // アクティブなセッションの時間を追加
        const activeSession = member.sessions[0]
        const activeDuration = activeSession
          ? Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000)
          : 0

        const totalWeeklyDuration = weeklyDuration + activeDuration

        return {
          id: member.id,
          userId: member.userId,
          name: member.name,
          avatar: member.avatar,
          courses: member.courses,
          schools: member.schoolLinks.map(link => link.school.name),
          isActive: member.sessions.length > 0,
          activeSession: activeSession || null,
          weeklyDuration: totalWeeklyDuration
        }
      })
    )

    // 開発中のメンバーを上に表示
    const sortedMembers = membersWithWeeklyTime.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1
      if (!a.isActive && b.isActive) return 1
      return b.weeklyDuration - a.weeklyDuration
    })

    return NextResponse.json(sortedMembers)
  } catch (error) {
    console.error('Mentor members fetch error:', error)
    return NextResponse.json(
      { error: '担当メンバー取得エラー' },
      { status: 500 }
    )
  }
}

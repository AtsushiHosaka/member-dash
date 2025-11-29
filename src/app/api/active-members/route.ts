import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const schools = (session.user as any).schools || []
    const schoolIds = schools.map((school: any) => school.id)

    // バッジ一覧を取得（アバターのバッジ名解決用）
    const allBadges = await prisma.badge.findMany({
      select: { icon: true, name: true }
    })
    const badgeNameMap = new Map(allBadges.map(b => [b.icon, b.name]))

    // 同じスクールのアクティブなセッションを持つユーザーを取得（複数校舎対応）
    const activeSessions = await prisma.session.findMany({
      where: {
        isActive: true,
        user: {
          schoolLinks: {
            some: {
              schoolId: {
                in: schoolIds
              }
            }
          }
        }
      },
      include: {
        user: {
          include: {
            schoolLinks: {
              include: {
                school: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // アクティブメンバーのデータを整形
    const activeMembers = activeSessions.map(session => ({
      id: session.user.id,
      name: session.user.name,
      courses: session.user.courses,
      schools: session.user.schoolLinks.map(link => ({
        id: link.school.id,
        name: link.school.name
      })),
      avatar: session.user.avatar,
      avatarBadgeName: session.user.avatar ? badgeNameMap.get(session.user.avatar) || null : null,
      startTime: session.startTime.toISOString()
    }))

    return NextResponse.json(activeMembers)
  } catch (error) {
    console.error('Active members fetch error:', error)
    return NextResponse.json(
      { error: 'アクティブメンバー取得エラー' },
      { status: 500 }
    )
  }
}

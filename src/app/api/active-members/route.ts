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

    const schoolId = (session.user as any).schoolId

    // 同じスクールのアクティブなセッションを持つユーザーを取得
    const activeSessions = await prisma.session.findMany({
      where: {
        isActive: true,
        user: {
          schoolId
        }
      },
      include: {
        user: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // アクティブメンバーのデータを整形
    const activeMembers = activeSessions.map(session => ({
      id: session.user.id,
      name: session.user.name,
      course: session.user.course,
      avatar: session.user.avatar,
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

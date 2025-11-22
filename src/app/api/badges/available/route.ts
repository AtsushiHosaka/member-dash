import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ユーザーが使用可能なバッジを取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // ユーザーが使用可能なバッジを取得
    // 1. isPublic=true のバッジ
    // 2. allowedUserIds にユーザーIDが含まれるバッジ
    const badges = await prisma.badge.findMany({
      where: {
        OR: [
          { isPublic: true },
          {
            allowedUserIds: {
              has: userId
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(badges)
  } catch (error) {
    console.error('Available badges fetch error:', error)
    return NextResponse.json(
      { error: 'バッジ取得エラー' },
      { status: 500 }
    )
  }
}

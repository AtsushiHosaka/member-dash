import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userIdString = (session.user as any).userId

    // まずIDで検索、見つからなければuserIdで検索（データベースリセット時の対策）
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        name: true,
        courses: true,
        avatar: true,
        role: true,
        gachaTickets: true,
        totalStudyHours: true,
        seasonGoal: true,
        seasonGoalExpiresAt: true
      }
    })

    // IDで見つからない場合、userIdで検索
    if (!user && userIdString) {
      user = await prisma.user.findUnique({
        where: { userId: userIdString },
        select: {
          id: true,
          userId: true,
          name: true,
          courses: true,
          avatar: true,
          role: true,
          gachaTickets: true,
          totalStudyHours: true,
          seasonGoal: true,
          seasonGoalExpiresAt: true
        }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。再度ログインしてください。' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

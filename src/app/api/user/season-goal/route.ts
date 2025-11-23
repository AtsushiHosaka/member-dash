import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 今期の目標を更新
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { seasonGoal } = await request.json()

    if (!seasonGoal || typeof seasonGoal !== 'string') {
      return NextResponse.json(
        { error: '今期の目標を入力してください' },
        { status: 400 }
      )
    }

    // 2026/3/31 23:59:59 JST
    const expiresAt = new Date('2026-03-31T23:59:59+09:00')

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        seasonGoal,
        seasonGoalExpiresAt: expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      seasonGoal: updatedUser.seasonGoal,
      seasonGoalExpiresAt: updatedUser.seasonGoalExpiresAt
    })
  } catch (error) {
    console.error('Season goal update error:', error)
    return NextResponse.json(
      { error: '今期の目標の更新に失敗しました' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 目標を編集
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id } = await params
    const { goal } = await request.json()

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json(
        { error: '目標を入力してください' },
        { status: 400 }
      )
    }

    // セッションを取得
    const existingSession = await prisma.session.findUnique({
      where: { id }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // 自分のセッションであることを確認
    if (existingSession.userId !== userId) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // 編集履歴を作成
    await prisma.sessionEditHistory.create({
      data: {
        sessionId: id,
        editedBy: userId,
        oldGoal: existingSession.goal,
        newGoal: goal
      }
    })

    // 目標を更新
    const updatedSession = await prisma.session.update({
      where: { id },
      data: { goal }
    })

    return NextResponse.json({
      success: true,
      session: updatedSession
    })
  } catch (error) {
    console.error('Goal update error:', error)
    return NextResponse.json(
      { error: '目標の更新に失敗しました' },
      { status: 500 }
    )
  }
}

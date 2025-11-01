import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// セッションを終了
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { description } = await request.json()

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: '開発内容の入力は必須です' },
        { status: 400 }
      )
    }

    const { id } = await params

    const devSession = await prisma.session.findUnique({
      where: { id }
    })

    if (!devSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    if (devSession.userId !== (session.user as any).id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const endTime = new Date()
    const duration = Math.floor(
      (endTime.getTime() - devSession.startTime.getTime()) / 1000
    )
    const durationHours = duration / 3600

    // ユーザーの現在の累計学習時間を取得
    const user = await prisma.user.findUnique({
      where: { id: devSession.userId },
      select: { totalStudyHours: true, gachaTickets: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const oldTotalHours = user.totalStudyHours
    const newTotalHours = oldTotalHours + durationHours

    // 3時間ごとにガチャ券を付与
    const oldTickets = Math.floor(oldTotalHours / 3)
    const newTickets = Math.floor(newTotalHours / 3)
    const ticketsToAdd = newTickets - oldTickets

    // トランザクションでセッション更新とユーザー情報更新を同時に実行
    const [updatedSession] = await prisma.$transaction([
      prisma.session.update({
        where: { id },
        data: {
          endTime,
          duration,
          description,
          isActive: false
        }
      }),
      prisma.user.update({
        where: { id: devSession.userId },
        data: {
          totalStudyHours: newTotalHours,
          gachaTickets: {
            increment: ticketsToAdd
          }
        }
      })
    ])

    return NextResponse.json({
      ...updatedSession,
      ticketsEarned: ticketsToAdd
    })
  } catch (error) {
    console.error('Session end error:', error)
    return NextResponse.json(
      { error: 'セッション終了エラー' },
      { status: 500 }
    )
  }
}

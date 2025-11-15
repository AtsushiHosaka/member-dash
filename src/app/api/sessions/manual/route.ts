import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 手動で開発セッションを追加
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const currentUserRole = (session.user as any).role

    const body = await request.json()
    const {
      userId,
      startTime,
      endTime,
      goal,
      achievement,
      whatIDid,
      whatILearned,
      whatIWantToDo
    } = body

    // 権限チェック: 管理者または自分自身のみ
    if (currentUserRole !== 'admin' && currentUserId !== userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // バリデーション
    if (!userId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'ユーザーID、開始時間、終了時間は必須です' },
        { status: 400 }
      )
    }

    if (!whatIDid || !whatILearned || !whatIWantToDo) {
      return NextResponse.json(
        { error: 'すべての項目の入力は必須です' },
        { status: 400 }
      )
    }

    if (achievement === undefined || achievement === null || achievement < 0) {
      return NextResponse.json(
        { error: '達成度は0以上の数字を入力してください' },
        { status: 400 }
      )
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      return NextResponse.json(
        { error: '終了時間は開始時間より後にしてください' },
        { status: 400 }
      )
    }

    // 期間（秒）を計算
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
    const durationHours = duration / 3600

    // ユーザーの現在の累計学習時間を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // トランザクションでセッション作成とユーザー情報更新を同時に実行
    const [newSession] = await prisma.$transaction([
      prisma.session.create({
        data: {
          userId,
          startTime: start,
          endTime: end,
          duration,
          isActive: false,
          goal: goal || null,
          achievement,
          whatIDid,
          whatILearned,
          whatIWantToDo
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalStudyHours: newTotalHours,
          gachaTickets: {
            increment: ticketsToAdd
          }
        }
      })
    ])

    return NextResponse.json({
      ...newSession,
      ticketsEarned: ticketsToAdd
    }, { status: 201 })
  } catch (error) {
    console.error('Manual session creation error:', error)
    return NextResponse.json(
      { error: 'セッション追加エラー' },
      { status: 500 }
    )
  }
}

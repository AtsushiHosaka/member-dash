import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// セッションを編集
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const currentUserRole = (session.user as any).role

    const { id } = await params

    // セッションを取得して所有者を確認
    const existingSession = await prisma.session.findUnique({
      where: { id },
      select: { userId: true, startTime: true, endTime: true, duration: true, goal: true, achievement: true, whatIDid: true, whatILearned: true, whatIWantToDo: true }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック: 管理者またはセッションの所有者のみ
    if (currentUserRole !== 'admin' && currentUserId !== existingSession.userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const {
      startTime,
      endTime,
      goal,
      achievement,
      whatIDid,
      whatILearned,
      whatIWantToDo
    } = body

    // バリデーション
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: '開始時間と終了時間は必須です' },
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

    // 新しい期間（秒）を計算
    const newDuration = Math.floor((end.getTime() - start.getTime()) / 1000)
    const oldDuration = existingSession.duration || 0

    // 期間の差分を計算（学習時間調整用）
    const durationDiff = (newDuration - oldDuration) / 3600 // 時間単位

    // ユーザーの現在の累計学習時間を取得
    const user = await prisma.user.findUnique({
      where: { id: existingSession.userId },
      select: { totalStudyHours: true, gachaTickets: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const oldTotalHours = user.totalStudyHours
    const newTotalHours = oldTotalHours + durationDiff

    // 3時間ごとにガチャ券を付与（変更分のみ）
    const oldTickets = Math.floor(oldTotalHours / 3)
    const newTickets = Math.floor(newTotalHours / 3)
    const ticketsToAdd = newTickets - oldTickets

    // トランザクションで編集履歴を保存してからセッションを更新
    const [updatedSession] = await prisma.$transaction([
      prisma.session.update({
        where: { id },
        data: {
          startTime: start,
          endTime: end,
          duration: newDuration,
          goal: goal || null,
          achievement,
          whatIDid,
          whatILearned,
          whatIWantToDo
        }
      }),
      prisma.sessionEditHistory.create({
        data: {
          sessionId: id,
          editedBy: currentUserId,
          oldStartTime: existingSession.startTime,
          oldEndTime: existingSession.endTime,
          oldDuration: existingSession.duration,
          oldGoal: existingSession.goal,
          oldAchievement: existingSession.achievement,
          oldWhatIDid: existingSession.whatIDid,
          oldWhatILearned: existingSession.whatILearned,
          oldWhatIWantToDo: existingSession.whatIWantToDo,
          newStartTime: start,
          newEndTime: end,
          newDuration,
          newGoal: goal || null,
          newAchievement: achievement,
          newWhatIDid: whatIDid,
          newWhatILearned: whatILearned,
          newWhatIWantToDo: whatIWantToDo
        }
      }),
      prisma.user.update({
        where: { id: existingSession.userId },
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
      ticketsChanged: ticketsToAdd
    })
  } catch (error) {
    console.error('Session edit error:', error)
    return NextResponse.json(
      { error: 'セッション編集エラー' },
      { status: 500 }
    )
  }
}

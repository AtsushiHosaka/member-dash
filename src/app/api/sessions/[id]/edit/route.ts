import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// セッションを編集
export async function PATCH(
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

    // 既存のセッションを取得
    const existingSession = await prisma.session.findUnique({
      where: { id }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック: 管理者または本人のみ
    if (currentUserRole !== 'admin' && existingSession.userId !== currentUserId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

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

    // 新しい期間を計算
    const newDuration = Math.floor((end.getTime() - start.getTime()) / 1000)

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
          // 編集前の値
          oldStartTime: existingSession.startTime,
          oldEndTime: existingSession.endTime,
          oldDuration: existingSession.duration,
          oldGoal: existingSession.goal,
          oldAchievement: existingSession.achievement,
          oldWhatIDid: existingSession.whatIDid,
          oldWhatILearned: existingSession.whatILearned,
          oldWhatIWantToDo: existingSession.whatIWantToDo,
          // 編集後の値
          newStartTime: start,
          newEndTime: end,
          newDuration,
          newGoal: goal || null,
          newAchievement: achievement,
          newWhatIDid: whatIDid,
          newWhatILearned: whatILearned,
          newWhatIWantToDo: whatIWantToDo
        }
      })
    ])

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Session edit error:', error)
    return NextResponse.json(
      { error: 'セッション編集エラー' },
      { status: 500 }
    )
  }
}

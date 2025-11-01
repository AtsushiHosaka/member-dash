import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const schoolId = (session.user as any).schoolId

    // 今週の開始と終了を取得
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }) // 日曜日始まり
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 })

    // 同じスクールのユーザーを取得
    const users = await prisma.user.findMany({
      where: { schoolId },
      include: {
        sessions: {
          where: {
            OR: [
              // 今週の完了済みセッション
              {
                startTime: {
                  gte: weekStart,
                  lte: weekEnd
                },
                isActive: false,
                duration: {
                  not: null
                }
              },
              // アクティブなセッション
              {
                isActive: true
              }
            ]
          }
        }
      }
    })

    // ランキングデータを作成
    const ranking = users.map(user => {
      // 今週の完了済みセッションの合計時間を計算
      const totalDuration = user.sessions
        .filter(session => !session.isActive && session.duration)
        .reduce((sum, session) => sum + (session.duration || 0), 0)

      // 現在開発中かどうかをチェック
      const isCurrentlyActive = user.sessions.some(session => session.isActive)

      return {
        id: user.id,
        name: user.name,
        course: user.course,
        avatar: user.avatar,
        totalDuration,
        isActive: isCurrentlyActive
      }
    })

    // 開発時間でソート
    ranking.sort((a, b) => b.totalDuration - a.totalDuration)

    return NextResponse.json(ranking)
  } catch (error) {
    console.error('Ranking fetch error:', error)
    return NextResponse.json(
      { error: 'ランキング取得エラー' },
      { status: 500 }
    )
  }
}

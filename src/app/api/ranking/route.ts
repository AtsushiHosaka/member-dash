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

    const schools = (session.user as any).schools || []
    const allSchoolIds = schools.map((school: any) => school.id)

    // URLからschoolIdパラメータを取得（フィルタリング用）
    const { searchParams } = new URL(request.url)
    const filterSchoolId = searchParams.get('schoolId')

    // フィルタがあればそのスクールのみ、なければ全てのスクール
    const schoolIds = filterSchoolId ? [filterSchoolId] : allSchoolIds

    // 今週の開始と終了を取得
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }) // 日曜日始まり
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 })

    // 同じスクールに属するユーザーを取得（複数校舎対応）
    const users = await prisma.user.findMany({
      where: {
        schoolLinks: {
          some: {
            schoolId: {
              in: schoolIds
            }
          }
        }
      },
      include: {
        schoolLinks: {
          include: {
            school: true
          }
        },
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
      const completedDuration = user.sessions
        .filter(session => !session.isActive && session.duration)
        .reduce((sum, session) => sum + (session.duration || 0), 0)

      // 現在開発中のセッションの時間を計算
      const activeSession = user.sessions.find(session => session.isActive)
      const activeDuration = activeSession
        ? Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000)
        : 0

      // 合計時間（完了 + 現在開発中）
      const totalDuration = completedDuration + activeDuration

      // 現在開発中かどうかをチェック
      const isCurrentlyActive = !!activeSession

      return {
        id: user.id,
        name: user.name,
        courses: user.courses,
        schools: user.schoolLinks.map(link => ({
          id: link.school.id,
          name: link.school.name
        })),
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

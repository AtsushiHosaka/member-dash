import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// スクール名から曜日を取得
function getSchoolDayOfWeek(schoolName: string): number {
  if (schoolName.includes('日曜')) return 0
  if (schoolName.includes('月曜')) return 1
  if (schoolName.includes('火曜')) return 2
  if (schoolName.includes('水曜')) return 3
  if (schoolName.includes('木曜')) return 4
  if (schoolName.includes('金曜')) return 5
  if (schoolName.includes('土曜')) return 6
  return 0 // デフォルトは日曜日
}

// スクールの週の範囲を取得（前日0:00 ~ 当日23:59）
function getSchoolWeekRange(schoolDayOfWeek: number): { start: Date; end: Date } {
  const now = new Date()
  const currentDayOfWeek = now.getDay()

  // スクール日までの日数を計算（前週のスクール日の次の日から今週のスクール日まで）
  let daysFromSchoolDay = currentDayOfWeek - schoolDayOfWeek
  if (daysFromSchoolDay < 0) {
    daysFromSchoolDay += 7
  }

  // 今週のスクール日を計算
  const schoolDay = new Date(now)
  schoolDay.setDate(now.getDate() - daysFromSchoolDay)
  schoolDay.setHours(23, 59, 59, 999)

  // 週の開始日（前日の0:00）
  const weekStart = new Date(schoolDay)
  weekStart.setDate(schoolDay.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  return {
    start: weekStart,
    end: schoolDay
  }
}

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

    // 選択されたスクール情報を取得（週の範囲を計算するため）
    const schoolsData = await prisma.school.findMany({
      where: {
        id: {
          in: schoolIds
        }
      }
    })

    // 複数スクールの場合は最初のスクールの曜日を使用
    const primarySchool = schoolsData[0]
    if (!primarySchool) {
      return NextResponse.json([])
    }

    const schoolDayOfWeek = getSchoolDayOfWeek(primarySchool.name)
    const { start: weekStart, end: weekEnd } = getSchoolWeekRange(schoolDayOfWeek)

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

    // 開発日数を計算
    const ranking = users.map(user => {
      // セッションの開始日を取得してユニークな日付のセットを作成
      const developmentDates = new Set<string>()

      user.sessions.forEach(session => {
        const sessionDate = new Date(session.startTime)
        // YYYY-MM-DD形式で日付をキーにする
        const dateKey = sessionDate.toISOString().split('T')[0]
        developmentDates.add(dateKey)
      })

      const daysCount = developmentDates.size
      const isCurrentlyActive = user.sessions.some(s => s.isActive)

      return {
        id: user.id,
        name: user.name,
        courses: user.courses,
        schools: user.schoolLinks.map(link => ({
          id: link.school.id,
          name: link.school.name
        })),
        avatar: user.avatar,
        daysCount,
        isActive: isCurrentlyActive
      }
    })

    // 開発日数が1日以上のメンバーのみフィルタリング
    const filteredRanking = ranking.filter(user => user.daysCount > 0)

    // 開発日数でソート
    filteredRanking.sort((a, b) => b.daysCount - a.daysCount)

    return NextResponse.json(filteredRanking)
  } catch (error) {
    console.error('Ranking fetch error:', error)
    return NextResponse.json(
      { error: 'ランキング取得エラー' },
      { status: 500 }
    )
  }
}

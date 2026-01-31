import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// バレンタインイベント期間（JST）
const EVENT_START = new Date('2026-01-31T00:00:00+09:00')
const EVENT_END = new Date('2026-02-13T23:59:59+09:00')
const RESULT_DISPLAY_END = new Date('2026-02-28T23:59:59+09:00')

// 既存のバッジID
const BADGE_IDS = {
  chocolate1: 'cml22hq6k0000juzs6dg3j02h',   // チョコ1個 (10h開発)
  chocolate10: 'cml22hzuo0001juzsdj1pmo8f',  // チョコ10個 (19h開発)
  chocolate20: 'cml22ia5t0002juzsoz972bvq'   // チョコ20個 (29h開発)
}

// イベント期間内かどうかをチェック
function isEventPeriod(date: Date): boolean {
  return date >= EVENT_START && date <= EVENT_END
}

// 結果表示期間内かどうかをチェック
function isResultDisplayPeriod(date: Date): boolean {
  return date > EVENT_END && date <= RESULT_DISPLAY_END
}

// 進捗ステージを計算
function getProgressStage(hours: number): string {
  if (hours < 2) return 'none'
  if (hours < 4) return 'ingredients'
  if (hours < 6) return 'melting'
  if (hours < 8) return 'molding'
  if (hours < 10) return 'cooling'
  return 'complete'
}

// 完成チョコ数を計算
function getChocolateCount(hours: number): number {
  if (hours < 10) return 0
  return Math.floor(hours - 9)
}

// バレンタイン進捗を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const now = new Date()

    // イベント期間外かつ結果表示期間外
    if (!isEventPeriod(now) && !isResultDisplayPeriod(now)) {
      return NextResponse.json({
        isEventPeriod: false,
        isResultPeriod: false,
        message: 'イベント期間外です'
      })
    }

    // イベント期間中のセッションを取得
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        startTime: {
          gte: EVENT_START,
          lte: EVENT_END
        },
        isActive: false,
        duration: { not: null }
      },
      select: {
        duration: true,
        startTime: true
      }
    })

    // アクティブセッションがあれば、経過時間を加算（イベント期間中のみ）
    let activeSessionSeconds = 0
    if (isEventPeriod(now)) {
      const activeSession = await prisma.session.findFirst({
        where: {
          userId,
          isActive: true,
          startTime: {
            gte: EVENT_START
          }
        },
        select: {
          startTime: true
        }
      })

      if (activeSession) {
        const elapsed = Math.floor((now.getTime() - new Date(activeSession.startTime).getTime()) / 1000)
        activeSessionSeconds = Math.max(0, elapsed)
      }
    }

    // 合計時間を計算
    const completedSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const totalSeconds = completedSeconds + activeSessionSeconds
    const totalHours = totalSeconds / 3600

    // 進捗情報を計算
    const progressStage = getProgressStage(totalHours)
    const chocolateCount = getChocolateCount(totalHours)

    // 次のステージまでの時間
    let nextStageHours: number | null = null
    if (progressStage === 'none') nextStageHours = 2
    else if (progressStage === 'ingredients') nextStageHours = 4
    else if (progressStage === 'melting') nextStageHours = 6
    else if (progressStage === 'molding') nextStageHours = 8
    else if (progressStage === 'cooling') nextStageHours = 10

    // バッジ情報を取得
    const badges = await prisma.badge.findMany({
      where: {
        id: { in: Object.values(BADGE_IDS) }
      },
      select: {
        id: true,
        name: true,
        icon: true
      }
    })

    const badgeInfo = {
      chocolate1: badges.find(b => b.id === BADGE_IDS.chocolate1),
      chocolate10: badges.find(b => b.id === BADGE_IDS.chocolate10),
      chocolate20: badges.find(b => b.id === BADGE_IDS.chocolate20)
    }

    return NextResponse.json({
      isEventPeriod: isEventPeriod(now),
      isResultPeriod: isResultDisplayPeriod(now),
      totalSeconds,
      totalHours: Math.round(totalHours * 100) / 100,
      chocolateCount,
      progressStage,
      nextStageHours,
      eventStartDate: EVENT_START.toISOString(),
      eventEndDate: EVENT_END.toISOString(),
      badges: badgeInfo
    })
  } catch (error) {
    console.error('Valentine progress error:', error)
    return NextResponse.json(
      { error: '進捗取得エラー' },
      { status: 500 }
    )
  }
}

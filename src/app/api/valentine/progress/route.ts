import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValentineProgressTotals } from '@/lib/valentine-progress'
import {
  isValentineEventPeriod,
  isValentineResultDisplayPeriod,
  VALENTINE_EVENT_END,
  VALENTINE_EVENT_START,
} from '@/lib/valentine'

// 既存のバッジID
const BADGE_IDS = {
  chocolate1: 'cml22hq6k0000juzs6dg3j02h',   // チョコ1個 (10h開発)
  chocolate10: 'cml22hzuo0001juzsdj1pmo8f',  // チョコ10個 (19h開発)
  chocolate20: 'cml22ia5t0002juzsoz972bvq'   // チョコ20個 (29h開発)
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
    if (!isValentineEventPeriod(now) && !isValentineResultDisplayPeriod(now)) {
      return NextResponse.json({
        isEventPeriod: false,
        isResultPeriod: false,
        message: 'イベント期間外です'
      })
    }

    const { totalSeconds, totalHours, chocolateCount } = await getValentineProgressTotals(userId, now)

    // 進捗情報を計算
    const progressStage = getProgressStage(totalHours)

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
      isEventPeriod: isValentineEventPeriod(now),
      isResultPeriod: isValentineResultDisplayPeriod(now),
      totalSeconds,
      totalHours: Math.round(totalHours * 100) / 100,
      chocolateCount,
      progressStage,
      nextStageHours,
      eventStartDate: VALENTINE_EVENT_START.toISOString(),
      eventEndDate: VALENTINE_EVENT_END.toISOString(),
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

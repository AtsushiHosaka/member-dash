import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// バレンタインイベント期間（JST）
const EVENT_START = new Date('2026-01-31T00:00:00+09:00')
const EVENT_END = new Date('2026-02-13T23:59:59+09:00')

// 既存のバッジIDを使用
const BADGE_IDS = {
  chocolate1: 'cml22hq6k0000juzs6dg3j02h',   // チョコ1個 (10h開発)
  chocolate10: 'cml22hzuo0001juzsdj1pmo8f',  // チョコ10個 (19h開発)
  chocolate20: 'cml22ia5t0002juzsoz972bvq'   // チョコ20個 (29h開発)
}

// 完成チョコ数を計算
function getChocolateCount(hours: number): number {
  if (hours < 10) return 0
  return Math.floor(hours - 9)
}

// Cron認証またはadmin認証をチェック
async function checkAuth(request: Request) {
  // Vercel Cronからのリクエストをチェック
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return { authorized: true, isAdmin: false }
  }

  // 管理者セッションをチェック
  const session = await getServerSession(authOptions)
  if (session?.user && (session.user as any).role === 'admin') {
    return { authorized: true, isAdmin: true }
  }

  return { authorized: false, isAdmin: false }
}

// バレンタイン報酬を付与（Cron/管理者用）
export async function POST(request: Request) {
  try {
    const auth = await checkAuth(request)

    if (!auth.authorized) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // 全ユーザーを取得
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true
      }
    })

    // 既存のバッジを取得
    const badge1 = await prisma.badge.findUnique({ where: { id: BADGE_IDS.chocolate1 } })
    const badge10 = await prisma.badge.findUnique({ where: { id: BADGE_IDS.chocolate10 } })
    const badge20 = await prisma.badge.findUnique({ where: { id: BADGE_IDS.chocolate20 } })

    if (!badge1 || !badge10 || !badge20) {
      return NextResponse.json({ error: 'バレンタインバッジが見つかりません' }, { status: 500 })
    }

    const results = {
      processedUsers: 0,
      badgesAwarded: {
        chocolate1: 0,
        chocolate10: 0,
        chocolate20: 0
      },
      totalTicketsAwarded: 0,
      details: [] as { userId: string; name: string; hours: number; chocolates: number; tickets: number; badges: string[] }[]
    }

    // 各ユーザーの開発時間を集計して報酬を付与
    for (const user of users) {
      // イベント期間中のセッションを取得
      const sessions = await prisma.session.findMany({
        where: {
          userId: user.id,
          startTime: {
            gte: EVENT_START,
            lte: EVENT_END
          },
          isActive: false,
          duration: { not: null }
        },
        select: {
          duration: true
        }
      })

      // 合計時間を計算
      const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      const totalHours = totalSeconds / 3600
      const chocolateCount = getChocolateCount(totalHours)

      // チョコがない場合はスキップ
      if (chocolateCount === 0) continue

      results.processedUsers++

      const userDetail = {
        userId: user.id,
        name: user.name,
        hours: Math.round(totalHours * 100) / 100,
        chocolates: chocolateCount,
        tickets: chocolateCount * 3,
        badges: [] as string[]
      }

      // ガチャチケットを付与
      await prisma.user.update({
        where: { id: user.id },
        data: {
          gachaTickets: {
            increment: chocolateCount * 3
          }
        }
      })
      results.totalTicketsAwarded += chocolateCount * 3

      // バッジを付与
      const badgesToAward: { badge: typeof badge1; key: keyof typeof results.badgesAwarded }[] = []

      if (chocolateCount >= 1) {
        badgesToAward.push({ badge: badge1, key: 'chocolate1' })
      }
      if (chocolateCount >= 10) {
        badgesToAward.push({ badge: badge10, key: 'chocolate10' })
      }
      if (chocolateCount >= 20) {
        badgesToAward.push({ badge: badge20, key: 'chocolate20' })
      }

      for (const { badge, key } of badgesToAward) {
        // allowedUserIdsにユーザーIDを追加
        if (!badge.allowedUserIds.includes(user.id)) {
          await prisma.badge.update({
            where: { id: badge.id },
            data: {
              allowedUserIds: {
                push: user.id
              }
            }
          })
        }

        // UserBadgeを作成（既存チェック）
        const existingUserBadge = await prisma.userBadge.findFirst({
          where: {
            userId: user.id,
            badgeId: badge.id
          }
        })

        if (!existingUserBadge) {
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: badge.id
            }
          })
          results.badgesAwarded[key]++
          userDetail.badges.push(badge.name)
        }
      }

      results.details.push(userDetail)
    }

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('Valentine reward error:', error)
    return NextResponse.json(
      { error: '報酬付与エラー' },
      { status: 500 }
    )
  }
}

// 報酬付与状況を確認（管理者用）
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // バッジの付与状況を確認
    const badges = await prisma.badge.findMany({
      where: {
        id: {
          in: Object.values(BADGE_IDS)
        }
      },
      include: {
        userBadges: {
          select: {
            userId: true,
            obtainedAt: true
          }
        }
      }
    })

    return NextResponse.json({
      badges: badges.map(b => ({
        name: b.name,
        allowedUserCount: b.allowedUserIds.length,
        awardedCount: b.userBadges.length
      }))
    })
  } catch (error) {
    console.error('Valentine reward status error:', error)
    return NextResponse.json(
      { error: 'ステータス取得エラー' },
      { status: 500 }
    )
  }
}

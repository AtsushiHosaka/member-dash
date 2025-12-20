import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// イベント期間（2025/12/20〜2026/1/10）
const EVENT_START = new Date('2025-12-20T00:00:00+09:00')
const EVENT_END = new Date('2026-01-10T23:59:59+09:00')

// イベント期間内かどうかをチェック
function isEventPeriod(date: Date): boolean {
  return date >= EVENT_START && date <= EVENT_END
}

// 日付を00:00:00に正規化（日本時間）
function normalizeToDateOnly(date: Date): Date {
  const jstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  return new Date(Date.UTC(jstDate.getFullYear(), jstDate.getMonth(), jstDate.getDate()))
}

// 継続日数に応じたチケット枚数を計算（1〜5枚、最大5枚）
function calculateTickets(consecutiveDays: number): number {
  return Math.min(consecutiveDays, 5)
}

// ログインボーナスをチェック/取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const now = new Date()
    const year = now.getFullYear()

    // イベント期間外
    if (!isEventPeriod(now)) {
      return NextResponse.json({
        isEventPeriod: false,
        message: 'イベント期間外です'
      })
    }

    const today = normalizeToDateOnly(now)

    // 今日のボーナスを既に受け取っているかチェック
    const todayBonus = await prisma.christmasLoginBonus.findUnique({
      where: {
        userId_year_loginDate: {
          userId,
          year,
          loginDate: today
        }
      }
    })

    // 今年のログインボーナス履歴を取得
    const bonusHistory = await prisma.christmasLoginBonus.findMany({
      where: {
        userId,
        year
      },
      orderBy: {
        loginDate: 'desc'
      }
    })

    // 7日継続バッジを取得済みかチェック
    const sevenDayBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: {
          icon: {
            contains: 'christmas-25-7-days-continuous'
          }
        }
      },
      include: {
        badge: true
      }
    })

    return NextResponse.json({
      isEventPeriod: true,
      alreadyClaimed: !!todayBonus,
      todayBonus,
      bonusHistory,
      totalConsecutiveDays: bonusHistory.length > 0 ? Math.max(...bonusHistory.map(b => b.consecutiveDays)) : 0,
      hasSevenDayBadge: !!sevenDayBadge
    })
  } catch (error) {
    console.error('Christmas bonus check error:', error)
    return NextResponse.json(
      { error: 'ボーナスチェックエラー' },
      { status: 500 }
    )
  }
}

// ログインボーナスを受け取る
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const now = new Date()
    const year = now.getFullYear()

    // イベント期間外
    if (!isEventPeriod(now)) {
      return NextResponse.json({
        success: false,
        error: 'イベント期間外です'
      }, { status: 400 })
    }

    const today = normalizeToDateOnly(now)

    // 今日のボーナスを既に受け取っているかチェック
    const existingBonus = await prisma.christmasLoginBonus.findUnique({
      where: {
        userId_year_loginDate: {
          userId,
          year,
          loginDate: today
        }
      }
    })

    if (existingBonus) {
      return NextResponse.json({
        success: false,
        error: '今日のボーナスは既に受け取っています',
        bonus: existingBonus
      }, { status: 400 })
    }

    // 昨日のボーナスをチェック（継続日数計算用）
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)

    const yesterdayBonus = await prisma.christmasLoginBonus.findUnique({
      where: {
        userId_year_loginDate: {
          userId,
          year,
          loginDate: yesterday
        }
      }
    })

    // 継続日数を計算
    let consecutiveDays = 1
    if (yesterdayBonus) {
      consecutiveDays = yesterdayBonus.consecutiveDays + 1
    }

    // チケット枚数を計算
    const ticketsEarned = calculateTickets(consecutiveDays)

    // トランザクションでボーナス記録とチケット付与を行う
    const result = await prisma.$transaction(async (tx) => {
      // ボーナス記録を作成
      const bonus = await tx.christmasLoginBonus.create({
        data: {
          userId,
          year,
          loginDate: today,
          consecutiveDays,
          ticketsEarned
        }
      })

      // ユーザーのガチャチケットを増やす
      await tx.user.update({
        where: { id: userId },
        data: {
          gachaTickets: {
            increment: ticketsEarned
          }
        }
      })

      // 7日継続でバッジを付与
      let badgeAwarded = null
      if (consecutiveDays === 7) {
        // 7日継続バッジを検索
        const sevenDayBadge = await tx.badge.findFirst({
          where: {
            icon: {
              contains: 'christmas-25-7-days-continuous'
            }
          }
        })

        if (sevenDayBadge) {
          // 既に持っているかチェック
          const existingUserBadge = await tx.userBadge.findFirst({
            where: {
              userId,
              badgeId: sevenDayBadge.id
            }
          })

          if (!existingUserBadge) {
            const userBadge = await tx.userBadge.create({
              data: {
                userId,
                badgeId: sevenDayBadge.id
              },
              include: {
                badge: true
              }
            })
            badgeAwarded = userBadge.badge
          }
        }
      }

      return { bonus, badgeAwarded }
    })

    // 更新後のユーザー情報を取得
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { gachaTickets: true }
    })

    return NextResponse.json({
      success: true,
      bonus: result.bonus,
      ticketsEarned,
      consecutiveDays,
      totalTickets: updatedUser?.gachaTickets || 0,
      badgeAwarded: result.badgeAwarded
    })
  } catch (error) {
    console.error('Christmas bonus claim error:', error)
    return NextResponse.json(
      { error: 'ボーナス取得エラー' },
      { status: 500 }
    )
  }
}

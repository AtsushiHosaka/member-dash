import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// レアリティ別の確率設定
const RARITY_WEIGHTS = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3
}

// ランダムにバッジを選択する関数
function selectRandomBadge(badges: any[]) {
  // レアリティごとにバッジをグループ化
  const badgesByRarity: { [key: string]: any[] } = {
    common: [],
    rare: [],
    epic: [],
    legendary: []
  }

  badges.forEach(badge => {
    if (badgesByRarity[badge.rarity]) {
      badgesByRarity[badge.rarity].push(badge)
    }
  })

  // 総重みを計算
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0)

  // ランダム値を生成
  const random = Math.random() * totalWeight
  let cumulativeWeight = 0

  // レアリティを決定
  let selectedRarity = 'common'
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulativeWeight += weight
    if (random <= cumulativeWeight) {
      selectedRarity = rarity
      break
    }
  }

  // 選択されたレアリティのバッジからランダムに1つ選択
  const rarityBadges = badgesByRarity[selectedRarity]
  if (rarityBadges.length === 0) {
    // フォールバック: 選択されたレアリティにバッジがない場合、全バッジからランダムに選択
    return badges[Math.floor(Math.random() * badges.length)]
  }

  return rarityBadges[Math.floor(Math.random() * rarityBadges.length)]
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // ユーザー情報とバッジ一覧を取得
    const [user, badges] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { gachaTickets: true }
      }),
      prisma.badge.findMany()
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    if (user.gachaTickets < 1) {
      return NextResponse.json(
        { error: 'ガチャ券が足りません' },
        { status: 400 }
      )
    }

    if (badges.length === 0) {
      return NextResponse.json(
        { error: 'バッジが存在しません' },
        { status: 500 }
      )
    }

    // ランダムにバッジを選択
    const selectedBadge = selectRandomBadge(badges)

    // トランザクションでガチャ券を消費し、バッジを付与
    const [, userBadge] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          gachaTickets: {
            decrement: 1
          }
        }
      }),
      prisma.userBadge.create({
        data: {
          userId,
          badgeId: selectedBadge.id
        },
        include: {
          badge: true
        }
      })
    ])

    return NextResponse.json({
      success: true,
      badge: userBadge.badge,
      remainingTickets: user.gachaTickets - 1
    })
  } catch (error) {
    console.error('Gacha draw error:', error)
    return NextResponse.json(
      { error: 'ガチャの実行に失敗しました' },
      { status: 500 }
    )
  }
}

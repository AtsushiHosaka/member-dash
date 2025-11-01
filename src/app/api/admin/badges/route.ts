import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// バッジ一覧を取得（管理者のみ）
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const badges = await prisma.badge.findMany({
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(badges)
  } catch (error) {
    console.error('Badges fetch error:', error)
    return NextResponse.json(
      { error: 'バッジ取得エラー' },
      { status: 500 }
    )
  }
}

// バッジを追加（管理者のみ）
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, icon, rarity } = body

    // バリデーション
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'バッジ名は必須です' },
        { status: 400 }
      )
    }

    if (!icon || !icon.trim()) {
      return NextResponse.json(
        { error: 'アイコンは必須です' },
        { status: 400 }
      )
    }

    if (!rarity || !['common', 'rare', 'epic', 'legendary'].includes(rarity)) {
      return NextResponse.json(
        { error: 'レアリティは必須です（common, rare, epic, legendary）' },
        { status: 400 }
      )
    }

    const badge = await prisma.badge.create({
      data: {
        name: name.trim(),
        icon: icon.trim(),
        rarity
      }
    })

    return NextResponse.json(badge)
  } catch (error) {
    console.error('Badge creation error:', error)
    return NextResponse.json(
      { error: 'バッジ作成エラー' },
      { status: 500 }
    )
  }
}

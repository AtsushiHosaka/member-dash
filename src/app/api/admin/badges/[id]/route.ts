import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// バッジを削除（管理者・メンター）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    if (userRole !== 'admin' && userRole !== 'mentor') {
      return NextResponse.json(
        { error: '管理者またはメンター権限が必要です' },
        { status: 403 }
      )
    }

    const { id } = await params

    // バッジが存在するか確認
    const badge = await prisma.badge.findUnique({
      where: { id }
    })

    if (!badge) {
      return NextResponse.json(
        { error: 'バッジが見つかりません' },
        { status: 404 }
      )
    }

    // バッジを削除（UserBadgeもCascade削除される）
    await prisma.badge.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'バッジを削除しました' })
  } catch (error) {
    console.error('Badge deletion error:', error)
    return NextResponse.json(
      { error: 'バッジ削除エラー' },
      { status: 500 }
    )
  }
}

// バッジを編集（管理者・メンター）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    if (userRole !== 'admin' && userRole !== 'mentor') {
      return NextResponse.json(
        { error: '管理者またはメンター権限が必要です' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, icon, rarity, isPublic, allowedUserIds } = body

    // バッジが存在するか確認
    const badge = await prisma.badge.findUnique({
      where: { id }
    })

    if (!badge) {
      return NextResponse.json(
        { error: 'バッジが見つかりません' },
        { status: 404 }
      )
    }

    // バリデーション
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        { error: 'バッジ名は必須です' },
        { status: 400 }
      )
    }

    if (icon !== undefined && (!icon || !icon.trim())) {
      return NextResponse.json(
        { error: 'バッジ画像は必須です' },
        { status: 400 }
      )
    }

    // レアリティのバリデーション
    const validRarities = ['common', 'rare', 'epic', 'legendary']
    const validatedRarity = rarity && validRarities.includes(rarity) ? rarity : undefined

    // バッジを更新
    const updatedBadge = await prisma.badge.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(icon !== undefined && { icon: icon.trim() }),
        ...(validatedRarity !== undefined && { rarity: validatedRarity }),
        ...(isPublic !== undefined && { isPublic }),
        ...(allowedUserIds !== undefined && { allowedUserIds })
      }
    })

    return NextResponse.json(updatedBadge)
  } catch (error) {
    console.error('Badge update error:', error)
    return NextResponse.json(
      { error: 'バッジ更新エラー' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// スクール情報を更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'スクール名が必要です' },
        { status: 400 }
      )
    }

    const { id } = await params

    const school = await prisma.school.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json(school)
  } catch (error) {
    console.error('School update error:', error)
    return NextResponse.json(
      { error: 'スクール更新エラー' },
      { status: 500 }
    )
  }
}

// スクールを削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // スクールに所属するユーザーも削除される（Cascadeが設定されている場合）
    await prisma.school.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'スクールを削除しました' })
  } catch (error) {
    console.error('School deletion error:', error)
    return NextResponse.json(
      { error: 'スクール削除エラー' },
      { status: 500 }
    )
  }
}

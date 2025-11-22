import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 選択肢を削除（管理者・メンター）
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

    // 選択肢を削除（関連する投票もCascade削除される）
    await prisma.namingPollOption.delete({
      where: { id }
    })

    return NextResponse.json({ message: '選択肢を削除しました' })
  } catch (error) {
    console.error('Option deletion error:', error)
    return NextResponse.json(
      { error: '選択肢削除エラー' },
      { status: 500 }
    )
  }
}

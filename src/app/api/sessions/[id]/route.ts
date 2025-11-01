import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// セッションを終了
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { description } = await request.json()

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: '開発内容の入力は必須です' },
        { status: 400 }
      )
    }

    const { id } = await params

    const devSession = await prisma.session.findUnique({
      where: { id }
    })

    if (!devSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    if (devSession.userId !== (session.user as any).id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const endTime = new Date()
    const duration = Math.floor(
      (endTime.getTime() - devSession.startTime.getTime()) / 1000
    )

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        endTime,
        duration,
        description,
        isActive: false
      }
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Session end error:', error)
    return NextResponse.json(
      { error: 'セッション終了エラー' },
      { status: 500 }
    )
  }
}

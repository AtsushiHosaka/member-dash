import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 開発セッションを開始
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // 既にアクティブなセッションがないか確認
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        isActive: true
      }
    })

    if (activeSession) {
      return NextResponse.json(
        { error: '既に開発中のセッションがあります' },
        { status: 400 }
      )
    }

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。再度ログインしてください。' },
        { status: 404 }
      )
    }

    const devSession = await prisma.session.create({
      data: {
        userId,
        isActive: true
      }
    })

    return NextResponse.json(devSession, { status: 201 })
  } catch (error) {
    console.error('Session start error:', error)

    // Prisma外部キー制約エラーの場合
    if ((error as any).code === 'P2003') {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。再度ログインしてください。' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'セッション開始エラー' },
      { status: 500 }
    )
  }
}

// アクティブなセッションを取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        isActive: true
      }
    })

    return NextResponse.json({ session: activeSession })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'セッション取得エラー' },
      { status: 500 }
    )
  }
}

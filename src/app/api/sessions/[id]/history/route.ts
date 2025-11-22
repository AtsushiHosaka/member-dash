import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 編集履歴を取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = params

    // セッションの編集履歴を取得
    const history = await prisma.sessionEditHistory.findMany({
      where: { sessionId: id },
      orderBy: { editedAt: 'desc' }
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { error: '履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}

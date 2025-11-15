import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// セッションの編集履歴を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // セッションの編集履歴を取得
    const history = await prisma.sessionEditHistory.findMany({
      where: { sessionId: id },
      orderBy: { editedAt: 'desc' }
    })

    // 編集したユーザーの情報を取得
    const editorIds = [...new Set(history.map(h => h.editedBy))]
    const editors = await prisma.user.findMany({
      where: { id: { in: editorIds } },
      select: { id: true, name: true, userId: true }
    })

    const editorMap = new Map(editors.map(e => [e.id, e]))

    // 編集者情報を含めた履歴を返す
    const historyWithEditors = history.map(h => ({
      ...h,
      editor: editorMap.get(h.editedBy) || null
    }))

    return NextResponse.json(historyWithEditors)
  } catch (error) {
    console.error('Session history fetch error:', error)
    return NextResponse.json(
      { error: '編集履歴取得エラー' },
      { status: 500 }
    )
  }
}

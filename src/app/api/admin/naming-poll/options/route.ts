import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 選択肢を追加（管理者・メンター）
export async function POST(request: Request) {
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

    const body = await request.json()
    const { text } = body

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '選択肢のテキストは必須です' },
        { status: 400 }
      )
    }

    // 投票を取得または作成
    let poll = await prisma.namingPoll.findFirst()

    if (!poll) {
      poll = await prisma.namingPoll.create({
        data: {
          isActive: false
        }
      })
    }

    // 選択肢を追加
    const option = await prisma.namingPollOption.create({
      data: {
        pollId: poll.id,
        text: text.trim()
      }
    })

    return NextResponse.json(option)
  } catch (error) {
    console.error('Option creation error:', error)
    return NextResponse.json(
      { error: '選択肢追加エラー' },
      { status: 500 }
    )
  }
}

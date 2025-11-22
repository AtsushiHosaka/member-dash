import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 投票情報を取得（全ユーザー）
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // アクティブな投票を取得
    const poll = await prisma.namingPoll.findFirst({
      where: { isActive: true },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        votes: {
          where: {
            userId
          }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({ poll: null, hasVoted: false })
    }

    // このユーザーが投票済みかどうか
    const hasVoted = poll.votes.length > 0
    const votedOptionId = hasVoted ? poll.votes[0].optionId : null

    return NextResponse.json({
      poll: {
        id: poll.id,
        options: poll.options
      },
      hasVoted,
      votedOptionId
    })
  } catch (error) {
    console.error('Naming poll fetch error:', error)
    return NextResponse.json(
      { error: '投票取得エラー' },
      { status: 500 }
    )
  }
}

// 投票する（全ユーザー）
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { optionId } = body

    if (!optionId) {
      return NextResponse.json(
        { error: '選択肢を選んでください' },
        { status: 400 }
      )
    }

    // アクティブな投票を取得
    const poll = await prisma.namingPoll.findFirst({
      where: { isActive: true }
    })

    if (!poll) {
      return NextResponse.json(
        { error: '現在投票は受け付けていません' },
        { status: 400 }
      )
    }

    // 選択肢が存在するか確認
    const option = await prisma.namingPollOption.findUnique({
      where: { id: optionId }
    })

    if (!option || option.pollId !== poll.id) {
      return NextResponse.json(
        { error: '無効な選択肢です' },
        { status: 400 }
      )
    }

    // 既に投票済みか確認
    const existingVote = await prisma.namingPollVote.findUnique({
      where: {
        pollId_userId: {
          pollId: poll.id,
          userId
        }
      }
    })

    if (existingVote) {
      return NextResponse.json(
        { error: '既に投票済みです' },
        { status: 400 }
      )
    }

    // 投票を記録
    const vote = await prisma.namingPollVote.create({
      data: {
        pollId: poll.id,
        optionId,
        userId
      }
    })

    return NextResponse.json({ success: true, vote })
  } catch (error) {
    console.error('Vote creation error:', error)
    return NextResponse.json(
      { error: '投票エラー' },
      { status: 500 }
    )
  }
}

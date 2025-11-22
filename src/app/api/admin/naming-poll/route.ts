import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 投票設定を取得または作成（管理者・メンター）
export async function GET(request: Request) {
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

    // 既存の投票を取得、なければ作成
    let poll = await prisma.namingPoll.findFirst({
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
        }
      }
    })

    if (!poll) {
      poll = await prisma.namingPoll.create({
        data: {
          isActive: false
        },
        include: {
          options: {
            include: {
              _count: {
                select: {
                  votes: true
                }
              }
            }
          }
        }
      })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Naming poll fetch error:', error)
    return NextResponse.json(
      { error: '投票設定取得エラー' },
      { status: 500 }
    )
  }
}

// 投票の表示/非表示を切り替え（管理者・メンター）
export async function PATCH(request: Request) {
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
    const { isActive } = body

    // 投票を取得または作成
    let poll = await prisma.namingPoll.findFirst()

    if (!poll) {
      poll = await prisma.namingPoll.create({
        data: {
          isActive: isActive ?? false
        }
      })
    } else {
      poll = await prisma.namingPoll.update({
        where: { id: poll.id },
        data: { isActive }
      })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Naming poll update error:', error)
    return NextResponse.json(
      { error: '投票設定更新エラー' },
      { status: 500 }
    )
  }
}

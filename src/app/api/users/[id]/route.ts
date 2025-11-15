import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        schoolLinks: {
          include: {
            school: true
          }
        },
        mentor: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        },
        sessions: {
          include: {
            _count: {
              select: {
                editHistory: true
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          }
        },
        userBadges: {
          include: {
            badge: true
          },
          orderBy: {
            obtainedAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // パスワードを除外
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'ユーザー取得エラー' },
      { status: 500 }
    )
  }
}

// ユーザープロフィールを更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as any).id

    // 自分のプロフィールのみ編集可能（管理者は除く）
    const userRole = (session.user as any).role
    if (id !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { name, courses, schoolIds, avatar } = await request.json()

    // バリデーション
    if (courses && (!Array.isArray(courses) || courses.length === 0)) {
      return NextResponse.json(
        { error: 'コースは1つ以上選択してください' },
        { status: 400 }
      )
    }

    if (schoolIds && (!Array.isArray(schoolIds) || schoolIds.length === 0)) {
      return NextResponse.json(
        { error: '校舎は1つ以上選択してください' },
        { status: 400 }
      )
    }

    // トランザクションで更新
    const updatedUser = await prisma.$transaction(async (tx) => {
      // ユーザー情報を更新
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(courses && { courses }),
          ...(avatar !== undefined && { avatar })
        }
      })

      // schoolIdsが提供された場合、schoolLinksを更新
      if (schoolIds) {
        // 既存のschoolLinksを削除
        await tx.userSchool.deleteMany({
          where: { userId: id }
        })

        // 新しいschoolLinksを作成
        await Promise.all(
          schoolIds.map((schoolId: string) =>
            tx.userSchool.create({
              data: {
                userId: id,
                schoolId
              }
            })
          )
        )
      }

      // 更新後のユーザー情報を取得
      return await tx.user.findUnique({
        where: { id },
        include: {
          schoolLinks: {
            include: {
              school: true
            }
          },
          userBadges: {
            include: {
              badge: true
            },
            orderBy: {
              obtainedAt: 'desc'
            }
          }
        }
      })
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // パスワードを除外
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'ユーザー更新エラー' },
      { status: 500 }
    )
  }
}

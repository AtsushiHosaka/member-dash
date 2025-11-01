import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 現在のユーザー情報を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

// 現在のユーザー情報を更新
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { name, avatar, courses, schoolIds } = body

    // バリデーション
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '名前は必須です' },
        { status: 400 }
      )
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json(
        { error: '少なくとも1つのコースを選択してください' },
        { status: 400 }
      )
    }

    if (!schoolIds || schoolIds.length === 0) {
      return NextResponse.json(
        { error: '少なくとも1つの校舎を選択してください' },
        { status: 400 }
      )
    }

    // トランザクションで更新
    const updatedUser = await prisma.$transaction(async (tx) => {
      // ユーザー情報を更新
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          avatar: avatar || null,
          courses: courses
        }
      })

      // 既存のスクールリンクを削除
      await tx.userSchool.deleteMany({
        where: { userId }
      })

      // 新しいスクールリンクを作成
      await tx.userSchool.createMany({
        data: schoolIds.map((schoolId: string) => ({
          userId,
          schoolId
        }))
      })

      // 更新後のユーザー情報を取得（schoolLinksを含む）
      return await tx.user.findUnique({
        where: { id: userId },
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
        { error: 'ユーザー更新エラー' },
        { status: 500 }
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

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ユーザー情報を更新（管理者のみ）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, courses, schoolIds, role } = body

    // バリデーション
    if (role && role !== 'admin' && role !== 'member') {
      return NextResponse.json(
        { error: 'ロールはadminまたはmemberである必要があります' },
        { status: 400 }
      )
    }

    if (courses && (!Array.isArray(courses) || courses.length === 0)) {
      return NextResponse.json(
        { error: '少なくとも1つのコースを選択してください' },
        { status: 400 }
      )
    }

    if (schoolIds && (!Array.isArray(schoolIds) || schoolIds.length === 0)) {
      return NextResponse.json(
        { error: '少なくとも1つのスクールを選択してください' },
        { status: 400 }
      )
    }

    const { id } = await params

    // トランザクションで更新
    const user = await prisma.$transaction(async (tx) => {
      // 基本情報を更新
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(courses && { courses }),
          ...(role && { role })
        }
      })

      // スクールリンクを更新
      if (schoolIds) {
        // 既存のスクールリンクを削除
        await tx.userSchool.deleteMany({
          where: { userId: id }
        })

        // 新しいスクールリンクを作成
        await tx.userSchool.createMany({
          data: schoolIds.map((schoolId: string) => ({
            userId: id,
            schoolId
          }))
        })
      }

      return updatedUser
    })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'ユーザー更新エラー' },
      { status: 500 }
    )
  }
}

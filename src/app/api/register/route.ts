import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { userId, password, name, courses, schoolIds, avatar } = await request.json()

    if (!userId || !password || !name || !courses || !Array.isArray(courses) || courses.length === 0 || !schoolIds || !Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このユーザーIDは既に登録されています' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        userId,
        password: hashedPassword,
        name,
        courses,
        avatar: avatar || null,
        role: 'member'
      }
    })

    // 校舎リンクを作成
    await Promise.all(
      schoolIds.map((schoolId: string) =>
        prisma.userSchool.create({
          data: {
            userId: user.id,
            schoolId
          }
        })
      )
    )

    return NextResponse.json(
      {
        message: 'ユーザー登録が完了しました',
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '登録中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

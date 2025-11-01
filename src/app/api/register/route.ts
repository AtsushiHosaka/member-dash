import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { userId, password, name, course, schoolId } = await request.json()

    if (!userId || !password || !name || !course || !schoolId) {
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
        course,
        schoolId,
        role: 'member'
      }
    })

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

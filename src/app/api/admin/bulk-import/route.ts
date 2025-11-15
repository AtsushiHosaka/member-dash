import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface ImportUser {
  userId: string
  password: string
  name: string
  courses: string[]
  schoolName: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const currentUserId = (session.user as any).userId

    // 管理者権限チェック
    if (currentUserId !== 'admin_lit_mentor') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { users } = await request.json()

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'ユーザーデータが無効です' },
        { status: 400 }
      )
    }

    const results = {
      success: [] as string[],
      errors: [] as { line: number; userId: string; error: string }[]
    }

    // スクール名からIDへのマッピングを取得
    const schools = await prisma.school.findMany()
    const schoolMap = new Map(schools.map(s => [s.name, s.id]))

    for (let i = 0; i < users.length; i++) {
      const user: ImportUser = users[i]
      const lineNumber = i + 1

      try {
        // バリデーション
        if (!user.userId || !user.password || !user.name || !user.schoolName) {
          results.errors.push({
            line: lineNumber,
            userId: user.userId || '未定義',
            error: '必須項目が不足しています'
          })
          continue
        }

        if (!Array.isArray(user.courses) || user.courses.length === 0) {
          results.errors.push({
            line: lineNumber,
            userId: user.userId,
            error: 'コースが指定されていません'
          })
          continue
        }

        // スクールIDを取得
        const schoolId = schoolMap.get(user.schoolName)
        if (!schoolId) {
          results.errors.push({
            line: lineNumber,
            userId: user.userId,
            error: `スクール「${user.schoolName}」が見つかりません`
          })
          continue
        }

        // 既存ユーザーチェック
        const existingUser = await prisma.user.findUnique({
          where: { userId: user.userId }
        })

        if (existingUser) {
          results.errors.push({
            line: lineNumber,
            userId: user.userId,
            error: 'ユーザーIDが既に存在します'
          })
          continue
        }

        // パスワードハッシュ化
        const hashedPassword = await bcrypt.hash(user.password, 10)

        // ユーザー作成
        await prisma.user.create({
          data: {
            userId: user.userId,
            password: hashedPassword,
            name: user.name,
            courses: user.courses,
            userSchools: {
              create: [
                {
                  schoolId: schoolId
                }
              ]
            }
          }
        })

        results.success.push(user.userId)
      } catch (error) {
        console.error(`Error importing user at line ${lineNumber}:`, error)
        results.errors.push({
          line: lineNumber,
          userId: user.userId,
          error: 'ユーザー作成中にエラーが発生しました'
        })
      }
    }

    return NextResponse.json({
      message: `${results.success.length}件のユーザーを追加しました`,
      results
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: '一括インポート中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

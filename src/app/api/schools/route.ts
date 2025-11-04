import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// スクール一覧を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const schools = await prisma.school.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Schools fetch error:', error)
    return NextResponse.json(
      { error: 'スクール取得エラー' },
      { status: 500 }
    )
  }
}

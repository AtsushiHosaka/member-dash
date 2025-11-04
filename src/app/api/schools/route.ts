import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// スクール一覧を取得（認証不要 - 新規登録画面でも使用）
export async function GET() {
  try {
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

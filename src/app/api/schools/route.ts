import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// スクール一覧を取得
export async function GET(request: Request) {
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

// 新しいスクールを作成（管理機能として）
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'スクール名が必要です' },
        { status: 400 }
      )
    }

    const school = await prisma.school.create({
      data: { name }
    })

    return NextResponse.json(school, { status: 201 })
  } catch (error) {
    console.error('School creation error:', error)
    return NextResponse.json(
      { error: 'スクール作成エラー' },
      { status: 500 }
    )
  }
}

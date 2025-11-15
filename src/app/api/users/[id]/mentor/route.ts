import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// メンター関係をトグル（追加/削除）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const currentUserRole = (session.user as any).role

    // mentorまたはadminのみアクセス可能
    if (currentUserRole !== 'mentor' && currentUserRole !== 'admin') {
      return NextResponse.json(
        { error: 'メンターまたは管理者のみアクセスできます' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { mentorId } = body

    const { id: memberId } = await params

    // 対象ユーザーが存在するか確認
    const targetUser = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // mentorが存在するか確認
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { role: true }
    })

    if (!mentor) {
      return NextResponse.json({ error: 'メンターが見つかりません' }, { status: 404 })
    }

    if (mentor.role !== 'mentor' && mentor.role !== 'admin') {
      return NextResponse.json(
        { error: '指定されたユーザーはメンターではありません' },
        { status: 400 }
      )
    }

    // メンター権限の場合、自分のみ設定可能
    if (currentUserRole === 'mentor' && mentorId !== currentUserId) {
      return NextResponse.json(
        { error: '自分のメンバーのみ設定できます' },
        { status: 403 }
      )
    }

    // 既存の関係をチェック
    const existingRelation = await prisma.mentorMember.findUnique({
      where: {
        mentorId_memberId: {
          mentorId,
          memberId
        }
      }
    })

    let result
    if (existingRelation) {
      // 既に存在する場合は削除
      await prisma.mentorMember.delete({
        where: {
          id: existingRelation.id
        }
      })
      result = { action: 'removed', mentorId, memberId }
    } else {
      // 存在しない場合は追加
      await prisma.mentorMember.create({
        data: {
          mentorId,
          memberId
        }
      })
      result = { action: 'added', mentorId, memberId }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Mentor assignment error:', error)
    return NextResponse.json(
      { error: 'メンター設定エラー' },
      { status: 500 }
    )
  }
}

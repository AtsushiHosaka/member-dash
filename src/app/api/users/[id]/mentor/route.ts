import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ユーザーのメンターを設定（mentoまたはadminのみ）
export async function PUT(
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
    const { mentorId } = body // mentorId が null の場合は削除

    const { id } = await params

    // 対象ユーザーが存在するか確認
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // mentorIdが指定されている場合、そのユーザーがmentorであることを確認
    if (mentorId) {
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
    }

    // メンターでない場合は自分のメンバーのみ設定可能
    if (currentUserRole === 'mentor' && mentorId !== currentUserId && mentorId !== null) {
      return NextResponse.json(
        { error: '自分のメンバーのみ設定できます' },
        { status: 403 }
      )
    }

    // ユーザーのmentorIdを更新
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        mentorId: mentorId || null
      },
      select: {
        id: true,
        userId: true,
        name: true,
        mentorId: true,
        mentor: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Mentor assignment error:', error)
    return NextResponse.json(
      { error: 'メンター設定エラー' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getMentorByKey,
  isMentorKey,
  isValentineDayFeatureActive,
  VALENTINE_DAY_EVENT_CODE,
} from '@/lib/valentine'

function buildSelectionPayload(mentorKey: string, giftType: 'chocolate' | 'cookie') {
  if (!isMentorKey(mentorKey)) return null

  const mentor = getMentorByKey(mentorKey)
  if (!mentor) return null

  return {
    key: mentor.key,
    name: mentor.name,
    image: mentor.image,
    giftType,
    message: mentor.key === 'kamimu' ? 'かみむーからクッキーをもらう' : `${mentor.name}からチョコをもらう`,
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const now = new Date()
    const host = request.headers.get('host')
    if (!isValentineDayFeatureActive(now, host)) {
      return NextResponse.json({ error: '表示期間外です' }, { status: 403 })
    }

    const body = await request.json()
    const mentorKey = body?.mentorKey

    if (typeof mentorKey !== 'string' || !isMentorKey(mentorKey)) {
      return NextResponse.json({ error: 'mentorKeyが不正です' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const existingSelection = await prisma.valentineMentorSelection.findUnique({
      where: {
        userId_eventCode: {
          userId,
          eventCode: VALENTINE_DAY_EVENT_CODE,
        },
      },
    })

    if (existingSelection) {
      const existingPayload = buildSelectionPayload(
        existingSelection.mentorKey,
        existingSelection.giftType as 'chocolate' | 'cookie'
      )
      return NextResponse.json(
        {
          error: '既にメンターを選択済みです',
          selection: existingPayload,
        },
        { status: 409 }
      )
    }

    const giftType = mentorKey === 'kamimu' ? 'cookie' : 'chocolate'

    const created = await prisma.valentineMentorSelection.create({
      data: {
        userId,
        eventCode: VALENTINE_DAY_EVENT_CODE,
        mentorKey,
        giftType,
      },
    })

    const selection = buildSelectionPayload(created.mentorKey, created.giftType as 'chocolate' | 'cookie')

    return NextResponse.json({
      success: true,
      selection,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'DBスキーマが未同期です。`npx prisma db push` を実行してください。' },
        { status: 503 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: '既にメンターを選択済みです' },
        { status: 409 }
      )
    }

    console.error('Valentine day select error:', error)
    return NextResponse.json(
      { error: 'メンター選択に失敗しました' },
      { status: 500 }
    )
  }
}

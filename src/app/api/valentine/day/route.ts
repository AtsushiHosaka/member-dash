import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValentineProgressTotals } from '@/lib/valentine-progress'
import {
  getMentorByKey,
  isMentorKey,
  isValentineDayFeatureActive,
  MentorKey,
  VALENTINE_DAY_EVENT_CODE,
  VALENTINE_LOVE_LETTER_IMAGE,
  VALENTINE_RANDOM_MENTOR_KEYS,
} from '@/lib/valentine'

function shuffle<T>(items: T[]): T[] {
  const copied = [...items]
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copied[i]
    copied[i] = copied[j]
    copied[j] = temp
  }
  return copied
}

function selectFairMentors(selectionCountMap: Record<string, number>) {
  const buckets = new Map<number, Exclude<MentorKey, 'kamimu'>[]>()

  for (const mentorKey of VALENTINE_RANDOM_MENTOR_KEYS) {
    const count = selectionCountMap[mentorKey] ?? 0
    const bucket = buckets.get(count) || []
    bucket.push(mentorKey)
    buckets.set(count, bucket)
  }

  const sortedCounts = Array.from(buckets.keys()).sort((a, b) => a - b)
  const selected: Exclude<MentorKey, 'kamimu'>[] = []

  for (const count of sortedCounts) {
    const keys = buckets.get(count)
    if (!keys) continue

    const shuffled = shuffle(keys)
    for (const key of shuffled) {
      selected.push(key)
      if (selected.length === 3) {
        return selected
      }
    }
  }

  return selected
}

function toMentorDto(mentorKey: MentorKey) {
  const mentor = getMentorByKey(mentorKey)
  if (!mentor) {
    return null
  }

  return {
    key: mentor.key,
    name: mentor.name,
    image: mentor.image,
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const now = new Date()
    const host = request.headers.get('host')
    const isActiveWindow = isValentineDayFeatureActive(now, host)
    const { chocolateCount } = await getValentineProgressTotals(userId, now)

    let existingSelection: {
      mentorKey: string
      giftType: string
    } | null = null
    let selectionTableMissing = false

    try {
      const result = await prisma.valentineMentorSelection.findUnique({
        where: {
          userId_eventCode: {
            userId,
            eventCode: VALENTINE_DAY_EVENT_CODE,
          },
        },
        select: {
          mentorKey: true,
          giftType: true,
        },
      })
      existingSelection = result
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
        selectionTableMissing = true
      } else {
        throw error
      }
    }

    const hasSelected = !!existingSelection
    let selection: {
      key: string
      name: string
      image: string
      giftType: string
    } | null = null

    if (existingSelection && isMentorKey(existingSelection.mentorKey)) {
      const mentor = toMentorDto(existingSelection.mentorKey)
      if (mentor) {
        selection = {
          ...mentor,
          giftType: existingSelection.giftType,
        }
      }
    }

    const kamimu = toMentorDto('kamimu')

    if (!isActiveWindow || hasSelected) {
      return NextResponse.json({
        isActiveWindow,
        hasSelected,
        selection,
        chocolateCount,
        loveLetterImage: VALENTINE_LOVE_LETTER_IMAGE,
        mentors: [],
        kamimu,
      })
    }

    let selectionCountMap: Record<string, number> = {}
    if (!selectionTableMissing) {
      try {
        const grouped = await prisma.valentineMentorSelection.groupBy({
          by: ['mentorKey'],
          where: {
            eventCode: VALENTINE_DAY_EVENT_CODE,
            mentorKey: {
              in: VALENTINE_RANDOM_MENTOR_KEYS,
            },
          },
          _count: {
            mentorKey: true,
          },
        })

        selectionCountMap = grouped.reduce<Record<string, number>>((acc, current) => {
          acc[current.mentorKey] = current._count.mentorKey
          return acc
        }, {})
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code !== 'P2021') {
          throw error
        }
      }
    }

    const selectedKeys = selectFairMentors(selectionCountMap)
    const mentors = selectedKeys
      .map((mentorKey) => toMentorDto(mentorKey))
      .filter((mentor): mentor is NonNullable<typeof mentor> => mentor !== null)

    return NextResponse.json({
      isActiveWindow,
      hasSelected,
      selection,
      chocolateCount,
      loveLetterImage: VALENTINE_LOVE_LETTER_IMAGE,
      mentors,
      kamimu,
    })
  } catch (error) {
    console.error('Valentine day fetch error:', error)
    return NextResponse.json(
      { error: 'バレンタイン当日データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

import { prisma } from '@/lib/prisma'
import {
  VALENTINE_EVENT_END,
  VALENTINE_EVENT_START,
  getChocolateCount,
  isValentineEventPeriod,
} from '@/lib/valentine'

export async function getValentineProgressTotals(userId: string, now = new Date()) {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      startTime: {
        gte: VALENTINE_EVENT_START,
        lte: VALENTINE_EVENT_END,
      },
      isActive: false,
      duration: { not: null },
    },
    select: {
      duration: true,
    },
  })

  let activeSessionSeconds = 0

  if (isValentineEventPeriod(now)) {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        isActive: true,
        startTime: {
          gte: VALENTINE_EVENT_START,
        },
      },
      select: {
        startTime: true,
      },
    })

    if (activeSession) {
      const elapsed = Math.floor((now.getTime() - new Date(activeSession.startTime).getTime()) / 1000)
      activeSessionSeconds = Math.max(0, elapsed)
    }
  }

  const completedSeconds = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  const totalSeconds = completedSeconds + activeSessionSeconds
  const totalHours = totalSeconds / 3600
  const chocolateCount = getChocolateCount(totalSeconds)

  return {
    totalSeconds,
    totalHours,
    chocolateCount,
  }
}

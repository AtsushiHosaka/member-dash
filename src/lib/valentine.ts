export const VALENTINE_EVENT_START = new Date('2026-01-31T00:00:00+09:00')
export const VALENTINE_EVENT_END = new Date('2026-02-14T23:59:59+09:00')
export const VALENTINE_RESULT_DISPLAY_END = new Date('2026-02-28T23:59:59+09:00')

export const VALENTINE_DAY_START = new Date('2026-02-14T19:50:00+09:00')
export const VALENTINE_DAY_END = new Date('2026-02-14T23:59:59+09:00')
export const VALENTINE_DAY_EVENT_CODE = 'valentine_2026_day'
export const VALENTINE_LOVE_LETTER_IMAGE = '/valentine/love-letter.png'

export const VALENTINE_MENTORS = [
  { key: 'charlie', name: 'ちゃーりー', image: '/valentine/mentors/charlie.jpg' },
  { key: 'yoru', name: 'ようる', image: '/valentine/mentors/yoru.jpg' },
  { key: 'yuyu', name: 'ゆうゆ', image: '/valentine/mentors/yuyu.jpg' },
  { key: 'as', name: 'えーえす', image: '/valentine/mentors/as.jpg' },
  { key: 'turtle', name: 'たーとる', image: '/valentine/mentors/turtle.jpg' },
  { key: 'inobee', name: 'いのべえ', image: '/valentine/mentors/inobee.jpg' },
  { key: 'yukke', name: 'ゆっけ', image: '/valentine/mentors/yukke.jpg' },
  { key: 'hara', name: 'はら', image: '/valentine/mentors/hara.jpg' },
  { key: 'das', name: 'だーす', image: '/valentine/mentors/das.jpg' },
  { key: 'kamimu', name: 'かみむー', image: '/valentine/mentors/kamimu.jpg' },
] as const

export type MentorKey = (typeof VALENTINE_MENTORS)[number]['key']
export type GiftType = 'chocolate' | 'cookie'

const MENTOR_MAP = new Map(VALENTINE_MENTORS.map((mentor) => [mentor.key, mentor]))

export const VALENTINE_RANDOM_MENTOR_KEYS = VALENTINE_MENTORS
  .filter((mentor) => mentor.key !== 'kamimu')
  .map((mentor) => mentor.key) as Exclude<MentorKey, 'kamimu'>[]

export function isValentineEventPeriod(date: Date): boolean {
  return date >= VALENTINE_EVENT_START && date <= VALENTINE_EVENT_END
}

export function isValentineResultDisplayPeriod(date: Date): boolean {
  return date > VALENTINE_EVENT_END && date <= VALENTINE_RESULT_DISPLAY_END
}

export function isValentineDayWindow(date: Date): boolean {
  return date >= VALENTINE_DAY_START && date <= VALENTINE_DAY_END
}

export function isLocalhostRequest(host: string | null): boolean {
  if (!host) return false

  try {
    const hostname = new URL(`http://${host}`).hostname.toLowerCase()
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    const hostname = host.split(':')[0].toLowerCase()
    return hostname === 'localhost' || hostname === '127.0.0.1'
  }
}

export function isValentineDayFeatureActive(date: Date, host: string | null): boolean {
  return isLocalhostRequest(host) || isValentineDayWindow(date)
}

export function getChocolateCount(totalSeconds: number): number {
  const perChocolateSeconds = 90 * 60
  if (totalSeconds < perChocolateSeconds) return 0
  return Math.floor(totalSeconds / perChocolateSeconds)
}

export function isMentorKey(value: string): value is MentorKey {
  return MENTOR_MAP.has(value as MentorKey)
}

export function getMentorByKey(key: MentorKey) {
  return MENTOR_MAP.get(key)
}

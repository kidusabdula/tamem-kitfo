import type { OpeningHours } from '@/lib/supabase/database.types'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export type DayKey = (typeof DAY_KEYS)[number]

/** Ethiopia is UTC+3 year round — no daylight saving to account for. */
const ADDIS_OFFSET_MINUTES = 3 * 60

const ADDIS_OFFSET_MS = ADDIS_OFFSET_MINUTES * 60_000

/**
 * Weekday labels live here rather than in the dictionary because they are
 * keyed by the same DayKey the opening-hours logic uses — keeping them
 * together means a renamed key breaks in one place, not three.
 */
export const DAY_LABELS: Record<'en' | 'am', Record<DayKey, string>> = {
  en: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
  am: { mon: 'ሰኞ', tue: 'ማክሰኞ', wed: 'ረቡዕ', thu: 'ሐሙስ', fri: 'ዓርብ', sat: 'ቅዳሜ', sun: 'እሁድ' },
}

/**
 * Timestamps are stored in UTC; staff and customers both think in Addis time.
 * The IANA zone rather than the fixed offset here, because Intl needs a zone
 * name and Africa/Addis_Ababa is stable at +03:00 anyway.
 */
export function formatAddisTime(iso: string, locale: 'en' | 'am' = 'en'): string {
  try {
    return new Intl.DateTimeFormat(locale === 'am' ? 'am-ET' : 'en-GB', {
      timeZone: 'Africa/Addis_Ababa',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/**
 * The instant Addis midnight happened, as a real UTC timestamp.
 *
 * The CMS asks "how many orders today?", and "today" has to mean today in
 * Addis — not in whatever region the server happens to run in.
 */
export function addisDayStart(at: Date = new Date()): Date {
  const shifted = new Date(at.getTime() + ADDIS_OFFSET_MS)
  const midnightAsUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  )
  return new Date(midnightAsUtc - ADDIS_OFFSET_MS)
}

/**
 * Current wall-clock time in Addis Ababa, regardless of where the visitor is.
 * A diaspora customer in Washington DC asking "are they open?" means Addis
 * time, not theirs.
 */
export function addisNow(at: Date = new Date()): { day: DayKey; minutes: number } {
  const utcMinutes = at.getUTCHours() * 60 + at.getUTCMinutes()
  const local = utcMinutes + ADDIS_OFFSET_MINUTES
  const dayShift = Math.floor(local / (24 * 60))
  const minutes = ((local % (24 * 60)) + 24 * 60) % (24 * 60)
  const dayIndex = (at.getUTCDay() + dayShift + 7) % 7
  return { day: DAY_KEYS[dayIndex] as DayKey, minutes }
}

function toMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

export interface OpenState {
  isOpen: boolean
  /** "HH:mm" of the next transition, or null if today has no hours set. */
  until: string | null
}

/**
 * Handles the case that actually matters here: the restaurant closes at 23:30,
 * so a visitor checking at 00:20 must be told it is closed — not wrongly told
 * it is open because yesterday's window is still being evaluated.
 */
export function getOpenState(hours: OpeningHours, at: Date = new Date()): OpenState {
  const { day, minutes } = addisNow(at)
  const today = hours[day]
  if (!today) return { isOpen: false, until: null }

  const open = toMinutes(today[0])
  const close = toMinutes(today[1])
  if (open === null || close === null) return { isOpen: false, until: null }

  // A close time earlier than the open time means the window runs past
  // midnight (e.g. 18:00 -> 02:00).
  const overnight = close <= open
  const isOpen = overnight ? minutes >= open || minutes < close : minutes >= open && minutes < close

  return { isOpen, until: isOpen ? today[1] : today[0] }
}

/** Groups consecutive days sharing the same hours: "Mon–Sun 07:00 – 23:30". */
export function summariseHours(hours: OpeningHours): { days: DayKey[]; open: string; close: string }[] {
  const ordered: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const groups: { days: DayKey[]; open: string; close: string }[] = []

  for (const day of ordered) {
    const window = hours[day]
    if (!window) continue
    const last = groups.at(-1)
    if (last && last.open === window[0] && last.close === window[1]) {
      last.days.push(day)
    } else {
      groups.push({ days: [day], open: window[0], close: window[1] })
    }
  }
  return groups
}

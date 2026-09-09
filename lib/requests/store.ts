/**
 * What this browser has asked the restaurant for — orders, catering enquiries
 * and table bookings.
 *
 * The problem this solves: every code is shown exactly once, on the success
 * panel, and lives only in component state. A reload loses it, and the status
 * endpoint needs the code *and* the phone number, so a customer who closed the
 * tab could never reach their own order again.
 *
 * This grants the browser no new privilege. The server still demands both the
 * code and a matching phone for every lookup; all that happens here is that
 * the browser remembers what the customer already typed, on the customer's own
 * device. Nothing is sent anywhere, and there is no server-side session.
 *
 * Stored deliberately narrowly: the code, the phone it was placed with, when,
 * and a display-only summary. Never the name, never the address, never the
 * notes. Someone who picks up an unlocked phone learns the status of an order
 * whose code and number they are holding anyway.
 */

export type RequestKind = 'order' | 'catering' | 'booking'

export interface StoredRequest {
  kind: RequestKind
  code: string
  /** As the customer typed it. The server normalises before comparing. */
  phone: string
  placedAt: string
  /** Display only, e.g. "3 items · 1,900 ETB". Never trusted. */
  summary?: string
}

const STORAGE_KEY = 'tamem.requests.v1'
const MAX_ENTRIES = 15
const MAX_AGE_DAYS = 60

/** `TMM-7PRK` → `order`. Prefixes come from `generateCode()` in lib/utils.ts. */
export function kindFromCode(code: string): RequestKind | null {
  const prefix = code.trim().toUpperCase().split('-')[0]
  if (prefix === 'TMM') return 'order'
  if (prefix === 'CAT') return 'catering'
  if (prefix === 'TBL') return 'booking'
  return null
}

function isStoredRequest(value: unknown): value is StoredRequest {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as StoredRequest
  return (
    (entry.kind === 'order' || entry.kind === 'catering' || entry.kind === 'booking') &&
    typeof entry.code === 'string' &&
    typeof entry.phone === 'string' &&
    typeof entry.placedAt === 'string'
  )
}

/**
 * Newest first, expired entries dropped.
 *
 * Validated defensively for the same reason the cart is: this data outlives
 * deploys, so a shape we stopped writing months ago must not be able to throw
 * on a customer's phone.
 */
export function readRequests(): StoredRequest[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
    return parsed
      .filter(isStoredRequest)
      .filter((entry) => {
        const at = Date.parse(entry.placedAt)
        return Number.isNaN(at) ? false : at >= cutoff
      })
      .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
      .slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

function write(entries: StoredRequest[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // Private browsing, or a full quota. Losing the history is survivable —
    // the success panel still shows the code on screen.
  }
}

/** Idempotent on `code`, so a double-submit cannot produce two rows. */
export function recordRequest(entry: StoredRequest): void {
  if (typeof window === 'undefined') return
  const rest = readRequests().filter((existing) => existing.code !== entry.code)
  write([entry, ...rest])
}

export function forgetRequest(code: string): void {
  if (typeof window === 'undefined') return
  write(readRequests().filter((entry) => entry.code !== code))
}

export function clearRequests(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // As above.
  }
}

/** The phone this browser used for a code, so status needs no retyping. */
export function phoneForCode(code: string): string | null {
  return readRequests().find((entry) => entry.code === code)?.phone ?? null
}

import 'server-only'
import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

/**
 * Abuse controls for the public form endpoints.
 *
 * These endpoints hold the service-role key, so they are the only place on
 * the whole site that can write to the database. Everything here runs BEFORE
 * that key is used.
 *
 * No third-party rate limiter: a Postgres table and a COUNT is entirely
 * adequate for a single restaurant's order volume, and it avoids handing the
 * owners another vendor bill and another set of credentials to lose.
 */

/**
 * Requests allowed per window, per IP, per form kind.
 * Ordering is deliberately looser than enquiries — a family ordering from one
 * office wifi is normal; ten catering enquiries from one IP is not.
 */
const LIMITS: Record<string, { max: number; windowMinutes: number }> = {
  order: { max: 8, windowMinutes: 15 },
  catering: { max: 4, windowMinutes: 30 },
  booking: { max: 5, windowMinutes: 30 },
  contact: { max: 4, windowMinutes: 30 },
}

/**
 * Hash the IP with a server-side salt rather than storing it.
 *
 * The restaurant has no need for its customers' IP addresses, and storing
 * them would make an ordinary form log into personal data. A salted hash
 * still lets us count repeats.
 */
function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? 'tamem-kitfo-default-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export interface RateLimitResult {
  allowed: boolean
}

export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  kind: keyof typeof LIMITS | string,
  ip: string,
): Promise<RateLimitResult> {
  const limit = LIMITS[kind] ?? { max: 5, windowMinutes: 30 }
  const ipHash = hashIp(ip)
  const since = new Date(Date.now() - limit.windowMinutes * 60_000).toISOString()

  try {
    const { count, error } = await supabase
      .from('submission_log')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('kind', kind)
      .gte('created_at', since)

    if (error) throw error
    if ((count ?? 0) >= limit.max) return { allowed: false }

    await supabase.from('submission_log').insert({ ip_hash: ipHash, kind })
    return { allowed: true }
  } catch (error) {
    // Fail OPEN. If the limiter itself is broken, a real customer trying to
    // order dinner must not be turned away — spam is the lesser problem.
    console.error('[guard] rate limit check failed, allowing request:', error)
    return { allowed: true }
  }
}

/** Bots fill every field they find; humans never see this one. */
export function isHoneypotTripped(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'website' in payload &&
    typeof (payload as { website: unknown }).website === 'string' &&
    (payload as { website: string }).website.length > 0
  )
}

/* --- Uniform JSON responses. `messageKey` indexes dictionary.form.validation
       so the client renders the error in the visitor's language. --- */

export function badRequest(messageKey: string) {
  return NextResponse.json({ ok: false, messageKey }, { status: 400 })
}

export function rateLimited() {
  return NextResponse.json({ ok: false, messageKey: 'rateLimited' }, { status: 429 })
}

export function serverError(messageKey = 'errorBody') {
  return NextResponse.json({ ok: false, messageKey }, { status: 500 })
}

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data })
}

/**
 * Silent success for a tripped honeypot. Telling a bot it was detected only
 * teaches whoever wrote it to try again differently.
 */
export function fakeSuccess() {
  return NextResponse.json({ ok: true, code: 'TMM-0000' })
}

/**
 * Supabase is optional at build and dev time.
 *
 * The site must render its menu, address and opening hours even when the
 * database is unreachable — that is the whole job of a restaurant site. So
 * every public read falls back to the fixtures in lib/data/fixtures.ts when
 * these variables are absent. Ordering and the CMS require real credentials
 * and say so explicitly rather than failing silently.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Public form submissions write through ' +
        'the service role because the anon role has no INSERT policies. See .env.example.',
    )
  }
  return key
}

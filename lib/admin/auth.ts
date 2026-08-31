import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { StaffProfile } from '@/lib/supabase/database.types'

export interface StaffSession {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  email: string
  profile: StaffProfile | null
}

/**
 * Every CMS page and every CMS mutation starts here.
 *
 * Two deliberate choices:
 *
 * 1. It returns the *cookie-bound* client, not the service-role one. Staff
 *    writes are evaluated by RLS against the signed-in user, so a bug in a
 *    page cannot escalate past what that person is allowed to do. The service
 *    role stays confined to the public form handlers and the Telegram webhook.
 *
 * 2. `getUser()` — never `getSession()`. The latter only decodes a cookie the
 *    browser sent, which a client can forge.
 *
 * `profile` may be null: an auth user with no staff_profiles row is signed in
 * but not staff. RLS already blocks them; the shell tells them why instead of
 * showing empty tables.
 */
export async function requireStaff(): Promise<StaffSession | null> {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return { supabase, userId: user.id, email: user.email ?? '', profile: profile ?? null }
}

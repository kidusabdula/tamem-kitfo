import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { SUPABASE_URL, requireServiceRoleKey } from './env'

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Only two things are allowed to use this:
 *   1. The public form Route Handlers (/api/orders, /api/catering, /api/bookings),
 *      because the anon role deliberately has no INSERT policy anywhere. All
 *      validation, honeypot and rate-limit checks run BEFORE this is touched.
 *   2. The Telegram webhook, which acts on behalf of staff who tapped a button
 *      in a private group and therefore has no Supabase session to speak of.
 *
 * Never import this into a Client Component or a page. The `server-only`
 * import above turns any such attempt into a build error.
 */
export function createAdminClient() {
  return createClient<Database>(SUPABASE_URL, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

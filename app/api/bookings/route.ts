import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { bookingSchema } from '@/lib/schemas/forms'
import { firstIssueKey } from '@/lib/schemas/common'
import {
  badRequest,
  checkRateLimit,
  fakeSuccess,
  getClientIp,
  isHoneypotTripped,
  ok,
  rateLimited,
  serverError,
} from '@/lib/api/guard'
import { formatBookingCard } from '@/lib/telegram/format'
import { sendTelegramMessage } from '@/lib/telegram/send'
import { generateCode } from '@/lib/utils'

export async function POST(request: Request) {
  if (!isSupabaseConfigured) return serverError()

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return badRequest('errorBody')
  }

  if (isHoneypotTripped(payload)) return fakeSuccess()

  const parsed = bookingSchema.safeParse(payload)
  if (!parsed.success) return badRequest(firstIssueKey(parsed.error))
  const booking = parsed.data

  const supabase = createAdminClient()
  const limit = await checkRateLimit(supabase, 'booking', getClientIp(request))
  if (!limit.allowed) return rateLimited()

  const { data: created, error } = await supabase
    .from('table_bookings')
    .insert({
      code: generateCode('TBL'),
      name: booking.name,
      phone: booking.phone,
      party_size: booking.party_size,
      booking_at: new Date(booking.booking_at).toISOString(),
      notes: booking.notes,
      locale: booking.locale,
    })
    .select('code, name, phone, party_size, booking_at, notes')
    .single()

  if (error || !created) {
    console.error('[bookings] insert failed:', error)
    return serverError()
  }

  await sendTelegramMessage(formatBookingCard(created))

  return ok({ code: created.code })
}

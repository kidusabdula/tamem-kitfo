import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { checkRateLimit, getClientIp, serverError } from '@/lib/api/guard'
import { normalizeEthiopianPhone } from '@/lib/utils'

/**
 * Status lookup for anything a customer has asked us for: an order (TMM-), a
 * catering enquiry (CAT-) or a table booking (TBL-).
 *
 * Requires the code AND the phone number it was placed with. A code is four
 * characters from a 24-letter alphabet — guessable enough that code-only
 * lookup would let anyone walk the restaurant's orders and read customers'
 * names, addresses and phone numbers.
 *
 * Every failure returns the same body and the same status, so this endpoint
 * cannot be used to discover which codes exist. Do not add a distinct "wrong
 * phone" message: that turns a 404 into an oracle confirming the code is real.
 *
 * The response carries no personal data — no name, no address, no notes.
 * Whoever holds the code and the phone knows all of that already; there is
 * nothing to gain by echoing it back and something to lose if the device is
 * shared.
 */

const lookupSchema = z.object({
  code: z.string().trim().min(4).max(16),
  phone: z.string().trim().min(4).max(40),
})

const notFound = () =>
  NextResponse.json({ ok: false, messageKey: 'lookupNotFound' }, { status: 404 })

export async function POST(request: Request) {
  if (!isSupabaseConfigured) return serverError()

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, messageKey: 'errorBody' }, { status: 400 })
  }

  const parsed = lookupSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, messageKey: 'lookupNotFound' }, { status: 400 })
  }

  const supabase = createAdminClient()
  // Rate limited because this endpoint compares a secret; without it the phone
  // number could be brute-forced against a known code.
  const limit = await checkRateLimit(supabase, 'lookup', getClientIp(request))
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, messageKey: 'rateLimited' }, { status: 429 })
  }

  const code = parsed.data.code.toUpperCase()
  const phone = normalizeEthiopianPhone(parsed.data.phone)
  if (!phone) return notFound()

  const prefix = code.split('-')[0]

  if (prefix === 'TMM') {
    const { data } = await supabase
      .from('orders')
      .select(
        'code, status, subtotal_etb, created_at, fulfilment_type, scheduled_for, customer_phone, order_items(dish_name_snapshot, quantity, unit_price_snapshot)',
      )
      .eq('code', code)
      .maybeSingle()

    if (!data || data.customer_phone !== phone) return notFound()

    return NextResponse.json({
      ok: true,
      request: {
        kind: 'order' as const,
        code: data.code,
        status: data.status,
        createdAt: data.created_at,
        subtotal: data.subtotal_etb,
        fulfilment: data.fulfilment_type,
        scheduledFor: data.scheduled_for,
        items: data.order_items.map((item) => ({
          name: item.dish_name_snapshot,
          quantity: item.quantity,
          unitPrice: item.unit_price_snapshot,
        })),
      },
    })
  }

  if (prefix === 'CAT') {
    const { data } = await supabase
      .from('catering_inquiries')
      .select('code, status, created_at, event_type, event_date, guest_count, phone')
      .eq('code', code)
      .maybeSingle()

    if (!data || data.phone !== phone) return notFound()

    // location and message are deliberately not returned — they are the most
    // identifying fields on the row and the customer wrote them.
    return NextResponse.json({
      ok: true,
      request: {
        kind: 'catering' as const,
        code: data.code,
        status: data.status,
        createdAt: data.created_at,
        eventType: data.event_type,
        eventDate: data.event_date,
        guestCount: data.guest_count,
      },
    })
  }

  if (prefix === 'TBL') {
    const { data } = await supabase
      .from('table_bookings')
      .select('code, status, created_at, party_size, booking_at, phone')
      .eq('code', code)
      .maybeSingle()

    if (!data || data.phone !== phone) return notFound()

    return NextResponse.json({
      ok: true,
      request: {
        kind: 'booking' as const,
        code: data.code,
        status: data.status,
        createdAt: data.created_at,
        partySize: data.party_size,
        bookingAt: data.booking_at,
      },
    })
  }

  // Unknown prefix. Same response as a wrong phone, for the same reason.
  return notFound()
}

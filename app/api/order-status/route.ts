import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { checkRateLimit, getClientIp, serverError } from '@/lib/api/guard'
import { normalizeEthiopianPhone } from '@/lib/utils'

/**
 * Order status lookup.
 *
 * Requires the code AND the phone number it was placed with. An order code
 * alone is four characters from a 24-letter alphabet — guessable enough that
 * code-only lookup would let anyone enumerate the restaurant's orders and read
 * customers' names, addresses and phone numbers.
 *
 * The response deliberately carries no personal data: just the status and the
 * items. Someone who has the code and the phone already knows the rest.
 */

const lookupSchema = z.object({
  code: z.string().trim().min(4).max(16),
  phone: z.string().trim().min(4).max(40),
})

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
  // Rate limited because this endpoint compares a secret; without it, the
  // phone number could be brute-forced.
  const limit = await checkRateLimit(supabase, 'lookup', getClientIp(request))
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, messageKey: 'rateLimited' }, { status: 429 })
  }

  const code = parsed.data.code.toUpperCase()
  const phone = normalizeEthiopianPhone(parsed.data.phone)

  const { data: order } = await supabase
    .from('orders')
    .select('code, status, subtotal_etb, created_at, customer_phone, order_items(dish_name_snapshot, quantity, unit_price_snapshot)')
    .eq('code', code)
    .maybeSingle()

  // One generic response for "no such order" and "wrong phone" alike, so the
  // endpoint cannot be used to confirm which codes exist.
  if (!order || !phone || order.customer_phone !== phone) {
    return NextResponse.json({ ok: false, messageKey: 'lookupNotFound' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    order: {
      code: order.code,
      status: order.status,
      subtotal: order.subtotal_etb,
      createdAt: order.created_at,
      items: order.order_items.map((item) => ({
        name: item.dish_name_snapshot,
        quantity: item.quantity,
        unitPrice: item.unit_price_snapshot,
      })),
    },
  })
}

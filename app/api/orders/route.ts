import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { orderSchema } from '@/lib/schemas/forms'
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
import { formatOrderCard, orderButtons } from '@/lib/telegram/format'
import { sendTelegramMessage } from '@/lib/telegram/send'
import { generateCode } from '@/lib/utils'

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    console.error('[orders] Supabase is not configured; cannot accept orders')
    return serverError()
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return badRequest('errorBody')
  }

  // Honeypot first: cheapest possible rejection, and it never reaches the DB.
  if (isHoneypotTripped(payload)) return fakeSuccess()

  const parsed = orderSchema.safeParse(payload)
  if (!parsed.success) return badRequest(firstIssueKey(parsed.error))
  const order = parsed.data

  const supabase = createAdminClient()

  const limit = await checkRateLimit(supabase, 'order', getClientIp(request))
  if (!limit.allowed) return rateLimited()

  // The owners can pause online ordering from the CMS. Honour it here as well
  // as in the UI, so a stale page or a direct POST cannot slip through.
  const { data: settings } = await supabase
    .from('site_settings')
    .select('is_accepting_orders')
    .single()
  if (settings && !settings.is_accepting_orders) {
    return NextResponse.json({ ok: false, messageKey: 'ordersClosed' }, { status: 409 })
  }

  /*
   * PRICING IS SERVER-SIDE, ALWAYS.
   *
   * The client posts slugs and quantities only. Prices, names and dish ids all
   * come from the database here. If the browser could name its own price,
   * anyone with devtools could buy the 1450 ETB agelgil for one birr.
   */
  const slugs = [...new Set(order.items.map((item) => item.slug))]
  const { data: dishes, error: dishError } = await supabase
    .from('dishes')
    .select('id, slug, name_en, name_am, price_etb, is_available')
    .in('slug', slugs)

  if (dishError) {
    console.error('[orders] dish lookup failed:', dishError)
    return serverError()
  }

  const bySlug = new Map((dishes ?? []).map((dish) => [dish.slug, dish]))

  const lineItems = order.items.flatMap((item) => {
    const dish = bySlug.get(item.slug)
    // Silently drop anything unknown or taken off the menu since the customer
    // loaded the page, rather than failing the whole order.
    if (!dish || !dish.is_available) return []
    return [
      {
        dish_id: dish.id,
        dish_name_snapshot: dish.name_en,
        unit_price_snapshot: dish.price_etb,
        quantity: item.quantity,
      },
    ]
  })

  if (lineItems.length === 0) return badRequest('cartEmpty')

  const subtotal = lineItems.reduce(
    (sum, line) => sum + line.unit_price_snapshot * line.quantity,
    0,
  )

  const code = generateCode('TMM')

  const { data: created, error: orderError } = await supabase
    .from('orders')
    .insert({
      code,
      customer_name: order.name,
      customer_phone: order.phone,
      fulfilment_type: order.fulfilment_type,
      scheduled_for: order.scheduled_for ? new Date(order.scheduled_for).toISOString() : null,
      delivery_address: order.delivery_address,
      notes: order.notes,
      subtotal_etb: subtotal,
      locale: order.locale,
    })
    .select('id, code')
    .single()

  if (orderError || !created) {
    console.error('[orders] insert failed:', orderError)
    return serverError()
  }

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(lineItems.map((line) => ({ ...line, order_id: created.id })))

  if (itemsError) {
    // Postgres has no transaction across two supabase-js calls, so clean up
    // rather than leave an order with no items for staff to puzzle over.
    console.error('[orders] item insert failed, rolling back order:', itemsError)
    await supabase.from('orders').delete().eq('id', created.id)
    return serverError()
  }

  // The order is safely stored. Telegram is best-effort from here — a failed
  // notification must not turn a successful order into an error for the
  // customer.
  const messageId = await sendTelegramMessage(
    formatOrderCard({
      code: created.code,
      customerName: order.name,
      customerPhone: order.phone,
      fulfilmentType: order.fulfilment_type,
      scheduledFor: order.scheduled_for,
      deliveryAddress: order.delivery_address,
      notes: order.notes,
      subtotal,
      items: lineItems.map((line) => ({
        name: line.dish_name_snapshot,
        quantity: line.quantity,
        unitPrice: line.unit_price_snapshot,
      })),
      status: 'new',
    }),
    orderButtons(created.id, 'new'),
  )

  if (messageId) {
    await supabase
      .from('orders')
      .update({ telegram_message_id: messageId })
      .eq('id', created.id)
  }

  return ok({ code: created.code })
}

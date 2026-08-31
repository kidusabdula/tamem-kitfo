import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram/send'
import { formatOrderCard, orderButtons } from '@/lib/telegram/format'
import type { FulfilmentType, OrderStatus } from '@/lib/supabase/database.types'

/**
 * Staff tap "✅ Confirm" on the order card in Telegram and the database
 * updates. This is the feature that makes the whole system usable: the owners
 * run the restaurant from their phones and may never open the CMS at all.
 *
 * Register the webhook once per deployment:
 *   curl -F "url=https://<domain>/api/telegram/webhook" \
 *        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
 *        https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook
 */

const VALID_STATUSES = new Set<OrderStatus>([
  'new',
  'confirmed',
  'preparing',
  'completed',
  'cancelled',
])

interface CallbackQuery {
  id: string
  data?: string
  from?: { id: number; first_name?: string }
  message?: { message_id: number }
}

export async function POST(request: Request) {
  /*
   * This endpoint is public, so anyone who guesses the URL could otherwise
   * cancel every order in the restaurant. Telegram echoes a secret we set at
   * registration time; a request without it is not from Telegram.
   *
   * Fail CLOSED — unlike the rate limiter, a misconfiguration here must block,
   * not allow.
   */
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expectedSecret) {
    console.error('[telegram-webhook] TELEGRAM_WEBHOOK_SECRET is not set; refusing all updates')
    return NextResponse.json({ ok: false }, { status: 503 })
  }
  if (request.headers.get('x-telegram-bot-api-secret-token') !== expectedSecret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  if (!isSupabaseConfigured) return NextResponse.json({ ok: true })

  let update: { callback_query?: CallbackQuery }
  try {
    update = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const callback = update.callback_query
  // Always 200 for anything we do not handle: a non-200 makes Telegram retry
  // the same update forever.
  if (!callback?.data) return NextResponse.json({ ok: true })

  const [kind, id, nextStatus] = callback.data.split(':')
  if (kind !== 'order' || !id || !nextStatus || !VALID_STATUSES.has(nextStatus as OrderStatus)) {
    await answerCallbackQuery(callback.id)
    return NextResponse.json({ ok: true })
  }

  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status: nextStatus as OrderStatus })
    .eq('id', id)
    .select('*, order_items(*)')
    .single()

  if (error || !order) {
    console.error('[telegram-webhook] order update failed:', error)
    await answerCallbackQuery(callback.id, 'Could not update that order')
    return NextResponse.json({ ok: true })
  }

  // Rewrite the original card in place rather than posting a new one, so the
  // group stays a clean list of orders instead of a status changelog.
  if (order.telegram_message_id) {
    await editTelegramMessage(
      order.telegram_message_id,
      formatOrderCard({
        code: order.code,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        fulfilmentType: order.fulfilment_type as FulfilmentType,
        scheduledFor: order.scheduled_for,
        deliveryAddress: order.delivery_address,
        notes: order.notes,
        subtotal: order.subtotal_etb,
        items: order.order_items.map((item) => ({
          name: item.dish_name_snapshot,
          quantity: item.quantity,
          unitPrice: item.unit_price_snapshot,
        })),
        status: order.status,
      }),
      orderButtons(order.id, order.status),
    )
  }

  await answerCallbackQuery(callback.id, `${order.code} → ${order.status}`)
  return NextResponse.json({ ok: true })
}

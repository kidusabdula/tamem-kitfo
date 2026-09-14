import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram/send'
import {
  bookingButtons,
  cateringButtons,
  formatBookingCard,
  formatCateringCard,
  formatOrderCard,
  orderButtons,
} from '@/lib/telegram/format'
import type { Database } from '@/lib/supabase/database.types'
import type { FulfilmentType } from '@/lib/supabase/database.types'

export const runtime = 'nodejs'

/**
 * Staff tap a status button on a card in Telegram and the database updates.
 * This is the feature that makes the whole system usable: the owners run the
 * restaurant from their phones and may never open the CMS at all.
 *
 * All three request kinds are handled here — orders, catering enquiries and
 * table bookings — because the callback contract is identical for each:
 * `<kind>:<row id>:<next status>`.
 *
 * Register the webhook once per deployment:
 *   curl -F "url=https://<domain>/api/telegram/webhook" \
 *        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
 *        https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook
 */

/**
 * The callback kinds, and what each one is allowed to do.
 *
 * The statuses are listed explicitly rather than derived from the enum,
 * because this set is an authorization boundary and not a convenience: a
 * status that must never be reachable by tapping a public webhook simply is
 * not in the list.
 */
const KINDS = {
  order: {
    table: 'orders',
    statuses: new Set<string>(['new', 'confirmed', 'preparing', 'completed', 'cancelled']),
    paths: ['/admin/orders', '/admin'],
    noun: 'Order',
  },
  catering: {
    table: 'catering_inquiries',
    statuses: new Set<string>(['new', 'contacted', 'quoted', 'won', 'lost']),
    paths: ['/admin/catering', '/admin'],
    noun: 'Enquiry',
  },
  booking: {
    table: 'table_bookings',
    statuses: new Set<string>(['new', 'confirmed', 'seated', 'completed', 'cancelled']),
    paths: ['/admin/bookings', '/admin'],
    noun: 'Booking',
  },
} as const

type Kind = keyof typeof KINDS

interface CallbackQuery {
  id: string
  data?: string
  from?: { id: number; first_name?: string }
  message?: { message_id: number }
}

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']
type CateringRow = Database['public']['Tables']['catering_inquiries']['Row']
type BookingRow = Database['public']['Tables']['table_bookings']['Row']

type Admin = ReturnType<typeof createAdminClient>

/** Escape hatch for the one place a table name is chosen at runtime. */
type UntypedFrom = { from: (table: string) => any }

function isTransientError(error: unknown): boolean {
  const message =
    error && typeof error === 'object' && 'message' in error ? String(error.message) : ''
  return /gateway\s*timeout|timed?\s*out|fetch failed|socket hang up|ECONNRESET|ETIMEDOUT/i.test(
    message,
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * The pooler occasionally drops a write under load. The retry deliberately does
 * not ask for the row back a second time: the failure being recovered from is a
 * timeout, so the retry stays as small as it can and reports success from the
 * affected row count instead of a second round trip.
 */
async function updateStatusWithRetry(
  supabase: Admin,
  table: string,
  id: string,
  nextStatus: string,
): Promise<{ data: { id: string; code: string | null } | null; error: unknown | null }> {
  const from = () => (supabase as unknown as UntypedFrom).from(table)

  const first = await from().update({ status: nextStatus }).eq('id', id).select('id, code').maybeSingle()

  if (!first.error && first.data) return { data: first.data, error: null }
  if (first.error && !isTransientError(first.error)) return { data: null, error: first.error }

  await sleep(500)

  const second = await from().update({ status: nextStatus }, { count: 'exact' }).eq('id', id)

  if (second.error && !isTransientError(second.error)) return { data: null, error: second.error }
  if (!second.error && (second.count ?? 0) > 0) return { data: { id, code: null }, error: null }
  if (!second.error) return { data: null, error: { message: 'No rows updated' } }

  return { data: null, error: second.error ?? first.error }
}

/**
 * Redraw the card in place, so the group stays a clean list of live requests
 * rather than a status changelog.
 *
 * Orders remember their own `telegram_message_id` because the CMS needs to be
 * able to redraw them too. Catering and bookings store no id and do not need
 * one here: the callback names the message the tapped button sits on, which is
 * the only message that can be stale.
 */
async function redraw(
  supabase: Admin,
  kind: Kind,
  id: string,
  callbackMessageId: number | undefined,
): Promise<void> {
  if (kind === 'order') {
    const [orderResult, itemsResult] = await Promise.all([
      supabase.from('orders').select('*').eq('id', id).maybeSingle<OrderRow>(),
      supabase
        .from('order_items')
        .select('dish_name_snapshot, quantity, unit_price_snapshot')
        .eq('order_id', id)
        .returns<OrderItemRow[]>(),
    ])

    if (orderResult.error) {
      console.error('[telegram-webhook] order re-read failed:', orderResult.error)
    }
    const order = orderResult.data
    const messageId = order?.telegram_message_id ?? callbackMessageId
    if (!order || !messageId) return

    await editTelegramMessage(
      messageId,
      formatOrderCard({
        code: order.code,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        fulfilmentType: order.fulfilment_type as FulfilmentType,
        scheduledFor: order.scheduled_for,
        deliveryAddress: order.delivery_address,
        notes: order.notes,
        subtotal: order.subtotal_etb,
        items: (itemsResult.data ?? []).map((item) => ({
          name: item.dish_name_snapshot,
          quantity: item.quantity,
          unitPrice: item.unit_price_snapshot,
        })),
        status: order.status,
      }),
      orderButtons(order.id, order.status),
    )
    return
  }

  if (!callbackMessageId) return

  if (kind === 'catering') {
    const [inquiryResult, itemsResult] = await Promise.all([
      supabase.from('catering_inquiries').select('*').eq('id', id).maybeSingle<CateringRow>(),
      supabase
        .from('catering_inquiry_items')
        .select('dish_name_snapshot, quantity')
        .eq('inquiry_id', id)
        .returns<{ dish_name_snapshot: string; quantity: number }[]>(),
    ])

    if (inquiryResult.error) {
      console.error('[telegram-webhook] catering re-read failed:', inquiryResult.error)
    }
    const inquiry = inquiryResult.data
    if (!inquiry) return

    await editTelegramMessage(
      callbackMessageId,
      formatCateringCard(
        inquiry,
        (itemsResult.data ?? []).map((item) => ({
          name: item.dish_name_snapshot,
          quantity: item.quantity,
        })),
      ),
      cateringButtons(inquiry.id, inquiry.status),
    )
    return
  }

  const bookingResult = await supabase
    .from('table_bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle<BookingRow>()

  if (bookingResult.error) {
    console.error('[telegram-webhook] booking re-read failed:', bookingResult.error)
  }
  const booking = bookingResult.data
  if (!booking) return

  await editTelegramMessage(
    callbackMessageId,
    formatBookingCard(booking),
    bookingButtons(booking.id, booking.status),
  )
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

  const [rawKind, id, nextStatus] = callback.data.split(':')
  const kind = rawKind as Kind
  const spec = KINDS[kind]

  if (!spec || !id || !nextStatus || !spec.statuses.has(nextStatus)) {
    await answerCallbackQuery(callback.id)
    return NextResponse.json({ ok: true })
  }

  const supabase = createAdminClient()
  const { data: updated, error } = await updateStatusWithRetry(supabase, spec.table, id, nextStatus)

  if (error || !updated) {
    console.error(`[telegram-webhook] ${kind} update failed:`, error)
    await answerCallbackQuery(callback.id, `Could not update that ${spec.noun.toLowerCase()}`)
    return NextResponse.json({ ok: true })
  }

  /*
   * The status can change from the Telegram card without a CMS form submission.
   * If we do not invalidate the CMS paths here, an already-open admin tab can
   * keep showing the previous status until the next manual admin mutation
   * happens to revalidate it.
   */
  try {
    for (const path of spec.paths) revalidatePath(path)
  } catch (revalidateError) {
    console.error('[telegram-webhook] CMS revalidation failed after update:', revalidateError)
  }

  // The database update is the command of record. Answer Telegram before doing
  // the best-effort card redraw so a flaky later network call cannot make staff
  // think the status change itself failed.
  await answerCallbackQuery(callback.id, `${updated.code ?? spec.noun} → ${nextStatus}`)

  /*
   * The redraw is best effort. If the re-read or the Telegram edit fails the
   * row has still moved, and the next status change will correct the card.
   */
  try {
    await redraw(supabase, kind, id, callback.message?.message_id)
  } catch (redrawError) {
    console.error('[telegram-webhook] card redraw failed:', redrawError)
  }

  return NextResponse.json({ ok: true })
}

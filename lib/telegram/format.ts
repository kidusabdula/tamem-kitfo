import 'server-only'
import { escapeHtml, type InlineButton } from './send'
import { formatAddisTime } from '@/lib/hours'
import type {
  BookingStatus,
  CateringInquiry,
  InquiryStatus,
  OrderStatus,
  TableBooking,
} from '@/lib/supabase/database.types'

/**
 * Message formatting.
 *
 * These cards are the primary interface for the owners — most days they will
 * never open the CMS. So the card has to answer, at a glance and on a phone:
 * what was ordered, who ordered it, when they want it, and what to tap next.
 *
 * Written in Amharic and English together rather than in the customer's
 * locale, because the staff reading them are constant while customers vary.
 */

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: '🆕 New',
  confirmed: '✅ Confirmed',
  preparing: '👨‍🍳 Preparing',
  completed: '🎉 Completed',
  cancelled: '❌ Cancelled',
}

/**
 * Staff-facing wording, so it matches the CMS board rather than the softened
 * labels a customer sees on /status. "Lost" is a real outcome the owners need
 * to be able to record; the customer-facing dictionary renames it to "Closed".
 */
const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: '🆕 New',
  contacted: '📞 Contacted',
  quoted: '💰 Quoted',
  won: '🎉 Won',
  lost: '❌ Lost',
}

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  new: '🆕 New',
  confirmed: '✅ Confirmed',
  seated: '🪑 Seated',
  completed: '🎉 Completed',
  cancelled: '❌ Cancelled',
}

const FULFILMENT_LABEL = {
  dine_in: '🍽 Dine in · እዚሁ',
  pickup: '🛍 Pickup · መጥቶ ይወስዳል',
  delivery: '🛵 Delivery · ዴሊቨሪ',
} as const

export interface OrderCardInput {
  code: string
  customerName: string
  customerPhone: string
  fulfilmentType: keyof typeof FULFILMENT_LABEL
  scheduledFor: string | null
  deliveryAddress: string | null
  notes: string | null
  subtotal: number
  items: { name: string; quantity: number; unitPrice: number }[]
  status: OrderStatus
}

export function formatOrderCard(order: OrderCardInput): string {
  const lines: string[] = []

  lines.push(`<b>🧾 ORDER ${escapeHtml(order.code)}</b>`)
  lines.push(STATUS_LABEL[order.status])
  lines.push('')

  for (const item of order.items) {
    const total = item.quantity * item.unitPrice
    lines.push(
      `${item.quantity} × ${escapeHtml(item.name)} — <b>${total.toLocaleString('en-US')} ETB</b>`,
    )
  }

  lines.push('')
  lines.push(`<b>Total: ${order.subtotal.toLocaleString('en-US')} ETB</b>`)
  lines.push('')
  lines.push(`👤 ${escapeHtml(order.customerName)}`)
  // tel: links make the number tappable straight from Telegram — the single
  // most useful thing on the card, since every order is confirmed by phone.
  lines.push(`📞 <a href="tel:${escapeHtml(order.customerPhone)}">${escapeHtml(order.customerPhone)}</a>`)
  lines.push(FULFILMENT_LABEL[order.fulfilmentType])

  if (order.scheduledFor) {
    lines.push(`🕐 ${escapeHtml(formatAddisTime(order.scheduledFor))}`)
  } else {
    lines.push('🕐 As soon as possible · በተቻለ ፍጥነት')
  }

  if (order.deliveryAddress) lines.push(`📍 ${escapeHtml(order.deliveryAddress)}`)
  if (order.notes) lines.push(`📝 ${escapeHtml(order.notes)}`)

  return lines.join('\n')
}

export function orderButtons(orderId: string, status: OrderStatus): InlineButton[][] {
  // A completed or cancelled order has nothing left to decide, so the card
  // loses its buttons rather than inviting a misclick.
  if (status === 'completed' || status === 'cancelled') return []

  const rows: InlineButton[][] = []
  if (status === 'new') {
    rows.push([
      { text: '✅ Confirm', callback_data: `order:${orderId}:confirmed` },
      { text: '❌ Cancel', callback_data: `order:${orderId}:cancelled` },
    ])
  } else if (status === 'confirmed') {
    rows.push([
      { text: '👨‍🍳 Preparing', callback_data: `order:${orderId}:preparing` },
      { text: '❌ Cancel', callback_data: `order:${orderId}:cancelled` },
    ])
  } else if (status === 'preparing') {
    rows.push([{ text: '🎉 Completed', callback_data: `order:${orderId}:completed` }])
  }
  return rows
}

/**
 * Catering moves along a sales pipeline rather than a kitchen queue, so the
 * buttons follow the CMS board: each tap advances one step, and "Lost" stays
 * reachable at every stage because an enquiry can die at any point.
 */
export function cateringButtons(id: string, status: InquiryStatus): InlineButton[][] {
  if (status === 'won' || status === 'lost') return []

  const next: Partial<Record<InquiryStatus, InlineButton>> = {
    new: { text: '📞 Contacted', callback_data: `catering:${id}:contacted` },
    contacted: { text: '💰 Quoted', callback_data: `catering:${id}:quoted` },
    quoted: { text: '🎉 Won', callback_data: `catering:${id}:won` },
  }

  const advance = next[status]
  const row: InlineButton[] = advance ? [advance] : []
  row.push({ text: '❌ Lost', callback_data: `catering:${id}:lost` })
  return [row]
}

export function bookingButtons(id: string, status: BookingStatus): InlineButton[][] {
  if (status === 'completed' || status === 'cancelled') return []

  const rows: InlineButton[][] = []
  if (status === 'new') {
    rows.push([
      { text: '✅ Confirm', callback_data: `booking:${id}:confirmed` },
      { text: '❌ Cancel', callback_data: `booking:${id}:cancelled` },
    ])
  } else if (status === 'confirmed') {
    rows.push([
      { text: '🪑 Seated', callback_data: `booking:${id}:seated` },
      { text: '❌ Cancel', callback_data: `booking:${id}:cancelled` },
    ])
  } else if (status === 'seated') {
    rows.push([{ text: '🎉 Completed', callback_data: `booking:${id}:completed` }])
  }
  return rows
}

export function formatCateringCard(
  inquiry: Pick<
    CateringInquiry,
    | 'code'
    | 'name'
    | 'phone'
    | 'email'
    | 'event_type'
    | 'event_date'
    | 'guest_count'
    | 'location'
    | 'message'
    | 'status'
  >,
  /** Optional requested dishes. Deliberately without prices: catering is
   *  quoted per event, and menu prices would mislead the customer. */
  items: { name: string; quantity: number }[] = [],
): string {
  const lines = [
    `<b>🎪 CATERING ${escapeHtml(inquiry.code)}</b>`,
    INQUIRY_STATUS_LABEL[inquiry.status],
    '',
    `👤 ${escapeHtml(inquiry.name)}`,
    `📞 <a href="tel:${escapeHtml(inquiry.phone)}">${escapeHtml(inquiry.phone)}</a>`,
  ]
  if (inquiry.email) lines.push(`✉️ ${escapeHtml(inquiry.email)}`)
  lines.push(`🎉 ${escapeHtml(inquiry.event_type)}`)
  if (inquiry.event_date) lines.push(`📅 ${escapeHtml(inquiry.event_date)}`)
  if (inquiry.guest_count) lines.push(`👥 ${inquiry.guest_count} guests`)
  if (inquiry.location) lines.push(`📍 ${escapeHtml(inquiry.location)}`)

  if (items.length > 0) {
    lines.push('')
    lines.push('<b>📦 Requested dishes:</b>')
    for (const item of items) {
      lines.push(`  • ${item.quantity} × ${escapeHtml(item.name)}`)
    }
  }

  if (inquiry.message) lines.push(`📝 ${escapeHtml(inquiry.message)}`)
  return lines.join('\n')
}

export function formatBookingCard(
  booking: Pick<
    TableBooking,
    'code' | 'name' | 'phone' | 'party_size' | 'booking_at' | 'notes' | 'status'
  >,
): string {
  const lines = [
    `<b>🪑 TABLE ${escapeHtml(booking.code)}</b>`,
    BOOKING_STATUS_LABEL[booking.status],
    '',
    `👤 ${escapeHtml(booking.name)}`,
    `📞 <a href="tel:${escapeHtml(booking.phone)}">${escapeHtml(booking.phone)}</a>`,
    `👥 ${booking.party_size} people`,
    `🕐 ${escapeHtml(formatAddisTime(booking.booking_at))}`,
  ]
  if (booking.notes) lines.push(`📝 ${escapeHtml(booking.notes)}`)
  return lines.join('\n')
}

export function formatContactCard(message: {
  name: string
  phone: string | null
  email: string | null
  message: string
}): string {
  const lines = [`<b>✉️ MESSAGE</b>`, '', `👤 ${escapeHtml(message.name)}`]
  if (message.phone) lines.push(`📞 ${escapeHtml(message.phone)}`)
  if (message.email) lines.push(`✉️ ${escapeHtml(message.email)}`)
  lines.push('', escapeHtml(message.message))
  return lines.join('\n')
}

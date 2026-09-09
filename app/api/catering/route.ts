import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cateringSchema } from '@/lib/schemas/forms'
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
import { formatCateringCard } from '@/lib/telegram/format'
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

  const parsed = cateringSchema.safeParse(payload)
  if (!parsed.success) return badRequest(firstIssueKey(parsed.error))
  const inquiry = parsed.data

  const supabase = createAdminClient()
  const limit = await checkRateLimit(supabase, 'catering', getClientIp(request))
  if (!limit.allowed) return rateLimited()

  const code = generateCode('CAT')

  const { data: created, error } = await supabase
    .from('catering_inquiries')
    .insert({
      code,
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      event_type: inquiry.event_type,
      event_date: inquiry.event_date,
      guest_count: inquiry.guest_count,
      location: inquiry.location,
      message: inquiry.message,
      locale: inquiry.locale,
    })
    .select('id, code, name, phone, email, event_type, event_date, guest_count, location, message')
    .single()

  if (error || !created) {
    console.error('[catering] insert failed:', error)
    return serverError()
  }

  /*
   * Optional dish list. The browser sends slugs and quantities only; names
   * come from the database and are snapshotted, exactly like order_items.
   * Unknown or since-unavailable dishes are dropped silently — this list is
   * a courtesy for the owners' quote, not an order, so a stale slug must
   * never fail the enquiry (unlike orders, where an empty cart is a 400).
   * A dish-lookup failure ships the enquiry without items for the same
   * reason; a failed item INSERT is a data-integrity problem, so that one
   * rolls the inquiry back like the orders route does.
   */
  const telegramItems: { name: string; quantity: number }[] = []
  if (inquiry.items.length > 0) {
    const slugs = [...new Set(inquiry.items.map((item) => item.slug))]
    const { data: dishes, error: dishError } = await supabase
      .from('dishes')
      .select('id, slug, name_en, is_available')
      .in('slug', slugs)

    if (dishError) {
      console.error('[catering] dish lookup failed, shipping enquiry without items:', dishError)
    } else {
      const bySlug = new Map((dishes ?? []).map((dish) => [dish.slug, dish]))
      const rows = inquiry.items.flatMap((item) => {
        const dish = bySlug.get(item.slug)
        if (!dish || !dish.is_available) return []
        return [
          {
            inquiry_id: created.id,
            dish_id: dish.id,
            dish_name_snapshot: dish.name_en,
            quantity: item.quantity,
          },
        ]
      })

      if (rows.length > 0) {
        const { error: itemsError } = await supabase
          .from('catering_inquiry_items')
          .insert(rows)

        if (itemsError) {
          console.error('[catering] item insert failed, rolling back inquiry:', itemsError)
          await supabase.from('catering_inquiries').delete().eq('id', created.id)
          return serverError()
        }

        telegramItems.push(...rows.map((row) => ({ name: row.dish_name_snapshot, quantity: row.quantity })))
      }
    }
  }

  await sendTelegramMessage(formatCateringCard(created, telegramItems))

  return ok({ code: created.code })
}

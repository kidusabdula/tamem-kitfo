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
    .select('code, name, phone, email, event_type, event_date, guest_count, location, message')
    .single()

  if (error || !created) {
    console.error('[catering] insert failed:', error)
    return serverError()
  }

  await sendTelegramMessage(formatCateringCard(created))

  return ok({ code: created.code })
}

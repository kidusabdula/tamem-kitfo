import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { contactSchema } from '@/lib/schemas/forms'
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
import { formatContactCard } from '@/lib/telegram/format'
import { sendTelegramMessage } from '@/lib/telegram/send'

export async function POST(request: Request) {
  if (!isSupabaseConfigured) return serverError()

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return badRequest('errorBody')
  }

  if (isHoneypotTripped(payload)) return fakeSuccess()

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) return badRequest(firstIssueKey(parsed.error))
  const message = parsed.data

  const supabase = createAdminClient()
  const limit = await checkRateLimit(supabase, 'contact', getClientIp(request))
  if (!limit.allowed) return rateLimited()

  const { error } = await supabase.from('contact_messages').insert({
    name: message.name,
    phone: message.phone,
    email: message.email,
    message: message.message,
  })

  if (error) {
    console.error('[contact] insert failed:', error)
    return serverError()
  }

  await sendTelegramMessage(formatContactCard(message))

  return ok()
}

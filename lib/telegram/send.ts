import 'server-only'

/**
 * Telegram is the NOTIFICATION channel, never the system of record.
 *
 * Every submission is written to Postgres first and only then announced here.
 * If Telegram is down, misconfigured, or rate-limited, the order still exists
 * and still appears in the admin board — the restaurant loses a ping, not a
 * customer. Every function in this file therefore fails soft.
 */

const API = 'https://api.telegram.org'

export interface InlineButton {
  text: string
  callback_data: string
}

function config() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return null
  return { token, chatId }
}

export const isTelegramConfigured = () => config() !== null

/**
 * Returns the sent message_id so the order row can remember it, which is what
 * lets a later status change edit the original card instead of spamming the
 * group with a second message.
 */
export async function sendTelegramMessage(
  html: string,
  buttons?: InlineButton[][],
): Promise<number | null> {
  const cfg = config()
  if (!cfg) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set; skipping notification')
    return null
  }

  try {
    const response = await fetch(`${API}/bot${cfg.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text: html,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
      }),
      // The customer is waiting on this request. Telegram is not allowed to
      // hold up their confirmation screen.
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error('[telegram] sendMessage failed:', response.status, await response.text())
      return null
    }

    const body = (await response.json()) as { result?: { message_id?: number } }
    return body.result?.message_id ?? null
  } catch (error) {
    console.error('[telegram] sendMessage threw:', error)
    return null
  }
}

/** Rewrites an existing card in place, e.g. after staff tap Confirm. */
export async function editTelegramMessage(
  messageId: number,
  html: string,
  buttons?: InlineButton[][],
): Promise<boolean> {
  const cfg = config()
  if (!cfg) return false
  try {
    const response = await fetch(`${API}/bot${cfg.token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        message_id: messageId,
        text: html,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: buttons ? { inline_keyboard: buttons } : { inline_keyboard: [] },
      }),
      signal: AbortSignal.timeout(8000),
    })
    return response.ok
  } catch (error) {
    console.error('[telegram] editMessageText threw:', error)
    return false
  }
}

/** Clears the "loading" spinner on a tapped inline button. */
export async function answerCallbackQuery(id: string, text?: string): Promise<void> {
  const cfg = config()
  if (!cfg) return
  try {
    await fetch(`${API}/bot${cfg.token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: id, ...(text ? { text } : {}) }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Cosmetic only.
  }
}

/** Telegram's HTML parse mode accepts a small tag set; everything else must be escaped. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

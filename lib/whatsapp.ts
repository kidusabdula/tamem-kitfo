/**
 * WhatsApp fallback.
 *
 * Ethiopian mobile data drops often enough that a form POST failing is a
 * routine event, not an edge case. Rather than telling the customer "try
 * again", every form offers a wa.me link with the whole enquiry pre-written —
 * they tap once and send it from their own account.
 *
 * The restaurant loses the database record on that path, which is why it is a
 * fallback rather than the primary route. But an order that arrives as a
 * WhatsApp message beats an order that never arrives.
 */

export function buildWhatsAppLink(number: string | null | undefined, text: string): string | null {
  if (!number) return null
  const digits = number.replace(/[^\d]/g, '')
  if (digits.length < 9) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function buildTelegramShareLink(username: string | null | undefined, text: string): string | null {
  if (!username) return null
  const handle = username.replace(/^@/, '')
  return `https://t.me/${handle}?text=${encodeURIComponent(text)}`
}

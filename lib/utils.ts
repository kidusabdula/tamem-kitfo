import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Ethiopian Birr, formatted the way menus in Addis actually read. */
export function formatETB(amount: number, locale: 'en' | 'am' = 'en') {
  const n = new Intl.NumberFormat(locale === 'am' ? 'am-ET' : 'en-ET', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${n} ${locale === 'am' ? 'ብር' : 'ETB'}`
}

/**
 * Short, human-speakable order code. Staff read these aloud over the phone,
 * so the alphabet excludes characters that sound or look alike
 * (0/O, 1/I/L, 5/S, 8/B, U/V).
 */
const CODE_ALPHABET = '23479ACDEFGHJKMNPQRTWXYZ'
export function generateCode(prefix: string): string {
  let out = ''
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length]
  return `${prefix}-${out}`
}

/** Ethiopian mobile numbers, normalised to E.164 for tel: and WhatsApp links. */
export function normalizeEthiopianPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '')
  if (/^\+251[79]\d{8}$/.test(digits)) return digits
  if (/^251[79]\d{8}$/.test(digits)) return `+${digits}`
  if (/^0[79]\d{8}$/.test(digits)) return `+251${digits.slice(1)}`
  if (/^[79]\d{8}$/.test(digits)) return `+251${digits}`
  // Landlines (Addis 011...)
  if (/^\+2511\d{8}$/.test(digits)) return digits
  if (/^01\d{8}$/.test(digits)) return `+251${digits.slice(1)}`
  return null
}

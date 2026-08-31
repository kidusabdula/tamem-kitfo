import { z } from 'zod'
import { normalizeEthiopianPhone } from '@/lib/utils'

/**
 * Validation messages are KEYS into `dictionary.form.validation`, not English
 * sentences. The same schema runs on the client (react-hook-form) and in the
 * Route Handler, and the client renders the message in whichever language the
 * visitor is reading. Baking English strings in here would make every error
 * message untranslatable.
 */

export const nameSchema = z
  .string({ message: 'nameRequired' })
  .trim()
  .min(2, { message: 'nameTooShort' })
  .max(80)

/**
 * Accepts the many ways Ethiopians write a phone number (0911…, +251911…,
 * 251911…, 911…) and normalises to E.164 so staff can tap to call and the
 * WhatsApp deep link works.
 */
export const phoneSchema = z
  .string({ message: 'phoneRequired' })
  .trim()
  .min(1, { message: 'phoneRequired' })
  .transform((value, ctx) => {
    const normalized = normalizeEthiopianPhone(value)
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'phoneInvalid' })
      return z.NEVER
    }
    return normalized
  })

export const optionalEmailSchema = z
  .union([z.literal(''), z.email({ message: 'emailInvalid' })])
  .optional()
  .transform((v) => (v ? v : null))

export const localeSchema = z.enum(['en', 'am']).default('en')

/**
 * Honeypot. A field hidden from humans via CSS; bots that fill every input
 * give themselves away. Cheap, silent, and adds no friction for real users.
 */
export const honeypotSchema = z
  .string()
  .max(0, { message: 'spam' })
  .optional()
  .or(z.literal('').optional())

export const notesSchema = z.string().trim().max(1000).optional().transform((v) => v || null)

/** A future date, tolerant of the client's clock being a few hours off. */
export const futureDateSchema = z
  .string({ message: 'dateRequired' })
  .min(1, { message: 'dateRequired' })
  .refine((value) => {
    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return false
    return parsed > Date.now() - 24 * 60 * 60 * 1000
  }, { message: 'dateInPast' })

/** Extracts the validation key from a ZodError for dictionary lookup. */
export function firstIssueKey(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'errorBody'
}

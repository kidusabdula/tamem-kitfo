import { z } from 'zod'
import {
  futureDateSchema,
  honeypotSchema,
  localeSchema,
  nameSchema,
  notesSchema,
  optionalEmailSchema,
  phoneSchema,
} from './common'

/* ===========================================================================
   ORDER
   =========================================================================== */

export const orderItemSchema = z.object({
  /** Slug, not price. The server looks up the real price — a client that
   *  posts its own prices is a client that can order a 1450 ETB agelgil
   *  for 1 birr. */
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
})

export const orderSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    fulfilment_type: z.enum(['dine_in', 'pickup', 'delivery']),
    scheduled_for: z.string().optional().transform((v) => v || null),
    delivery_address: z.string().trim().max(400).optional().transform((v) => v || null),
    notes: notesSchema,
    items: z.array(orderItemSchema).min(1, { message: 'cartEmpty' }),
    locale: localeSchema,
    website: honeypotSchema,
  })
  .refine(
    (data) => data.fulfilment_type !== 'delivery' || Boolean(data.delivery_address),
    { message: 'addressRequired', path: ['delivery_address'] },
  )

export type OrderInput = z.input<typeof orderSchema>
export type OrderPayload = z.output<typeof orderSchema>

/* ===========================================================================
   CATERING
   =========================================================================== */

export const cateringSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  event_type: z.enum(['wedding', 'mahiber', 'corporate', 'birthday', 'memorial', 'other']),
  event_date: futureDateSchema,
  guest_count: z.coerce
    .number({ message: 'guestsRequired' })
    .int()
    .min(1, { message: 'guestsRange' })
    .max(2000, { message: 'guestsRange' }),
  location: z.string({ message: 'locationRequired' }).trim().min(2, { message: 'locationRequired' }).max(300),
  message: notesSchema,
  locale: localeSchema,
  website: honeypotSchema,
})

export type CateringInput = z.input<typeof cateringSchema>
export type CateringPayload = z.output<typeof cateringSchema>

/* ===========================================================================
   TABLE BOOKING
   =========================================================================== */

export const bookingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  party_size: z.coerce
    .number({ message: 'partyRange' })
    .int()
    .min(1, { message: 'partyRange' })
    .max(40, { message: 'partyRange' }),
  booking_at: futureDateSchema,
  notes: notesSchema,
  locale: localeSchema,
  website: honeypotSchema,
})

export type BookingInput = z.input<typeof bookingSchema>
export type BookingPayload = z.output<typeof bookingSchema>

/* ===========================================================================
   CONTACT
   =========================================================================== */

export const contactSchema = z.object({
  name: nameSchema,
  phone: z.string().trim().max(40).optional().transform((v) => v || null),
  email: optionalEmailSchema,
  message: z
    .string({ message: 'messageRequired' })
    .trim()
    .min(5, { message: 'messageRequired' })
    .max(2000),
  locale: localeSchema,
  website: honeypotSchema,
})

export type ContactInput = z.input<typeof contactSchema>
export type ContactPayload = z.output<typeof contactSchema>

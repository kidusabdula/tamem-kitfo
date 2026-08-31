'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { requireStaff } from '@/lib/admin/auth'
import { STAFF_LOCALE_COOKIE } from '@/lib/admin/locale'
import { createClient } from '@/lib/supabase/server'
import { isLocale } from '@/lib/i18n/config'
import { editTelegramMessage } from '@/lib/telegram/send'
import { formatOrderCard, orderButtons } from '@/lib/telegram/format'
import type {
  BookingStatus,
  FulfilmentType,
  GalleryCategory,
  InquiryStatus,
  OpeningHours,
  OrderStatus,
} from '@/lib/supabase/database.types'

/**
 * Every mutation the CMS can perform.
 *
 * They are Server Actions rather than Route Handlers so the forms work
 * without client-side JavaScript — the same resilience rule the public site
 * follows, and the CMS is used on Ethiopian mobile data too.
 *
 * `revalidatePath('/', 'layout')` after content edits: the public pages are
 * statically rendered with a 5-minute revalidate window, and an owner who
 * changes a price expects to see it immediately, not in five minutes.
 */

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const ORDER_STATUSES: readonly OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'completed',
  'cancelled',
]
const INQUIRY_STATUSES: readonly InquiryStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost']
const BOOKING_STATUSES: readonly BookingStatus[] = [
  'new',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
]
const GALLERY_CATEGORIES: readonly GalleryCategory[] = ['food', 'dining', 'events', 'drinks']

/* ------------------------------------------------------------------ helpers */

function str(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Empty text inputs mean "no value", not an empty string, for nullable columns. */
function nullable(form: FormData, key: string): string | null {
  const value = str(form, key)
  return value.length > 0 ? value : null
}

function bool(form: FormData, key: string): boolean {
  // Unchecked checkboxes are absent from FormData entirely.
  return form.get(key) != null
}

function int(form: FormData, key: string, fallback = 0): number {
  const parsed = Number.parseInt(str(form, key), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function money(form: FormData, key: string): number {
  const parsed = Number.parseFloat(str(form, key))
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      // Amharic has no useful ASCII slug, so a dish named only in Amharic
      // falls through to the timestamp suffix below rather than an empty slug.
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  )
}

function uniqueSlug(input: string): string {
  const base = slugify(input)
  return base.length > 2 ? base : `item-${Date.now().toString(36)}`
}

/* --------------------------------------------------------------- session */

export async function setStaffLocaleAction(formData: FormData) {
  const next = str(formData, 'locale')
  if (isLocale(next)) {
    const store = await cookies()
    store.set(STAFF_LOCALE_COOKIE, next, {
      path: '/admin',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }
  revalidatePath('/admin', 'layout')
}

export async function signInAction(_prev: unknown, formData: FormData): Promise<{ error: boolean }> {
  const email = str(formData, 'email')
  const password = String(formData.get('password') ?? '')
  const next = str(formData, 'next')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: true }

  // Only same-origin admin paths, so a crafted ?next= cannot bounce a staff
  // member to another site right after they type their password.
  redirect(next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/* ---------------------------------------------------------------- orders */

export async function updateOrderStatusAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  const status = str(formData, 'status') as OrderStatus
  if (!id || !ORDER_STATUSES.includes(status)) return

  const { data: order, error } = await session.supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('*, order_items(*)')
    .single()

  if (error || !order) {
    console.error('[admin] order status update failed:', error)
    return
  }

  /*
   * Keep the Telegram card in step with the CMS. Without this, an order
   * confirmed here still shows "Received" in the group and someone confirms
   * it twice. Best-effort: the database is already correct, and Telegram
   * being unreachable must not fail the action.
   */
  if (order.telegram_message_id) {
    await editTelegramMessage(
      order.telegram_message_id,
      formatOrderCard({
        code: order.code,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        fulfilmentType: order.fulfilment_type as FulfilmentType,
        scheduledFor: order.scheduled_for,
        deliveryAddress: order.delivery_address,
        notes: order.notes,
        subtotal: order.subtotal_etb,
        items: order.order_items.map((item) => ({
          name: item.dish_name_snapshot,
          quantity: item.quantity,
          unitPrice: item.unit_price_snapshot,
        })),
        status: order.status,
      }),
      orderButtons(order.id, order.status),
    )
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

export async function updateInquiryStatusAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  const status = str(formData, 'status') as InquiryStatus
  if (!id || !INQUIRY_STATUSES.includes(status)) return

  await session.supabase.from('catering_inquiries').update({ status }).eq('id', id)
  revalidatePath('/admin/catering')
  revalidatePath('/admin')
}

export async function updateBookingStatusAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  const status = str(formData, 'status') as BookingStatus
  if (!id || !BOOKING_STATUSES.includes(status)) return

  await session.supabase.from('table_bookings').update({ status }).eq('id', id)
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

/* ------------------------------------------------------------------ menu */

async function uploadImage(
  session: NonNullable<Awaited<ReturnType<typeof requireStaff>>>,
  bucket: 'dishes' | 'gallery',
  file: File,
): Promise<string | null> {
  if (!file || file.size === 0) return null

  const extension = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${Date.now().toString(36)}-${Math.round(Math.random() * 1e6).toString(36)}.${extension || 'jpg'}`

  const { error } = await session.supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '31536000', upsert: false })

  if (error) {
    console.error(`[admin] ${bucket} upload failed:`, error)
    return null
  }
  return path
}

export async function saveDishAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  const nameEn = str(formData, 'name_en')
  if (!nameEn) return

  const file = formData.get('image') as File | null
  const uploaded = file instanceof File ? await uploadImage(session, 'dishes', file) : null

  const fields = {
    name_en: nameEn,
    name_am: nullable(formData, 'name_am'),
    description_en: nullable(formData, 'description_en'),
    description_am: nullable(formData, 'description_am'),
    price_etb: money(formData, 'price_etb'),
    category_id: nullable(formData, 'category_id'),
    spice_level: Math.min(3, Math.max(0, int(formData, 'spice_level'))),
    is_available: bool(formData, 'is_available'),
    is_popular: bool(formData, 'is_popular'),
    sort_order: int(formData, 'sort_order'),
    // Leaving the file input empty must keep the existing photo, not clear it.
    ...(uploaded ? { image_path: uploaded } : {}),
  }

  if (id) {
    await session.supabase.from('dishes').update(fields).eq('id', id)
  } else {
    await session.supabase.from('dishes').insert({ ...fields, slug: uniqueSlug(nameEn) })
  }

  revalidatePath('/admin/menu')
  revalidatePath('/', 'layout')
}

export async function deleteDishAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  if (!id) return

  // order_items.dish_id is ON DELETE SET NULL and carries name/price
  // snapshots, so deleting a dish never rewrites what a customer was charged.
  await session.supabase.from('dishes').delete().eq('id', id)

  revalidatePath('/admin/menu')
  revalidatePath('/', 'layout')
}

export async function saveCategoryAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  const nameEn = str(formData, 'name_en')
  if (!nameEn) return

  const fields = {
    name_en: nameEn,
    name_am: nullable(formData, 'name_am'),
    sort_order: int(formData, 'sort_order'),
  }

  if (id) {
    await session.supabase.from('menu_categories').update(fields).eq('id', id)
  } else {
    await session.supabase.from('menu_categories').insert({ ...fields, slug: uniqueSlug(nameEn) })
  }

  revalidatePath('/admin/menu')
  revalidatePath('/', 'layout')
}

/* --------------------------------------------------------------- gallery */

export async function uploadGalleryAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length === 0) return

  const rawCategory = str(formData, 'category') as GalleryCategory
  const category = GALLERY_CATEGORIES.includes(rawCategory) ? rawCategory : 'food'

  for (const file of files) {
    const path = await uploadImage(session, 'gallery', file)
    if (!path) continue
    await session.supabase.from('gallery_images').insert({
      storage_path: path,
      // Alt text is required for accessibility but the owner uploads in bulk;
      // seeding it from the filename is better than an empty string and is
      // editable in the row right below.
      alt_en: str(formData, 'alt_en') || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      alt_am: nullable(formData, 'alt_am'),
      category,
      is_published: true,
    })
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/', 'layout')
}

export async function updateGalleryAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  if (!id) return

  const rawCategory = str(formData, 'category') as GalleryCategory

  await session.supabase
    .from('gallery_images')
    .update({
      alt_en: str(formData, 'alt_en'),
      alt_am: nullable(formData, 'alt_am'),
      ...(GALLERY_CATEGORIES.includes(rawCategory) ? { category: rawCategory } : {}),
      is_published: bool(formData, 'is_published'),
      sort_order: int(formData, 'sort_order'),
    })
    .eq('id', id)

  revalidatePath('/admin/gallery')
  revalidatePath('/', 'layout')
}

export async function deleteGalleryAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const id = str(formData, 'id')
  const path = str(formData, 'storage_path')
  if (!id) return

  await session.supabase.from('gallery_images').delete().eq('id', id)
  if (path) await session.supabase.storage.from('gallery').remove([path])

  revalidatePath('/admin/gallery')
  revalidatePath('/', 'layout')
}

/* --------------------------------------------------------------- content */

export async function saveContentAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const key = str(formData, 'key')
  if (!key) return

  await session.supabase
    .from('site_content')
    .upsert(
      { key, value_en: nullable(formData, 'value_en'), value_am: nullable(formData, 'value_am') },
      { onConflict: 'key' },
    )

  revalidatePath('/admin/content')
  revalidatePath('/', 'layout')
}

export async function resetContentAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const key = str(formData, 'key')
  if (!key) return

  // Deleting the override row is what restores the wording built into the
  // site — there is no separate "default" to write back.
  await session.supabase.from('site_content').delete().eq('key', key)

  revalidatePath('/admin/content')
  revalidatePath('/', 'layout')
}

/* -------------------------------------------------------------- settings */

export async function saveSettingsAction(formData: FormData) {
  const session = await requireStaff()
  if (!session) return

  const hours: OpeningHours = {}
  for (const day of DAYS) {
    const open = str(formData, `hours_${day}_open`)
    const close = str(formData, `hours_${day}_close`)
    hours[day] = open && close ? [open, close] : null
  }

  /*
   * upsert, not update. site_settings is a singleton keyed on `id = true`, and
   * on a fresh database that row may not exist yet — an update would report
   * success while changing nothing, and the owner would think they had saved
   * their phone number.
   */
  await session.supabase
    .from('site_settings')
    .upsert({
      id: true,
      phones: str(formData, 'phones')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      whatsapp_number: nullable(formData, 'whatsapp_number'),
      email: nullable(formData, 'email'),
      address_en: nullable(formData, 'address_en'),
      address_am: nullable(formData, 'address_am'),
      map_url: nullable(formData, 'map_url'),
      hours,
      is_accepting_orders: bool(formData, 'is_accepting_orders'),
      delivery_note_en: nullable(formData, 'delivery_note_en'),
      delivery_note_am: nullable(formData, 'delivery_note_am'),
    })

  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
}

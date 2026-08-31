import 'server-only'
import { createPublicClient } from '@/lib/supabase/server'
import type {
  Dish,
  GalleryImage,
  MenuCategory,
  SiteSettings,
} from '@/lib/supabase/database.types'
import {
  fixtureCategories,
  fixtureDishes,
  fixtureGallery,
  fixtureSettings,
} from './fixtures'

/**
 * Public content reads.
 *
 * Every function here degrades to fixtures rather than throwing. A restaurant
 * site whose one job is showing a menu and an address should never render an
 * error page because a database is briefly unreachable.
 *
 * These are called from statically-generated pages, so in production they run
 * at build time and on revalidation, not per request.
 */

export const revalidateSeconds = 300

async function safe<T>(run: () => Promise<T | null>, fallback: T, label: string): Promise<T> {
  try {
    const result = await run()
    return result ?? fallback
  } catch (error) {
    console.error(`[data] ${label} failed, serving fixtures:`, error)
    return fallback
  }
}

export async function getCategories(): Promise<MenuCategory[]> {
  return safe(
    async () => {
      const supabase = createPublicClient()
      if (!supabase) return null
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return data.length > 0 ? data : null
    },
    fixtureCategories,
    'getCategories',
  )
}

export async function getDishes(): Promise<Dish[]> {
  return safe(
    async () => {
      const supabase = createPublicClient()
      if (!supabase) return null
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('is_available', true)
        .order('sort_order')
      if (error) throw error
      return data.length > 0 ? data : null
    },
    fixtureDishes,
    'getDishes',
  )
}

export async function getPopularDishes(limit = 4): Promise<Dish[]> {
  const dishes = await getDishes()
  const popular = dishes.filter((d) => d.is_popular)
  return (popular.length > 0 ? popular : dishes).slice(0, limit)
}

export async function getDishesBySlug(slugs: string[]): Promise<Map<string, Dish>> {
  const dishes = await getDishes()
  const wanted = new Set(slugs)
  return new Map(dishes.filter((d) => wanted.has(d.slug)).map((d) => [d.slug, d]))
}

export async function getGallery(): Promise<GalleryImage[]> {
  return safe(
    async () => {
      const supabase = createPublicClient()
      if (!supabase) return null
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_published', true)
        .order('sort_order')
      if (error) throw error
      return data.length > 0 ? data : null
    },
    fixtureGallery,
    'getGallery',
  )
}

export async function getSettings(): Promise<SiteSettings> {
  return safe(
    async () => {
      const supabase = createPublicClient()
      if (!supabase) return null
      const { data, error } = await supabase.from('site_settings').select('*').single()
      if (error) throw error
      return data
    },
    fixtureSettings,
    'getSettings',
  )
}

/**
 * CMS copy overrides, keyed to paths in the typed dictionary
 * (e.g. "home.storyTitle"). Missing keys fall through to the shipped copy,
 * so the owners only need to fill in what they actually want to change.
 */
export async function getContentOverrides(): Promise<Map<string, { en: string | null; am: string | null }>> {
  return safe(
    async () => {
      const supabase = createPublicClient()
      if (!supabase) return null
      const { data, error } = await supabase.from('site_content').select('*')
      if (error) throw error
      return new Map(data.map((row) => [row.key, { en: row.value_en, am: row.value_am }]))
    },
    new Map<string, { en: string | null; am: string | null }>(),
    'getContentOverrides',
  )
}

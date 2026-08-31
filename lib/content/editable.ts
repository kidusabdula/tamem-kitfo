import type { Dictionary, Locale } from '@/lib/i18n/config'

/**
 * The copy the owners are allowed to rewrite.
 *
 * Deliberately a curated list, not "every string in the dictionary". Exposing
 * all of it would let someone blank out "Add to cart" or the phone-number
 * label and quietly break the site. These are the sentences that are actually
 * about the restaurant — its story, its promises — which are exactly the ones
 * a template writer gets wrong and the owner should correct.
 *
 * A key with no row in `site_content` falls back to the wording built into the
 * dictionary, in the visitor's language. Deleting the row is how you undo.
 */

export interface EditableSlot {
  key: string
  /** Where this text appears, described for staff in both languages. */
  label: { en: string; am: string }
  fallback: (dict: Dictionary) => string
  multiline?: boolean
}

export const editableSlots: readonly EditableSlot[] = [
  {
    key: 'home.heroTitleLine1',
    label: { en: 'Home · headline, first line', am: 'መነሻ · ዋና አርዕስት፣ የመጀመሪያ መስመር' },
    fallback: (d) => d.home.heroTitleLine1,
  },
  {
    key: 'home.heroTitleLine2',
    label: { en: 'Home · headline, second line', am: 'መነሻ · ዋና አርዕስት፣ ሁለተኛ መስመር' },
    fallback: (d) => d.home.heroTitleLine2,
  },
  {
    key: 'home.heroBody',
    label: { en: 'Home · paragraph under the headline', am: 'መነሻ · ከአርዕስቱ በታች ያለው አንቀጽ' },
    fallback: (d) => d.home.heroBody,
    multiline: true,
  },
  {
    key: 'home.storyTitle',
    label: { en: 'Home · story heading', am: 'መነሻ · የታሪክ አርዕስት' },
    fallback: (d) => d.home.storyTitle,
  },
  {
    key: 'home.storyBody1',
    label: { en: 'Home · story, first paragraph', am: 'መነሻ · ታሪክ፣ የመጀመሪያ አንቀጽ' },
    fallback: (d) => d.home.storyBody1,
    multiline: true,
  },
  {
    key: 'home.storyBody2',
    label: { en: 'Home · story, second paragraph', am: 'መነሻ · ታሪክ፣ ሁለተኛ አንቀጽ' },
    fallback: (d) => d.home.storyBody2,
    multiline: true,
  },
  {
    key: 'home.cateringBody',
    label: { en: 'Home · catering paragraph', am: 'መነሻ · የግብዣ አንቀጽ' },
    fallback: (d) => d.home.cateringBody,
    multiline: true,
  },
  {
    key: 'home.eventsBody',
    label: { en: 'Home · events paragraph', am: 'መነሻ · የዝግጅት አንቀጽ' },
    fallback: (d) => d.home.eventsBody,
    multiline: true,
  },
  {
    key: 'catering.heroBody',
    label: { en: 'Catering page · introduction', am: 'የግብዣ ገጽ · መግቢያ' },
    fallback: (d) => d.catering.heroBody,
    multiline: true,
  },
  {
    key: 'events.heroBody',
    label: { en: 'Events page · introduction', am: 'የዝግጅት ገጽ · መግቢያ' },
    fallback: (d) => d.events.heroBody,
    multiline: true,
  },
  {
    key: 'menu.intro',
    label: { en: 'Menu page · introduction', am: 'የምናሌ ገጽ · መግቢያ' },
    fallback: (d) => d.menu.intro,
    multiline: true,
  },
] as const

export type CopyOverrides = Map<string, { en: string | null; am: string | null }>

/**
 * Returns a reader that prefers the owner's wording and falls back to the
 * dictionary. Amharic falls back to the owner's English before falling back to
 * the built-in Amharic, so a half-translated override never shows a blank.
 */
export function makeCopy(overrides: CopyOverrides, dict: Dictionary, locale: Locale) {
  return (slotKey: string): string => {
    const slot = editableSlots.find((candidate) => candidate.key === slotKey)
    const builtIn = slot ? slot.fallback(dict) : ''
    const row = overrides.get(slotKey)
    if (!row) return builtIn

    const preferred = locale === 'am' ? row.am : row.en
    if (preferred && preferred.trim()) return preferred
    if (locale === 'am' && row.en && row.en.trim()) return row.en
    return builtIn
  }
}

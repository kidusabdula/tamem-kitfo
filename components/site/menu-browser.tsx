'use client'

import * as React from 'react'
import { DishCard } from './dish-card'
import { pick, type Dictionary, type Locale } from '@/lib/i18n/config'
import type { Dish, MenuCategory } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

/**
 * Category filtering happens in the browser over the full dish list.
 *
 * The whole menu is a handful of kilobytes, so shipping all of it and
 * filtering client-side is faster than a round trip per tab — and it keeps
 * the page statically prerendered, which matters far more on a slow
 * connection than saving a few bytes.
 */
export function MenuBrowser({
  dishes,
  categories,
  locale,
  dict,
  canOrder,
}: {
  dishes: Dish[]
  categories: MenuCategory[]
  locale: Locale
  dict: Dictionary
  canOrder: boolean
}) {
  const [active, setActive] = React.useState<string | null>(null)

  // Only show tabs for categories that actually contain something today.
  const populated = React.useMemo(
    () => categories.filter((c) => dishes.some((d) => d.category_id === c.id)),
    [categories, dishes],
  )

  const visible = active ? dishes.filter((d) => d.category_id === active) : dishes

  return (
    <div>
      <div
        role="tablist"
        aria-label={dict.menu.title}
        className="flex flex-wrap justify-center gap-2"
      >
        <FilterTab active={active === null} onClick={() => setActive(null)}>
          {dict.menu.allItems}
        </FilterTab>
        {populated.map((category) => (
          <FilterTab
            key={category.id}
            active={active === category.id}
            onClick={() => setActive(category.id)}
          >
            {pick(category, 'name', locale)}
          </FilterTab>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted">{dict.menu.empty}</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((dish, index) => (
            <DishCard
              key={dish.id}
              dish={dish}
              locale={locale}
              dict={dict}
              canOrder={canOrder}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
        active
          ? 'bg-brown-800 text-cream-100'
          : 'bg-surface text-brown-700 hover:bg-brown-100 hover:text-brown-900',
      )}
    >
      {children}
    </button>
  )
}

'use client'

import * as React from 'react'
import Image from 'next/image'
import { Check, Plus } from 'lucide-react'
import { Badge, DishMonogram, Price, SpiceLevel } from '@/components/ui/bits'
import { useCart } from '@/lib/cart/context'
import { resolveDishImage } from '@/lib/data/images'
import { pick, type Dictionary, type Locale } from '@/lib/i18n/config'
import type { Dish } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

export function DishCard({
  dish,
  locale,
  dict,
  canOrder,
  priority = false,
}: {
  dish: Dish
  locale: Locale
  dict: Dictionary
  /** False when the owners have paused online ordering from the CMS. */
  canOrder: boolean
  priority?: boolean
}) {
  const { add, lines } = useCart()
  const [justAdded, setJustAdded] = React.useState(false)

  const name = pick(dish, 'name', locale)
  const description = pick(dish, 'description', locale)
  const image = resolveDishImage(dish.slug, dish.image_path)
  const inCart = lines.find((l) => l.slug === dish.slug)

  function handleAdd() {
    add({ slug: dish.slug, nameEn: dish.name_en, nameAm: dish.name_am, price: dish.price_etb })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-4/3 overflow-hidden bg-surface-sunk">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
        ) : (
          <DishMonogram name={name} className="size-full" />
        )}

        {dish.is_popular ? (
          <Badge className="absolute top-3 left-3 shadow-sm">{dict.menu.popular}</Badge>
        ) : null}
        {dish.tags.includes('vegan') || dish.tags.includes('fasting') ? (
          <Badge tone="green" className="absolute top-3 right-3 shadow-sm">
            {locale === 'am' ? 'ጾም' : 'Fasting'}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug font-semibold text-brown-900">{name}</h3>
          <Price amount={dish.price_etb} locale={locale} className="shrink-0 pt-0.5" />
        </div>

        {description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <SpiceLevel
            level={dish.spice_level}
            label={dict.menu.spiceLabel}
            labels={dict.menu.spice}
          />

          {canOrder ? (
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                justAdded
                  ? 'bg-gomen text-cream-50'
                  : 'bg-brown-800 text-cream-100 hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {justAdded ? (
                <>
                  <Check className="size-4" /> {dict.actions.inCart}
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {dict.actions.addToCart}
                  {inCart ? <span className="tabular-nums">· {inCart.quantity}</span> : null}
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

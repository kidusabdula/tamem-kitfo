'use client'

import { Minus, Plus, UtensilsCrossed } from 'lucide-react'

import type { Dictionary } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

export interface CateringPick {
  slug: string
  name: string
}

/**
 * Optional dish selection for a catering enquiry, collapsed until opened.
 *
 * A native <details>, not a state-driven toggle: the expansion works with
 * zero JavaScript, which keeps the form's no-JS story intact as far as it
 * goes (the submit itself needs JS regardless, but nothing here should make
 * that worse).
 *
 * Deliberately NOT the cart. A quote request and an order are different
 * intents — a customer gathering a catering price must not find their order
 * cart rearranged, and vice versa. Quantities are portions for an event,
 * which is why the ceiling here is far above the order flow's.
 */
export function CateringDishPicker({
  dishes,
  dict,
  value,
  onChange,
}: {
  dishes: CateringPick[]
  dict: Dictionary
  /** slug -> quantity. Only picked dishes appear. */
  value: Record<string, number>
  onChange: (next: Record<string, number>) => void
}) {
  const pickedCount = Object.keys(value).length

  const setQuantity = (slug: string, quantity: number) => {
    const next = { ...value }
    if (quantity <= 0) delete next[slug]
    else next[slug] = Math.min(quantity, 2000)
    onChange(next)
  }

  return (
    <details className="group rounded-[var(--radius-card)] border border-brown-200 bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ember-100 text-accent-ink">
            <UtensilsCrossed className="size-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[0.9375rem] font-semibold text-brown-900">
              {dict.catering.dishesTitle}
            </span>
            <span className="block text-xs text-ink-subtle">{dict.form.optional}</span>
          </span>
        </span>
        <span className="flex items-center gap-2.5">
          {pickedCount > 0 ? (
            <span className="grid min-w-6 place-items-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground tabular-nums">
              {pickedCount}
            </span>
          ) : null}
          <Plus
            aria-hidden="true"
            className="size-4 text-brown-500 transition-transform duration-200 group-open:rotate-45"
          />
        </span>
      </summary>

      <div className="border-t border-[var(--color-hairline)] px-5 pb-5 pt-4">
        <p className="text-xs leading-relaxed text-ink-subtle">{dict.catering.dishesHint}</p>

        <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {dishes.map((dish) => {
            const quantity = value[dish.slug] ?? 0
            const picked = quantity > 0
            return (
              <li
                key={dish.slug}
                className={cn(
                  'flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] py-2.5 last:border-b-0 sm:last:border-b sm:[&:nth-last-child(2)]:border-b-0',
                  picked && 'text-brown-900',
                )}
              >
                <span className="min-w-0 truncate text-[0.9375rem] text-brown-800">{dish.name}</span>

                {picked ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-sunk p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(dish.slug, quantity - 1)}
                      aria-label={`− ${dish.name}`}
                      className="grid size-7 place-items-center rounded-full text-brown-700 transition-colors hover:bg-brown-100"
                    >
                      <Minus className="size-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(dish.slug, quantity + 1)}
                      aria-label={`+ ${dish.name}`}
                      className="grid size-7 place-items-center rounded-full text-brown-700 transition-colors hover:bg-brown-100"
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuantity(dish.slug, 1)}
                    className="shrink-0 rounded-full border border-brown-300 px-3 py-1 text-xs font-semibold text-brown-700 transition-colors hover:border-brown-800 hover:text-brown-950"
                  >
                    +
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </details>
  )
}

import { cn, formatETB } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'

/**
 * Price. Rendered in `accent-ink`, the darkened orange — the true logo orange
 * only reaches 2.26:1 against cream and would fail AA as small text.
 */
export function Price({
  amount,
  locale,
  className,
  size = 'md',
}: {
  amount: number
  locale: Locale
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' } as const
  return (
    <span
      className={cn(
        'font-display font-semibold tabular-nums tracking-tight text-accent-ink',
        sizes[size],
        className,
      )}
    >
      {formatETB(amount, locale)}
    </span>
  )
}

/**
 * Spice level as three chilli pips rather than a number, which reads at a
 * glance and needs no translation. The text label is still exposed to screen
 * readers so the meaning is never colour-only.
 */
export function SpiceLevel({
  level,
  label,
  labels,
  className,
}: {
  level: number
  label: string
  labels: string[]
  className?: string
}) {
  if (level <= 0) return null
  const description = labels[level] ?? ''
  return (
    <span className={cn('inline-flex items-center gap-1', className)} title={description}>
      <span className="sr-only">
        {label}: {description}
      </span>
      {[1, 2, 3].map((pip) => (
        <span
          key={pip}
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full transition-colors',
            pip <= level ? 'bg-berbere' : 'bg-brown-200',
          )}
        />
      ))}
    </span>
  )
}

export function Badge({
  children,
  tone = 'accent',
  className,
}: {
  children: React.ReactNode
  tone?: 'accent' | 'neutral' | 'green'
  className?: string
}) {
  const tones = {
    accent: 'bg-ember-100 text-accent-ink',
    neutral: 'bg-brown-100 text-brown-700',
    green: 'bg-gomen/12 text-gomen',
  } as const
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * Used where a dish has no photograph. A typographic card is honest; showing
 * a stock picture of someone else's food is not.
 */
export function DishMonogram({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase()
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-linear-to-br from-brown-100 to-surface-sunk',
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-display text-4xl font-semibold text-brown-300">{initial}</span>
    </div>
  )
}

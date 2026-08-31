import * as React from 'react'
import { cn } from '@/lib/utils'
import { DiamondRule } from './tibeb'
import { Reveal } from './reveal'

export function Section({
  className,
  tone = 'canvas',
  id,
  children,
}: {
  className?: string
  /** Alternating tone is what gives the page rhythm without adding borders. */
  tone?: 'canvas' | 'surface' | 'sunk' | 'espresso'
  id?: string
  children: React.ReactNode
}) {
  const tones = {
    canvas: 'bg-canvas text-ink',
    surface: 'bg-surface text-ink',
    sunk: 'bg-surface-sunk text-ink',
    espresso: 'bg-espresso text-cream-100',
  } as const

  return (
    <section id={id} className={cn('py-20 md:py-28', tones[tone], className)}>
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'center',
  tone = 'dark',
  className,
}: {
  eyebrow?: string
  title: string
  body?: string
  align?: 'center' | 'start'
  /** `light` inverts the colours for use on espresso or over photography. */
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow', tone === 'light' && 'text-ember-300')}>{eyebrow}</p>
      ) : null}

      <h2
        className={cn(
          'display-md max-w-2xl',
          tone === 'light' ? 'text-cream-50' : 'text-brown-900',
        )}
      >
        {title}
      </h2>

      <DiamondRule className={align === 'center' ? '' : 'self-start'} />

      {body ? (
        <p
          className={cn(
            'max-w-xl text-[1.0625rem] leading-relaxed',
            tone === 'light' ? 'text-cream-200/85' : 'text-ink-muted',
          )}
        >
          {body}
        </p>
      ) : null}
    </Reveal>
  )
}

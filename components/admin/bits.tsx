'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'

/**
 * Small pieces shared by every CMS screen. Deliberately plain: dense rows,
 * unmistakable status colours, and touch targets big enough to hit on a phone
 * in a busy kitchen.
 */

export function PageHeader({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-semibold text-brown-900">
        {title}
        {typeof count === 'number' ? (
          <span className="ml-2 text-base font-normal text-ink-subtle">{count}</span>
        ) : null}
      </h1>
      {children}
    </div>
  )
}

export function Panel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-card)] transition-colors',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Panel className="text-center">
      <p className="py-8 text-sm text-ink-subtle">{message}</p>
    </Panel>
  )
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel className="hover:border-brown-300">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-brown-900 tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-ink-subtle">{hint}</p> : null}
    </Panel>
  )
}

/**
 * Status colour is carried by hue *and* by the word itself, never by hue
 * alone — a red and a green pill are indistinguishable to a red-green
 * colourblind cook.
 */
const PILL_TONE: Record<string, string> = {
  new: 'bg-ember-100 text-accent-ink',
  confirmed: 'bg-gomen/12 text-gomen',
  preparing: 'bg-ember-100 text-accent-ink',
  seated: 'bg-gomen/12 text-gomen',
  completed: 'bg-brown-100 text-brown-700',
  cancelled: 'bg-berbere/10 text-berbere',
  contacted: 'bg-tej/15 text-brown-800',
  quoted: 'bg-tej/15 text-brown-800',
  won: 'bg-gomen/12 text-gomen',
  lost: 'bg-berbere/10 text-berbere',
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
        PILL_TONE[status] ?? 'bg-brown-100 text-brown-700',
      )}
    >
      {label}
    </span>
  )
}

/** Disables itself while the enclosing Server Action is in flight. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = 'primary',
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
  variant?: 'primary' | 'accent' | 'quiet' | 'danger'
}) {
  const { pending } = useFormStatus()
  const tone =
    variant === 'accent'
      ? 'bg-accent text-accent-foreground hover:bg-ember-600'
      : variant === 'quiet'
        ? 'border border-brown-200 bg-surface text-brown-800 hover:border-brown-300'
        : variant === 'danger'
          ? 'border border-berbere/40 bg-surface text-berbere hover:bg-berbere/8'
          : 'bg-brown-900 text-cream-50 hover:bg-brown-800'

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-60',
        tone,
        className,
      )}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  )
}

/**
 * Status dropdown that submits the moment it changes — one tap instead of
 * select-then-press-save.
 *
 * It is controlled, not uncontrolled, so the browser widget stays mapped to
 * the order row's canonical status after the server action revalidates the
 * page. Falls back to a visible Save button when JavaScript is not running.
 */
export function StatusSelect({
  name,
  value,
  options,
  saveLabel,
  label,
}: {
  name: string
  value: string
  options: { value: string; label: string }[]
  saveLabel: string
  label?: string
}) {
  const { pending } = useFormStatus()
  const [selected, setSelected] = React.useState(value)

  React.useEffect(() => {
    setSelected(value)
  }, [value])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          {label}
        </span>
      ) : null}
      <select
        name={name}
        value={selected}
        aria-label={label}
        disabled={pending}
        onChange={(event) => {
          const next = event.currentTarget.value
          setSelected(next)
          if (!pending) event.currentTarget.form?.requestSubmit()
        }}
        className={cn(
          'min-h-11 rounded-xl border border-hairline bg-surface px-3 text-sm font-medium text-brown-800',
          'hover:border-brown-300 focus:border-accent-ink focus:outline-none disabled:opacity-60',
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {pending ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-subtle">
          <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
          {saveLabel}…
        </span>
      ) : null}
      <noscript>
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-brown-900 px-3 text-sm font-semibold text-cream-50"
        >
          {saveLabel}
        </button>
      </noscript>
    </div>
  )
}

/** Destructive submit that asks first. Without JS it submits directly. */
export function ConfirmSubmit({
  message,
  children,
  className,
}: {
  message: string
  children: React.ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault()
      }}
      className={cn(
        'inline-flex min-h-11 items-center rounded-xl border border-berbere/40 px-3 text-sm font-semibold text-berbere transition-colors hover:bg-berbere/8 disabled:opacity-60',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function AdminField({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-brown-800">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
    </div>
  )
}

export const adminControl =
  'min-h-11 w-full rounded-xl border border-brown-200 bg-surface px-3 py-2 text-sm text-ink ' +
  'placeholder:text-ink-subtle/70 hover:border-brown-300 focus:border-accent-ink focus:outline-none'

/**
 * Label-plus-control pairs.
 *
 * The settings form was eleven repetitions of AdminField wrapping a bare input
 * with `adminControl` pasted on by hand. That is the shape a styling mistake
 * hides in: one field missing the class, or one `id` that no longer matches its
 * `htmlFor`, looks fine in review and silently breaks the label association.
 *
 * These render exactly the same markup, with `id` derived from `name` so the
 * two can never drift apart.
 */
export function TextField({
  name,
  label,
  hint,
  type = 'text',
  inputMode,
  defaultValue,
  lang,
  className,
}: {
  name: string
  label: string
  hint?: string
  type?: 'text' | 'tel' | 'email' | 'url' | 'number'
  inputMode?: 'text' | 'tel' | 'email' | 'url' | 'numeric'
  defaultValue?: string | number | null
  lang?: string
  className?: string
}) {
  return (
    <AdminField label={label} htmlFor={name} hint={hint} className={className}>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        lang={lang}
        defaultValue={defaultValue ?? ''}
        className={adminControl}
      />
    </AdminField>
  )
}

export function TextAreaField({
  name,
  label,
  hint,
  rows = 2,
  defaultValue,
  lang,
  mono = false,
  className,
}: {
  name: string
  label: string
  hint?: string
  rows?: number
  defaultValue?: string | null
  lang?: string
  /** Monospace, for values that are one-per-line rather than prose. */
  mono?: boolean
  className?: string
}) {
  return (
    <AdminField label={label} htmlFor={name} hint={hint} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        lang={lang}
        defaultValue={defaultValue ?? ''}
        className={cn(adminControl, 'resize-y', mono && 'font-mono')}
      />
    </AdminField>
  )
}

/**
 * One opening window per day.
 *
 * A day left blank means closed, which is why these are two plain time inputs
 * rather than a range control: "closed" has to be as easy to express as a pair
 * of times, and clearing both fields is the most obvious way to say it.
 */
export function HoursEditor({
  days,
  dayLabel,
  hours,
  opensLabel,
  closesLabel,
}: {
  days: readonly string[]
  dayLabel: Record<string, string>
  hours: Record<string, [string, string] | null | undefined>
  opensLabel: string
  closesLabel: string
}) {
  return (
    <ul className="flex flex-col gap-2">
      {days.map((day) => {
        const window = hours[day] ?? null
        return (
          <li key={day} className="flex flex-wrap items-center gap-2">
            <span className="w-24 shrink-0 text-sm font-medium text-brown-800">
              {dayLabel[day]}
            </span>
            <input
              type="time"
              name={`hours_${day}_open`}
              defaultValue={window?.[0] ?? ''}
              aria-label={`${dayLabel[day]} — ${opensLabel}`}
              className={cn(adminControl, 'w-32')}
            />
            <span className="text-ink-subtle">–</span>
            <input
              type="time"
              name={`hours_${day}_close`}
              defaultValue={window?.[1] ?? ''}
              aria-label={`${dayLabel[day]} — ${closesLabel}`}
              className={cn(adminControl, 'w-32')}
            />
          </li>
        )
      })}
    </ul>
  )
}

/** A panel whose contents are introduced by a heading and a line of guidance. */
export function PanelSection({
  title,
  hint,
  className,
  children,
}: {
  title: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Panel className={className}>
      <p className="text-sm font-semibold text-brown-900">{title}</p>
      {hint ? <p className="mt-1 mb-4 text-xs text-ink-subtle">{hint}</p> : null}
      {children}
    </Panel>
  )
}

export function Toggle({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string
  label: string
  defaultChecked?: boolean
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brown-200 bg-surface p-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
      />
      <span>
        <span className="block text-sm font-medium text-brown-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-subtle">{hint}</span> : null}
      </span>
    </label>
  )
}

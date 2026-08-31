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
        'rounded-2xl border border-brown-200/70 bg-surface p-5 shadow-[var(--shadow-card)]',
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
    <Panel>
      <p className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-brown-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-subtle">{hint}</p> : null}
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
 * A status dropdown that submits the moment it changes — one tap instead of
 * select-then-press-save. Falls back to a visible Save button when JavaScript
 * is not running, so the form still works.
 */
export function StatusSelect({
  name,
  value,
  options,
  saveLabel,
}: {
  name: string
  value: string
  options: { value: string; label: string }[]
  saveLabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        name={name}
        defaultValue={value}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="min-h-11 rounded-xl border border-brown-200 bg-surface px-3 text-sm text-ink hover:border-brown-300 focus:border-accent-ink focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

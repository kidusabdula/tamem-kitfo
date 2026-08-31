'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const control =
  'w-full rounded-xl border border-brown-200 bg-surface px-4 py-3 text-[0.9375rem] text-ink ' +
  'placeholder:text-ink-subtle/70 transition-colors ' +
  'hover:border-brown-300 focus:border-accent-ink focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'aria-[invalid=true]:border-berbere'

export function Field({
  label,
  hint,
  error,
  required,
  optionalLabel,
  children,
  htmlFor,
  className,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  optionalLabel?: string
  children: React.ReactNode
  htmlFor: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-brown-800">
        {label}
        {!required && optionalLabel ? (
          <span className="ml-1.5 text-xs font-normal text-ink-subtle">({optionalLabel})</span>
        ) : null}
      </label>
      {children}
      {/*
        aria-live so a screen reader announces the error when it appears,
        rather than the user tabbing away and never learning why the form
        would not submit.
      */}
      {error ? (
        <p className="text-sm text-berbere" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, className)} {...props} />
  },
)

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} rows={4} className={cn(control, 'resize-y', className)} {...props} />
  },
)

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(control, 'appearance-none pr-10', className)} {...props}>
        {children}
      </select>
    )
  },
)

/**
 * Honeypot. Hidden from sighted users AND from screen readers (aria-hidden +
 * tabIndex -1), so no real person can fill it by accident — which would
 * otherwise silently reject a legitimate order.
 *
 * Deliberately NOT `display: none`: some bots skip hidden inputs, but nearly
 * all fill an off-screen one.
 */
export function Honeypot({ register }: { register?: React.ComponentProps<'input'> }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Leave this field empty</label>
      <input
        id="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register}
      />
    </div>
  )
}

/** Radio group rendered as selectable cards. Used for fulfilment type. */
export function ChoiceCards<T extends string>({
  name,
  value,
  onChange,
  options,
  legend,
}: {
  name: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; hint?: string }[]
  legend: string
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-brown-800">{legend}</legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors',
                selected
                  ? 'border-accent-ink bg-ember-100/60'
                  : 'border-brown-200 bg-surface hover:border-brown-300',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'text-[0.9375rem] font-semibold',
                  selected ? 'text-accent-ink' : 'text-brown-800',
                )}
              >
                {option.label}
              </span>
              {option.hint ? (
                <span className="text-xs leading-relaxed text-ink-subtle">{option.hint}</span>
              ) : null}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

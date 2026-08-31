'use client'

import * as React from 'react'
import { CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DiamondRule } from '@/components/ui/tibeb'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import type { Dictionary } from '@/lib/i18n/config'

export function SuccessPanel({
  title,
  body,
  code,
  codeLabel,
  codeHint,
}: {
  title: string
  body: string
  code?: string
  codeLabel?: string
  codeHint?: string
}) {
  return (
    <div
      className="rounded-[var(--radius-card)] border border-gomen/25 bg-gomen/6 p-8 text-center"
      role="status"
    >
      <CheckCircle2 className="mx-auto size-11 text-gomen" aria-hidden="true" />
      <h2 className="mt-4 font-display text-2xl font-semibold text-brown-900">{title}</h2>
      <DiamondRule className="mx-auto mt-4 justify-center" />
      <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>

      {code ? (
        <div className="mt-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-ink-subtle uppercase">
            {codeLabel}
          </p>
          {/* Deliberately large and monospaced: staff read this aloud over the
              phone, and customers screenshot it. */}
          <p className="mt-2 font-mono text-3xl font-bold tracking-[0.12em] text-accent-ink">
            {code}
          </p>
          {codeHint ? <p className="mt-2 text-xs text-ink-subtle">{codeHint}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Error state with a WhatsApp escape hatch.
 *
 * When a submission fails on Ethiopian mobile data, "please try again" is
 * usually wrong advice — the network is the problem and retrying fails too.
 * The pre-filled WhatsApp message gets the enquiry to the restaurant anyway.
 */
export function FormError({
  message,
  dict,
  whatsappNumber,
  fallbackText,
}: {
  message: string
  dict: Dictionary
  whatsappNumber?: string | null
  fallbackText: string
}) {
  const link = buildWhatsAppLink(whatsappNumber, fallbackText)
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-berbere/30 bg-berbere/6 p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-berbere" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-brown-900">{dict.form.errorTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{message}</p>
        </div>
      </div>
      {link ? (
        <Button asChild variant="outline" size="sm" className="self-start">
          <a href={link} target="_blank" rel="noreferrer noopener">
            <MessageCircle className="size-4" />
            {dict.actions.continueOnWhatsApp}
          </a>
        </Button>
      ) : null}
    </div>
  )
}

/** Card wrapper shared by every public form. */
export function FormCard({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
      {title ? (
        <h2 className="mb-6 font-display text-2xl font-semibold text-brown-900">{title}</h2>
      ) : null}
      {children}
    </div>
  )
}

/** Minimum datetime for the native pickers: now, in the input's local format. */
export function useMinDateTime(): { date: string; dateTime: string } {
  const [value, setValue] = React.useState({ date: '', dateTime: '' })
  React.useEffect(() => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    setValue({ date, dateTime: `${date}T${pad(now.getHours())}:${pad(now.getMinutes())}` })
  }, [])
  return value
}

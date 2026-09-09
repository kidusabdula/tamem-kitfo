'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { FormCard } from './forms/shared'
import { Price } from '@/components/ui/bits'
import { DiamondRule } from '@/components/ui/tibeb'
import { formatAddisTime } from '@/lib/hours'
import { phoneForCode, recordRequest, kindFromCode } from '@/lib/requests/store'
import type { Dictionary, Locale } from '@/lib/i18n/config'
import type { OrderStatus } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

/**
 * Status for an order, a catering enquiry or a table booking.
 *
 * The three kinds share one endpoint and one form because the customer does
 * not think of them as different systems — they have "a code from the kitfo
 * place" and want to know what is happening with it.
 */

type CateringStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
type BookingStatus = 'new' | 'confirmed' | 'seated' | 'completed' | 'cancelled'

type FoundRequest =
  | {
      kind: 'order'
      code: string
      status: OrderStatus
      createdAt: string
      subtotal: number
      fulfilment: 'dine_in' | 'pickup' | 'delivery'
      scheduledFor: string | null
      items: { name: string; quantity: number; unitPrice: number }[]
    }
  | {
      kind: 'catering'
      code: string
      status: CateringStatus
      createdAt: string
      eventType: string
      eventDate: string | null
      guestCount: number | null
    }
  | {
      kind: 'booking'
      code: string
      status: BookingStatus
      createdAt: string
      partySize: number
      bookingAt: string
    }

/* Green for anything settled, orange for anything still moving, red only for
   a genuine stop. Orange is a fill here, never the text colour. */
const TONE = {
  waiting: 'bg-ember-100 text-accent-ink',
  good: 'bg-gomen/12 text-gomen',
  stopped: 'bg-berbere/10 text-berbere',
} as const

const ORDER_TONE: Record<OrderStatus, string> = {
  new: TONE.waiting,
  confirmed: TONE.good,
  preparing: TONE.waiting,
  completed: TONE.good,
  cancelled: TONE.stopped,
}
const CATERING_TONE: Record<CateringStatus, string> = {
  new: TONE.waiting,
  contacted: TONE.waiting,
  quoted: TONE.waiting,
  won: TONE.good,
  lost: TONE.stopped,
}
const BOOKING_TONE: Record<BookingStatus, string> = {
  new: TONE.waiting,
  confirmed: TONE.good,
  seated: TONE.good,
  completed: TONE.good,
  cancelled: TONE.stopped,
}

function statusLabel(request: FoundRequest, dict: Dictionary): string {
  if (request.kind === 'order') return dict.order.status[request.status]
  if (request.kind === 'catering') return dict.requests.cateringStatus[request.status]
  return dict.requests.bookingStatus[request.status]
}

function statusTone(request: FoundRequest): string {
  if (request.kind === 'order') return ORDER_TONE[request.status]
  if (request.kind === 'catering') return CATERING_TONE[request.status]
  return BOOKING_TONE[request.status]
}

export function RequestLookup({
  initialCode = '',
  locale,
  dict,
}: {
  initialCode?: string
  locale: Locale
  dict: Dictionary
}) {
  const [code, setCode] = React.useState(initialCode)
  const [phone, setPhone] = React.useState('')
  const [found, setFound] = React.useState<FoundRequest | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const submit = React.useCallback(
    async (lookupCode: string, lookupPhone: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: lookupCode, phone: lookupPhone }),
        })
        const body = await response.json()
        if (!response.ok || !body.ok) {
          setError(response.status === 429 ? dict.form.rateLimited : dict.requests.notFound)
          setFound(null)
          return
        }
        const request = body.request as FoundRequest
        setFound(request)
        // Looked one up on a device that did not place it — remember it, so
        // this customer does not have to type the code again either.
        const kind = kindFromCode(request.code)
        if (kind) {
          recordRequest({
            kind,
            code: request.code,
            phone: lookupPhone,
            placedAt: request.createdAt,
          })
        }
      } catch {
        setError(dict.form.errorBody)
      } finally {
        setLoading(false)
      }
    },
    [dict],
  )

  /*
   * Arriving at /status/TMM-XXXX from the success panel or the history list:
   * the phone is already known, so look it up once and show live status with
   * no typing. Deliberately a single request — running one per stored request
   * would burn the lookup rate limit on page load.
   */
  const autoRan = React.useRef(false)
  React.useEffect(() => {
    if (autoRan.current || !initialCode) return
    const known = phoneForCode(initialCode)
    if (!known) return
    autoRan.current = true
    setPhone(known)
    void submit(initialCode, known)
  }, [initialCode, submit])

  if (found) {
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-ink-subtle uppercase">
          {dict.requests.kinds[found.kind]}
        </p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-[0.12em] text-brown-900">
          {found.code}
        </p>
        <DiamondRule className="mt-5" />

        <span
          className={cn(
            'mt-5 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold',
            statusTone(found),
          )}
        >
          {statusLabel(found, dict)}
        </span>

        {found.kind === 'order' ? (
          <>
            <ul className="mt-6 divide-y divide-[var(--color-hairline)]">
              {found.items.map((item) => (
                <li key={item.name} className="flex justify-between gap-4 py-3">
                  <span className="text-[0.9375rem] text-brown-800">
                    {item.quantity} × {item.name}
                  </span>
                  <Price amount={item.quantity * item.unitPrice} locale={locale} size="sm" />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-[var(--color-hairline)] pt-4">
              <span className="font-display text-lg font-semibold text-brown-900">
                {dict.cart.total}
              </span>
              <Price amount={found.subtotal} locale={locale} size="lg" />
            </div>
          </>
        ) : (
          <dl className="mt-6 grid gap-3 text-[0.9375rem]">
            {found.kind === 'catering' ? (
              <>
                <Row
                  label={dict.catering.eventType}
                  value={
                    dict.catering.eventTypes[
                      found.eventType as keyof typeof dict.catering.eventTypes
                    ] ?? found.eventType
                  }
                />
                {found.eventDate ? (
                  <Row label={dict.requests.eventDate} value={found.eventDate} />
                ) : null}
                {found.guestCount ? (
                  <Row label={dict.requests.guests} value={String(found.guestCount)} />
                ) : null}
              </>
            ) : (
              <>
                <Row label={dict.requests.party} value={String(found.partySize)} />
                <Row
                  label={dict.requests.bookingAt}
                  value={formatAddisTime(found.bookingAt, locale)}
                />
              </>
            )}
            <Row label={dict.requests.placed} value={formatAddisTime(found.createdAt, locale)} />
          </dl>
        )}
      </div>
    )
  }

  return (
    <FormCard>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void submit(code, phone)
        }}
        className="flex flex-col gap-5"
      >
        <Field label={dict.requests.codeLabel} htmlFor="code" required>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="TMM-XXXX"
            autoComplete="off"
            className="font-mono tracking-widest"
          />
        </Field>

        <Field
          label={dict.requests.phoneLabel}
          htmlFor="phone"
          required
          hint={dict.order.phoneHint}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0911 123 456"
          />
        </Field>

        {error ? (
          <p className="text-sm text-berbere" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={loading} className="self-start">
          {loading ? dict.actions.submitting : dict.requests.check}
        </Button>
      </form>
    </FormCard>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--color-hairline)] pb-3 last:border-b-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-brown-900">{value}</dd>
    </div>
  )
}

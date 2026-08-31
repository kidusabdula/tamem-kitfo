'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { FormCard } from './forms/shared'
import { Price } from '@/components/ui/bits'
import { DiamondRule } from '@/components/ui/tibeb'
import type { Dictionary, Locale } from '@/lib/i18n/config'
import type { OrderStatus } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

interface FoundOrder {
  code: string
  status: OrderStatus
  subtotal: number
  items: { name: string; quantity: number; unitPrice: number }[]
}

const STATUS_TONE: Record<OrderStatus, string> = {
  new: 'bg-ember-100 text-accent-ink',
  confirmed: 'bg-gomen/12 text-gomen',
  preparing: 'bg-ember-100 text-accent-ink',
  completed: 'bg-gomen/12 text-gomen',
  cancelled: 'bg-berbere/10 text-berbere',
}

export function OrderLookup({
  initialCode,
  locale,
  dict,
}: {
  initialCode: string
  locale: Locale
  dict: Dictionary
}) {
  const [code, setCode] = React.useState(initialCode)
  const [phone, setPhone] = React.useState('')
  const [order, setOrder] = React.useState<FoundOrder | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function lookup(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, phone }),
      })
      const body = await response.json()
      if (!response.ok || !body.ok) {
        setError(
          response.status === 429 ? dict.form.rateLimited : dict.order.lookupNotFound,
        )
        setOrder(null)
      } else {
        setOrder(body.order as FoundOrder)
      }
    } catch {
      setError(dict.form.errorBody)
    } finally {
      setLoading(false)
    }
  }

  if (order) {
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-ink-subtle uppercase">
          {dict.order.yourCode}
        </p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-[0.12em] text-brown-900">
          {order.code}
        </p>
        <DiamondRule className="mt-5" />

        <span
          className={cn(
            'mt-5 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold',
            STATUS_TONE[order.status],
          )}
        >
          {dict.order.status[order.status]}
        </span>

        <ul className="mt-6 divide-y divide-[var(--color-hairline)]">
          {order.items.map((item) => (
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
          <Price amount={order.subtotal} locale={locale} size="lg" />
        </div>
      </div>
    )
  }

  return (
    <FormCard>
      <form onSubmit={lookup} className="flex flex-col gap-5">
        <Field label={dict.order.yourCode} htmlFor="code" required>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="TMM-XXXX"
            autoComplete="off"
            className="font-mono tracking-widest"
          />
        </Field>

        <Field label={dict.order.phone} htmlFor="phone" required hint={dict.order.phoneHint}>
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
          {loading ? dict.actions.submitting : dict.order.lookupTitle}
        </Button>
      </form>
    </FormCard>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/bits'
import { ChoiceCards, Field, Honeypot, Input, Textarea } from '@/components/ui/field'
import { FormCard, FormError, SuccessPanel, useMinDateTime } from './forms/shared'
import { useCart } from '@/lib/cart/context'
import { useSubmit } from '@/lib/forms/use-submit'
import { orderSchema, type OrderInput } from '@/lib/schemas/forms'
import type { Dictionary, Locale } from '@/lib/i18n/config'
import { routes } from '@/lib/routes'
import { formatETB } from '@/lib/utils'
import type { FulfilmentType } from '@/lib/supabase/database.types'

export function OrderFlow({
  locale,
  dict,
  whatsappNumber,
  acceptingOrders,
  deliveryNote,
}: {
  locale: Locale
  dict: Dictionary
  whatsappNumber: string | null
  acceptingOrders: boolean
  deliveryNote: string | null
}) {
  const { lines, ready, setQuantity, remove, subtotal, count, clear } = useCart()
  const min = useMinDateTime()
  const [fulfilment, setFulfilment] = React.useState<FulfilmentType>('pickup')
  const [asap, setAsap] = React.useState(true)

  const { submit, status, error, result, isSubmitting, isSuccess } = useSubmit<OrderInput>(
    '/api/orders',
    dict,
  )

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: standardSchemaResolver(orderSchema),
    defaultValues: { locale, fulfilment_type: 'pickup', items: [] },
  })

  const v = dict.form.validation as Record<string, string | undefined>
  const msg = (key?: string) => (key ? (v[key] ?? key) : undefined)

  // Keep the form's item list in step with the cart. Only slug and quantity
  // travel to the server; prices are looked up there.
  React.useEffect(() => {
    setValue(
      'items',
      lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
    )
  }, [lines, setValue])

  React.useEffect(() => {
    setValue('fulfilment_type', fulfilment)
  }, [fulfilment, setValue])

  // Clearing the cart only after a confirmed success means a failed submit
  // never loses the customer's order.
  React.useEffect(() => {
    if (isSuccess) clear()
  }, [isSuccess, clear])

  if (isSuccess) {
    return (
      <SuccessPanel
        title={dict.order.successTitle}
        body={dict.order.successBody}
        code={result?.code}
        codeLabel={dict.order.yourCode}
        codeHint={dict.order.codeHint}
      />
    )
  }

  // Wait for localStorage before deciding the cart is empty, or a customer who
  // refreshes the checkout page is told their order vanished.
  if (!ready) {
    return <div className="h-64" aria-busy="true" aria-label={dict.a11y.loading} />
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-12 text-center shadow-[var(--shadow-card)]">
        <ShoppingBag className="mx-auto size-10 text-brown-300" aria-hidden="true" />
        <p className="mt-4 font-display text-xl font-semibold text-brown-900">{dict.cart.empty}</p>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">{dict.cart.emptyHint}</p>
        <Button asChild className="mt-6">
          <Link href={routes.menu(locale)}>{dict.actions.viewMenu}</Link>
        </Button>
      </div>
    )
  }

  const fallbackText = () => {
    const values = getValues()
    const items = lines
      .map((l) => `• ${l.quantity} × ${locale === 'am' && l.nameAm ? l.nameAm : l.nameEn}`)
      .join('\n')
    return [
      `${dict.order.title} — ${dict.brand.name}`,
      items,
      `${dict.cart.total}: ${formatETB(subtotal, locale)}`,
      `${dict.order.name}: ${values.name ?? ''}`,
      `${dict.order.phone}: ${values.phone ?? ''}`,
      `${dict.order.fulfilment}: ${dict.order.fulfilmentOptions[fulfilment]}`,
      values.delivery_address ? `${dict.order.address}: ${values.delivery_address}` : '',
      values.notes ? `${dict.order.notes}: ${values.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
      {/* ------------------------------------------------------------- FORM */}
      <FormCard>
        <form
          onSubmit={handleSubmit((data) => submit({ ...data, fulfilment_type: fulfilment }))}
          className="flex flex-col gap-6"
          noValidate
        >
          <Honeypot register={register('website')} />

          <ChoiceCards
            name="fulfilment"
            legend={dict.order.fulfilment}
            value={fulfilment}
            onChange={setFulfilment}
            options={(['dine_in', 'pickup', 'delivery'] as FulfilmentType[]).map((value) => ({
              value,
              label: dict.order.fulfilmentOptions[value],
              hint: dict.order.fulfilmentHints[value],
            }))}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={dict.order.name} htmlFor="name" required error={msg(errors.name?.message)}>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </Field>

            <Field
              label={dict.order.phone}
              htmlFor="phone"
              required
              error={msg(errors.phone?.message)}
              hint={dict.order.phoneHint}
            >
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0911 123 456"
                aria-invalid={Boolean(errors.phone)}
                {...register('phone')}
              />
            </Field>
          </div>

          {fulfilment === 'delivery' ? (
            <Field
              label={dict.order.address}
              htmlFor="delivery_address"
              required
              hint={deliveryNote ?? dict.order.addressHint}
              error={msg(errors.delivery_address?.message)}
            >
              <Textarea
                id="delivery_address"
                rows={2}
                aria-invalid={Boolean(errors.delivery_address)}
                {...register('delivery_address')}
              />
            </Field>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-brown-800">{dict.order.when}</span>
            <label className="flex items-center gap-2.5 text-[0.9375rem] text-brown-800">
              <input
                type="checkbox"
                checked={asap}
                onChange={(e) => {
                  setAsap(e.target.checked)
                  if (e.target.checked) setValue('scheduled_for', '')
                }}
                className="size-4 accent-[var(--color-accent)]"
              />
              {dict.order.whenAsap}
            </label>
            {!asap ? (
              <Input
                id="scheduled_for"
                type="datetime-local"
                min={min.dateTime}
                {...register('scheduled_for')}
              />
            ) : null}
          </div>

          <Field
            label={dict.order.notes}
            htmlFor="notes"
            optionalLabel={dict.form.optional}
            hint={dict.order.notesHint}
          >
            <Textarea id="notes" rows={3} {...register('notes')} />
          </Field>

          {errors.items ? (
            <p className="text-sm text-berbere" role="alert">
              {msg(errors.items.message) ?? dict.cart.empty}
            </p>
          ) : null}

          {status === 'error' && error ? (
            <FormError
              message={error}
              dict={dict}
              whatsappNumber={whatsappNumber}
              fallbackText={fallbackText()}
            />
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting || !acceptingOrders}>
            {isSubmitting ? dict.actions.submitting : dict.actions.placeOrder}
          </Button>

          <p className="text-xs leading-relaxed text-ink-subtle">{dict.cart.note}</p>
        </form>
      </FormCard>

      {/* ------------------------------------------------------------- CART */}
      <aside className="rounded-[var(--radius-card)] bg-surface-sunk p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold text-brown-900">
          {dict.cart.title}{' '}
          <span className="text-base font-normal text-ink-subtle">
            ({count} {count === 1 ? dict.cart.itemsOne : dict.cart.itemsOther})
          </span>
        </h2>

        <ul className="mt-5 divide-y divide-[var(--color-hairline)]">
          {lines.map((line) => {
            const name = locale === 'am' && line.nameAm ? line.nameAm : line.nameEn
            return (
              <li key={line.slug} className="flex items-start gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] leading-snug font-medium text-brown-900">{name}</p>
                  <Price amount={line.price} locale={locale} size="sm" className="mt-1 block" />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-surface p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.slug, line.quantity - 1)}
                    aria-label={dict.a11y.decreaseQuantity}
                    className="grid size-7 place-items-center rounded-full text-brown-700 hover:bg-brown-100"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.slug, line.quantity + 1)}
                    aria-label={dict.a11y.increaseQuantity}
                    className="grid size-7 place-items-center rounded-full text-brown-700 hover:bg-brown-100"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(line.slug)}
                  aria-label={`${dict.actions.remove}: ${name}`}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-berbere/10 hover:text-berbere"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex items-baseline justify-between border-t border-[var(--color-hairline)] pt-4">
          <span className="font-display text-lg font-semibold text-brown-900">
            {dict.cart.total}
          </span>
          <Price amount={subtotal} locale={locale} size="lg" />
        </div>

        <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
          <Link href={routes.menu(locale)}>{dict.actions.viewMenu}</Link>
        </Button>
      </aside>
    </div>
  )
}

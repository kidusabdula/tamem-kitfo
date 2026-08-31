'use client'

import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@/components/ui/button'
import { Field, Honeypot, Input, Textarea } from '@/components/ui/field'
import { FormCard, FormError, SuccessPanel, useMinDateTime } from './shared'
import { bookingSchema, type BookingInput } from '@/lib/schemas/forms'
import { useSubmit } from '@/lib/forms/use-submit'
import type { Dictionary, Locale } from '@/lib/i18n/config'

export function BookingForm({
  locale,
  dict,
  whatsappNumber,
}: {
  locale: Locale
  dict: Dictionary
  whatsappNumber: string | null
}) {
  const min = useMinDateTime()
  const { submit, status, error, result, isSubmitting, isSuccess } = useSubmit<BookingInput>(
    '/api/bookings',
    dict,
  )

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: standardSchemaResolver(bookingSchema),
    defaultValues: { locale, party_size: 2 },
  })

  const v = dict.form.validation as Record<string, string | undefined>
  const msg = (key?: string) => (key ? (v[key] ?? key) : undefined)

  if (isSuccess) {
    return (
      <SuccessPanel
        title={dict.book.successTitle}
        body={dict.book.successBody}
        code={result?.code}
        codeLabel={dict.order.yourCode}
        codeHint={dict.order.codeHint}
      />
    )
  }

  const fallbackText = () => {
    const values = getValues()
    return [
      `${dict.book.title} — ${dict.brand.name}`,
      `${dict.order.name}: ${values.name ?? ''}`,
      `${dict.order.phone}: ${values.phone ?? ''}`,
      `${dict.book.partySize}: ${values.party_size ?? ''}`,
      `${dict.book.when}: ${values.booking_at ?? ''}`,
      values.notes ? `${dict.book.notes}: ${values.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <FormCard>
      <form onSubmit={handleSubmit((data) => submit(data))} className="flex flex-col gap-5" noValidate>
        <Honeypot register={register('website')} />

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

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={dict.book.partySize}
            htmlFor="party_size"
            required
            error={msg(errors.party_size?.message)}
          >
            <Input
              id="party_size"
              type="number"
              inputMode="numeric"
              min={1}
              max={40}
              aria-invalid={Boolean(errors.party_size)}
              {...register('party_size')}
            />
          </Field>

          <Field
            label={dict.book.when}
            htmlFor="booking_at"
            required
            error={msg(errors.booking_at?.message)}
          >
            <Input
              id="booking_at"
              type="datetime-local"
              min={min.dateTime}
              aria-invalid={Boolean(errors.booking_at)}
              {...register('booking_at')}
            />
          </Field>
        </div>

        <Field
          label={dict.book.notes}
          htmlFor="notes"
          optionalLabel={dict.form.optional}
          hint={dict.book.notesHint}
        >
          <Textarea id="notes" rows={3} {...register('notes')} />
        </Field>

        {status === 'error' && error ? (
          <FormError
            message={error}
            dict={dict}
            whatsappNumber={whatsappNumber}
            fallbackText={fallbackText()}
          />
        ) : null}

        <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
          {isSubmitting ? dict.actions.submitting : dict.actions.bookTable}
        </Button>
      </form>
    </FormCard>
  )
}

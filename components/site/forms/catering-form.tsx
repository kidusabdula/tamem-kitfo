'use client'

import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@/components/ui/button'
import { Field, Honeypot, Input, Select, Textarea } from '@/components/ui/field'
import { FormCard, FormError, SuccessPanel, useMinDateTime } from './shared'
import { cateringSchema, type CateringInput } from '@/lib/schemas/forms'
import { useSubmit } from '@/lib/forms/use-submit'
import type { Dictionary, Locale } from '@/lib/i18n/config'

export function CateringForm({
  locale,
  dict,
  whatsappNumber,
}: {
  locale: Locale
  dict: Dictionary
  whatsappNumber: string | null
}) {
  const min = useMinDateTime()
  const { submit, status, error, isSubmitting, isSuccess } = useSubmit<CateringInput>(
    '/api/catering',
    dict,
  )

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CateringInput>({
    resolver: standardSchemaResolver(cateringSchema),
    defaultValues: { locale, event_type: 'wedding' },
  })

  // Field-level messages arrive as dictionary KEYS from the shared schema.
  const v = dict.form.validation as Record<string, string | undefined>
  const msg = (key?: string) => (key ? (v[key] ?? key) : undefined)

  if (isSuccess) {
    return <SuccessPanel title={dict.catering.successTitle} body={dict.catering.successBody} />
  }

  const fallbackText = () => {
    const values = getValues()
    return [
      `${dict.catering.title} — ${dict.brand.name}`,
      `${dict.order.name}: ${values.name ?? ''}`,
      `${dict.order.phone}: ${values.phone ?? ''}`,
      `${dict.catering.eventDate}: ${values.event_date ?? ''}`,
      `${dict.catering.guestCount}: ${values.guest_count ?? ''}`,
      `${dict.catering.location}: ${values.location ?? ''}`,
      values.message ? `${dict.catering.message}: ${values.message}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <FormCard title={dict.catering.formTitle}>
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
          <Field label={dict.catering.eventType} htmlFor="event_type">
            <Select id="event_type" {...register('event_type')}>
              {(
                Object.entries(dict.catering.eventTypes) as [
                  keyof typeof dict.catering.eventTypes,
                  string,
                ][]
              ).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={dict.catering.eventDate}
            htmlFor="event_date"
            required
            error={msg(errors.event_date?.message)}
          >
            <Input
              id="event_date"
              type="date"
              min={min.date}
              aria-invalid={Boolean(errors.event_date)}
              {...register('event_date')}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={dict.catering.guestCount}
            htmlFor="guest_count"
            required
            error={msg(errors.guest_count?.message)}
          >
            <Input
              id="guest_count"
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              placeholder="80"
              aria-invalid={Boolean(errors.guest_count)}
              {...register('guest_count')}
            />
          </Field>

          <Field
            label={dict.catering.email}
            htmlFor="email"
            optionalLabel={dict.form.optional}
            error={msg(errors.email?.message)}
          >
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>
        </div>

        <Field
          label={dict.catering.location}
          htmlFor="location"
          required
          error={msg(errors.location?.message)}
        >
          <Input id="location" aria-invalid={Boolean(errors.location)} {...register('location')} />
        </Field>

        <Field
          label={dict.catering.message}
          htmlFor="message"
          optionalLabel={dict.form.optional}
          error={msg(errors.message?.message)}
        >
          <Textarea id="message" {...register('message')} />
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
          {isSubmitting ? dict.actions.submitting : dict.actions.requestQuote}
        </Button>
      </form>
    </FormCard>
  )
}

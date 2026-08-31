'use client'

import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@/components/ui/button'
import { Field, Honeypot, Input, Textarea } from '@/components/ui/field'
import { FormCard, FormError, SuccessPanel } from './shared'
import { contactSchema, type ContactInput } from '@/lib/schemas/forms'
import { useSubmit } from '@/lib/forms/use-submit'
import type { Dictionary, Locale } from '@/lib/i18n/config'

export function ContactForm({
  locale,
  dict,
  whatsappNumber,
}: {
  locale: Locale
  dict: Dictionary
  whatsappNumber: string | null
}) {
  const { submit, status, error, isSubmitting, isSuccess } = useSubmit<ContactInput>(
    '/api/contact',
    dict,
  )

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: standardSchemaResolver(contactSchema),
    defaultValues: { locale },
  })

  const v = dict.form.validation as Record<string, string | undefined>
  const msg = (key?: string) => (key ? (v[key] ?? key) : undefined)

  if (isSuccess) {
    return <SuccessPanel title={dict.contact.successTitle} body={dict.contact.successBody} />
  }

  const fallbackText = () => {
    const values = getValues()
    return [
      `${dict.contact.formTitle} — ${dict.brand.name}`,
      `${dict.order.name}: ${values.name ?? ''}`,
      values.phone ? `${dict.order.phone}: ${values.phone}` : '',
      values.message ?? '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <FormCard title={dict.contact.formTitle}>
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
            optionalLabel={dict.form.optional}
            error={msg(errors.phone?.message)}
          >
            <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
          </Field>
        </div>

        <Field
          label={dict.contact.email}
          htmlFor="email"
          optionalLabel={dict.form.optional}
          error={msg(errors.email?.message)}
        >
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </Field>

        <Field
          label={dict.contact.yourMessage}
          htmlFor="message"
          required
          error={msg(errors.message?.message)}
        >
          <Textarea
            id="message"
            rows={5}
            aria-invalid={Boolean(errors.message)}
            {...register('message')}
          />
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
          {isSubmitting ? dict.actions.submitting : dict.actions.sendMessage}
        </Button>
      </form>
    </FormCard>
  )
}

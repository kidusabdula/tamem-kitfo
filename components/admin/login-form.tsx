'use client'

import { useActionState } from 'react'
import { signInAction } from '@/app/(admin)/admin/actions'
import { AdminField, SubmitButton, adminControl } from './bits'
import type { Dictionary } from '@/lib/i18n/config'

export function LoginForm({ dict, next }: { dict: Dictionary; next: string }) {
  const [state, formAction] = useActionState(signInAction, { error: false })

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <AdminField label={dict.admin.email} htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={adminControl}
        />
      </AdminField>

      <AdminField label={dict.admin.password} htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={adminControl}
        />
      </AdminField>

      {/*
        One message for a wrong email and a wrong password alike. Saying "no
        such account" would tell anyone who asks which addresses are staff.
      */}
      {state.error ? (
        <p role="alert" className="text-sm text-berbere">
          {dict.admin.signInError}
        </p>
      ) : null}

      <SubmitButton pendingLabel={dict.admin.signingIn} className="mt-1 w-full">
        {dict.admin.signIn}
      </SubmitButton>
    </form>
  )
}

'use client'

import * as React from 'react'
import type { Dictionary } from '@/lib/i18n/config'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export interface SubmitResult {
  code?: string
}

/**
 * One submit path for all four public forms.
 *
 * The server replies with a `messageKey` naming an entry in
 * `dictionary.form.validation`, never a prose message — so an Amharic visitor
 * gets an Amharic error even though the failure was decided server-side.
 */
export function useSubmit<TPayload>(endpoint: string, dict: Dictionary) {
  const [status, setStatus] = React.useState<Status>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<SubmitResult | null>(null)

  const submit = React.useCallback(
    async (payload: TPayload) => {
      setStatus('submitting')
      setError(null)
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const body: unknown = await response.json().catch(() => ({}))

        if (!response.ok) {
          const key =
            typeof body === 'object' && body !== null && 'messageKey' in body
              ? String((body as { messageKey: unknown }).messageKey)
              : ''
          const validation = dict.form.validation as Record<string, string | undefined>
          if (response.status === 429) setError(dict.form.rateLimited)
          else setError(validation[key] ?? dict.form.errorBody)
          setStatus('error')
          return false
        }

        setResult(
          typeof body === 'object' && body !== null && 'code' in body
            ? { code: String((body as { code: unknown }).code) }
            : {},
        )
        setStatus('success')
        return true
      } catch {
        // Network failure — common on Ethiopian mobile data. The forms offer a
        // WhatsApp fallback for exactly this case.
        setError(dict.form.errorBody)
        setStatus('error')
        return false
      }
    },
    [endpoint, dict],
  )

  const reset = React.useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  return {
    submit,
    reset,
    status,
    error,
    result,
    isSubmitting: status === 'submitting',
    isSuccess: status === 'success',
  }
}

'use client'

import * as React from 'react'
import { recordRequest, type RequestKind } from './store'

/**
 * Write a successful submission into this browser's history.
 *
 * Runs in an effect rather than in the submit handler so it fires on the same
 * render that shows the success panel — the customer can reload that page, or
 * close the tab entirely, and the code survives. That reload was previously
 * the moment the order became unreachable: the code lived only in component
 * state, and the status endpoint needs the code *and* the phone.
 *
 * Silently does nothing without a code or a phone, because a history entry
 * missing either is one the customer could never use.
 */
export function useRecordRequest({
  kind,
  isSuccess,
  code,
  phone,
  summary,
}: {
  kind: RequestKind
  isSuccess: boolean
  code?: string | null
  phone?: string | null
  summary?: string
}) {
  React.useEffect(() => {
    if (!isSuccess || !code || !phone) return
    recordRequest({
      kind,
      code,
      phone,
      placedAt: new Date().toISOString(),
      summary,
    })
  }, [kind, isSuccess, code, phone, summary])
}

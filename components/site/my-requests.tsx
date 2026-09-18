'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'

import { formatAddisTime } from '@/lib/hours'
import { forgetRequest, readRequests, type StoredRequest } from '@/lib/requests/store'
import { routes } from '@/lib/routes'
import type { Dictionary, Locale } from '@/lib/i18n/config'

/**
 * Everything this browser has sent the restaurant.
 *
 * Deliberately does NOT fetch a status for each row. One lookup per stored
 * request on every page load would exhaust the endpoint's rate limit before a
 * customer with three orders had finished reading the page — and it would spend
 * requests on rows nobody opened. Status is fetched when a row is opened.
 */
export function MyRequests({
  locale,
  dict,
  emptyState = true,
}: {
  locale: Locale
  dict: Dictionary
  /** The /status page wants the empty message; the cart page already has one. */
  emptyState?: boolean
}) {
  const [entries, setEntries] = React.useState<StoredRequest[]>([])
  const [ready, setReady] = React.useState(false)

  // After mount: reading localStorage during render desynchronises the server
  // and client markup, which is the bug class that cost this project a day.
  React.useEffect(() => {
    setEntries(readRequests())
    setReady(true)
  }, [])

  function forget(code: string) {
    forgetRequest(code)
    setEntries(readRequests())
  }

  if (!ready) return <div className="h-24" aria-busy="true" aria-label={dict.a11y.loading} />

  if (entries.length === 0) {
    if (!emptyState) return null
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-10 text-center shadow-[var(--shadow-card)]">
        <p className="font-display text-xl font-semibold text-brown-900">{dict.requests.none}</p>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">{dict.requests.noneHint}</p>
      </div>
    )
  }

  return (
    <ul className="grid gap-3">
      {entries.map((entry) => (
        <li
          key={entry.code}
          className="flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-ink-subtle uppercase">
              {dict.requests.kinds[entry.kind]}
            </p>
            <p className="mt-1 font-mono text-lg font-bold tracking-[0.1em] text-brown-900">
              {entry.code}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {dict.requests.placed} · {formatAddisTime(entry.placedAt, locale)}
              {entry.summary ? ` · ${entry.summary}` : ''}
            </p>
          </div>

          <Link
            href={routes.requestStatus(locale, entry.code)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            {dict.requests.track}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => forget(entry.code)}
            aria-label={`${dict.requests.forget} — ${entry.code}`}
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-brown-100 hover:text-brown-900"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}

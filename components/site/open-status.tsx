'use client'

import * as React from 'react'
import { getOpenState } from '@/lib/hours'
import type { OpeningHours } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

/**
 * "Open now" has to be computed in the browser.
 *
 * These pages are statically generated, so anything rendered on the server
 * would freeze whatever the answer happened to be at build time and then be
 * wrong for the next several hours. Rendering nothing until mount is the
 * honest option: a missing badge is better than a badge that lies about
 * whether a restaurant is open.
 */
export function OpenStatus({
  hours,
  labels,
  className,
}: {
  hours: OpeningHours
  labels: { open: string; closed: string }
  className?: string
}) {
  const [state, setState] = React.useState<ReturnType<typeof getOpenState> | null>(null)

  React.useEffect(() => {
    const update = () => setState(getOpenState(hours))
    update()
    // Re-check each minute so an open page flips at closing time.
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [hours])

  if (!state) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium',
        state.isOpen ? 'text-gomen' : 'text-ink-subtle',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-full',
          state.isOpen ? 'bg-gomen' : 'bg-brown-300',
        )}
      />
      {state.isOpen ? labels.open : labels.closed}
      {state.until ? <span className="text-ink-subtle tabular-nums">· {state.until}</span> : null}
    </span>
  )
}

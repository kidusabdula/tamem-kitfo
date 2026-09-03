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
        // Text inherits the surrounding theme. Carrying its own dark-cream
        // colour here made the badge unreadable on espresso (the footer) and
        // nearly invisible against cream (the contact page) — colour is now
        // the dot's job, not the text's.
        'inline-flex items-center gap-2 text-sm font-medium',
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
      {state.until ? (
        // Dimmed through opacity so it stays legible in every theme it
        // inherits — brown-500 failed on the espresso footer.
        <span className="opacity-70 tabular-nums">· {state.until}</span>
      ) : null}
    </span>
  )
}

import { MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'

/**
 * Where we are, and one tap to directions.
 *
 * This replaced a keyless Google Maps iframe
 * (`google.com/maps?q=...&output=embed`). That endpoint now 404s *and* returns
 * `X-Frame-Options: SAMEORIGIN`, so Google refuses to be framed by us at all —
 * the contact page was rendering a large blank panel where the map should be.
 * Both the www and maps subdomains behave the same way, so there is no keyless
 * variant left to switch to.
 *
 * A real embedded map needs either a Google Maps Embed API key or the venue's
 * coordinates for an OpenStreetMap frame. Until one of those exists, a blank
 * frame is worse than no frame: this card gives the visitor the address and the
 * action they actually came for, and drops straight back to a map component
 * when the owners supply coordinates.
 */
export function DirectionsCard({
  title,
  address,
  mapUrl,
  ctaLabel,
}: {
  title: string
  address: string
  /** The saved place link from the CMS. Without it the card is address-only. */
  mapUrl: string | null
  ctaLabel: string
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-brown-200 bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-5 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ember-100 text-accent-ink">
          <MapPin className="size-4" aria-hidden="true" />
        </span>
        <h3 className="font-display text-[0.9375rem] font-semibold text-brown-900">{title}</h3>
      </div>

      <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">{address}</p>
        {mapUrl ? (
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <a href={mapUrl} target="_blank" rel="noreferrer noopener">
              {ctaLabel}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

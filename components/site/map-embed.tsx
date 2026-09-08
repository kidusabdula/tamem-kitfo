import { MapPin } from 'lucide-react'

/**
 * Keyless Google Maps embed, derived from the CMS `map_url`.
 *
 * Assumption (documented per handoff-protocol): `site_settings.map_url` holds
 * a Google Maps *place share link* (https://maps.app.goo.gl/... or a
 * /maps/search/... URL). We can't fetch-resolve the short link server-side
 * without a Google API key, so the iframe uses the keyless `output=embed`
 * endpoint with the brand + address as the query — Google resolves the same
 * place. The `map_url` link remains the "Open in Google Maps" CTA, which
 * always opens the exact saved place in a new tab.
 */
export function MapEmbed({ query, title }: { query: string; title: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-brown-200 bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-5 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ember-100 text-accent-ink">
          <MapPin className="size-4" aria-hidden="true" />
        </span>
        <h3 className="font-display text-[0.9375rem] font-semibold text-brown-900">{title}</h3>
      </div>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="block aspect-[4/3] w-full sm:aspect-[16/9]"
      />
      <noscript>
        <p className="px-5 py-3 text-sm text-ink-muted">{query}</p>
      </noscript>
    </div>
  )
}

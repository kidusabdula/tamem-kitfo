import { cn } from '@/lib/utils'

/**
 * Tibeb — the woven border found on Ethiopian shemma cloth, and on the
 * tablecloths in the restaurant's own dining room.
 *
 * Used sparingly. One band per section at most, always as a rule between
 * blocks, never as a page background. Repeated heritage motifs stop reading
 * as heritage and start reading as clip-art; restraint is what keeps it
 * feeling like the real thing.
 *
 * Colours are muted from the true textile brights so the band sits under the
 * photography rather than competing with it.
 */

const TILE_ID = 'tibeb-tile'

export function TibebBand({ className }: { className?: string }) {
  return (
    <div className={cn('h-2 w-full opacity-55', className)} aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none" role="presentation">
        <defs>
          <pattern id={TILE_ID} width="48" height="10" patternUnits="userSpaceOnUse">
            {/* diamond */}
            <path d="M12 1 L17 5 L12 9 L7 5 Z" fill="#A8442F" />
            <path d="M36 1 L41 5 L36 9 L31 5 Z" fill="#3E4E86" />
            {/* ticks */}
            <rect x="22" y="1.5" width="1.6" height="7" fill="#D9A02B" />
            <rect x="25.5" y="1.5" width="1.6" height="7" fill="#4A7A52" />
            <rect x="0" y="1.5" width="1.6" height="7" fill="#4A7A52" />
            <rect x="45.5" y="1.5" width="1.6" height="7" fill="#D9A02B" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${TILE_ID})`} />
      </svg>
    </div>
  )
}

/**
 * The quieter sibling: a hairline broken by a single diamond. This is the
 * default divider under a section heading.
 */
export function DiamondRule({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-hidden="true">
      <span className="h-px w-10 bg-linear-to-r from-transparent to-brown-300" />
      <svg width="9" height="9" viewBox="0 0 9 9" className="shrink-0">
        <path d="M4.5 0 L9 4.5 L4.5 9 L0 4.5 Z" className="fill-accent" />
      </svg>
      <span className="h-px w-10 bg-linear-to-l from-transparent to-brown-300" />
    </div>
  )
}

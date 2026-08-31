'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Scroll reveal — deliberately NOT built on `whileInView`.
 *
 * A motion component with `initial={{opacity: 0}}` emits opacity:0 into the
 * server HTML. If JavaScript fails to load or an IntersectionObserver
 * callback never fires, every section of the site stays invisible. On the
 * mobile networks this restaurant's customers actually use, that is a real
 * failure mode, not a theoretical one.
 *
 * So the default is VISIBLE. An inline script in the layout stamps
 * `data-js="1"` on <html> before first paint; only then does CSS hide these
 * elements, and an observer reveals them. No JS means no hiding, and the page
 * reads perfectly without a single byte of script.
 *
 * The animation itself is CSS, which also keeps it off the main thread.
 */
export function Reveal({
  children,
  className,
  id,
  index = 0,
}: {
  children?: React.ReactNode
  className?: string
  id?: string
  /** Stagger index. Siblings in the same group pass 0, 1, 2… */
  index?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    // No observer support: show immediately rather than never.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -64px 0px' },
    )
    observer.observe(element)

    // Safety net: if the observer has not fired within a second (a print
    // stylesheet, a headless browser, an odd embedded webview), reveal anyway.
    const fallback = window.setTimeout(() => setVisible(true), 1000)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <div
      ref={ref}
      id={id}
      className={cn('reveal', className)}
      data-visible={visible ? '' : undefined}
      style={index ? ({ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}

/**
 * Slow Ken Burns drift for hero photography. 20s and only 4% of scale —
 * enough that the image feels alive, slow enough that you never catch it
 * moving. Purely decorative, so it is safe to leave to motion: if it never
 * runs, the photograph simply sits still.
 */
export function KenBurns({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ scale: 1.04 }}
      animate={{ scale: 1 }}
      transition={{ duration: 20, ease: 'linear' }}
    >
      {children}
    </motion.div>
  )
}

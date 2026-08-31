'use client'

import * as React from 'react'

/**
 * Cart state lives entirely in the browser (React context + localStorage).
 * There is no server-side session, no cart table, and nothing to clean up —
 * an abandoned cart costs the restaurant nothing and expires with the browser.
 *
 * The stored snapshot exists ONLY so the cart can render on any page without
 * refetching the menu. It is never trusted: /api/orders receives slugs and
 * quantities, and looks the real prices up server-side.
 */

export interface CartLine {
  slug: string
  quantity: number
  /** Display-only snapshot. The server re-derives all of this. */
  nameEn: string
  nameAm: string | null
  price: number
}

interface CartState {
  lines: CartLine[]
  /** False until localStorage has been read, so SSR and first paint agree. */
  ready: boolean
  add: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void
  setQuantity: (slug: string, quantity: number) => void
  remove: (slug: string) => void
  clear: () => void
  count: number
  subtotal: number
}

const CartContext = React.createContext<CartState | null>(null)

const STORAGE_KEY = 'tamem.cart.v1'
const MAX_QTY = 50

function readStorage(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Validate defensively: this data survives deploys, so an older shape
    // must not be able to crash the cart.
    return parsed.filter(
      (l): l is CartLine =>
        typeof l === 'object' &&
        l !== null &&
        typeof (l as CartLine).slug === 'string' &&
        typeof (l as CartLine).quantity === 'number' &&
        typeof (l as CartLine).price === 'number',
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [ready, setReady] = React.useState(false)

  // Hydrate after mount. Reading localStorage during render would produce
  // server/client markup mismatches.
  React.useEffect(() => {
    setLines(readStorage())
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Private browsing or a full quota. The cart still works this session.
    }
  }, [lines, ready])

  const add = React.useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((l) => l.slug === line.slug)
      if (existing) {
        return current.map((l) =>
          l.slug === line.slug ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l,
        )
      }
      return [...current, { ...line, quantity: Math.min(MAX_QTY, quantity) }]
    })
  }, [])

  const setQuantity = React.useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
    )
  }, [])

  const remove = React.useCallback((slug: string) => {
    setLines((current) => current.filter((l) => l.slug !== slug))
  }, [])

  const clear = React.useCallback(() => setLines([]), [])

  const value = React.useMemo<CartState>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0)
    const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.price, 0)
    return { lines, ready, add, setQuantity, remove, clear, count, subtotal }
  }, [lines, ready, add, setQuantity, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const context = React.useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}

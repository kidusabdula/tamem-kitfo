import { Fraunces, Plus_Jakarta_Sans, Noto_Sans_Ethiopic, Noto_Serif_Ethiopic } from 'next/font/google'

/**
 * Fraunces carries the brand voice: a warm, slightly wonky old-style serif
 * that reads as hand-made rather than corporate. Variable, so the optical
 * size axis keeps large display type tight and small type readable.
 */
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
})

export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

/**
 * Ethiopic faces are NOT preloaded: most first visits are English, and
 * preloading two extra scripts would cost every visitor bandwidth that
 * only Amharic readers need. `swap` means the switch is near-instant
 * once the locale flips.
 */
export const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-ethiopic',
})

export const notoSerifEthiopic = Noto_Serif_Ethiopic({
  subsets: ['ethiopic'],
  display: 'swap',
  preload: false,
  weight: ['400', '600', '700'],
  variable: '--font-noto-serif-ethiopic',
})

export const fontVariables = [
  fraunces.variable,
  jakarta.variable,
  notoSansEthiopic.variable,
  notoSerifEthiopic.variable,
].join(' ')

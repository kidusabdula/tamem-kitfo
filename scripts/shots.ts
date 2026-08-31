/**
 * Design review harness.
 *
 * Captures full-page screenshots at a realistic desktop and mobile viewport so
 * layout can be judged the way a visitor sees it. Capturing at an artificially
 * tall window makes `min-h-dvh` heroes look enormous and hides real problems.
 *
 * Usage: npx tsx scripts/shots.ts [baseUrl] [outDir]
 */
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const BASE = process.argv[2] ?? 'http://localhost:3111'
const OUT = process.argv[3] ?? '.screens'

const PAGES = [
  ['home', '/en'],
  ['home-am', '/am'],
  ['menu', '/en/menu'],
  ['catering', '/en/catering'],
  ['events', '/en/events'],
  ['gallery', '/en/gallery'],
  ['contact', '/en/contact'],
  ['book', '/en/book'],
  ['order', '/en/order'],
] as const

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    // Motion reveals start at opacity 0; without this, a screenshot taken
    // before they fire captures a page of invisible sections.
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  for (const [name, path] of PAGES) {
    const url = `${BASE}${path}`
    const response = await page.goto(url, { waitUntil: 'load', timeout: 45_000 })
    const status = response?.status() ?? 0
    if (status >= 400) {
      console.log(`  ${name.padEnd(10)} ${viewport.name.padEnd(8)} HTTP ${status} — skipped`)
      continue
    }
    await page.waitForLoadState('domcontentloaded')
    // fullPage screenshots do not themselves trigger lazy loading, so images
    // below the fold would capture as blur placeholders. Scroll the page
    // through once to force them in, then return to the top.
    // Passed as a source string: tsx compiles inline functions with an esbuild
    // `__name` helper that does not exist in the page context.
    await page.evaluate(`new Promise((resolve) => {
      let y = 0
      const step = () => {
        y += window.innerHeight
        window.scrollTo(0, y)
        if (y < document.body.scrollHeight) setTimeout(step, 120)
        else { window.scrollTo(0, 0); setTimeout(resolve, 400) }
      }
      step()
    })`)
    await page.waitForTimeout(1200)
    const file = `${OUT}/${name}-${viewport.name}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log(`  ${name.padEnd(10)} ${viewport.name.padEnd(8)} ${file}`)
  }

  await context.close()
}

await browser.close()
console.log('\nDone.')

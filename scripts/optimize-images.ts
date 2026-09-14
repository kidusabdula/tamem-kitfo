/**
 * Photo pipeline.
 *
 * The originals are 6000x4000 (5-10 MB each). Two problems with shipping
 * those: they bloat the git repo and the deployment bundle, and Next's image
 * optimizer has to chew through a huge decode on every cold cache.
 *
 * So we shrink once, here, to a sane master (2400px on the long edge). The
 * output lives in assets/images/ rather than public/ on purpose: files under
 * public/ are served verbatim and bypass optimization, whereas files imported
 * from assets/ go through next/image, which gives us responsive srcsets,
 * AVIF/WebP negotiation, and an automatic blurDataURL placeholder for free.
 *
 * Run: pnpm images
 */
import { readdir, mkdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'assets/source'
const OUTPUT_DIR = 'assets/images'

/** Long-edge cap. 2400px covers a full-bleed hero on a 2x desktop display. */
const MAX_EDGE = 2400
const QUALITY = 82

async function optimizeTree(fromDir: string, toDir: string): Promise<void> {
  await mkdir(toDir, { recursive: true })
  const entries = await readdir(fromDir, { withFileTypes: true })

  for (const entry of entries) {
    const from = join(fromDir, entry.name)

    if (entry.isDirectory()) {
      await optimizeTree(from, join(toDir, entry.name))
      continue
    }

    const { name, ext } = parse(entry.name)
    if (!/^\.(jpe?g|png|webp)$/i.test(ext)) continue

    const to = join(toDir, `${name}.jpg`)
    const image = sharp(from, { failOn: 'none' })
    const meta = await image.metadata()
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0)

    const out = await image
      // withoutEnlargement means an already-small file (the logo) is left at
      // its native size rather than being upscaled into mush.
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(to)

    const before = (await stat(from)).size
    const after = (await stat(to)).size
    const saved = Math.round((1 - after / before) * 100)
    const outEdge = Math.max(out.width, out.height)
    console.log(
      `${entry.name.padEnd(20)} ${String(longEdge).padStart(4)}px -> ${String(outEdge).padStart(4)}px   ` +
        `${mb(before)} -> ${mb(after)}  (${saved >= 0 ? '-' : '+'}${Math.abs(saved)}%)`,
    )
  }
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`.padStart(8)
}

await optimizeTree(SOURCE_DIR, OUTPUT_DIR)
console.log('\nDone. Import these from "@/assets/images/..." so next/image can optimize them.')

/**
 * Square crops for dish cards.
 *
 * Several of the food photographs are studio shots on a white sweep, with the
 * bowl occupying maybe a third of the frame. Dropped into a 4:3 card they read
 * as blank space — the card looks broken rather than appetising.
 *
 * sharp's `attention` strategy picks the crop window with the highest
 * "interest" (saturation and edge density), which on these images lands
 * squarely on the food. Cropping at build time beats fiddling with per-image
 * object-position values in CSS that break the moment a photo is swapped.
 */
const SQUARE_DIR = `${OUTPUT_DIR}/square`
const SQUARE_EDGE = 1200

/**
 * Hand-placed crop windows, in *master* pixels (i.e. after the 2400px resize
 * above), for photographs where `attention` picks the wrong subject.
 *
 * The strategy maximises saturation and edge density, which is exactly right
 * for a studio shot where the food is the only thing in frame. It fails on a
 * photograph taken in a busy room: on the sourced dish photos it locked onto
 * a cafe window, a patterned sleeve and a stack of bare injera, cropping the
 * actual dish out of its own picture.
 *
 * Recording the window here rather than correcting it with CSS object-position
 * keeps the fix inside the pipeline: `pnpm images` reproduces the identical
 * crop on any machine, and re-aiming a swapped photo is a one-line edit.
 */
const SQUARE_CROPS: Record<string, { left: number; top: number; side: number }> = {
  // The mesob and its spread; the right of the frame is cloth and shadow.
  'beyaynetu.jpg': { left: 100, top: 280, side: 1000 },
  // Centre the bowl, which sits small in a large dark field.
  'genfo-bowl.jpg': { left: 562, top: 13, side: 1300 },
  // Frame the brazier: rosemary at the top, glowing charcoal vent at the base.
  'tibs-shekla.jpg': { left: 100, top: 300, side: 1200 },
  // The served tray. The wide shot reads as two mostly empty plates.
  'gomen-besiga.jpg': { left: 1024, top: 520, side: 1000 },
  // Full height, so the berele keeps its silhouette instead of reading as juice.
  'tej-berele.jpg': { left: 0, top: 350, side: 1800 },
}

await mkdir(SQUARE_DIR, { recursive: true })
console.log('\nSquare crops (attention-centred unless listed in SQUARE_CROPS):')

for (const entry of await readdir(OUTPUT_DIR, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.jpg$/i.test(entry.name)) continue
  const from = join(OUTPUT_DIR, entry.name)
  const to = join(SQUARE_DIR, entry.name)
  const window = SQUARE_CROPS[entry.name]

  const pipe = sharp(from)
  if (window) {
    pipe.extract({ left: window.left, top: window.top, width: window.side, height: window.side })
  }

  await pipe
    .resize(SQUARE_EDGE, SQUARE_EDGE, {
      fit: 'cover',
      ...(window ? {} : { position: sharp.strategy.attention }),
    })
    .jpeg({ quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(to)
  console.log(`  ${entry.name}${window ? '  (hand-placed)' : ''}`)
}

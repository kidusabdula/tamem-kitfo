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

await mkdir(SQUARE_DIR, { recursive: true })
console.log('\nSquare crops (attention-centred on the subject):')

for (const entry of await readdir(OUTPUT_DIR, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.jpg$/i.test(entry.name)) continue
  const from = join(OUTPUT_DIR, entry.name)
  const to = join(SQUARE_DIR, entry.name)
  await sharp(from)
    .resize(SQUARE_EDGE, SQUARE_EDGE, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(to)
  console.log(`  ${entry.name}`)
}

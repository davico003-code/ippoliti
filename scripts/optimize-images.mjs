import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '../public')

const SKIP = ['favicon', 'android-chrome', 'apple-touch', 'icon']

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(e => {
    const full = join(dir, e.name)
    return e.isDirectory() ? getFiles(full) : full
  }))
  return files.flat().filter(f => /\.(jpg|jpeg|png)$/i.test(f) && !SKIP.some(s => basename(f).includes(s)))
}

async function optimize() {
  const files = await getFiles(PUBLIC_DIR)
  let totalSaved = 0

  for (const file of files) {
    const { size: before } = await stat(file)
    if (before < 10000) { console.log(`⊘ ${basename(file)} (${(before/1024).toFixed(0)}KB) — skip, too small`); continue }

    const isHero = basename(file).includes('hero')
    const quality = isHero ? 82 : 80
    const width = isHero ? 1920 : 1200
    const outPath = file.replace(/\.(jpg|jpeg|png)$/i, '.webp')

    await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(outPath)

    const { size: after } = await stat(outPath)
    const saved = before - after
    totalSaved += Math.max(saved, 0)
    console.log(`✓ ${basename(file)} → ${basename(outPath)} (${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB, ${saved > 0 ? '-' : '+'}${Math.abs(Math.round(saved/before*100))}%)`)
  }

  console.log(`\nTotal ahorrado: ${(totalSaved/1024).toFixed(0)}KB`)
}

optimize().catch(console.error)

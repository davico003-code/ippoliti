#!/usr/bin/env node
// Procesa imágenes pesadas de /public/barrios/{slug}/ → optimizadas web.
// - Resize max 1920px de ancho (preserva ratio)
// - JPG quality 82, mozjpeg
// - Nombre canónico: hero.jpg (la mejor aérea) + foto-1.jpg, foto-2.jpg, ...
// - Borra el original pesado tras procesar exitosamente.
// - Skipea archivos ya canónicos (hero.jpg / foto-N.jpg / nombres existentes
//   en barrios.ts).

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.join(process.cwd(), 'public', 'barrios')
const MAX_W = 1920
const QUALITY = 82

// Barrios a procesar y heurística de hero. Sin sentir las imágenes a vista,
// usamos:
//   - Si hay archivos DJI (drone aéreo), el más grande es hero.
//   - Si no, el más grande es hero.
// El resto se renombra a foto-1.jpg ... foto-N.jpg en orden alfabético.
const TARGETS = [
  'vida-jardin',
  'funes-hills-miraflores',
  'kentucky',
]

// Patrones de "pesadas no canónicas" que vamos a procesar.
const HEAVY_PATTERNS = [
  /^dji_fly_.*\.(jpg|jpeg)$/i,
  /^dm[\s_]\d+\.(jpg|jpeg)$/i,
  /^IMG_\d+\.(jpg|jpeg)$/i,
  /^DSC_\d+\.(jpg|jpeg)$/i,
]

function isHeavyOriginal(name) {
  return HEAVY_PATTERNS.some((re) => re.test(name))
}

async function fileSize(p) {
  try {
    const s = await fs.stat(p)
    return s.size
  } catch {
    return 0
  }
}

async function processBarrio(slug) {
  const dir = path.join(ROOT, slug)
  let entries
  try {
    entries = await fs.readdir(dir)
  } catch (err) {
    console.warn(`[skip] ${slug}: ${err.message}`)
    return
  }

  const originals = entries.filter(isHeavyOriginal)
  if (originals.length === 0) {
    console.log(`[skip] ${slug}: no hay originales pesados`)
    return
  }

  // Orden: el de mayor tamaño primero → será hero.
  const sized = await Promise.all(
    originals.map(async (n) => ({ name: n, size: await fileSize(path.join(dir, n)) })),
  )
  sized.sort((a, b) => b.size - a.size)

  const heroPath = path.join(dir, 'hero.jpg')
  const heroExists = entries.includes('hero.jpg')

  let fotoIndex = 1
  for (let i = 0; i < sized.length; i++) {
    const { name, size } = sized[i]
    const srcPath = path.join(dir, name)
    let outName
    if (i === 0 && !heroExists) {
      outName = 'hero.jpg'
    } else {
      // Si ya hay hero.jpg, todo nuevo va a foto-N.jpg
      outName = `foto-${fotoIndex++}.jpg`
      // Evitar colisión con foto-N existente
      while (entries.includes(outName)) {
        outName = `foto-${fotoIndex++}.jpg`
      }
    }
    const outPath = path.join(dir, outName)
    const before = (size / 1024 / 1024).toFixed(2)

    try {
      await sharp(srcPath)
        .rotate() // respeta EXIF
        .resize({ width: MAX_W, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
        .toFile(outPath + '.tmp')
      await fs.rename(outPath + '.tmp', outPath)
      const after = ((await fileSize(outPath)) / 1024 / 1024).toFixed(2)
      await fs.unlink(srcPath)
      console.log(`[ok] ${slug}/${name} (${before}MB) → ${outName} (${after}MB)`)
    } catch (err) {
      console.error(`[ERR] ${slug}/${name}: ${err.message}`)
      try { await fs.unlink(outPath + '.tmp') } catch {}
    }
  }
}

for (const slug of TARGETS) {
  await processBarrio(slug)
}

console.log('\n✓ Optimización completada')

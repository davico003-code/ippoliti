#!/usr/bin/env node
/**
 * Guard: detecta imágenes que existen en /public y están referenciadas en el
 * código, pero NO están commiteadas a git. Ese es el caso que rompió los
 * renders de Distrito Roldán: el archivo estaba en disco local, el build
 * pasaba acá, pero en Vercel (que buildea desde git) daba 404.
 *
 * - Solo marca como ERROR las imágenes untracked que SÍ se referencian en src/.
 *   Las imágenes sueltas en /public que nadie usa (scratch) se ignoran.
 * - No toca rutas dinámicas (/og-*.jpg, /icon-*.png) porque esas no tienen
 *   archivo en disco, así que nunca aparecen como "untracked file".
 *
 * Corre en pre-push vía `npm run check`.
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const IMG_RE = /\.(png|jpe?g|webp|avif|gif|svg)$/i

// 1. Imágenes sin trackear bajo public/ (respeta .gitignore).
let untracked = []
try {
  untracked = execSync('git ls-files --others --exclude-standard public/', { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter((p) => p && IMG_RE.test(p))
} catch {
  // Sin git disponible → no bloquear.
  process.exit(0)
}

if (untracked.length === 0) process.exit(0)

// 2. Junta el texto de src/ para buscar referencias.
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue
      walk(full, acc)
    } else if (/\.(ts|tsx|js|jsx|css|mdx?)$/.test(name)) {
      acc.push(full)
    }
  }
  return acc
}
const haystack = (existsSync('src') ? walk('src') : [])
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

// 3. ¿Alguna untracked está referenciada por su ruta pública?
const referenced = []
const ignored = []
for (const p of untracked) {
  const publicPath = '/' + relative('public', p).split(sep).join('/')
  if (haystack.includes(publicPath)) referenced.push({ file: p, publicPath })
  else ignored.push(p)
}

if (referenced.length > 0) {
  console.error('\n✖ Imágenes referenciadas en código pero SIN commitear (darían 404 en Vercel):\n')
  for (const r of referenced) console.error(`    ${r.file}  →  usada como "${r.publicPath}"`)
  console.error('\n  Solución: git add <archivo> y commitealas antes de pushear.\n')
  process.exit(1)
}

if (ignored.length > 0) {
  console.warn(`ℹ ${ignored.length} imagen(es) sin trackear en public/ (no referenciadas, se ignoran):`)
  for (const p of ignored) console.warn(`    ${p}`)
}
process.exit(0)

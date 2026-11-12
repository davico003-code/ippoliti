// Fecha de última modificación de las páginas FIJAS del sitio, para el
// <lastmod> del sitemap: el último commit que tocó la carpeta de cada ruta
// (o los archivos de datos de los que sale). Las páginas con datos vivos
// (propiedades, blog, tasar/vender) NO pasan por acá: el sitemap les pone la
// fecha de su dato.
//
// Se corre a mano cuando se cambia una página fija y se commitea el resultado:
//   node scripts/sitemap-fechas.mjs
// (En Vercel el clon es de 10 commits: ahí no se puede calcular, por eso el
// archivo va commiteado.)

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const APP = 'src/app/(main)'
const SALIDA = 'src/data/sitemap-fechas.json'

// Rutas cuyo contenido sale (también) de archivos fuera de su carpeta.
const EXTRA = {
  '/': ['src/components/home'],
  '/guia': ['public/guia'],
  '/contenidos': ['src/data/contenidos'],
  '/barrios-privados': ['src/lib/barrios.ts'],
  '/barrios-privados/[slug]': ['src/lib/barrios.ts', 'src/lib/barrios-editorial-data.ts'],
  '/[...cluster]': ['src/lib/clusters.ts'],
  '/nosotros': ['src/data/equipo.ts'],
}

/** Fecha (YYYY-MM-DD) del último commit que tocó alguno de estos paths. */
function ultimoCommit(pathspecs) {
  const existentes = pathspecs.filter((p) => p.startsWith(':(') || fs.existsSync(p))
  if (!existentes.length) return null
  const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...existentes], { encoding: 'utf8' }).trim()
  return out || null
}

/** Todas las carpetas con page.tsx bajo (main), como ruta pública ("/recursos/mapa-funes"). */
function rutas(dir = APP, base = '') {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name === 'api' || e.name === 'admin' || e.name === 'agentes') continue
      // Los route groups "(algo)" no forman parte de la URL.
      const seg = /^\(.+\)$/.test(e.name) ? '' : `/${e.name}`
      out.push(...rutas(path.join(dir, e.name), base + seg))
    } else if (e.name === 'page.tsx') {
      out.push({ ruta: base || '/', dir })
    }
  }
  return out
}

const fechas = {}
for (const { ruta, dir } of rutas()) {
  // Solo los archivos directos de la carpeta: los de las subrutas tienen su propia fecha.
  const fecha = ultimoCommit([`:(glob)${dir}/*`, ...(EXTRA[ruta] ?? [])])
  if (fecha) fechas[ruta] = fecha
}
// /guia es un HTML estático de public/ (rewrite en next.config), sin page.tsx.
const guia = ultimoCommit(EXTRA['/guia'])
if (guia) fechas['/guia'] = guia

const ordenado = Object.fromEntries(Object.entries(fechas).sort(([a], [b]) => a.localeCompare(b)))
fs.mkdirSync(path.dirname(SALIDA), { recursive: true })
fs.writeFileSync(SALIDA, JSON.stringify(ordenado, null, 2) + '\n')
console.log(`${Object.keys(ordenado).length} rutas → ${SALIDA}`)

// Aplica las portadas reales curadas a mano (03-oct-2026) a las notas del
// blog, llamando al endpoint del panel con la foto elegida del banco.
// Correr DESPUÉS de mergear (el endpoint baja las fotos de siinmobiliaria.com).
//
//   SI_TEAM_CODE=... node scripts/aplicar-portadas-reales.mjs [--dry] [--solo slug1,slug2]
//
// Respaldo de las portadas anteriores: scripts/data/portadas-antes-2026-10-03.json
// (og:image de cada nota antes del cambio).

import { readFileSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'https://siinmobiliaria.com'
const CODE = process.env.SI_TEAM_CODE
const dry = process.argv.includes('--dry')
const soloIdx = process.argv.indexOf('--solo')
const solo = soloIdx > -1 ? new Set(process.argv[soloIdx + 1].split(',')) : null

if (!CODE && !dry) {
  console.error('Falta SI_TEAM_CODE')
  process.exit(1)
}

const mapa = JSON.parse(readFileSync(new URL('./data/portadas-reales.json', import.meta.url)))
const entradas = Object.entries(mapa).filter(([slug]) => !solo || solo.has(slug))

let ok = 0
const fallas = []
for (const [slug, fotoId] of entradas) {
  if (dry) {
    console.log(`${slug} → ${fotoId}`)
    continue
  }
  const res = await fetch(`${BASE}/api/admin/notas/generar-imagen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-team-code': CODE },
    body: JSON.stringify({ slug, fotoId }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.ok) {
    ok++
    console.log(`✓ ${slug} → ${fotoId}`)
  } else {
    fallas.push(slug)
    console.log(`✗ ${slug}: ${data.error ?? res.status}`)
  }
}
console.log(`\n${ok}/${entradas.length} aplicadas${fallas.length ? ` · fallaron: ${fallas.join(', ')}` : ''}`)

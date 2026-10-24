// Copia de OpenStreetMap de toda la zona para "Lugares cercanos"
// (src/data/lugares-zona.json): escuelas, salud, súper, plazas, farmacias,
// bancos, colectivos y trenes del corredor Rosario–Funes–Roldán. Con esto la
// ficha calcula lo cercano de cualquier propiedad de la zona sin pedirle nada a
// Overpass en vivo: desde Vercel casi nunca contesta (23-oct-2026: las 30 fichas
// cargadas después del 16-oct mostraban "temporalmente no disponible").
//
//   npx tsx scripts/lugares-zona.mts            (--forzar si trae mucho menos que la copia actual)
//
// Es UNA consulta por rectángulo: la de por punto, de a cientos, Overpass la
// rechaza por saturación. Lo que hay en el mapa cambia poco: correrlo cada
// algunos meses, o si avisa que hay propiedades publicadas fuera de la zona.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { CONSULTA, ESPEJOS, TAGS_USADOS, UA } from '../src/lib/cercanos-consulta'

// Donde la ficha responde desde la copia: el corredor con aire alrededor de las
// publicadas (23-oct: lat -32,97…-32,71, lng -60,95…-60,58).
const RESPONDE = { s: -33.1, w: -61.0, n: -32.68, e: -60.55 }
// La consulta trae un margen mayor que el radio más grande (2,5 km ≈ 0,027° de
// longitud a esta latitud) para que un punto del borde vea todo su alrededor.
const MARGEN = 0.03
const CAJA = { s: RESPONDE.s - MARGEN, w: RESPONDE.w - MARGEN, n: RESPONDE.n + MARGEN, e: RESPONDE.e + MARGEN }
const DESTINO = new URL('../src/data/lugares-zona.json', import.meta.url)

type Elemento = { tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }

const caja = `${CAJA.s},${CAJA.w},${CAJA.n},${CAJA.e}`
const consulta = `[out:json][timeout:180];(${CONSULTA.map(([f]) => `${f}(${caja});`).join('')});out center tags;`

let elementos: Elemento[] | null = null
for (const url of ESPEJOS) {
  const t = Date.now()
  try {
    const r = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams({ data: consulta }),
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(200_000),
    })
    const j = (await r.json().catch(() => ({}))) as { elements?: Elemento[]; remark?: string }
    if (!r.ok || !Array.isArray(j.elements) || (j.remark && /error|timed out|timeout/i.test(j.remark))) {
      throw new Error(`${r.status} ${j.remark?.slice(0, 80) ?? ''}`)
    }
    elementos = j.elements
    console.log(`${url}: ${elementos.length} lugares en ${Math.round((Date.now() - t) / 1000)} s`)
    break
  } catch (e) {
    console.log(`${url}: no respondió (${e instanceof Error ? e.message : e})`)
  }
}
if (!elementos?.length) {
  console.error('Ningún espejo de Overpass respondió: probá en un rato. No se tocó el archivo.')
  process.exit(1)
}

// Cada lugar: [lat, lng, clave, valor, clave, valor…] con solo las etiquetas que se usan.
const lugares = elementos.flatMap((el) => {
  const lat = el.lat ?? el.center?.lat
  const lon = el.lon ?? el.center?.lon
  if (!lat || !lon) return []
  const tags = TAGS_USADOS.flatMap((k) => (el.tags?.[k] ? [k, el.tags[k]] : []))
  return [[Number(lat.toFixed(5)), Number(lon.toFixed(5)), ...tags]]
})

// Un espejo a veces devuelve una respuesta cortada: si trae bastante menos que
// la copia actual, no se pisa (las fichas perderían lugares sin que nadie lo
// note). --forzar la escribe igual.
const anteriores = existsSync(DESTINO) ? (JSON.parse(readFileSync(DESTINO, 'utf8')) as { lugares: unknown[] }).lugares.length : 0
if (lugares.length < anteriores * 0.9 && !process.argv.includes('--forzar')) {
  console.error(`Trajo ${lugares.length} lugares y la copia actual tiene ${anteriores}: no la piso. Reintentá en un rato o pasá --forzar.`)
  process.exit(1)
}

writeFileSync(DESTINO, JSON.stringify({ generado: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }), responde: RESPONDE, lugares }) + '\n')
console.log(`${lugares.length} lugares guardados en src/data/lugares-zona.json`)

// Aviso: publicadas que caen fuera de la zona (esas siguen pidiéndole a Overpass).
const feed = (await (await fetch('https://meethilo.com/api/public/propiedades?limit=1000')).json()) as {
  objects?: Array<{ id: number; geo_lat?: string; geo_long?: string }>
}
const fuera = (feed.objects ?? []).filter((p) => {
  const lat = Number(p.geo_lat)
  const lng = Number(p.geo_long)
  return lat && lng && (lat < RESPONDE.s || lat > RESPONDE.n || lng < RESPONDE.w || lng > RESPONDE.e)
})
console.log(`publicadas fuera de la zona: ${fuera.length}${fuera.length ? ' → ' + fuera.map((p) => p.id).join(', ') : ''}`)

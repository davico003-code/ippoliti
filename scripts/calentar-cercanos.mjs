// Llena el caché de "Lugares cercanos" (Redis, un año) para TODAS las propiedades
// publicadas, de a una y con paciencia: Overpass público suele estar saturado y
// pide reintentar con espera. Las que ya están guardadas responden al instante.
// Dentro de la zona de src/data/lugares-zona.json ya no hace falta: responden de
// la copia (scripts/lugares-zona.mts); sirve para las de afuera.
//
//   node scripts/calentar-cercanos.mjs                       → producción
//   BASE_URL=https://<preview>.vercel.app node scripts/calentar-cercanos.mjs
//
// Usa las mismas coordenadas redondeadas que la ficha (4 decimales).

const BASE = (process.env.BASE_URL || 'https://siinmobiliaria.com').replace(/\/$/, '')
const FEED = 'https://meethilo.com/api/public/propiedades'
const ESPERA_INICIAL_MS = 150_000 // la pausa del servidor es de 2 min
const ESPERA_MAX_MS = 20 * 60_000
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

const feed = await (await fetch(FEED)).json()
const props = (feed.objects ?? feed.data ?? feed).filter((p) => Number(p.geo_lat) && Number(p.geo_long))
const coords = [...new Map(props.map((p) => {
  const lat = Number(p.geo_lat).toFixed(4)
  const lng = Number(p.geo_long).toFixed(4)
  return [`${lat},${lng}`, { lat, lng, id: p.id }]
})).values()]
console.log(`${props.length} propiedades con coordenadas · ${coords.length} puntos distintos · ${BASE}`)

let ok = 0
let espera = ESPERA_INICIAL_MS
for (let i = 0; i < coords.length; i++) {
  const { lat, lng, id } = coords[i]
  for (;;) {
    const t = Date.now()
    const r = await fetch(`${BASE}/api/cercanos?lat=${lat}&lng=${lng}`, { signal: AbortSignal.timeout(70_000) }).catch(() => null)
    const ms = Date.now() - t
    if (r?.ok) {
      const d = await r.json()
      const n = Object.values(d.ficha ?? {}).reduce((a, v) => a + v.length, 0)
      ok++
      console.log(`${i + 1}/${coords.length} ✓ ${id} (${lat},${lng}) ${n} lugares · ${d.chips?.length ?? 0} chips · ${ms} ms`)
      espera = ESPERA_INICIAL_MS
      if (ms > 1500) await dormir(2000) // vino de Overpass: un respiro antes del siguiente
      break
    }
    console.log(`${i + 1}/${coords.length} … ${id} ${r?.status ?? 'sin respuesta'}: Overpass no respondió, espero ${Math.round(espera / 60_000 * 10) / 10} min`)
    await dormir(espera)
    espera = Math.min(espera * 2, ESPERA_MAX_MS)
  }
}
console.log(`listo: ${ok}/${coords.length} puntos con datos guardados`)

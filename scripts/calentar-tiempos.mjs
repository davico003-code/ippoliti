// Llena el caché de "¿Cuánto tardás desde acá?" (Redis, medio año) para TODAS
// las propiedades publicadas, de a una. Cada propiedad nueva cuesta hasta 4
// elementos de Google; las ya guardadas responden al instante y no gastan.
//
//   node scripts/calentar-tiempos.mjs                       → producción
//   BASE_URL=https://<preview>.vercel.app node scripts/calentar-tiempos.mjs
//   LIMITE=1 node scripts/calentar-tiempos.mjs              → piloto con una sola
//
// La clave de Google vive en Vercel: esto solo llama a /api/tiempos-viaje.

const BASE = (process.env.BASE_URL || 'https://siinmobiliaria.com').replace(/\/$/, '')
const FEED = 'https://meethilo.com/api/public/propiedades'
const LIMITE = Number(process.env.LIMITE) || Infinity
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

const feed = await (await fetch(FEED)).json()
const props = (feed.objects ?? feed.data ?? feed).filter((p) => Number(p.geo_lat) && Number(p.geo_long))
// Una por coordenada (las de un mismo edificio o loteo comparten el cálculo).
const unicas = [...new Map(props.map((p) => [`${Number(p.geo_lat).toFixed(4)},${Number(p.geo_long).toFixed(4)}`, p])).values()]
  .slice(0, LIMITE)
console.log(`${props.length} propiedades con coordenadas · ${unicas.length} puntos a calcular · ${BASE}`)

let ok = 0
let fuera = 0
for (let i = 0; i < unicas.length; i++) {
  const p = unicas[i]
  const t = Date.now()
  const r = await fetch(`${BASE}/api/tiempos-viaje?id=${p.id}`, { signal: AbortSignal.timeout(40_000) }).catch(() => null)
  const ms = Date.now() - t
  if (r?.ok) {
    const d = await r.json()
    ok++
    console.log(`${i + 1}/${unicas.length} ✓ ${p.id} ${d.destinos.map((x) => `${x.nombre} ${x.minutos}′`).join(' · ')} (${ms} ms)`)
  } else {
    fuera++
    console.log(`${i + 1}/${unicas.length} — ${p.id} ${r?.status ?? 'sin respuesta'} (fuera de zona, sin clave o Google no respondió)`)
  }
  if (ms > 800) await dormir(300) // vino de Google: un respiro
}
console.log(`listo: ${ok} con tiempos · ${fuera} sin datos`)

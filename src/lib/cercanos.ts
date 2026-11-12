import 'server-only'
import { redis } from '@/lib/redis'
import { CONSULTA, ESPEJOS, UA } from '@/lib/cercanos-consulta'
import zona from '@/data/lugares-zona.json'

// Lugares cercanos a una propiedad (OpenStreetMap vía Overpass), para la ficha
// de la web (NearbyPlaces) y la de verficha.casa (CercaChips).
//
// Antes cada navegador le pedía a Overpass directo: los servidores públicos
// están saturados (16-oct-2026: overpass-api.de 502, kumi 500, el que anda tarda
// 10 s) y además rechazan pedidos sin User-Agent propio → en TODAS las fichas
// salía "temporalmente no disponible". Ahora se pide UNA vez por coordenada,
// desde el servidor, con los tres espejos escalonados, y se guarda un año en
// Redis: lo que hay cerca de una casa casi no cambia. Si Overpass está "a
// capacidad" (su propio aviso pide reintentar con espera), durante PAUSA_S no se
// le vuelve a pedir: la ficha muestra el aviso al instante en vez de esperar
// 20 s.
//
// 23-oct-2026: ni así alcanzaba — desde Vercel Overpass casi nunca contesta y
// las 30 fichas cargadas después del 16-oct quedaron "temporalmente no
// disponible". Ahora, dentro del corredor, lo cercano se calcula de una copia de
// OpenStreetMap de toda la zona (src/data/lugares-zona.json, la arma
// scripts/lugares-zona.mts): una propiedad nueva tiene sus lugares desde que se
// publica, sin pedirle nada a nadie. Overpass queda solo para lo de afuera.

export interface LugarFicha {
  name: string
  distance: number
  category: string
  level?: string
  levelColor?: string
  access?: 'Público' | 'Privado'
}

export interface CercanoChip {
  key: string
  distancia: number
  nombre?: string
}

export interface LugaresCercanos {
  ficha: Record<string, LugarFicha[]>
  chips: CercanoChip[]
}

type Tags = Record<string, string>

// Ficha de la web: hasta 5 con nombre por rubro.
const RUBROS_FICHA: Array<{ key: string; radio: number; es: (t: Tags) => boolean }> = [
  { key: 'school', radio: 2000, es: (t) => t.amenity === 'school' },
  { key: 'hospital', radio: 1000, es: (t) => t.amenity === 'hospital' },
  { key: 'supermarket', radio: 1000, es: (t) => t.shop === 'supermarket' },
  { key: 'park', radio: 1000, es: (t) => t.leisure === 'park' },
]

// Chips de verficha: el más cercano de cada rubro (el orden es el de los chips).
const RUBROS_CHIPS: Array<{ key: string; radio: number; es: (t: Tags) => boolean }> = [
  { key: 'escuela', radio: 1500, es: (t) => t.amenity === 'school' },
  { key: 'super', radio: 1200, es: (t) => t.shop === 'supermarket' || t.shop === 'convenience' },
  { key: 'farmacia', radio: 1200, es: (t) => t.amenity === 'pharmacy' },
  { key: 'colectivo', radio: 500, es: (t) => t.highway === 'bus_stop' },
  { key: 'tren', radio: 2000, es: (t) => t.railway === 'station' || t.railway === 'halt' },
  { key: 'plaza', radio: 1000, es: (t) => t.leisure === 'park' || t.leisure === 'playground' },
  { key: 'salud', radio: 2500, es: (t) => t.amenity === 'hospital' || t.amenity === 'clinic' },
  { key: 'banco', radio: 1200, es: (t) => t.amenity === 'bank' },
]

const ESCALON_MS = 4000
const TIMEOUT_MS = 20_000
const TTL_S = 365 * 24 * 60 * 60
const PAUSA_S = 120
const CLAVE_PAUSA = 'cercanos:overpass-caido'
const PRIVATE_PATTERNS = /\b(san |santa |sagrado|nuestra|instituto|colegio|privad|parish|parroquial)/i

interface Elemento { tags?: Tags; lat?: number; lon?: number; center?: { lat: number; lon: number } }

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function escuela(name: string, tags: Tags, distance: number): LugarFicha {
  const isPrivate = tags['operator:type'] === 'private' || PRIVATE_PATTERNS.test(name)
  const isced = tags['isced:level'] || tags['school:type'] || ''
  const n = name.toLowerCase()
  let level = 'Escuela'
  let levelColor = '#6b7280'
  if (/jard[ií]n|inicial|infantil|preescolar/i.test(n) || isced === '0') { level = 'Inicial'; levelColor = '#16a34a' }
  else if (/primari[ao]|elemental/i.test(n) || isced === '1') { level = 'Primario'; levelColor = '#2563eb' }
  else if (/secundari[ao]|bachiller|t[eé]cnic|medio/i.test(n) || isced === '2' || isced === '3') { level = 'Secundario'; levelColor = '#ea580c' }
  else if (/universid|facultad|instituto\s+(superior|terciario)/i.test(n) || isced === '4' || isced === '5' || isced === '6') { level = 'Terciario'; levelColor = '#7c3aed' }
  return { name, distance, category: 'school', level, levelColor, access: isPrivate ? 'Privado' : 'Público' }
}

/** Arma las dos vistas a partir de lo que devolvió Overpass. Pura. */
export function armarCercanos(lat: number, lng: number, elementos: Elemento[]): LugaresCercanos {
  const puntos = elementos.flatMap((el) => {
    const la = el.lat ?? el.center?.lat
    const lo = el.lon ?? el.center?.lon
    if (!la || !lo) return []
    return [{ tags: el.tags || {}, d: Math.round(haversineMeters(lat, lng, la, lo)) }]
  }).sort((a, b) => a.d - b.d)

  const ficha: Record<string, LugarFicha[]> = {}
  for (const r of RUBROS_FICHA) {
    ficha[r.key] = puntos
      .filter((p) => p.tags.name && p.d <= r.radio && r.es(p.tags))
      .slice(0, 5)
      .map((p) => r.key === 'school' ? escuela(p.tags.name, p.tags, p.d) : { name: p.tags.name, distance: p.d, category: r.key })
  }
  const chips = RUBROS_CHIPS.flatMap((r) => {
    const p = puntos.find((x) => x.d <= r.radio && r.es(x.tags))
    return p ? [{ key: r.key, distancia: p.d, ...(p.tags.name ? { nombre: p.tags.name } : {}) }] : []
  })
  return { ficha, chips }
}

let elementosZona: Elemento[] | null = null

/** Lo cercano según la copia de la zona; null si el punto queda fuera de ella.
 *  Cada lugar del archivo es [lat, lng, clave, valor, clave, valor…]. */
function cercanosDeZona(lat: number, lng: number): LugaresCercanos | null {
  const { s, w, n, e } = zona.responde
  if (lat < s || lat > n || lng < w || lng > e) return null
  elementosZona ??= zona.lugares.map(([la, lo, ...kv]) => {
    const tags: Tags = {}
    for (let i = 0; i + 1 < kv.length; i += 2) tags[String(kv[i])] = String(kv[i + 1])
    return { lat: Number(la), lon: Number(lo), tags }
  })
  return armarCercanos(lat, lng, elementosZona)
}

/** Una respuesta de Overpass sirve si trae elements y no avisa un error (timeout,
 *  falta de memoria): esas vienen con 200, elements vacío y un "remark". */
async function pedirEspejo(url: string, consulta: string, signal: AbortSignal): Promise<Elemento[]> {
  const r = await fetch(url, {
    method: 'POST',
    body: new URLSearchParams({ data: consulta }),
    headers: { 'user-agent': UA },
    signal,
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`${url} ${r.status}`)
  const j = (await r.json()) as { elements?: Elemento[]; remark?: string }
  if (!Array.isArray(j.elements)) throw new Error(`${url} sin elements`)
  if (j.remark && /error|timed out|timeout/i.test(j.remark)) throw new Error(`${url} ${j.remark.slice(0, 80)}`)
  return j.elements
}

/** Pide a los espejos escalonados (el siguiente arranca si el anterior no
 *  contestó en ESCALON_MS); gana el primero que responde bien. */
async function consultarOverpass(lat: number, lng: number): Promise<Elemento[]> {
  const consulta = `[out:json][timeout:25];(${CONSULTA.map(([f, r]) => `${f}(around:${r},${lat},${lng});`).join('')});out center tags;`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await Promise.any(ESPEJOS.map((url, i) =>
      new Promise<void>((ok) => setTimeout(ok, i * ESCALON_MS)).then(() => {
        if (ctrl.signal.aborted) throw new Error('ya respondió otro')
        return pedirEspejo(url, consulta, ctrl.signal)
      }),
    ))
  } finally {
    clearTimeout(timer)
    ctrl.abort()
  }
}

const enCurso = new Map<string, Promise<LugaresCercanos | null>>()

/** Lugares cercanos a (lat, lng), redondeado a 4 decimales (~11 m). null si
 *  Overpass no respondió (o está en pausa): no se guarda nada, el próximo pedido
 *  después de la pausa vuelve a probar. */
const claveDe = (latIn: number, lngIn: number) => {
  const lat = Number(latIn.toFixed(4))
  const lng = Number(lngIn.toFixed(4))
  return { lat, lng, clave: `cercanos:v1:${lat}:${lng}` }
}

/** Nunca le pide a Overpass: dentro de la zona sale de la copia; afuera, solo lo
 *  ya guardado. Lo usa la ficha al armarse en el servidor para que el HTML
 *  traiga los lugares cercanos. null si no está o si Redis tarda: la ficha cae
 *  al pedido del navegador de siempre.
 *
 *  Va por el REST de Upstash con `next.revalidate` y NO con el cliente `redis`:
 *  el cliente pide con cache 'no-store' y eso vuelve dinámica la ficha (ISR de
 *  1 h) → "Page changed from static to dynamic at runtime" = 500 en todas. */
export async function cercanosGuardados(latIn: number, lngIn: number): Promise<LugaresCercanos | null> {
  const { lat, lng, clave } = claveDe(latIn, lngIn)
  const deZona = cercanosDeZona(lat, lng)
  if (deZona) return deZona
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(clave)}`, {
      headers: { authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(800),
    })
    if (!r.ok) return null
    const { result } = (await r.json()) as { result: string | null }
    return result ? (JSON.parse(result) as LugaresCercanos) : null
  } catch {
    return null
  }
}

export function lugaresCercanos(latIn: number, lngIn: number): Promise<LugaresCercanos | null> {
  const { lat, lng, clave } = claveDe(latIn, lngIn)
  const deZona = cercanosDeZona(lat, lng)
  if (deZona) return Promise.resolve(deZona)
  const ya = enCurso.get(clave)
  if (ya) return ya
  const p = (async () => {
    const [guardado, enPausa] = await Promise.all([
      redis.get<LugaresCercanos>(clave).catch(() => null),
      redis.get(CLAVE_PAUSA).catch(() => null),
    ])
    if (guardado) return guardado
    if (enPausa) return null
    try {
      const res = armarCercanos(lat, lng, await consultarOverpass(lat, lng))
      await redis.set(clave, res, { ex: TTL_S }).catch(() => {})
      return res
    } catch (e) {
      console.error('[cercanos] Overpass no respondió', clave, e instanceof AggregateError ? e.errors.map(String) : String(e))
      await redis.set(CLAVE_PAUSA, 1, { ex: PAUSA_S }).catch(() => {})
      return null
    }
  })().finally(() => enCurso.delete(clave))
  enCurso.set(clave, p)
  return p
}

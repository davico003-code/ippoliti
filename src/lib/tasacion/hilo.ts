// Lectura de la API pública de tasación de Hilo, con modo mock.
//
// Solo se importa desde código de servidor (rutas /api/tasacion/* y la page).
// Reglas:
//   · HILO_TASACION_MOCK=1 → fixtures siempre (desarrollo sin Hilo).
//   · En desarrollo, si Hilo responde 404/5xx o no responde → fixtures.
//   · En producción, si Hilo falla → barrios del catálogo local (sin comparables:
//     todo nivel 4, pero el pedido funciona) / nivel 4. La página nunca rompe.

import { BARRIOS_TASADOR } from '@/lib/tasador/barrios'
import { FIXTURE_BARRIOS, fixtureNivel4, mockComparables } from './fixtures'
import type {
  BarrioTasacion,
  ComparablesQuery,
  ComparablesResponse,
  NivelComparables,
  TipoTasacion,
} from './types'

export const TIPOS_TASACION: readonly TipoTasacion[] = ['casa', 'lote', 'depto']

export function esMockTasacion(): boolean {
  return process.env.HILO_TASACION_MOCK === '1'
}

const esDesarrollo = () => process.env.NODE_ENV !== 'production'

function baseHilo(): string {
  return (process.env.HILO_LEADS_URL || 'https://meethilo.com').replace(/\/$/, '')
}

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null

const str = (v: unknown, max = 200): string => String(v ?? '').trim().slice(0, max)

function normalizarBarrio(raw: unknown): BarrioTasacion | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = str(r.id, 64)
  const nombre = str(r.nombre, 80)
  if (!id || !nombre) return null
  const c = (r.centroide && typeof r.centroide === 'object' ? (r.centroide as Record<string, unknown>) : null)
  const lat = c ? num(c.lat) : null
  const lng = c ? num(c.lng) : null
  const m2 = (r.m2Tipico && typeof r.m2Tipico === 'object' ? (r.m2Tipico as Record<string, unknown>) : {}) as Record<string, unknown>
  const t = (r.tiene && typeof r.tiene === 'object' ? (r.tiene as Record<string, unknown>) : {}) as Record<string, unknown>
  const cuenta = (v: unknown): number | boolean => (typeof v === 'boolean' ? v : num(v) ?? 0)
  return {
    id,
    nombre,
    slug: str(r.slug, 80) || slugify(nombre),
    ciudad: str(r.ciudad, 40) || 'Funes',
    esCerrado: typeof r.esCerrado === 'boolean' ? r.esCerrado : null,
    centroide: lat != null && lng != null ? { lat, lng } : null,
    m2Tipico: { lote: num(m2.lote), cubiertos: num(m2.cubiertos) },
    tiene: { casas: cuenta(t.casas), lotes: cuenta(t.lotes), deptos: cuenta(t.deptos) },
  }
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const CIUDADES_SLUG = new Set(['funes', 'roldan', 'rosario'])

let cacheLocales: BarrioTasacion[] | null = null

/** Catálogo local (src/lib/tasador/barrios.ts: barrios reales con centroide),
 *  sin comparables. Es la red de seguridad de producción cuando Hilo no
 *  responde: los chips y el selector funcionan, y el pedido llega igual. Se
 *  ordena por actividad del feed para que los chips sugeridos tengan sentido. */
export function barriosLocales(): BarrioTasacion[] {
  if (cacheLocales) return cacheLocales
  cacheLocales = BARRIOS_TASADOR.filter((b) => !CIUDADES_SLUG.has(b.slug))
    .sort((a, b) => b.muestras + b.muestrasDepto - (a.muestras + a.muestrasDepto))
    .map((b) => ({
      id: b.slug,
      nombre: b.nombre,
      slug: b.slug,
      ciudad: b.ciudad,
      esCerrado: b.cerrado,
      centroide: { lat: b.lat, lng: b.lon },
      m2Tipico: { lote: null, cubiertos: null },
      tiene: { casas: 0, lotes: 0, deptos: 0 },
    }))
  return cacheLocales
}

const sinHilo = () => (esDesarrollo() ? FIXTURE_BARRIOS : barriosLocales())

export async function obtenerBarrios(): Promise<BarrioTasacion[]> {
  if (esMockTasacion()) return FIXTURE_BARRIOS
  try {
    const res = await fetch(`${baseHilo()}/api/public/tasacion/barrios`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      console.warn('[tasacion] barrios no-ok:', res.status)
      return sinHilo()
    }
    const data = (await res.json()) as { barrios?: unknown[] }
    const barrios = (Array.isArray(data?.barrios) ? data.barrios : [])
      .map(normalizarBarrio)
      .filter((x): x is BarrioTasacion => x !== null)
    return barrios.length ? barrios : sinHilo()
  } catch (err) {
    console.warn('[tasacion] barrios error:', err)
    return sinHilo()
  }
}

export function respuestaNivel4(): ComparablesResponse {
  return fixtureNivel4(null)
}

function normalizarComparables(raw: unknown): ComparablesResponse {
  if (!raw || typeof raw !== 'object') return respuestaNivel4()
  const r = raw as Record<string, unknown>
  const nivelNum = num(r.nivel)
  const nivel = (nivelNum && nivelNum >= 1 && nivelNum <= 4 ? Math.trunc(nivelNum) : 4) as NivelComparables
  const rg = r.rango && typeof r.rango === 'object' ? (r.rango as Record<string, unknown>) : null
  const min = rg ? num(rg.min) : null
  const max = rg ? num(rg.max) : null
  const rango = min != null && max != null && max >= min ? { min, max } : null
  const ambitoRaw = str(r.ambito, 20)
  const ambito = ambitoRaw === 'barrio' || ambitoRaw === 'zona' || ambitoRaw === 'ciudad' ? ambitoRaw : null
  const unidadRaw = str(r.unidad, 20)
  const unidad = unidadRaw === 'total' || unidadRaw === 'usd_m2' ? unidadRaw : null
  const muestras = (Array.isArray(r.muestras) ? r.muestras : [])
    .slice(0, 3)
    .map((m) => {
      const mm = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>
      const precio = num(mm.precio)
      if (precio == null) return null
      return {
        precio,
        m2Cubiertos: num(mm.m2Cubiertos),
        m2Lote: num(mm.m2Lote),
        dormitorios: num(mm.dormitorios),
        fuente: str(mm.fuente, 40),
      }
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
  const precios = Array.isArray(r.precios)
    ? r.precios.map(num).filter((p): p is number => p != null)
    : undefined
  const b = r.barrio && typeof r.barrio === 'object' ? (r.barrio as Record<string, unknown>) : null
  const barrio = b
    ? {
        id: str(b.id, 64),
        nombre: str(b.nombre, 80),
        ciudad: str(b.ciudad, 40),
        esCerrado: typeof b.esCerrado === 'boolean' ? b.esCerrado : null,
      }
    : null

  // Sin rango no hay número que mostrar: es nivel 4 aunque Hilo diga otra cosa.
  if (!rango || nivel === 4) return { ...respuestaNivel4(), barrio, periodo: str(r.periodo, 60) }

  return {
    nivel,
    ambito,
    n: Math.max(0, Math.trunc(num(r.n) ?? 0)),
    rango,
    unidad: unidad ?? 'total',
    descripcion: str(r.descripcion, 240),
    periodo: str(r.periodo, 60),
    muestras,
    precios: precios && precios.length ? precios : undefined,
    barrio,
  }
}

export async function obtenerComparables(q: ComparablesQuery): Promise<ComparablesResponse> {
  if (esMockTasacion()) return mockComparables(q)
  const url = new URL(`${baseHilo()}/api/public/tasacion/comparables`)
  url.searchParams.set('barrioId', q.barrioId)
  url.searchParams.set('tipo', q.tipo)
  if (q.m2Cubiertos != null) url.searchParams.set('m2Cubiertos', String(q.m2Cubiertos))
  if (q.m2Lote != null) url.searchParams.set('m2Lote', String(q.m2Lote))
  if (q.lat != null && q.lng != null) {
    url.searchParams.set('lat', String(q.lat))
    url.searchParams.set('lng', String(q.lng))
  }
  try {
    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
      next: { revalidate: 600 },
    })
    if (!res.ok) {
      console.warn('[tasacion] comparables no-ok:', res.status)
      if (esDesarrollo() && (res.status === 404 || res.status >= 500)) return mockComparables(q)
      return respuestaNivel4()
    }
    return normalizarComparables(await res.json())
  } catch (err) {
    console.warn('[tasacion] comparables error:', err)
    return esDesarrollo() ? mockComparables(q) : respuestaNivel4()
  }
}

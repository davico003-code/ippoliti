// Ronda Funes Roldán — lo que se guarda (Redis, el mismo de las fichas).
//
// Tres hashes, un campo por registro (JSON):
//   ronda:inmobiliarias  → Inmobiliaria   (la lista que se autocompleta)
//   ronda:agentes        → AgenteRonda    (quién entró, con su WhatsApp)
//   ronda:publicaciones  → Publicacion    (la grilla; las vencidas se limpian al publicar)
//   ronda:leido:<clave>  → el aviso ya leído, 30 min (no leerlo dos veces)
//   ronda:zonaprop       → copia de los avisos de Zonaprop que Hilo ya tenía leídos
//
// La cuota de Upstash es finita (se agotó el 25-ago-2026): leer la grilla es UN
// hgetall y queda 15 s en memoria por instancia. Fuera de producción todo va a
// "ronda-prueba:*" para que una prueba local no ensucie la ronda real.

import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { activas, sinTildes, type AgenteRonda, type Inmobiliaria, type Publicacion } from './reglas'

// Las dos señales: el .env.local de esta máquina trae VERCEL_ENV="production"
// (viene de `vercel env pull`), así que `next dev` sola no alcanza para saberlo.
const EN_PRODUCCION = process.env.VERCEL_ENV === 'production' && process.env.NODE_ENV === 'production'
const P = EN_PRODUCCION ? 'ronda' : 'ronda-prueba'
const K = {
  inmobiliarias: `${P}:inmobiliarias`,
  agentes: `${P}:agentes`,
  publicaciones: `${P}:publicaciones`,
  leido: (clave: string) => `${P}:leido:${clave}`,
}

const TTL_GRILLA_MS = 15_000
const TTL_LISTA_MS = 30_000

let _grilla: { filas: Publicacion[]; ts: number } | null = null
let _inmobiliarias: { filas: Inmobiliaria[]; ts: number } | null = null

/** Upstash devuelve el JSON ya parseado; por las dudas se acepta también el texto. */
function fila<T>(v: unknown): T | null {
  if (v && typeof v === 'object') return v as T
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T
    } catch {
      return null
    }
  }
  return null
}

async function todas<T>(clave: string): Promise<T[]> {
  const mapa = (await redis.hgetall<Record<string, unknown>>(clave)) ?? {}
  return Object.values(mapa)
    .map((v) => fila<T>(v))
    .filter((v): v is T => v !== null)
}

// ── Inmobiliarias ───────────────────────────────────────────────────────

export async function listarInmobiliarias(fresco = false): Promise<Inmobiliaria[]> {
  if (!fresco && _inmobiliarias && Date.now() - _inmobiliarias.ts < TTL_LISTA_MS) return _inmobiliarias.filas
  const filas = (await todas<Inmobiliaria>(K.inmobiliarias)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  _inmobiliarias = { filas, ts: Date.now() }
  return filas
}

export async function inmobiliariaPorId(id: string): Promise<Inmobiliaria | null> {
  return fila<Inmobiliaria>(await redis.hget(K.inmobiliarias, id))
}

/** La que ya existe con ese nombre (sin mayúsculas ni tildes), o una nueva. */
export async function crearInmobiliaria(datos: { nombre: string; matriculado: string; matricula: string }): Promise<Inmobiliaria> {
  const lista = await listarInmobiliarias(true)
  const existente = lista.find((i) => sinTildes(i.nombre) === sinTildes(datos.nombre))
  if (existente) return existente
  const nueva: Inmobiliaria = { id: nanoid(10), ...datos, creada: Date.now() }
  await redis.hset(K.inmobiliarias, { [nueva.id]: nueva })
  _inmobiliarias = null
  return nueva
}

// ── Agentes ─────────────────────────────────────────────────────────────

export async function guardarAgente(agente: AgenteRonda): Promise<void> {
  await redis.hset(K.agentes, { [agente.id]: agente })
}

// ── Publicaciones ───────────────────────────────────────────────────────

/** Las publicaciones vigentes, la más nueva primero. */
export async function listarPublicaciones(fresco = false): Promise<Publicacion[]> {
  if (!fresco && _grilla && Date.now() - _grilla.ts < TTL_GRILLA_MS) return activas(_grilla.filas)
  const filas = await todas<Publicacion>(K.publicaciones)
  _grilla = { filas, ts: Date.now() }
  return activas(filas)
}

export async function guardarPublicacion(p: Publicacion): Promise<void> {
  await redis.hset(K.publicaciones, { [p.id]: p })
  _grilla = null
}

export async function publicacionPorId(id: string): Promise<Publicacion | null> {
  return fila<Publicacion>(await redis.hget(K.publicaciones, id))
}

export async function borrarPublicacion(id: string): Promise<void> {
  await redis.hdel(K.publicaciones, id)
  _grilla = null
}

/** Saca del hash las que ya vencieron. Se llama al publicar: no hace falta un cron. */
export async function limpiarVencidas(): Promise<void> {
  const filas = await todas<Publicacion>(K.publicaciones)
  const vencidas = filas.filter((p) => p.vence <= Date.now()).map((p) => p.id)
  if (vencidas.length > 0) await redis.hdel(K.publicaciones, ...vencidas)
}

/** Si el agente cambió su nombre o su WhatsApp, sus publicaciones vigentes lo siguen. */
export async function actualizarContacto(agente: { id: string; nombre: string; whatsapp: string }): Promise<void> {
  const suyas = (await listarPublicaciones(true)).filter(
    (p) => p.agente.id === agente.id && (p.agente.nombre !== agente.nombre || p.agente.whatsapp !== agente.whatsapp),
  )
  if (suyas.length === 0) return
  const cambios: Record<string, Publicacion> = {}
  for (const p of suyas) cambios[p.id] = { ...p, agente: { ...agente } }
  await redis.hset(K.publicaciones, cambios)
  _grilla = null
}

// ── Copia de avisos de Zonaprop ─────────────────────────────────────────
// Lo que Hilo ya tenía leído de Zonaprop (scripts/ronda-copia-zonaprop.mjs lo
// carga en el hash ronda:zonaprop). Completa la lectura en el momento (todas las
// fotos) y la reemplaza si el aviso hoy no figura. Es una foto de un día: cada
// registro dice cuándo se leyó. Solo se lee, así que es la misma en producción y en pruebas.

export interface CopiaZonaprop {
  id: string
  url: string
  titulo: string
  tipo: string
  operacion: string
  precio: number | null
  moneda: 'USD' | 'ARS'
  dormitorios: number | null
  banos: number | null
  cocheras: number | null
  ambientes: number | null
  supTotal: number | null
  supCub: number | null
  barrio: string | null
  localidad: string | null
  anunciante: string | null
  fotos: string[]
  descripcion: string
  /** Cuándo se leyó el aviso (ISO). */
  leido: string
}

export async function copiaDeZonaprop(id: string): Promise<CopiaZonaprop | null> {
  return fila<CopiaZonaprop>(await redis.hget('ronda:zonaprop', id))
}

// ── Aviso ya leído (entre "Revisar" y "Publicar") ───────────────────────

const claveLeido = (clave: string) => clave.replace(/[^a-z0-9]+/g, '-').slice(0, 180)

export async function guardarLectura<T>(clave: string, aviso: T): Promise<void> {
  await redis.set(K.leido(claveLeido(clave)), JSON.stringify(aviso), { ex: 1800 })
}

export async function lecturaGuardada<T>(clave: string): Promise<T | null> {
  return fila<T>(await redis.get(K.leido(claveLeido(clave))))
}

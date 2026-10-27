// Ronda Funes Roldán — lo que se guarda (Redis, el mismo de las fichas).
//
// Tres hashes, un campo por registro (JSON cifrado, ver cifrado.ts):
//   ronda:inmobiliarias  → Inmobiliaria   (la lista que se autocompleta)
//   ronda:agentes        → AgenteRonda    (quién entró, con su WhatsApp)
//   ronda:publicaciones  → Publicacion    (la grilla; las vencidas se limpian al publicar)
//   ronda:pedidos        → Pedido         (lo que buscan los clientes de los colegas, 16-oct-2026)
//   ronda:leido:<clave>  → el aviso ya leído, 30 min (no leerlo dos veces)
//   ronda:zonaprop       → copia de los avisos de Zonaprop que Hilo ya tenía leídos
//   ronda:contactos:<mes>, ronda:fichas:<mes> → la actividad del mes (ver abajo)
//   ronda:lecturas:<día> → cómo salió cada link que pegó un colega (para el vigía, salud.ts)
//   ronda:sala:<sala>:publicaciones / :pedidos → los de una sala (sala.ts, 27-oct-2026);
//     las inmobiliarias y los agentes son los mismos de la Ronda.
//
// La cuota de Upstash es finita (se agotó el 25-ago-2026): leer la grilla es UN
// hgetall y queda 15 s en memoria por instancia. Fuera de producción todo va a
// "ronda-prueba:*" para que una prueba local no ensucie la ronda real.

import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { cifrar, descifrar, estaCifrado } from './cifrado'
import type { Sala } from './sala'
import { activas, pedidosActivos, sinTildes, type AgenteRonda, type Inmobiliaria, type Pedido, type Publicacion } from './reglas'

// Las dos señales: el .env.local de esta máquina trae VERCEL_ENV="production"
// (viene de `vercel env pull`), así que `next dev` sola no alcanza para saberlo.
const EN_PRODUCCION = process.env.VERCEL_ENV === 'production' && process.env.NODE_ENV === 'production'
const P = EN_PRODUCCION ? 'ronda' : 'ronda-prueba'
const K = {
  inmobiliarias: `${P}:inmobiliarias`,
  agentes: `${P}:agentes`,
  publicaciones: `${P}:publicaciones`,
  pedidos: `${P}:pedidos`,
  publicacionesDe: (sala: Sala | null) => (sala ? `${P}:sala:${sala.id}:publicaciones` : `${P}:publicaciones`),
  pedidosDe: (sala: Sala | null) => (sala ? `${P}:sala:${sala.id}:pedidos` : `${P}:pedidos`),
  leido: (clave: string) => `${P}:leido:${clave}`,
}

const TTL_GRILLA_MS = 15_000
const TTL_LISTA_MS = 30_000

// Un caché por sala ('' = la Ronda de siempre).
const _grillas = new Map<string, { filas: Publicacion[]; ts: number }>()
const _listasPedidos = new Map<string, { filas: Pedido[]; ts: number }>()
const idSala = (sala: Sala | null) => sala?.id ?? ''
let _inmobiliarias: { filas: Inmobiliaria[]; ts: number } | null = null

/**
 * Un registro guardado. Los de la Ronda van cifrados (ver cifrado.ts); los que
 * quedaron de antes en claro se siguen leyendo y se cifran en la próxima limpieza.
 */
function fila<T>(v: unknown): T | null {
  if (estaCifrado(v)) return descifrar<T>(v)
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
  await redis.hset(K.inmobiliarias, { [nueva.id]: cifrar(nueva) })
  _inmobiliarias = null
  return nueva
}

// ── Agentes ─────────────────────────────────────────────────────────────

export async function guardarAgente(agente: AgenteRonda): Promise<void> {
  await redis.hset(K.agentes, { [agente.id]: cifrar(agente) })
}

// ── Publicaciones ───────────────────────────────────────────────────────

/** Las publicaciones vigentes, la más nueva primero. */
export async function listarPublicaciones(fresco = false, sala: Sala | null = null): Promise<Publicacion[]> {
  const cache = _grillas.get(idSala(sala))
  if (!fresco && cache && Date.now() - cache.ts < TTL_GRILLA_MS) return activas(cache.filas)
  const filas = await todas<Publicacion>(K.publicacionesDe(sala))
  _grillas.set(idSala(sala), { filas, ts: Date.now() })
  return activas(filas)
}

export async function guardarPublicacion(p: Publicacion, sala: Sala | null = null): Promise<void> {
  await redis.hset(K.publicacionesDe(sala), { [p.id]: cifrar(p) })
  _grillas.delete(idSala(sala))
}

export async function publicacionPorId(id: string, sala: Sala | null = null): Promise<Publicacion | null> {
  return fila<Publicacion>(await redis.hget(K.publicacionesDe(sala), id))
}

export async function borrarPublicacion(id: string, sala: Sala | null = null): Promise<void> {
  await redis.hdel(K.publicacionesDe(sala), id)
  _grillas.delete(idSala(sala))
}

/** Saca del hash las que ya vencieron. Se llama al publicar: no hace falta un cron. */
export async function limpiarVencidas(sala: Sala | null = null): Promise<void> {
  const filas = await todas<Publicacion>(K.publicacionesDe(sala))
  const vencidas = filas.filter((p) => p.vence <= Date.now()).map((p) => p.id)
  if (vencidas.length > 0) await redis.hdel(K.publicacionesDe(sala), ...vencidas)
  if (!sala) await cifrarLoQueQuedoEnClaro()
}

// ── Pedidos de búsqueda ─────────────────────────────────────────────────

/** Los pedidos vigentes, el más nuevo primero (15 s en memoria, como la grilla). */
export async function listarPedidos(fresco = false, sala: Sala | null = null): Promise<Pedido[]> {
  const cache = _listasPedidos.get(idSala(sala))
  if (!fresco && cache && Date.now() - cache.ts < TTL_GRILLA_MS) return pedidosActivos(cache.filas)
  const filas = await todas<Pedido>(K.pedidosDe(sala))
  _listasPedidos.set(idSala(sala), { filas, ts: Date.now() })
  return pedidosActivos(filas)
}

export async function guardarPedido(p: Pedido, sala: Sala | null = null): Promise<void> {
  await redis.hset(K.pedidosDe(sala), { [p.id]: cifrar(p) })
  _listasPedidos.delete(idSala(sala))
}

export async function pedidoPorId(id: string, sala: Sala | null = null): Promise<Pedido | null> {
  return fila<Pedido>(await redis.hget(K.pedidosDe(sala), id))
}

export async function borrarPedido(id: string, sala: Sala | null = null): Promise<void> {
  await redis.hdel(K.pedidosDe(sala), id)
  _listasPedidos.delete(idSala(sala))
}

/** Saca los vencidos. Se llama al publicar un pedido: no hace falta un cron. */
export async function limpiarPedidosVencidos(sala: Sala | null = null): Promise<void> {
  const filas = await todas<Pedido>(K.pedidosDe(sala))
  const vencidos = filas.filter((p) => p.vence <= Date.now()).map((p) => p.id)
  if (vencidos.length > 0) await redis.hdel(K.pedidosDe(sala), ...vencidos)
}

/** Los registros de antes del cifrado (13-oct-2026) se reescriben cifrados. */
async function cifrarLoQueQuedoEnClaro(): Promise<void> {
  for (const clave of [K.publicaciones, K.agentes, K.inmobiliarias]) {
    const mapa = (await redis.hgetall<Record<string, unknown>>(clave)) ?? {}
    const enClaro = Object.entries(mapa).filter(([, v]) => !estaCifrado(v) && fila(v) !== null)
    if (enClaro.length > 0) await redis.hset(clave, Object.fromEntries(enClaro.map(([id, v]) => [id, cifrar(fila(v))])))
  }
}

// ── Actividad del mes (el contador de arriba de la grilla) ──────────────
//
// Solo hechos reales, por mes de Argentina. Cada uno es un set de
// "agente:publicación": el mismo colega tocando dos veces la misma no suma dos.
//   ronda:contactos:<AAAA-MM>  → le escribió por WhatsApp al colega que la publicó
//   ronda:fichas:<AAAA-MM>     → le mandó la ficha a un cliente
// Solo cuentan los toques sobre oportunidades de OTRA inmobiliaria (ver /api/ronda/actividad).

export type TipoActividad = 'contacto' | 'ficha'

export interface ActividadRonda {
  mes: string
  contactos: number
  fichas: number
  colegas: number
  inmobiliarias: number
}

/** El mes en Argentina (UTC-3): "2026-10". */
export const mesActual = (ms = Date.now()) => new Date(ms - 3 * 3_600_000).toISOString().slice(0, 7)
const claveActividad = (tipo: TipoActividad, mes: string) => `${P}:${tipo === 'contacto' ? 'contactos' : 'fichas'}:${mes}`
const TTL_ACTIVIDAD_S = 400 * 24 * 3600

let _actividad: { valor: ActividadRonda; ts: number } | null = null

export async function anotarActividad(tipo: TipoActividad, agenteId: string, publicacionId: string): Promise<void> {
  const clave = claveActividad(tipo, mesActual())
  const p = redis.pipeline()
  p.sadd(clave, `${agenteId}:${publicacionId}`)
  p.expire(clave, TTL_ACTIVIDAD_S)
  await p.exec()
  _actividad = null
}

/** Los números del mes: un solo viaje a Redis y 15 s en memoria (la cuota). */
export async function actividadDelMes(): Promise<ActividadRonda> {
  if (_actividad && Date.now() - _actividad.ts < TTL_GRILLA_MS) return _actividad.valor
  const mes = mesActual()
  const p = redis.pipeline()
  p.scard(claveActividad('contacto', mes))
  p.scard(claveActividad('ficha', mes))
  p.hlen(K.inmobiliarias)
  p.hgetall(K.agentes)
  const [contactos, fichas, inmobiliarias, agentes] = await p.exec<[number, number, number, Record<string, unknown> | null]>()
  // Quien entró desde dos teléfonos quedó dos veces: las personas se cuentan por WhatsApp.
  const colegas = new Set(Object.values(agentes ?? {}).map((v) => fila<AgenteRonda>(v)?.whatsapp).filter(Boolean)).size
  const valor = { mes, contactos, fichas, colegas, inmobiliarias }
  _actividad = { valor, ts: Date.now() }
  return valor
}

// ── Lecturas de links (lo mira el vigía) ────────────────────────────────
//
// Cada link que pega un colega deja una marca por día de Argentina:
//   ronda:lecturas:<AAAA-MM-DD> → hash "<origen>:<resultado>" → cuántos
// Así una falla que vio un colega no pasa en silencio aunque nadie avise.

export type ResultadoLectura = 'ok' | 'copia' | 'no-figura' | 'caida' | 'error' | 'no-reconocido'

const diaAR = (ms = Date.now()) => new Date(ms - 3 * 3_600_000).toISOString().slice(0, 10)
const claveLecturas = (dia: string) => `${P}:lecturas:${dia}`

export async function anotarLectura(origen: string, resultado: ResultadoLectura): Promise<void> {
  const clave = claveLecturas(diaAR())
  const p = redis.pipeline()
  p.hincrby(clave, `${origen}:${resultado}`, 1)
  p.expire(clave, 40 * 24 * 3600)
  await p.exec()
}

/** Lo anotado hoy y los días anteriores (`dias` en total), sumado: { "zonaprop:ok": 3, … }. */
export async function lecturasRecientes(dias = 2): Promise<Record<string, number>> {
  const p = redis.pipeline()
  for (let i = 0; i < dias; i++) p.hgetall(claveLecturas(diaAR(Date.now() - i * 86_400_000)))
  const filas = await p.exec<(Record<string, number | string> | null)[]>()
  const total: Record<string, number> = {}
  for (const fila of filas) for (const [k, v] of Object.entries(fila ?? {})) total[k] = (total[k] ?? 0) + Number(v)
  return total
}

/** Si el agente cambió su nombre o su WhatsApp, sus publicaciones vigentes lo siguen. */
export async function actualizarContacto(agente: { id: string; nombre: string; whatsapp: string }): Promise<void> {
  const suyas = (await listarPublicaciones(true)).filter(
    (p) => p.agente.id === agente.id && (p.agente.nombre !== agente.nombre || p.agente.whatsapp !== agente.whatsapp),
  )
  if (suyas.length === 0) return
  const cambios: Record<string, string> = {}
  for (const p of suyas) cambios[p.id] = cifrar({ ...p, agente: { ...agente } })
  await redis.hset(K.publicaciones, cambios)
  _grillas.delete('')
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
  /** Comodidades del aviso (pileta, parrilla…), si la copia las trae. */
  caracteristicas?: string[]
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

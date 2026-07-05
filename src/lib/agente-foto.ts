// Foto del agente que arma la selección. Misma fuente que la página /nosotros:
//   1) fotos curadas propias en /public/team (fundadores + agentes del CRM con
//      override + extras) — tienen prioridad, igual que en /nosotros;
//   2) para el resto, la foto que viene de Tokko (cacheada en Redis 24h).
//
// Sin dependencia de Supabase ni env vars nuevas: /team/*.jpg ya está deployado
// y Tokko usa la TOKKO_API_KEY que ya existe. Best-effort: si no hay match,
// devuelve null y la vista usa el avatar de iniciales.

import { redis } from './redis'
import { getTokkoAgents } from './tokko-agents'

const CACHE_TTL = 7 * 24 * 60 * 60 // 7d

// Normaliza para matchear sin importar acentos, mayúsculas ni dobles espacios.
const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Fotos propias en /public/team. Espejan las que muestra /nosotros y tienen
// prioridad sobre la foto de Tokko.
const FOTO_TEAM: Record<string, string> = {
  'Susana Ippoliti': '/team/susana-ippoliti.jpg',
  'David Flores': '/team/david-flores.jpg',
  'Laura Flores': '/team/laura-flores.jpg',
  'Mariana Orlate': '/team/mariana-orlate.jpg',
  'Micaela Gonzalez': '/team/micaela-gonzalez.jpg',
  'Leticia Alexenicer': '/team/leticia-alexenicer.jpg',
  'Maria Jose Espilocin': '/team/maria-jose-espilocin.jpg',
  'Marisa Benitez': '/team/marisa-benitez.jpg',
  'Sabrina Rogani': '/team/sabrina-rogani.jpg',
  'Eliana Rojas': '/team/eliana-rojas.jpg',
  'Julian Ruschneider': '/team/julian-ruschneider.jpg',
  'Claudia': '/team/claudia.jpg',
}
const FOTO_TEAM_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(FOTO_TEAM).map(([k, v]) => [norm(k), v]),
)

const cacheKey = (n: string) => `agente-foto:${norm(n)}`

export async function getAgentePhoto(nombre: string | null | undefined): Promise<string | null> {
  const n = (nombre || '').replace(/\s+/g, ' ').trim()
  if (!n) return null

  // 1) Foto curada propia: instantánea, sin red ni cache.
  const propia = FOTO_TEAM_NORM[norm(n)]
  if (propia) return propia

  // 2) Cache por-agente (resultados de Tokko / sin-foto).
  try {
    const cached = await redis.get<string>(cacheKey(n))
    if (cached === '__none__') return null
    if (cached) return cached
  } catch {
    /* cache best-effort */
  }

  // 3) Foto de Tokko (misma lista que consume /nosotros).
  let foto: string | null = null
  try {
    const { agents } = await getTokkoAgents()
    const hit = agents.find((a) => norm(a.name) === norm(n))
    const u = hit?.picture
    if (u && /^https?:\/\//i.test(u)) foto = u
  } catch {
    /* red/timeout: best-effort */
  }

  try {
    await redis.set(cacheKey(n), foto ?? '__none__', { ex: CACHE_TTL })
  } catch {
    /* cache best-effort */
  }
  return foto
}

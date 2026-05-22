// Helpers para leer leads del newsletter desde Redis (Upstash).
//
// El endpoint /api/leads guarda cada lead en:
//   - lead:{origen}:{ts}:{email}    → key individual
//   - leads:all (LPUSH)              → lista cronológica (más nuevo primero)
//
// Filtrar por origen sobre 'leads:all' es suficiente para los volúmenes
// actuales (<1k leads). Si crece, se puede sumar un índice dedicado
// (leads:by-origen:newsletter) sin tocar consumidores.

import { redis } from './redis'

const ALL_KEY = 'leads:all'
const LIST_LIMIT = 1000

export interface NewsletterLead {
  nombre: string
  email: string
  whatsapp?: string
  origen: string
  fecha: string
  // Campos opcionales del popup ExitPopup; no todos los leads viejos los tienen.
  operation?: string
  propertyType?: string
  budget?: string
}

interface RawLead {
  nombre?: string
  email?: string
  whatsapp?: string
  phone?: string
  origen?: string
  source?: string
  fecha?: string
  date?: string
  operation?: string
  propertyType?: string
  budget?: string
}

function normalizeLead(raw: unknown): NewsletterLead | null {
  if (!raw) return null
  const obj: RawLead = typeof raw === 'string'
    ? (() => { try { return JSON.parse(raw) as RawLead } catch { return {} } })()
    : (raw as RawLead)

  const email = (obj.email ?? '').trim()
  if (!email) return null

  return {
    nombre: (obj.nombre ?? '').trim(),
    email,
    whatsapp: obj.whatsapp ?? obj.phone ?? undefined,
    origen: obj.origen ?? obj.source ?? 'web',
    fecha: obj.fecha ?? obj.date ?? '',
    operation: obj.operation,
    propertyType: obj.propertyType,
    budget: obj.budget,
  }
}

async function fetchAllLeadsRaw(): Promise<NewsletterLead[]> {
  const raw = await redis.lrange(ALL_KEY, 0, LIST_LIMIT - 1)
  const out: NewsletterLead[] = []
  for (const item of raw) {
    const lead = normalizeLead(item)
    if (lead) out.push(lead)
  }
  return out
}

/**
 * Devuelve los suscriptores del newsletter (popup "¿Encontraste lo que
 * buscabas?") ordenados del más nuevo al más viejo, deduplicados por email.
 * Si dos leads comparten email, gana el más reciente.
 */
export async function listNewsletterLeads(): Promise<NewsletterLead[]> {
  const all = await fetchAllLeadsRaw()
  // 'leads:all' ya está ordenado desc (LPUSH agrega al inicio).
  const newsletter = all.filter(l => l.origen === 'newsletter')

  const seen = new Set<string>()
  const dedup: NewsletterLead[] = []
  for (const lead of newsletter) {
    const key = lead.email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    dedup.push(lead)
  }
  return dedup
}

export interface NewsletterStats {
  total: number
  esteMes: number
}

/**
 * Conteo liviano para mostrar en la PlacaCard del dashboard sin descargar
 * toda la lista. Reusa fetchAllLeadsRaw + filtros — barato para <1k leads.
 */
export async function countNewsletterLeads(): Promise<NewsletterStats> {
  try {
    const leads = await listNewsletterLeads()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    let esteMes = 0
    for (const l of leads) {
      const t = Date.parse(l.fecha)
      if (Number.isFinite(t) && t >= startOfMonth) esteMes++
    }
    return { total: leads.length, esteMes }
  } catch (e) {
    console.error('[leads] countNewsletterLeads:', e)
    return { total: 0, esteMes: 0 }
  }
}

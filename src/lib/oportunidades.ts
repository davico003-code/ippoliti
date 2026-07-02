// Oportunidades: propiedades curadas por admin con un "gancho" comercial
// (vendedor motivado / acepta permuta / margen para negociar) que se muestran
// en un popup esquinero en el sitio público.
//
// La lista vive en Redis (oportunidades:items). Al agregar, se snapshotea
// título/foto/precio/slug de la propiedad para que el GET público sea una
// lectura simple de Redis (sin pegarle a Tokko en cada visita).

import { redis } from '@/lib/redis'

export const HOOKS = ['motivado', 'permuta', 'negociable', 'bajo-precio'] as const
export type Hook = (typeof HOOKS)[number]

export const HOOK_META: Record<Hook, { badge: string; cta: string }> = {
  motivado: { badge: 'Vendedor motivado', cta: 'Pasá a conocerla' },
  permuta: { badge: 'Acepta permuta', cta: 'Pasá a conocerla' },
  negociable: { badge: 'Margen para negociar', cta: 'Hacé tu oferta' },
  'bajo-precio': { badge: 'Bajó el precio', cta: 'Miralá ahora' },
}

export interface Oportunidad {
  propertyId: number
  hook: Hook
  titulo: string
  foto: string | null
  precio: string
  /** Solo para hook 'bajo-precio': precio anterior ya formateado y % de baja. */
  precioAnterior?: string
  pctBaja?: number
  /** URL relativa de la ficha (/propiedades/<slug>). */
  href: string
  createdAt: number
}

const KEY = 'oportunidades:items'
export const MAX_OPORTUNIDADES = 4

export async function listOportunidades(): Promise<Oportunidad[]> {
  try {
    const raw = await redis.get<Oportunidad[]>(KEY)
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export async function saveOportunidades(items: Oportunidad[]): Promise<void> {
  await redis.set(KEY, JSON.stringify(items))
}

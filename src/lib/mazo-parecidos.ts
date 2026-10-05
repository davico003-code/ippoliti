// Trae las casas de los BARRIOS PARECIDOS para sumarlas al mazo (ver
// barrios-parecidos.ts). Reusa el mismo endpoint de "Conocé tu próximo hogar"
// (/api/propiedades/hogar: nuestras de esa zona + las En red que elige Hilo),
// uno por barrio, en paralelo. Solo en el navegador.

import type { ItemFeed, TipoHogar } from '@/lib/feed-en-red'

/** Con más, el mazo se hace eterno: alcanza para ver variedad de cada barrio. */
const MAX_PARECIDAS = 30

/**
 * Orden: primero las nuestras de todos los barrios; después las En red,
 * alternando barrio por barrio (así no son 15 seguidas del mismo). Sin las
 * que ya vio ni repetidas. Un barrio que falla se saltea.
 */
export function mezclarParecidas(porBarrio: readonly ItemFeed[][], yaVistas: ReadonlySet<string>): ItemFeed[] {
  const vistas = new Set(yaVistas)
  const out: ItemFeed[] = []
  const sumar = (i: ItemFeed) => {
    if (vistas.has(i.key) || out.length >= MAX_PARECIDAS) return
    vistas.add(i.key)
    out.push(i)
  }
  for (const items of porBarrio) items.filter((i) => i.esNuestra).forEach(sumar)
  const red = porBarrio.map((items) => items.filter((i) => !i.esNuestra))
  for (let k = 0; red.some((r) => k < r.length); k++) for (const r of red) if (r[k]) sumar(r[k])
  return out
}

export async function cargarCasasDeBarrios(
  barrios: readonly string[],
  tipo: TipoHogar,
  tope: number | null,
  yaVistas: ReadonlySet<string>,
  dorm: number | null = null,
): Promise<ItemFeed[]> {
  const porBarrio = await Promise.all(
    barrios.map(async (zona) => {
      const p = new URLSearchParams({ zona, tipo })
      if (tope) p.set('tope', String(tope))
      if (dorm) p.set('dorm', String(dorm))
      try {
        const r = await fetch(`/api/propiedades/hogar?${p.toString()}`, { signal: AbortSignal.timeout(12_000) })
        if (!r.ok) return []
        const d = (await r.json()) as { items?: ItemFeed[] }
        return Array.isArray(d.items) ? d.items : []
      } catch {
        return []
      }
    }),
  )
  return mezclarParecidas(porBarrio, yaVistas)
}

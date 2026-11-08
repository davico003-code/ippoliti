import type { TokkoProperty } from '@/lib/tokko'

// Lo que la cuenta necesita de un lote del feed: el precio de venta en dólares
// (solo si es público) y la expensa que alguien cargó en Hilo (el feed la trae
// como `expenses`, en pesos por mes; 0 o ausente = no cargada).

export function loteDeLaPropiedad(property: TokkoProperty): { precioUsd: number | null; expensasArs: number | null } {
  const venta = (property.operations ?? []).find((o) => o.operation_type === 'Sale')
  const precio = venta?.prices?.find((p) => p.currency === 'USD' && p.price > 0)?.price ?? null
  const expRaw = (property as { expenses?: unknown }).expenses
  const expensasArs = typeof expRaw === 'number' && expRaw > 0 ? expRaw : null
  return { precioUsd: property.web_price === false ? null : precio, expensasArs }
}

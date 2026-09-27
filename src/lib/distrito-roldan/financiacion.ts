// Financiación de los lotes de Distrito Roldán y el resumen de disponibilidad
// que muestra la landing. Módulo puro (sin red ni @vercel/blob) para que lo
// puedan usar tanto el servidor (consulta → Hilo) como el navegador (landing).
//
// Regla de David: nunca inventar números. Todo sale del plano vivo que publica
// el panel de agentes (GET /api/plano-lotes); los defaults de acá son solo el
// respaldo cuando el Blob no publicó una financiación.

export type TipoLote = 'residencial' | 'comercial'

export type FinanciacionTipo = { anticipoPct: number; cuotas: number; contadoTxt?: string }

/** Mismos valores que el CFG embebido en public/planos/distrito-roldan.html.
 *  Se usan solo si el Blob no publicó una financiación. */
export const FINANCIACION_DEFAULT: Record<TipoLote, FinanciacionTipo> = {
  residencial: { anticipoPct: 30, cuotas: 24, contadoTxt: 'US$ 5/m² de descuento' },
  comercial: { anticipoPct: 50, cuotas: 12, contadoTxt: '10% de descuento' },
}

/** Los lotes 1 a 21 son los comerciales (frente a Ruta 9); es la marca
 *  `esComercial` de la geometría del plano, que no se edita. */
export const ULTIMO_LOTE_COMERCIAL = 21

export const tipoDeLote = (nro: number): TipoLote => (nro <= ULTIMO_LOTE_COMERCIAL ? 'comercial' : 'residencial')

/** Misma cuenta que hace el plano (public/planos/distrito-roldan.html):
 *  entrega = precio × anticipo %, cuota = (precio − entrega) / cuotas, ambas
 *  redondeadas a entero. Sin precio no hay financiación que mostrar. */
export function calcularFinanciacion(precio: number | null, fin: FinanciacionTipo) {
  if (precio == null) return { entrega: null, cuota: null }
  const entregaExacta = (precio * fin.anticipoPct) / 100
  return {
    entrega: Math.round(entregaExacta),
    cuota: Math.round((precio - entregaExacta) / fin.cuotas),
  }
}

/** La financiación publicada si es válida; si no, la de respaldo. */
export function financiacionDe(publicada: Partial<FinanciacionTipo> | undefined, tipo: TipoLote): FinanciacionTipo {
  return publicada &&
    Number.isFinite(publicada.anticipoPct) &&
    Number.isFinite(publicada.cuotas) &&
    (publicada.cuotas as number) > 0
    ? (publicada as FinanciacionTipo)
    : FINANCIACION_DEFAULT[tipo]
}

type LoteCrudo = { estado?: string; precio?: number | null }

export type ResumenTipo = {
  total: number
  disponibles: number
  vendidos: number
  /** Precio de lista más bajo entre los disponibles con precio. */
  desde: number | null
  /** Cuota del lote más barato con la financiación de su tipo. */
  cuotaDesde: number | null
  fin: FinanciacionTipo
}

export type ResumenPlano = {
  residencial: ResumenTipo
  comercial: ResumenTipo
  total: number
  vendidos: number
  actualizado: string | null
}

/** Resume lo que devuelve GET /api/plano-lotes. null si no hay datos usables. */
export function resumirPlano(data: unknown): ResumenPlano | null {
  const d = data as {
    lotes?: Record<string, LoteCrudo> | null
    cfg?: { actualizado?: string; financiacion?: Partial<Record<TipoLote, Partial<FinanciacionTipo>>> }
  } | null
  if (!d?.lotes || typeof d.lotes !== 'object') return null

  const base = (tipo: TipoLote): ResumenTipo => ({
    total: 0,
    disponibles: 0,
    vendidos: 0,
    desde: null,
    cuotaDesde: null,
    fin: financiacionDe(d.cfg?.financiacion?.[tipo], tipo),
  })
  const r: Record<TipoLote, ResumenTipo> = { residencial: base('residencial'), comercial: base('comercial') }

  for (const [nro, l] of Object.entries(d.lotes)) {
    const n = Number(nro)
    if (!Number.isInteger(n) || n <= 0 || !l) continue
    const t = r[tipoDeLote(n)]
    t.total++
    if (l.estado === 'v') t.vendidos++
    if (l.estado !== 'd') continue
    t.disponibles++
    if (typeof l.precio === 'number' && l.precio > 0 && (t.desde == null || l.precio < t.desde)) t.desde = l.precio
  }
  for (const t of Object.values(r)) t.cuotaDesde = calcularFinanciacion(t.desde, t.fin).cuota

  const total = r.residencial.total + r.comercial.total
  if (!total) return null
  return {
    ...r,
    total,
    vendidos: r.residencial.vendidos + r.comercial.vendidos,
    actualizado: typeof d.cfg?.actualizado === 'string' ? d.cfg.actualizado : null,
  }
}

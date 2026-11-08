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

type LoteCrudo = { estado?: string; precio?: number | null; sup?: number | null }

/** El lote que se usa de ejemplo para "hacer la cuenta". */
export type LoteTipico = { precio: number; sup: number | null; entrega: number; cuota: number }

export type ResumenTipo = {
  total: number
  disponibles: number
  vendidos: number
  /** El lote más repetido entre los disponibles (mismo precio). Regla de David
   *  (22-oct-2026): NUNCA mostrar el "lote desde" ni la "cuota desde". Suele
   *  quedar uno solo barato: el cliente pide ese, ya no está, y el resto parece
   *  caro. El ejemplo es el lote que más hay. */
  tipico: LoteTipico | null
  fin: FinanciacionTipo
}

export type ResumenPlano = {
  residencial: ResumenTipo
  comercial: ResumenTipo
  total: number
  vendidos: number
  /** Número de cada lote vendido, para pintar el mosaico. */
  vendidosNros: number[]
  actualizado: string | null
}

/** El precio que más se repite entre los disponibles; si empatan, el más
 *  cercano a la mediana. Nunca el más barato por ser el más barato. */
export function loteTipico(lotes: { precio: number; sup: number | null }[], fin: FinanciacionTipo): LoteTipico | null {
  if (!lotes.length) return null
  const precios = lotes.map((l) => l.precio).sort((a, b) => a - b)
  const mediana = precios[Math.floor(precios.length / 2)]
  const porPrecio = new Map<number, (number | null)[]>()
  for (const l of lotes) porPrecio.set(l.precio, [...(porPrecio.get(l.precio) ?? []), l.sup])
  const [precio, sups] = Array.from(porPrecio).sort(
    ([pa, a], [pb, b]) => b.length - a.length || Math.abs(pa - mediana) - Math.abs(pb - mediana) || pb - pa,
  )[0]
  // La superficie más repetida dentro de ese precio.
  const cuenta = new Map<number, number>()
  for (const s of sups) if (typeof s === 'number' && s > 0) cuenta.set(s, (cuenta.get(s) ?? 0) + 1)
  const sup = Array.from(cuenta).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const { entrega, cuota } = calcularFinanciacion(precio, fin)
  return { precio, sup, entrega: entrega as number, cuota: cuota as number }
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
    tipico: null,
    fin: financiacionDe(d.cfg?.financiacion?.[tipo], tipo),
  })
  const r: Record<TipoLote, ResumenTipo> = { residencial: base('residencial'), comercial: base('comercial') }
  const conPrecio: Record<TipoLote, { precio: number; sup: number | null }[]> = { residencial: [], comercial: [] }
  const vendidosNros: number[] = []

  for (const [nro, l] of Object.entries(d.lotes)) {
    const n = Number(nro)
    if (!Number.isInteger(n) || n <= 0 || !l) continue
    const tipo = tipoDeLote(n)
    const t = r[tipo]
    t.total++
    if (l.estado === 'v') {
      t.vendidos++
      vendidosNros.push(n)
    }
    if (l.estado !== 'd') continue
    t.disponibles++
    if (typeof l.precio === 'number' && l.precio > 0) {
      conPrecio[tipo].push({ precio: l.precio, sup: typeof l.sup === 'number' ? l.sup : null })
    }
  }
  for (const tipo of ['residencial', 'comercial'] as const) r[tipo].tipico = loteTipico(conPrecio[tipo], r[tipo].fin)

  const total = r.residencial.total + r.comercial.total
  if (!total) return null
  return {
    ...r,
    total,
    vendidos: r.residencial.vendidos + r.comercial.vendidos,
    vendidosNros: vendidosNros.sort((a, b) => a - b),
    actualizado: typeof d.cfg?.actualizado === 'string' ? d.cfg.actualizado : null,
  }
}

/** Cuándo termina la obra del barrio (dato de David, 11-oct-2026: "entrega
 *  agosto 2027"). Es la obra del barrio —calles, servicios—, no las casas: para
 *  construir hay que terminar de pagar el lote. */
export const FIN_DE_OBRA = { anio: 2027, mes: 8, texto: 'agosto 2027' }

/** En qué cuota cae el fin de obra para quien firma en el mes de `hoy`: la
 *  primera cuota se paga el mes siguiente (David, 11-oct-2026: firma en
 *  octubre, primera cuota en noviembre). null si ya pasó o cae después de la
 *  última cuota. */
export function cuotaDelFinDeObra(hoy: Date, cuotas: number): number | null {
  const n = FIN_DE_OBRA.anio * 12 + (FIN_DE_OBRA.mes - 1) - (hoy.getFullYear() * 12 + hoy.getMonth())
  return n >= 1 && n <= cuotas ? n : null
}

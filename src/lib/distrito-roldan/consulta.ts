// Contrato web → Hilo del pedido "Consultar por este lote" del plano de
// Distrito Roldán (06-sep-2026). El objeto `lote` viaja tal cual dentro del
// POST a meethilo.com/api/public/leads con origen 'lote_web'; Hilo lo valida
// y responde 400 si está mal formado. Si se toca acá, se toca en Hilo.
//
// Helpers puros (sin red): validación de lo que manda el navegador, cálculo
// de la financiación y el brief que lee el agente en el inbox.

import { FINANCIACION_DEFAULT, type EstadoLote, type FinanciacionTipo, type PlanoPublicado } from './plano-publicado'

export type UtmLote = {
  source: string | null
  medium: string | null
  campaign: string | null
  content: string | null
}

export type TipoLote = 'residencial' | 'comercial'

/** Objeto `lote` del contrato. Los importes van en USD enteros. */
export type LoteLead = {
  emprendimiento: 'Distrito Roldan'
  developmentId: 67178
  nro: number
  sup: number
  frente: number
  fondo: number
  tipo: TipoLote
  precio: number | null
  contado: number | null
  moneda: 'USD'
  entregaPct: number
  entrega: number | null
  cuotas: number
  cuota: number | null
  estado: EstadoLote
  utm: UtmLote | null
  paginaUrl: string
}

/** Lo que manda el navegador. Solo se confía en nro/tipo y en los datos de
 *  contexto (utm, página); los números se pisan con el plano publicado cuando
 *  está disponible. */
export type LoteCliente = {
  nro: number
  tipo: TipoLote
  frente: number | null
  fondo: number | null
  sup: number | null
  precio: number | null
  contado: number | null
  estado: EstadoLote
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const num = (v: unknown): number | null => {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}
const numEn = (v: unknown, min: number, max: number): number | null => {
  const n = num(v)
  return n != null && n >= min && n <= max ? n : null
}

export function leerLoteCliente(raw: unknown): LoteCliente | null {
  if (!raw || typeof raw !== 'object') return null
  const l = raw as Record<string, unknown>
  const nro = numEn(l.nro, 1, 400)
  if (nro == null || !Number.isInteger(nro)) return null
  const tipo = str(l.tipo, 12).toLowerCase()
  if (tipo !== 'residencial' && tipo !== 'comercial') return null
  const estado = str(l.estado, 1)
  return {
    nro,
    tipo,
    frente: numEn(l.frente, 1, 500),
    fondo: numEn(l.fondo, 1, 500),
    sup: numEn(l.sup, 1, 100000),
    precio: numEn(l.precio, 1, 1e8),
    contado: numEn(l.contado, 1, 1e8),
    estado: estado === 'n' || estado === 'v' ? estado : 'd',
  }
}

export function leerUtm(raw: unknown): UtmLote | null {
  if (!raw || typeof raw !== 'object') return null
  const u = raw as Record<string, unknown>
  const utm: UtmLote = {
    source: str(u.source, 100) || null,
    medium: str(u.medium, 100) || null,
    campaign: str(u.campaign, 150) || null,
    content: str(u.content, 150) || null,
  }
  return utm.source || utm.medium || utm.campaign || utm.content ? utm : null
}

export function leerPaginaUrl(raw: unknown): string {
  const s = str(raw, 500)
  return /^https?:\/\//.test(s) ? s : 'https://siinmobiliaria.com/distrito-roldan-precios'
}

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

/** Arma el objeto del contrato. Si el plano publicado tiene el lote, sus
 *  números mandan (precio, contado, medidas, estado y financiación por tipo);
 *  si no, quedan los del cliente ya acotados. */
export function armarLoteLead(
  cli: LoteCliente,
  plano: PlanoPublicado | null,
  utm: UtmLote | null,
  paginaUrl: string,
): LoteLead {
  const pub = plano?.lotes?.[String(cli.nro)] ?? null
  const finPub = plano?.cfg?.financiacion?.[cli.tipo]
  const fin: FinanciacionTipo =
    finPub && Number.isFinite(finPub.anticipoPct) && Number.isFinite(finPub.cuotas) && finPub.cuotas > 0
      ? finPub
      : FINANCIACION_DEFAULT[cli.tipo]

  const estado: EstadoLote = pub?.estado ?? cli.estado
  // Un lote que no está a la venta no lleva precio, esté o no en el plano.
  const precio = estado === 'd' ? (pub ? pub.precio ?? null : cli.precio) : null
  const contado = estado === 'd' ? (pub ? pub.contado ?? null : cli.contado) : null
  const { entrega, cuota } = calcularFinanciacion(precio, fin)

  return {
    emprendimiento: 'Distrito Roldan',
    developmentId: 67178,
    nro: cli.nro,
    sup: pub?.sup ?? cli.sup ?? 0,
    frente: pub?.frente ?? cli.frente ?? 0,
    fondo: pub?.fondo ?? cli.fondo ?? 0,
    tipo: cli.tipo,
    precio,
    contado,
    moneda: 'USD',
    entregaPct: fin.anticipoPct,
    entrega,
    cuotas: fin.cuotas,
    cuota,
    estado,
    utm,
    paginaUrl,
  }
}

const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const m2 = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} m²`

/** Resumen corto para el inbox de Hilo (lo lee el agente de un vistazo). */
export function armarBriefLote(l: LoteLead): string {
  const Tipo = l.tipo === 'comercial' ? 'Comercial' : 'Residencial'
  const partes = [`Lote ${l.nro} Distrito Roldán · ${Tipo} · ${m2(l.sup)} (${l.frente} × ${l.fondo} m)`]
  if (l.precio != null) {
    partes.push(`USD ${miles(l.precio)}`)
    if (l.cuota != null && l.entrega != null) {
      partes.push(`entrega ${l.entregaPct} % USD ${miles(l.entrega)} + ${l.cuotas} cuotas de USD ${miles(l.cuota)}`)
    }
    if (l.contado != null) partes.push(`contado USD ${miles(l.contado)}`)
  } else {
    partes.push(l.estado === 'd' ? 'sin precio publicado' : l.estado === 'v' ? 'figura vendido' : 'figura no disponible')
  }
  if (l.utm?.source) partes.push(`origen ${l.utm.source}${l.utm.campaign ? ` / ${l.utm.campaign}` : ''}`)
  return partes.join(' · ')
}

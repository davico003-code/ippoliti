// "La cuenta del lote": lo que Hilo manda por barrio en
// /api/public/en-red/cuenta-lote (lo arma src/lib/cuenta-lote/calcular.ts allá).
// Son medianas del mercado y los montos de la tabla de expensas de SI: nunca
// un aviso ni un anunciante.

export type Dolar = { valor: number; fuente: string; fecha: string }

export type Tenencia = {
  /** Expensas en dólares por mes. */
  mensualUsd: number
  /** Un año de expensas como % del precio del lote. */
  anualPct: number
  cincoAniosUsd: number
  cincoAniosPct: number
}

export type Tierra = {
  usdM2Inicio: number
  usdM2Hoy: number
  variacionPct: number
  desde: string
  hasta: string
  /** La serie es la del barrio o, si el barrio no junta dos semanas, la de Funes entera. */
  nivel: 'barrio' | 'ciudad'
}

export type Construir = {
  nLotes: number
  nCasas: number
  loteUsd: number
  casaM2: number
  casaHechaUsd: number
  loteMasObraUsd: number
  /** Negativo = construir sale más barato que comprar hecho. */
  diferenciaPct: number
}

export type CuentaBarrio = {
  slug: string
  nombre: string
  ciudad: 'Funes'
  expensas: { loteArs: number | null; casaArs: number | null; origen: 'tabla' | 'propias' | null; actualizado: string | null }
  lote: { n: number; tipicoUsd: number | null; m2Tipico: number | null }
  tenencia: Tenencia | null
  tierra: Tierra | null
  construir: Construir | null
}

export type CuentaLotes = {
  dolar: Dolar | null
  costoObraUsdM2: number
  aniosTenencia: number
  calculadoAt: string
  barrios: CuentaBarrio[]
}

/** Lo que reciben la ficha y la página del barrio: la cuenta de ESE barrio más lo común a todos. */
export type CuentaDeBarrio = { barrio: CuentaBarrio; dolar: Dolar | null; costoObraUsdM2: number; aniosTenencia: number }

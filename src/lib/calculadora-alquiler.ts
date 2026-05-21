// Lógica fiscal de alquiler permanente — fuente única para CalculadoraCostos
// (página completa /recursos/calculadora-alquiler) y CostosIngresoMini
// (card en la ficha de propiedad). Cualquier cambio acá impacta ambas.

export const IVA = 0.21
export const HONORARIOS_PCT = 0.05
export const ADMIN_PCT = 0.03
export const VERIFICACION_ARS = 60_000

export type Moneda = 'ARS' | 'USD'
export type TipoFiscal = 'vivienda' | 'comercio'

export const SELLADO_PCT: Record<TipoFiscal, number> = {
  vivienda: 0,
  comercio: 0.012,
}

// Mapeo nombre Tokko (inglés o español) → tipo fiscal.
// Match case-insensitive sobre property.type.name. Si nada coincide,
// detectarTipoFiscal() devuelve 'vivienda' como default conservador
// (sellado 0, sin sumar costo extra).
export const TIPO_FISCAL_POR_PROPIEDAD: Record<string, TipoFiscal> = {
  // Vivienda
  house: 'vivienda',
  apartment: 'vivienda',
  ph: 'vivienda',
  'country house': 'vivienda',
  condo: 'vivienda',
  casa: 'vivienda',
  departamento: 'vivienda',
  'casa de campo': 'vivienda',
  condominio: 'vivienda',
  quinta: 'vivienda',
  'cabaña': 'vivienda',
  cabana: 'vivienda',
  'dúplex': 'vivienda',
  duplex: 'vivienda',
  // Comercio (incluye terrenos: el sellado de un alquiler de lote sigue siendo 1,2%)
  store: 'comercio',
  'bussiness premises': 'comercio',
  office: 'comercio',
  garage: 'comercio',
  warehouse: 'comercio',
  land: 'comercio',
  'local comercial': 'comercio',
  oficina: 'comercio',
  cochera: 'comercio',
  'galpón': 'comercio',
  galpon: 'comercio',
  terreno: 'comercio',
  'depósito': 'comercio',
  deposito: 'comercio',
  'fondo de comercio': 'comercio',
}

export function detectarTipoFiscal(tipoPropiedadTokko: string | undefined | null): TipoFiscal {
  if (!tipoPropiedadTokko) return 'vivienda'
  const key = tipoPropiedadTokko.trim().toLowerCase()
  return TIPO_FISCAL_POR_PROPIEDAD[key] ?? 'vivienda'
}

export function getMesesDefault(tipoFiscal: TipoFiscal): 24 | 36 {
  return tipoFiscal === 'comercio' ? 36 : 24
}

// Redondeo del depósito en garantía. Regla "umbral 15": cualquier exceso de
// USD 15 o más sobre el múltiplo de 50 redondea hacia arriba; menos, queda
// abajo. Piso mínimo USD 50. Aplicada en calculadora completa, ficha de
// propiedad (CostosIngresoMini) y planilla descargable.
export function redondearDeposito(montoUSD: number): number {
  if (!Number.isFinite(montoUSD) || montoUSD <= 50) return 50
  const piso = Math.floor(montoUSD / 50) * 50
  const exceso = montoUSD - piso
  return exceso >= 15 ? piso + 50 : piso
}

// Alternativa "más cercano" (Math.round) — descartada el 21-may-2026 a favor
// de la regla "umbral 15" que coincide con los ejemplos pactados con David.
// export function redondearDepositoMasCercano(montoUSD: number): number {
//   if (!Number.isFinite(montoUSD) || montoUSD <= 50) return 50
//   return Math.round(montoUSD / 50) * 50
// }

export interface CalcularInput {
  alquiler: number
  meses: number
  moneda: Moneda
  tipo: TipoFiscal
  cotizacion: number
}

export interface CalcularOutput {
  primerMes: number
  honoCuota: number
  honoTotal: number
  sellado: number          // siempre en pesos
  verificacion: number     // siempre en pesos (60_000)
  admin: number            // misma moneda del contrato
  totalSubMonedaContrato: number  // monto en la moneda del contrato (USD si USD, ARS si ARS)
  totalSubARS: number      // monto adicional en pesos (sellado + verificación cuando contrato USD; 0 cuando contrato ARS)
  depositoUSD: number      // siempre USD, redondeado vía redondearDeposito() (umbral 15, piso 50)
  depositoEquivARS: number // depositoUSD × cotizacion (para mostrar referencia)
}

export function calcularCostosIngreso({
  alquiler,
  meses,
  moneda,
  tipo,
  cotizacion,
}: CalcularInput): CalcularOutput {
  const honoBase = alquiler * meses * HONORARIOS_PCT
  const honoTotal = honoBase * (1 + IVA)
  const honoCuota = honoTotal / 3
  const admin = alquiler * ADMIN_PCT * (1 + IVA)

  // Sellado se calcula sobre el total del contrato convertido a pesos
  const totalContrato = alquiler * meses
  const totalContratoArs = moneda === 'USD' ? totalContrato * cotizacion : totalContrato
  const sellado = totalContratoArs * SELLADO_PCT[tipo]
  const verificacion = VERIFICACION_ARS

  // Total al ingresar — separado por moneda
  // USD: alquiler + honoCuota + admin (USD)  ·  sellado + verificacion (ARS extra)
  // ARS: alquiler + honoCuota + sellado + verificacion + admin (todo ARS)
  const totalSubMonedaContrato =
    moneda === 'USD'
      ? alquiler + honoCuota + admin
      : alquiler + honoCuota + sellado + verificacion + admin
  const totalSubARS = moneda === 'USD' ? sellado + verificacion : 0

  // Depósito en USD: regla umbral 15 con piso 50. Se aplica tanto a
  // contratos ARS (convertidos por cotización) como USD (alquiler directo).
  const depositoCrudoUSD = moneda === 'USD' ? alquiler : alquiler / cotizacion
  const depositoUSD = redondearDeposito(depositoCrudoUSD)
  const depositoEquivARS = depositoUSD * cotizacion

  return {
    primerMes: alquiler,
    honoCuota,
    honoTotal,
    sellado,
    verificacion,
    admin,
    totalSubMonedaContrato,
    totalSubARS,
    depositoUSD,
    depositoEquivARS,
  }
}

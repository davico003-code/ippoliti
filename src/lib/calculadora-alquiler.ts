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

export interface CalcularInput {
  alquiler: number
  meses: number
  moneda: Moneda
  tipo: TipoFiscal
  cotizacion: number
  // Excepción puntual: propiedades sin gasto administrativo mensual.
  // Cuando es true, admin = 0 y queda fuera del total y del cronograma.
  sinAdmin?: boolean
  // Cuántas cuotas para los honorarios (default 3, comportamiento histórico).
  // 1 = pago único: honoCuota pasa a ser el total y se abona todo al ingreso.
  honorariosCuotas?: 1 | 3
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
}

export function calcularCostosIngreso({
  alquiler,
  meses,
  moneda,
  tipo,
  cotizacion,
  sinAdmin = false,
  honorariosCuotas = 3,
}: CalcularInput): CalcularOutput {
  const honoBase = alquiler * meses * HONORARIOS_PCT
  const honoTotal = honoBase * (1 + IVA)
  const honoCuota = honoTotal / honorariosCuotas
  const admin = sinAdmin ? 0 : alquiler * ADMIN_PCT * (1 + IVA)

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

  return {
    primerMes: alquiler,
    honoCuota,
    honoTotal,
    sellado,
    verificacion,
    admin,
    totalSubMonedaContrato,
    totalSubARS,
  }
}

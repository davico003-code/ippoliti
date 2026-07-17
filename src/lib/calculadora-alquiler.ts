// Lógica fiscal de alquiler permanente — fuente única para CalculadoraCostos
// (página completa /recursos/calculadora-alquiler) y CostosIngresoMini
// (card en la ficha de propiedad). Cualquier cambio acá impacta ambas.

export const IVA = 0.21
export const HONORARIOS_PCT = 0.05
export const ADMIN_PCT = 0.03
export const VERIFICACION_ARS = 60_000

export type Moneda = 'ARS' | 'USD'
export type TipoFiscal = 'vivienda' | 'comercio'
export type FormaPagoHonorarios = '3cuotas' | '1pago'

export const SELLADO_PCT: Record<TipoFiscal, number> = {
  vivienda: 0,
  comercio: 0.0025,
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
  // Comercio (incluye terrenos: el sellado de un alquiler de lote sigue siendo 0,25%)
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
  // Si false, admin = 0 y queda fuera del total y del cronograma (la
  // inmobiliaria solo confecciona el contrato, no administra el alquiler).
  incluirAdmin?: boolean
  // Forma de pago de los honorarios:
  //  - '3cuotas' (default): 1ª cuota al ingresar, 2ª y 3ª en los meses 2 y 3.
  //  - '1pago': honorarios completos (con IVA) al ingresar.
  formaPagoHonorarios?: FormaPagoHonorarios
}

export interface CalcularOutput {
  primerMes: number
  honoTotal: number        // total honorarios CON IVA
  honoCuota: number        // honoTotal / 3 (1ª de 3 cuotas)
  honoEnMes1: number       // lo que entra al ingreso: cuota (3cuotas) o total (1pago)
  honoEnMes23: number      // lo que se paga en los meses 2 y 3: cuota (3cuotas) o 0 (1pago)
  honoMes1Label: string    // sufijo del label en el desglose: '(1ª de 3 cuotas)' | 'totales + IVA'
  mostrarMeses23: boolean  // true en 3cuotas (hay meses 2 y 3 con cuota); false en 1pago
  sellado: number          // siempre en pesos
  verificacion: number     // siempre en pesos (60_000)
  admin: number            // misma moneda del contrato (0 si no se incluye)
  mostrarAdmin: boolean    // incluirAdmin — controla si la fila admin se muestra
  totalSubMonedaContrato: number  // monto en la moneda del contrato (USD si USD, ARS si ARS)
  totalSubARS: number      // monto adicional en pesos (sellado + verificación cuando contrato USD; 0 cuando contrato ARS)
}

export function calcularCostosIngreso({
  alquiler,
  meses,
  moneda,
  tipo,
  cotizacion,
  incluirAdmin = true,
  formaPagoHonorarios = '3cuotas',
}: CalcularInput): CalcularOutput {
  // Honorarios SIEMPRE con IVA en el monto final (no se descompone en pantalla).
  const honoTotal = alquiler * meses * HONORARIOS_PCT * (1 + IVA)
  const honoCuota = honoTotal / 3
  const admin = incluirAdmin ? alquiler * ADMIN_PCT * (1 + IVA) : 0

  // Sellado se calcula sobre el total del contrato convertido a pesos.
  const totalContrato = alquiler * meses
  const totalContratoArs = moneda === 'USD' ? totalContrato * cotizacion : totalContrato
  const sellado = totalContratoArs * SELLADO_PCT[tipo]
  const verificacion = VERIFICACION_ARS

  const es3 = formaPagoHonorarios === '3cuotas'
  const honoEnMes1 = es3 ? honoCuota : honoTotal
  const honoEnMes23 = es3 ? honoCuota : 0
  const honoMes1Label = es3 ? '(1ª de 3 cuotas)' : 'totales + IVA'

  // Total al ingresar — separado por moneda
  // USD: alquiler + honoEnMes1 + admin (USD)  ·  sellado + verificacion (ARS extra)
  // ARS: alquiler + honoEnMes1 + sellado + verificacion + admin (todo ARS)
  const totalSubMonedaContrato =
    moneda === 'USD'
      ? alquiler + honoEnMes1 + admin
      : alquiler + honoEnMes1 + sellado + verificacion + admin
  const totalSubARS = moneda === 'USD' ? sellado + verificacion : 0

  return {
    primerMes: alquiler,
    honoTotal,
    honoCuota,
    honoEnMes1,
    honoEnMes23,
    honoMes1Label,
    mostrarMeses23: es3,
    sellado,
    verificacion,
    admin,
    mostrarAdmin: incluirAdmin,
    totalSubMonedaContrato,
    totalSubARS,
  }
}

// Fuente única de los valores del Índice de Costos de Construcción
// (/recursos/costos-de-construccion). Los valores por m² se definen como BASE
// con mes base Agosto 2026 y se ajustan automáticamente un 2% MENSUAL
// acumulativo (regla comercial de David, 17-ago-2026 — reemplaza al ajuste por
// IPC/INDEC que corría antes; el primer ajuste corre solo en Septiembre 2026).
// Los CASOS REALES no se ajustan: quedan estáticos como el HTML aprobado.

export const MES_BASE = '2026-08'

// Ajuste mensual fijo (2% acumulativo). Decisión de David 17-ago-2026.
export const TASA_MENSUAL = 0.02

export interface FilaResidencialBase {
  calidad: string
  slug: string
  superficie: string
  desc: string
  cuentaPropiaBase: number
  llaveBase: number
}

export interface FilaComercialBase {
  tipologia: string
  desc: string
  cuentaPropiaBase: number
  llaveBase: number
}

// Nombres "Línea ..." por pedido de David (jun-2026); las descripciones son
// textuales del HTML de referencia aprobado. Valores base Agosto 2026 =
// base Junio 2026 + 5% (pedido de David, 17-ago-2026).
export const MATRIZ_RESIDENCIAL_BASE: FilaResidencialBase[] = [
  {
    calidad: 'Línea Estándar',
    slug: 'linea-estandar',
    superficie: '50 a 120 m²',
    desc: 'Fundaciones zapata corrida, mampostería ladrillo hueco 18, revoque exterior proyectado, techo chapa con aislación poliuretano, pisos cerámicos 1ra, aberturas de aluminio línea Herrero/Módena básica, sanitarios línea Andina.',
    cuentaPropiaBase: 725,
    llaveBase: 819,
  },
  {
    calidad: 'Línea Media',
    slug: 'linea-media',
    superficie: '100 a 250 m²',
    desc: 'Platea de fundación, estructura tradicional con cámara de aire/EPS, techo losa de viguetas, porcelanato 60x60 comercial, aberturas aluminio Módena con DVH, sanitarios línea Mónaco, muebles MDF 18mm.',
    cuentaPropiaBase: 1050,
    llaveBase: 1188,
  },
  {
    calidad: 'Línea Alta',
    slug: 'linea-alta',
    superficie: '200 a 400 m²',
    desc: 'Estructura HºAº independiente, mampostería Retak o doble muro, losa radiante (caldera dual), porcelanato símil madera o gran formato (90x90), aberturas A30 New DVH, sanitarios alta gama (Gap/Marina).',
    cuentaPropiaBase: 1304,
    llaveBase: 1474,
  },
  {
    calidad: 'Premium Country',
    slug: 'premium-country',
    superficie: '+300 m²',
    desc: 'Estructura H°A° visto, climatización central VRV/VRF, aberturas PVC foliado (Rehau/Schüco) con vidrios seguridad DVH, mármol o porcelanato importado +120x120, domótica integral, piscina revestida borde infinito.',
    cuentaPropiaBase: 1811,
    llaveBase: 2048,
  },
]

export const MATRIZ_COMERCIAL_BASE: FilaComercialBase[] = [
  {
    tipologia: 'Galpón Tinglado',
    desc: 'Bases aisladas H°A°, pórticos de alma llena, cubierta chapa U-45 cincalum, aislación térmica lana de vidrio 80mm con foil, piso H°A° llaneado apto tránsito pesado, portón industrial 5x5m.',
    cuentaPropiaBase: 457,
    llaveBase: 516,
  },
  {
    tipologia: 'Local Vidriado',
    desc: 'Estructura metálica pesada o H°A°, frente integral con piel de vidrio templado 10mm o DVH estructural, pisos de alto tránsito (porcelanato técnico), cielorraso desmontable, cortina motorizada.',
    cuentaPropiaBase: 798,
    llaveBase: 903,
  },
]

export interface AjusteMensual {
  factor: number
  // 'YYYY-MM' del mes al que quedaron ajustados los valores (el mes corriente;
  // MES_BASE si todavía estamos en el mes base).
  mes: string
}

// Factor acumulado desde MES_BASE hasta el mes corriente: (1+TASA)^meses.
// Sin dependencias externas (antes leía el IPC de Redis): no puede fallar y
// las páginas con `revalidate` lo recalculan solas al cruzar el mes.
// Se mantiene async para no tocar la firma que esperan los consumidores.
export async function getAjusteMensual(hoy: Date = new Date()): Promise<AjusteMensual> {
  const [anioBase, mesBase] = MES_BASE.split('-').map(Number)
  const meses = (hoy.getFullYear() - anioBase) * 12 + (hoy.getMonth() + 1 - mesBase)
  if (meses <= 0) return { factor: 1, mes: MES_BASE }

  const factor = Math.pow(1 + TASA_MENSUAL, meses)
  const totalMeses = mesBase - 1 + meses
  const anio = anioBase + Math.floor(totalMeses / 12)
  const mes = (totalMeses % 12) + 1
  return { factor, mes: `${anio}-${String(mes).padStart(2, '0')}` }
}

export const getCalidadBySlug = (slug: string) =>
  MATRIZ_RESIDENCIAL_BASE.find((f) => f.slug === slug)

export const ajustar = (base: number, factor: number) => Math.round(base * factor)

export const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// '2026-08' → 'Agosto 2026'
export function formatMesAnio(yyyyMm: string): string {
  const [anio, mes] = yyyyMm.split('-')
  return `${MESES[Number(mes) - 1] ?? ''} ${anio}`.trim()
}

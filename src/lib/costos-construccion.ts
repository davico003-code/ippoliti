import { redis } from '@/lib/redis'

// Fuente única de los valores del Índice de Costos de Construcción
// (/recursos/costos-de-construccion). Los valores por m² se definen como BASE
// con mes base Junio 2026 y se ajustan automáticamente por la variación
// acumulada del IPC (INDEC, niveles de índice en Redis indices:IPC — la misma
// integración que alimenta /api/indices vía el cron mensual del día 22).
// Los CASOS REALES no se ajustan: quedan estáticos como el HTML aprobado.

export const MES_BASE = '2026-06'

export interface FilaResidencialBase {
  calidad: string
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
// textuales del HTML de referencia aprobado.
export const MATRIZ_RESIDENCIAL_BASE: FilaResidencialBase[] = [
  {
    calidad: 'Línea Estándar',
    superficie: '50 a 120 m²',
    desc: 'Fundaciones zapata corrida, mampostería ladrillo hueco 18, revoque exterior proyectado, techo chapa con aislación poliuretano, pisos cerámicos 1ra, aberturas de aluminio línea Herrero/Módena básica, sanitarios línea Andina.',
    cuentaPropiaBase: 690,
    llaveBase: 780,
  },
  {
    calidad: 'Línea Media',
    superficie: '100 a 250 m²',
    desc: 'Platea de fundación, estructura tradicional con cámara de aire/EPS, techo losa de viguetas, porcelanato 60x60 comercial, aberturas aluminio Módena con DVH, sanitarios línea Mónaco, muebles MDF 18mm.',
    cuentaPropiaBase: 1000,
    llaveBase: 1131,
  },
  {
    calidad: 'Línea Alta',
    superficie: '200 a 400 m²',
    desc: 'Estructura HºAº independiente, mampostería Retak o doble muro, losa radiante (caldera dual), porcelanato símil madera o gran formato (90x90), aberturas A30 New DVH, sanitarios alta gama (Gap/Marina).',
    cuentaPropiaBase: 1242,
    llaveBase: 1404,
  },
  {
    calidad: 'Premium Country',
    superficie: '+300 m²',
    desc: 'Estructura H°A° visto, climatización central VRV/VRF, aberturas PVC foliado (Rehau/Schüco) con vidrios seguridad DVH, mármol o porcelanato importado +120x120, domótica integral, piscina revestida borde infinito.',
    cuentaPropiaBase: 1725,
    llaveBase: 1950,
  },
]

export const MATRIZ_COMERCIAL_BASE: FilaComercialBase[] = [
  {
    tipologia: 'Galpón Tinglado',
    desc: 'Bases aisladas H°A°, pórticos de alma llena, cubierta chapa U-45 cincalum, aislación térmica lana de vidrio 80mm con foil, piso H°A° llaneado apto tránsito pesado, portón industrial 5x5m.',
    cuentaPropiaBase: 414,
    llaveBase: 468,
  },
  {
    tipologia: 'Local Vidriado',
    desc: 'Estructura metálica pesada o H°A°, frente integral con piel de vidrio templado 10mm o DVH estructural, pisos de alto tránsito (porcelanato técnico), cielorraso desmontable, cortina motorizada.',
    cuentaPropiaBase: 724,
    llaveBase: 819,
  },
]

export interface AjusteIPC {
  factor: number
  // 'YYYY-MM' del último dato de IPC aplicado; MES_BASE si todavía no hay
  // dato posterior al mes base (o si Redis/INDEC fallan).
  mes: string
}

interface PuntoIndice {
  date: string
  value: number
}

// Variación acumulada del IPC desde MES_BASE hasta el último dato disponible.
// indices:IPC guarda NIVELES del índice (no variaciones), así que el factor
// es un cociente directo. Cualquier falla → factor 1 con mes base: la página
// nunca se rompe por el índice.
export async function getAjusteIPC(): Promise<AjusteIPC> {
  try {
    const raw = await redis.get('indices:IPC')
    const serie = (typeof raw === 'string' ? JSON.parse(raw) : raw) as PuntoIndice[] | null
    if (!serie || serie.length === 0) return { factor: 1, mes: MES_BASE }

    const base = serie.find((p) => p.date.slice(0, 7) === MES_BASE)
    const ultimo = serie[serie.length - 1]
    if (!base?.value || !ultimo?.value) return { factor: 1, mes: MES_BASE }
    if (ultimo.date.slice(0, 7) <= MES_BASE) return { factor: 1, mes: MES_BASE }

    return { factor: ultimo.value / base.value, mes: ultimo.date.slice(0, 7) }
  } catch {
    return { factor: 1, mes: MES_BASE }
  }
}

export const ajustar = (base: number, factor: number) => Math.round(base * factor)

export const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// '2026-06' → 'Junio 2026'
export function formatMesAnio(yyyyMm: string): string {
  const [anio, mes] = yyyyMm.split('-')
  return `${MESES[Number(mes) - 1] ?? ''} ${anio}`.trim()
}

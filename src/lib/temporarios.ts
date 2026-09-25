// Alquileres temporarios (David, 24-sep-2026): la propiedad muestra el valor por
// QUINCENA y/o por MES y sus condiciones bien claras.
//
// Los datos se cargan en HILO como operación "Alquiler temporario" y, en la
// DESCRIPCIÓN, un renglón por dato con la forma "Etiqueta: valor":
//
//   Quincena: $ 900.000
//   Mes: $ 1.500.000
//   Depósito: $ 300.000
//   Seña para reservar: 30%
//   Forma de pago: efectivo o transferencia
//   Estadía mínima: 1 quincena
//   Entrada: 14 h
//   Salida: 10 h
//   Disponible: enero y febrero
//   Incluye: luz, gas, wifi, ropa blanca, limpieza de salida
//   Capacidad: 6 personas
//   Comodidades: pileta, parrilla, aire acondicionado, wifi
//   Alquilado: dic 2da, enero completo
//
// "Alquilado:" va sumando las quincenas que se alquilan (dic/ene/feb, 1ra/2da,
// o el mes entero): el cuadro de disponibilidad de la temporada se completa solo.
//
// Esos renglones salen de la descripción y se muestran ordenados; el resto del
// texto queda como descripción. Módulo puro (sin imports) para testearlo con
// node --test.

export type PrecioTemporario = { periodo: 'quincena' | 'mes'; texto: string }

/** Meses de la temporada que muestra el cuadro de disponibilidad. */
export const MESES_TEMPORADA = [
  { clave: 'dic', nombre: 'Dic' },
  { clave: 'ene', nombre: 'Ene' },
  { clave: 'feb', nombre: 'Feb' },
] as const
export type MesTemporada = (typeof MESES_TEMPORADA)[number]['clave']
/** "dic-1" = 1ra quincena de diciembre, "dic-2" = 2da. */
export type QuincenaClave = `${MesTemporada}-${1 | 2}`

export type CondicionesTemporario = {
  precios: PrecioTemporario[]
  deposito: string | null
  sena: string | null
  formaPago: string | null
  estadiaMinima: string | null
  entrada: string | null
  salida: string | null
  disponible: string | null
  incluye: string[]
  /** Para cuántas personas ("6"), del renglón "Capacidad:" / "Personas:". */
  personas: string | null
  /** Comodidades de la casa del renglón "Comodidades:" (se suman a las cargadas). */
  comodidades: string[]
  /** Quincenas ya alquiladas de la temporada (renglón "Alquilado:"). */
  alquiladas: QuincenaClave[]
  /** La descripción sin los renglones de condiciones. */
  descripcion: string
}

type Campo =
  | Exclude<keyof CondicionesTemporario, 'precios' | 'incluye' | 'descripcion' | 'alquiladas' | 'personas' | 'comodidades'>
  | 'personas'
  | 'comodidades'
  | 'quincena'
  | 'mes'
  | 'incluye'
  | 'alquiladas'

// Orden importa: "seña para reservar" antes que cualquier cosa que diga "pago".
const ETIQUETAS: { campo: Campo; re: RegExp }[] = [
  { campo: 'quincena', re: /^(valor|precio)?\s*(por\s+)?(la\s+)?quincena$/ },
  { campo: 'mes', re: /^(valor|precio)?\s*(por\s+)?(el\s+)?(mes|mensual)$/ },
  { campo: 'deposito', re: /^deposito( en garantia)?$|^garantia$/ },
  { campo: 'sena', re: /^(sena|reserva)( para reservar| de reserva)?$/ },
  { campo: 'formaPago', re: /^(forma|formas|medio|medios) de pago$|^pago$/ },
  { campo: 'estadiaMinima', re: /^(estadia|estadia minima|minimo|minimo de estadia|estadia min\.?)$/ },
  { campo: 'entrada', re: /^(entrada|check[\s-]?in|ingreso|horario de (entrada|ingreso))$/ },
  { campo: 'salida', re: /^(salida|check[\s-]?out|egreso|horario de (salida|egreso))$/ },
  { campo: 'disponible', re: /^(disponible|disponibilidad|fechas( disponibles)?|temporada)$/ },
  { campo: 'incluye', re: /^(incluye|servicios incluidos|que incluye)$/ },
  { campo: 'personas', re: /^(capacidad|personas|huespedes|cantidad de personas|capacidad maxima)$/ },
  { campo: 'comodidades', re: /^(comodidades|la casa tiene|cuenta con|equipamiento)$/ },
  { campo: 'alquiladas', re: /^(alquilad[oa]s?|ocupad[oa]s?|reservad[oa]s?|no disponible)$/ },
]

const MES_RE: [MesTemporada, RegExp][] = [
  ['dic', /^dic(iembre)?\.?$/],
  ['ene', /^ene(ro)?\.?$/],
  ['feb', /^feb(rero)?\.?$/],
]

/**
 * "dic 2da, enero completo, feb 1ra quincena" → ['dic-2','ene-1','ene-2','feb-1'].
 * Un mes sin quincena (o "completo"/"entero") cuenta las dos.
 */
export function leerAlquiladas(valor: string): QuincenaClave[] {
  const out = new Set<QuincenaClave>()
  for (const tramo of normalizar(valor).split(/\s*(?:,|;|\/|\sy\s)\s*/)) {
    const palabras = tramo.split(/[\s-]+/).filter(Boolean)
    const mes = palabras.map((w) => MES_RE.find(([, re]) => re.test(w))?.[0]).find(Boolean)
    if (!mes) continue
    const resto = palabras.join(' ')
    const primera = /\b(1|1ra|1ra\.|1era|1°|1º|primera)\b/.test(resto)
    const segunda = /\b(2|2da|2da\.|2°|2º|segunda)\b/.test(resto)
    if (primera || !segunda) out.add(`${mes}-1`)
    if (segunda || !primera) out.add(`${mes}-2`)
  }
  const orden = MESES_TEMPORADA.flatMap((m) => [`${m.clave}-1`, `${m.clave}-2`])
  return Array.from(out).sort((a, b) => orden.indexOf(a) - orden.indexOf(b))
}

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * "$ 1.500.000" → "ARS 1.500.000", "USD 900" → "USD 900". Si no hay un monto
 * claro, se devuelve el texto tal cual (ej. "a convenir").
 */
export function formatearMonto(valor: string): string {
  const v = valor.trim()
  const esUsd = /\b(usd|u\$s|us\$|dolares|dólares)\b/i.test(v) || /u\$s|us\$/i.test(v)
  const soloMonto = v.replace(/\b(ars|usd|pesos|dolares|dólares)\b|u\$s|us\$|\$/gi, '').trim()
  if (!/^\d{1,3}([.\s]\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(soloMonto)) return v
  const n = Number(soloMonto.replace(/[.\s]/g, '').replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return v
  return `${esUsd ? 'USD' : 'ARS'} ${Math.round(n).toLocaleString('es-AR')}`
}

function lista(valor: string): string[] {
  return valor
    .split(/\s*(?:,|;|·|\/|\sy\s|\se\s)\s*/i)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
}

export function leerCondicionesTemporario(descripcion: string, precioFeed?: string | null): CondicionesTemporario {
  const out: CondicionesTemporario = {
    precios: [],
    deposito: null,
    sena: null,
    formaPago: null,
    estadiaMinima: null,
    entrada: null,
    salida: null,
    disponible: null,
    incluye: [],
    personas: null,
    comodidades: [],
    alquiladas: [],
    descripcion: '',
  }
  let quincena: string | null = null
  let mes: string | null = null
  const resto: string[] = []

  for (const linea of (descripcion ?? '').split('\n')) {
    // "• Quincena: $ 900.000" / "- Mes – $ 1.500.000"
    const m = linea.match(/^\s*(?:[-•*·✓✔]\s*)?([^:–—\n]{2,40}?)\s*[:–—]\s*(.+?)\s*$/)
    const etiqueta = m ? normalizar(m[1]).replace(/[.:]$/, '') : ''
    const hit = m ? ETIQUETAS.find((e) => e.re.test(etiqueta)) : undefined
    if (!m || !hit) {
      resto.push(linea)
      continue
    }
    const valor = m[2]
    switch (hit.campo) {
      case 'quincena': quincena = formatearMonto(valor); break
      case 'mes': mes = formatearMonto(valor); break
      case 'deposito': out.deposito = formatearMonto(valor); break
      case 'incluye': out.incluye.push(...lista(valor)); break
      case 'personas': out.personas = valor.match(/\d+/)?.[0] ?? valor; break
      case 'comodidades': out.comodidades.push(...lista(valor)); break
      case 'alquiladas': out.alquiladas = Array.from(new Set([...out.alquiladas, ...leerAlquiladas(valor)])); break
      default: out[hit.campo] = valor
    }
  }

  if (quincena) out.precios.push({ periodo: 'quincena', texto: quincena })
  if (mes) out.precios.push({ periodo: 'mes', texto: mes })
  // Sin renglones de precio: el precio cargado en la operación, tomado por mes.
  if (!out.precios.length && precioFeed) out.precios.push({ periodo: 'mes', texto: precioFeed })

  out.descripcion = resto.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return out
}

export function tieneCondiciones(c: CondicionesTemporario): boolean {
  return Boolean(
    c.deposito || c.sena || c.formaPago || c.estadiaMinima || c.entrada || c.salida || c.disponible || c.personas ||
      c.incluye.length || c.comodidades.length,
  )
}

// Comodidades que le importan a quien alquila por temporada, en este orden. La
// clave es el tag de Tokko/Hilo; el valor, cómo se muestra.
const COMODIDADES_TAGS: [string[], string][] = [
  [['Pool', 'Swimming Pool'], 'Pileta'],
  [['Barbecue', 'Barbecue area', 'Covered BBQ', 'Individual grill in the apartment'], 'Parrilla'],
  [['Air Conditioning', 'Individual Air conditioner', 'Pre-installed Air-Conditioning'], 'Aire acondicionado'],
  [['WiFi', 'Internet', 'Optical fiber', 'Fiber optic', 'Fiber Optic'], 'Wifi'],
  [['Garden', 'Backyard'], 'Jardín'],
  [['Jacuzzi'], 'Jacuzzi'],
  [['Deck', 'Solarium'], 'Deck'],
  [['Terrace', 'Balcony', 'Balcony terrace'], 'Terraza'],
  [['Heating', 'Central Heating', 'Gas heating', 'Split heating', 'Radiant floor heating', 'General radiant floor heating', 'Fireplace'], 'Calefacción'],
  [['Laundry', 'Laundry room'], 'Lavadero'],
  [['24 Hour Security', 'Security', 'Private security', 'Entrance Security'], 'Seguridad 24 h'],
]

/**
 * Comodidades para mostrar: primero las escritas en "Comodidades:" (el agente
 * sabe qué importa), después las cargadas como tags; sin repetir.
 */
export function comodidadesTemporario(
  c: Pick<CondicionesTemporario, 'comodidades'>,
  tags: { name: string }[] = [],
  cocheras = 0,
): string[] {
  const nombres = new Set(tags.map((t) => t.name))
  const deTags = COMODIDADES_TAGS.filter(([claves]) => claves.some((k) => nombres.has(k))).map(([, label]) => label)
  if (cocheras > 0) deTags.push('Cochera')
  const vistas = new Set<string>()
  return [...c.comodidades, ...deTags].filter((x) => {
    const k = normalizar(x)
    if (vistas.has(k)) return false
    vistas.add(k)
    return true
  })
}

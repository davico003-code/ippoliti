// Buscador de /propiedades: entiende lo que la gente tipea.
//
// El filtro viejo era `haystack.includes(query)`: la frase entera tenía que
// aparecer tal cual, así que "casa funes", "terreno roldan" o "depto" daban
// "Sin resultados". Acá la búsqueda se interpreta:
//
//   "casa 3 dorm en funes hasta 200 mil"
//     → tipo Casa · 3 dormitorios · lugar Funes · precio ≤ 200.000
//
// - Palabras en cualquier orden; cada una tiene que cumplirse (AND), salvo los
//   tipos, las ciudades y lo unido con "o", que se suman (OR).
// - Sin tildes ni mayúsculas; plurales, abreviaturas y jerga ("depto", "lote",
//   "mono", "2 amb", "p.h.", "country", "100k", "u$s", "palos").
// - Errores de tipeo (Damerau-Levenshtein), palabras pegadas o separadas
//   ("tierranueva", "dock garden") y la última palabra a medio escribir
//   (prefijo), porque el listado filtra en vivo mientras se tipea.
// - Alias de barrios desde lib/zonas ("kcc", "tds", "la sexta", "microcentro").
// - Calle + altura: "cordoba 1234" y "san juan al 2000" (misma cuadra).
// - Lo que el inventario no puede verificar ("linda", "luminosa", "pileta")
//   suma orden pero no filtra; lo que no aparece en ningún aviso se ignora y
//   se informa.
// - Nunca un callejón sin salida: si la combinación exacta no existe, se afloja
//   de a una restricción (la menos importante primero) y se avisa qué se aflojó.
//
// Módulo puro (sin React): se indexa una vez por inventario y cada tecla solo
// parsea la consulta y recorre ~300 avisos precomputados (< 1 ms).

import { ZONAS, type Zona } from '@/lib/zonas'
import type { TokkoProperty } from '@/lib/tokko'

// ─── Normalización ───────────────────────────────────────────────────────────

export function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/m²/g, 'm2')
}

/** Texto → palabras (solo letras/dígitos). */
function palabras(s: string): string[] {
  return normalizar(s).split(/[^a-z0-9]+/).filter(Boolean)
}

// Damerau-Levenshtein restringida (OSA): una transposición cuenta 1, así
// "roldna" → "roldan" es distancia 1. Corta temprano si supera `max`.
function distancia(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const n = a.length
  const m = b.length
  let prev2: number[] = []
  let prev: number[] = Array.from({ length: m + 1 }, (_, j) => j)
  for (let i = 1; i <= n; i++) {
    const cur = [i]
    let minFila = i
    for (let j = 1; j <= m; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + costo)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1)
      }
      cur.push(v)
      if (v < minFila) minFila = v
    }
    if (minFila > max) return max + 1
    prev2 = prev
    prev = cur
  }
  return prev[m]
}

/** Errores tolerados según el largo: las palabras cortas no se corrigen. */
function tolerancia(len: number): number {
  if (len >= 8) return 2
  if (len >= 5) return 1
  return 0
}

// ─── Vocabulario ─────────────────────────────────────────────────────────────

// Tipos: ids de Tokko (ver PROPERTY_TYPE_LABELS en lib/tokko). El primer id es
// el "puro" (suma más); `parecido` es a qué tipo caer si no hay ninguno.
interface TipoDef { ids: number[]; singular: string; plural: string; parecido?: TipoClave[] }
type TipoClave = 'casa' | 'departamento' | 'ph' | 'duplex' | 'terreno' | 'quinta' | 'oficina' | 'local' |
  'campo' | 'cochera' | 'galpon'
const TIPOS: Record<TipoClave, TipoDef> = {
  casa:         { ids: [3, 13, 4],    singular: 'Casa',         plural: 'Casas', parecido: ['ph', 'departamento'] },
  departamento: { ids: [2],           singular: 'Departamento', plural: 'Departamentos', parecido: ['ph'] },
  ph:           { ids: [13],          singular: 'PH',           plural: 'PH', parecido: ['departamento', 'casa'] },
  duplex:       { ids: [3, 2, 13],    singular: 'Dúplex',       plural: 'Dúplex' },
  terreno:      { ids: [1],           singular: 'Terreno',      plural: 'Terrenos', parecido: ['campo'] },
  quinta:       { ids: [4],           singular: 'Casa quinta',  plural: 'Casas quinta', parecido: ['casa'] },
  oficina:      { ids: [5],           singular: 'Oficina',      plural: 'Oficinas', parecido: ['local'] },
  local:        { ids: [7],           singular: 'Local',        plural: 'Locales', parecido: ['oficina', 'galpon'] },
  campo:        { ids: [9],           singular: 'Campo',        plural: 'Campos', parecido: ['terreno'] },
  cochera:      { ids: [10],          singular: 'Cochera',      plural: 'Cocheras' },
  galpon:       { ids: [12, 24, 14],  singular: 'Galpón',       plural: 'Galpones', parecido: ['local'] },
}

// Palabra (normalizada) → tipo. Incluye plurales, abreviaturas y jerga.
const PALABRA_TIPO: Record<string, TipoClave> = {}
function alias(tipo: TipoClave, ...ws: string[]) { for (const w of ws) PALABRA_TIPO[w] = tipo }
alias('casa', 'casa', 'casas', 'casita', 'casitas', 'chalet', 'chalets', 'vivienda', 'viviendas', 'casona', 'casonas')
alias('departamento', 'departamento', 'departamentos', 'depto', 'deptos', 'dpto', 'dptos', 'dto', 'dtos',
  'depa', 'depas', 'apartamento', 'apartamentos', 'monoambiente', 'monoambientes', 'mono', 'monoamb')
alias('ph', 'ph', 'phs')
alias('duplex', 'duplex', 'duplexs', 'triplex')
alias('terreno', 'terreno', 'terrenos', 'lote', 'lotes', 'loteo', 'loteos', 'parcela', 'parcelas', 'solar',
  'fraccion', 'fracciones')
alias('quinta', 'quinta', 'quintas', 'casaquinta', 'casaquintas')
alias('oficina', 'oficina', 'oficinas', 'consultorio', 'consultorios')
alias('local', 'local', 'locales', 'comercio', 'comercios', 'comercial', 'comerciales', 'negocio', 'negocios',
  'salon', 'salones')
alias('campo', 'campo', 'campos', 'chacra', 'chacras', 'hectareas', 'estancia')
alias('cochera', 'cochera', 'cocheras', 'garage', 'garages', 'garaje', 'garajes', 'estacionamiento')
alias('galpon', 'galpon', 'galpones', 'nave', 'naves', 'deposito', 'depositos', 'tinglado', 'tinglados')

const PALABRA_OP: Record<string, 'Sale' | 'Rent'> = {}
for (const w of ['vta', 'vtas', 'venta', 'ventas', 'vendo', 'vende', 'venden', 'vender', 'comprar', 'compra', 'compro', 'comprando'])
  PALABRA_OP[w] = 'Sale'
for (const w of ['alq', 'alqs', 'alqui', 'alquiler', 'alquileres', 'alquilar', 'alquilo', 'alquila', 'alquilan', 'alquilen', 'renta',
  'rentar', 'arriendo', 'arrendar', 'temporario', 'temporaria', 'temporada', 'alquilando'])
  PALABRA_OP[w] = 'Rent'

// Palabras de relleno: no filtran ni se informan como ignoradas.
const RELLENO = new Set([
  'en', 'de', 'del', 'la', 'las', 'los', 'el', 'un', 'una', 'unos', 'unas', 'con', 'sin', 'para', 'por', 'que',
  'y', 'e', 'a', 'al', 'lo', 'mi', 'me', 'se', 'te', 'su', 'sus', 'q', 'x', 'u', 'le', 'les', 'sobre', 'cerca',
  'entre', 'busco', 'buscando', 'busca', 'buscamos', 'quiero', 'queria', 'queremos', 'quisiera', 'necesito',
  'necesitamos', 'precisamos', 'preciso', 'hay', 'tenes', 'tienen', 'tengo', 'tenga', 'tiene', 'algo', 'alguna',
  'alguno', 'algun', 'ver', 'mostrame', 'muestren', 'propiedad', 'propiedades', 'inmueble', 'inmuebles',
  'disponible', 'disponibles', 'zona', 'barrio', 'barrios', 'calle', 'av', 'avenida', 'avda', 'bv', 'bvd',
  'boulevard', 'bulevar', 'nro', 'numero', 'n', 'altura', 'mas', 'muy', 'bien', 'tipo', 'estilo', 'ubicado',
  'ubicada', 'ubicados', 'ubicadas', 'situado', 'situada', 'como', 'donde', 'cual', 'favor', 'porfa', 'hola',
  'gracias', 'si', 'no', 'o', 'ciudad', 'localidad', 'dormitorio', 'dormitorios', 'dorm', 'dorms', 'ambiente',
  'ambientes', 'amb', 'ambs', 'habitacion', 'habitaciones', 'provincia', 'santa', 'fe', 'argentina', 'sea', 'cara',
  'caro', 'caros', 'caras', 'mucho', 'poco', 'ya', 'hoy', 'urgente', 'ahora', 'vivir', 'mudarme', 'mudarnos',
  'dueno', 'directo', 'dueño', 'inmobiliaria', 'es', 'son', 'este', 'esta', 'estos', 'estas', 'solo', 'todo',
  'todos', 'toda', 'todas', 'otro', 'otra', 'otros', 'otras', 'aca', 'alla', 'ahi', 'cualquier', 'cerquita',
])

// Suman orden si aparecen en el aviso, nunca filtran: el feed del listado no
// trae descripción ni amenities, así que "pileta" solo se ve si está en el título.
const SUAVES = new Set([
  'lindo', 'linda', 'lindos', 'lindas', 'hermoso', 'hermosa', 'hermosos', 'hermosas', 'bueno', 'buena', 'buenos',
  'buenas', 'grande', 'grandes', 'amplio', 'amplia', 'amplios', 'amplias', 'luminoso', 'luminosa', 'luminosos',
  'moderno', 'moderna', 'modernos', 'modernas', 'nuevo', 'nueva', 'nuevos', 'nuevas', 'estrenar', 'reciclado',
  'reciclada', 'reciclar', 'pileta', 'piscina', 'patio', 'jardin', 'parque', 'quincho', 'parrilla', 'asador',
  'balcon', 'terraza', 'vista', 'vistas', 'lujo', 'premium', 'categoria', 'comodo', 'comoda', 'tranquilo',
  'tranquila', 'seguro', 'segura', 'familia', 'familiar', 'inversion', 'invertir', 'oportunidad', 'impecable',
  'cochera', 'cocheras', 'garage', 'garaje', 'amenities', 'seguridad', 'esquina', 'frente', 'contrafrente',
  'externo', 'interno', 'soleado', 'soleada', 'verde', 'arbolado', 'arbolada', 'escuela', 'colegio', 'amueblado',
  'amueblada', 'amoblado', 'amoblada', 'mascotas', 'mascota', 'servicios', 'gas', 'agua', 'luz', 'cloacas',
  'escritura', 'financiacion', 'financiado', 'cuotas', 'credito', 'apto', 'construccion', 'pozo', 'estrenar',
  'chico', 'chica', 'chicos', 'chicas', 'pequeno', 'pequena', 'ideal', 'excelente', 'espectacular', 'unico',
  'unica', 'paseo', 'plaza', 'rio', 'lago', 'laguna', 'golf', 'club', 'house', 'suite', 'suites', 'toilette',
  'lavadero', 'galeria', 'deck', 'solarium', 'sum', 'gimnasio', 'gym', 'vigilancia', 'bano', 'banos', 'planta',
  'baja', 'alta', 'piso', 'pisos', 'dos', 'plantas',
])

const BARATO = new Set(['barato', 'barata', 'baratos', 'baratas', 'economico', 'economica', 'economicos',
  'economicas', 'accesible', 'accesibles', 'oferta', 'ofertas', 'ganga', 'baratito', 'baratita', 'precio'])

const CERRADO_FRASES = [
  ['barrio', 'cerrado'], ['barrios', 'cerrados'], ['barrio', 'privado'], ['barrios', 'privados'],
  ['b', 'cerrado'], ['b', 'privado'], ['club', 'de', 'campo'], ['clubes', 'de', 'campo'], ['country', 'club'],
  ['country'], ['countries'], ['countrys'], ['countri'], ['cerrado'], ['cerrados'], ['privado'], ['privados'],
  ['barrio', 'abierto'], ['con', 'seguridad'],
]

// Ciudades: entre sí se suman (nadie vive en dos ciudades a la vez).
const CIUDADES = new Map<string, string>([
  ['funes', 'Funes'], ['roldan', 'Roldán'], ['rosario', 'Rosario'], ['ibarlucea', 'Ibarlucea'],
  ['perez', 'Pérez'], ['baigorria', 'Baigorria'], ['zavalla', 'Zavalla'], ['soldini', 'Soldini'],
  ['alvear', 'Alvear'],
])

const NUMEROS: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7,
}

// Palabras de unidad con typo o a medio escribir: "dormitoris", "dormi",
// "monoambinete", "habitacines" → forma canónica antes de parsear números.
const UNIDADES: [string, string][] = [
  ['dormitorios', 'dormitorios'], ['dormitorio', 'dormitorio'], ['habitaciones', 'habitaciones'],
  ['habitacion', 'habitacion'], ['ambientes', 'ambientes'], ['ambiente', 'ambiente'],
  ['monoambiente', 'monoambiente'], ['monoambientes', 'monoambiente'],
]

// ─── Índice ──────────────────────────────────────────────────────────────────

type Prop = Pick<TokkoProperty,
  'id' | 'publication_title' | 'address' | 'fake_address' | 'reference_code' | 'type' | 'location' |
  'operations' | 'web_price' | 'suite_amount' | 'room_amount' | 'surface' | 'roofed_surface' |
  'total_surface' | 'development' | 'is_starred_on_web'
>

interface Entrada {
  p: Prop
  /** " palabra palabra ... " — para frases con límites de palabra. */
  texto: string
  palabras: Set<string>
  lista: string[]
  /** Alturas de calle (números de 3+ dígitos del título/dirección). */
  alturas: number[]
  titulo: Set<string>
  cerrado: boolean
  dorms: number | null
  ambientes: number | null
  mono: boolean
  sup: number[]
  codigo: string
}

export interface Indice {
  entradas: Entrada[]
  vocab: Set<string>
  porId: Map<string, Entrada>
}

const CERRADO_TEXTO = /\b(countries|country|b\.? ?cerrado|barrio cerrado|barrio privado|barrios? cerrados?|club de campo|lagoon|golf)\b/

const ZONAS_CERRADAS: string[] = ZONAS
  .filter(z => z.tipo === 'barrio_cerrado')
  .flatMap(z => [z.nombre, ...(z.aliases ?? [])])
  .map(f => palabras(f).join(' '))
  .filter(f => f.length >= 5 && !['distrito', 'pueblos', 'quintas', 'molino', 'solares', 'comarca', 'alameda', 'aromos',
    'glorietas', 'pellegrini', 'carlos pellegrini', 'green', 'lakes', 'aldea', 'aldea funes'].includes(f))

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

export function construirIndice(props: Prop[]): Indice {
  const vocab = new Set<string>()
  const porId = new Map<string, Entrada>()
  const entradas = props.map(p => {
    const loc = p.location as (Prop['location'] & { full_location?: string }) | null
    // Tokko cuelga Roldán del departamento San Lorenzo ("Santa Fe | San Lorenzo |
    // Roldan"): sin esto, "terreno san lorenzo" traía los lotes de Roldán.
    const sinDepto = (s?: string | null) => (s ?? '').replace(/\|\s*San Lorenzo\s*\|\s*(?=Rold)/i, '| ')
    const tipoLabel = TIPOS[(Object.keys(TIPOS) as TipoClave[])
      .find(k => TIPOS[k].ids.length === 1 && TIPOS[k].ids[0] === p.type?.id) ?? 'duplex']?.singular ?? ''
    const fuentes = [
      p.publication_title, p.address, p.fake_address, loc?.name, sinDepto(loc?.short_location),
      sinDepto(loc?.full_location), p.development?.name, p.type?.id === 2 || p.type?.id === 1 ? tipoLabel : '',
    ].filter(Boolean).join(' | ')
    const lista = palabras(fuentes)
    const texto = ` ${lista.join(' ')} `
    const set = new Set(lista)
    lista.forEach(w => vocab.add(w))

    const lugar = ` ${palabras([loc?.name, loc?.short_location, loc?.full_location, p.development?.name].filter(Boolean).join(' ')).join(' ')} `
    const cerrado = CERRADO_TEXTO.test(texto) || ZONAS_CERRADAS.some(f => lugar.includes(` ${f} `))

    // Dormitorios: suite_amount. Si falta y es depto, ambientes − 1.
    const suites = typeof p.suite_amount === 'number' ? p.suite_amount : null
    const amb = num(p.room_amount)
    const esDepto = p.type?.id === 2
    let dorms: number | null = suites != null && suites > 0 ? suites : null
    if (dorms == null && esDepto && amb != null) dorms = Math.max(0, amb - 1)
    const tituloN = normalizar(p.publication_title ?? '')
    const mono = esDepto && ((suites === 0 && (amb ?? 0) <= 1) || /monoambiente/.test(tituloN))
    if (mono) dorms = 0

    const alturas = palabras([p.publication_title, p.address, p.fake_address].join(' '))
      .filter(w => /^\d{3,5}$/.test(w)).map(Number)
    const sup = [p.surface, p.roofed_surface, p.total_surface].map(num).filter((n): n is number => n != null)
    const codigo = normalizar(p.reference_code ?? '')
    const e: Entrada = {
      p, texto, palabras: set, lista, alturas, titulo: new Set(palabras(p.publication_title ?? '')),
      cerrado, dorms, ambientes: amb, mono, sup, codigo,
    }
    porId.set(String(p.id), e)
    if (codigo) porId.set(codigo, e)
    return e
  })
  return { entradas, vocab, porId }
}

// ─── Interpretación de la consulta ───────────────────────────────────────────

type Moneda = 'USD' | 'ARS'

interface Termino {
  /** Texto tal como se muestra al usuario. */
  crudo: string
  /** Variantes: la entrada cumple si contiene CUALQUIERA (OR). Cada variante es una frase. */
  variantes: string[][]
  /** Última palabra a medio escribir: acepta prefijo. */
  parcial: boolean
  /** Variantes que salen de un alias de zona: solo frase exacta. */
  deZona?: boolean
  /** Última palabra a medio escribir que también puede ser un tipo/operación ("depa", "alqu"). */
  prefijoTipos?: TipoClave[]
  prefijoOps?: ('Sale' | 'Rent')[]
}

export interface Interpretacion {
  tipos: TipoClave[]
  operacion: 'Sale' | 'Rent' | null
  dorms: { n: number; modo: 'min' | 'max' | 'exacto' } | null
  ambientes: number | null
  mono: boolean
  precio: { min?: number; max?: number; moneda: Moneda | null } | null
  superficie: { min?: number; max?: number; aprox?: number } | null
  cerrado: boolean
  barato: boolean
  codigo: string | null
  ciudades: string[]
  terminos: Termino[]
  suaves: string[]
  ignoradas: string[]
  vacia: boolean
}

function parseMonto(numStr: string, mult: string | undefined): number {
  let n: number
  if (/^\d{1,3}([.,]\d{3})+$/.test(numStr)) n = Number(numStr.replace(/[.,]/g, ''))
  else n = Number(numStr.replace(',', '.'))
  switch (mult) {
    case 'k': case 'mil': case 'lucas': case 'luca': return n * 1_000
    case 'millon': case 'millones': case 'palo': case 'palos': case 'mm': return n * 1_000_000
    default: return n
  }
}

const RE_MONEDA_USD = /\b(usd|us|dolares|dolar|dls|dol|verdes)\b|u\$s|us\$|u\$d|u\$/
const RE_MONEDA_ARS = /\b(pesos|ars|peso)\b|(^|[^us])\$/

const NUM = String.raw`(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)`
const MULT = String.raw`(?:\s*(k|mil|lucas|luca|millones|millon|palos|palo|mm)\b)?`
const MON = String.raw`(?:\s*(?:usd|u\$s|u\$d|us\$|dolares|dolar|dls|pesos|ars|\$))?`
const MON_PRE = String.raw`(?:(?:usd|u\$s|u\$d|us\$|dolares|dls|\$|ars)\s*)?`

/** Interpreta la consulta. Con `indice` además reconoce códigos/ids de aviso. */
export function interpretar(query: string, indice?: Indice): Interpretacion {
  const out: Interpretacion = {
    tipos: [], operacion: null, dorms: null, ambientes: null, mono: false, precio: null,
    superficie: null, cerrado: false, barato: false, codigo: null, ciudades: [], terminos: [],
    suaves: [], ignoradas: [], vacia: true,
  }
  const parcialFinal = !/\s$/.test(query)
  let s = ` ${normalizar(query)
    .replace(/[“”"'`´]/g, ' ')
    .replace(/\bp\s?\.\s?h\b\.?/g, ' ph ')
    .replace(/\bc\s?\/\s?/g, ' con ')
    .replace(/\bs\s?\/\s?/g, ' sin ')
    .replace(/\bp\s?\/\s?/g, ' para ')
    .replace(/\bn\s?[°º]\s?/g, ' ')
    .replace(/[°º]/g, ' ')} `
  if (!s.trim()) return out
  out.vacia = false

  // Unidades con typo/incompletas → canónicas (solo detrás de un número).
  s = s.replace(/(\d+|un|uno|una|dos|tres|cuatro|cinco|seis)\s+([a-z]{3,})/g, (m, n, w) => {
    if (/^(dorm|dor|domi|habi|hab|amb)/.test(w) && !/^dorrego/.test(w)) {
      if (w.startsWith('amb')) return `${n} ambientes`
      if (w.startsWith('hab')) return `${n} habitaciones`
      return `${n} dormitorios`
    }
    for (const [u, canon] of UNIDADES) if (w.length >= 6 && distancia(w, u, 2) <= 2) return `${n} ${canon}`
    return m
  })
  s = s.replace(/\b(mono[a-z]*)\b/g, (m, w) => (w === 'mono' || w.startsWith('monoam') || distancia(w, 'monoambiente', 2) <= 2 ? 'monoambiente' : m))

  // Saca del texto lo que se reconoce. Si el callback devuelve un string, ese
  // texto queda en el mismo lugar (p. ej. un número que no era plata).
  const quitar = (re: RegExp, fn: (m: string[]) => string | void) => {
    s = s.replace(re, (...args) => {
      const queda = fn(args.slice(0, -2) as string[])
      return typeof queda === 'string' ? ` ${queda} ` : ' '
    })
  }

  // Moneda explícita (antes de sacar los montos).
  const monedaTexto: Moneda | null = RE_MONEDA_USD.test(s) ? 'USD' : RE_MONEDA_ARS.test(s) ? 'ARS' : null

  // Superficie: "20x50", "1000 m2", "500 metros", "2 hectareas".
  quitar(/\b(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\b(?:\s*(?:m2|mts2|mts|metros|m))?/g, m => {
    const a = parseFloat(m[1].replace(',', '.')) * parseFloat(m[2].replace(',', '.'))
    if (a > 0) out.superficie = { aprox: a }
  })
  quitar(new RegExp(String.raw`\b(mas de|desde|minimo|min|arriba de|hasta|menos de|maximo|max)?\s*` + NUM +
    String.raw`\s*(m2|mts2|mts|mt2|mt|metros cuadrados|metros|mtrs|m|hectareas|hectarea|has|ha)\b`, 'g'), m => {
    let v = parseMonto(m[2], undefined)
    if (/^h/.test(m[3])) v *= 10_000
    if (!(v > 0)) return
    const cmp = m[1] ?? ''
    if (/mas de|desde|minimo|min|arriba/.test(cmp)) out.superficie = { min: v }
    else if (/hasta|menos|max/.test(cmp)) out.superficie = { max: v }
    else out.superficie = { aprox: v }
  })

  // Dormitorios / ambientes / monoambiente.
  const nDorm = String.raw`(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete)`
  const aNum = (t: string) => NUMEROS[t] ?? parseInt(t, 10)
  quitar(new RegExp(String.raw`\b(mas de|minimo|min|desde|al menos|hasta|maximo|max|de)?\s*` + nDorm +
    String.raw`\s*(\+|o mas)?\s*(dormitorios|dormitorio|dorms|dorm|dor|habitaciones|habitacion|habs|hab|cuartos|cuarto|piezas|pieza|d)\b(\s*o mas|\s*\+|\s*(?:o|y)\s*(\d)\s*(?:dormitorios|dorm))?`, 'g'), m => {
    const n = aNum(m[2])
    if (!(n >= 0 && n < 20)) return
    const pre = m[1] ?? ''
    if (m[6]) {
      // "2 o 3 dormitorios": rango → mínimo del menor (el orden prioriza exactos).
      out.dorms = { n: Math.min(n, Number(m[6])), modo: 'min' }
      return
    }
    if (/mas de/.test(pre)) out.dorms = { n: n + 1, modo: 'min' }
    else if (/minimo|min|desde|al menos/.test(pre) || m[3] || m[5]) out.dorms = { n, modo: 'min' }
    else if (/hasta|max/.test(pre)) out.dorms = { n, modo: 'max' }
    else out.dorms = { n, modo: 'exacto' }
  })
  quitar(new RegExp(String.raw`\b` + nDorm + String.raw`\s*(ambientes|ambiente|ambs|amb)\b`, 'g'), m => {
    const n = aNum(m[1])
    if (n >= 1 && n < 20) out.ambientes = n
  })
  quitar(/\bmonoambientes?\b/g, () => { out.mono = true; if (!out.tipos.includes('departamento')) out.tipos.push('departamento') })

  // Precio.
  const setPrecio = (min?: number, max?: number) => {
    out.precio = { moneda: null, ...(out.precio ?? {}), ...(min != null ? { min } : {}), ...(max != null ? { max } : {}) }
  }
  quitar(new RegExp(String.raw`\bentre\s*` + MON_PRE + NUM + MULT + MON + String.raw`\s*(?:y|a|-)\s*` + MON_PRE + NUM + MULT + MON, 'g'), m => {
    const multB = m[4]
    const a = parseMonto(m[1], m[2] ?? multB)
    const b = parseMonto(m[3], multB)
    if (a > 0 && b > 0) setPrecio(Math.min(a, b), Math.max(a, b))
  })
  quitar(new RegExp(String.raw`\b(hasta|menos de|max|maximo|tope|no mas de|por debajo de|debajo de|presupuesto de|presupuesto|desde|mas de|minimo|min|arriba de|a partir de|por encima de)\s*(?:de\s*)?` + MON_PRE + NUM + MULT + MON, 'g'), m => {
    const v = parseMonto(m[2], m[3])
    if (!(v > 0)) return
    // "hasta 3" sin unidad ni multiplicador no es plata.
    if (v < 500 && !m[3]) return
    if (/desde|mas de|minimo|min|arriba|a partir|encima/.test(m[1])) setPrecio(v, undefined)
    else setPrecio(undefined, v)
  })
  // Monto suelto con moneda o multiplicador: "usd 80k", "150 mil", "1,5 palos".
  quitar(new RegExp(String.raw`(?:^|\s)(usd|u\$s|u\$d|us\$|\$|dolares|dls|ars)?\s*` + NUM + MULT + String.raw`(?:\s*(usd|u\$s|dolares|dolar|dls|pesos|ars|verdes))?(?=\s|$)`, 'g'), m => {
    const conMarca = !!(m[1] || m[4])
    const v = parseMonto(m[2], m[3])
    const conSeparador = /^\d{1,3}([.,]\d{3})+$/.test(m[2])
    // Ids/códigos: los reconoce el paso de códigos, no son plata.
    if (!m[3] && !conMarca && /^\d{6,}$/.test(m[2]) && indice?.porId.has(m[2])) return m[2]
    if (conMarca || m[3] || conSeparador || v >= 20_000) {
      if (v > 0) setPrecio(undefined, v)
    } else {
      // No era plata: queda como término (altura de calle, número de lote…).
      return m[2]
    }
  })
  if (out.precio) out.precio.moneda = monedaTexto

  const toks = s.split(/[^a-z0-9]+/).filter(Boolean)
  const ultimoOriginal = palabras(query).at(-1)
  const esParcial = (t: string, i: number) => parcialFinal && i === toks.length - 1 && t === ultimoOriginal

  const usados = new Set<number>()
  const matchFrase = (frase: string[], desde: number, conTypo = false) =>
    frase.every((w, k) => {
      const t = toks[desde + k]
      if (t == null || usados.has(desde + k)) return false
      if (t === w) return true
      // "funes hils", "funes nrte": una letra de error por palabra de 4+.
      return conTypo && w.length >= 4 && t.length >= 4 && !/\d/.test(w + t) && distancia(t, w, 1) <= 1
    })

  // Zonas de varias palabras antes que tipos ("quintas del norte" no es "quinta").
  const frasesZona = construirFrasesZona()
  const porPosicion: { pos: number; t: Termino }[] = []
  for (let i = 0; i < toks.length; i++) {
    for (const fz of frasesZona) {
      if (fz.palabras.length < 2 || !matchFrase(fz.palabras, i, true)) continue
      // "centro rosario", "tds roldan": si sacando la ciudad queda otra zona, la
      // ciudad se usa como ciudad (si no, "centro rosario" traía el centro de Roldán).
      const resto = fz.palabras.filter(w => !CIUDADES.has(w))
      if (resto.length && resto.length < fz.palabras.length &&
        (frasesZona.some(f => f.palabras.join(' ') === resto.join(' ')) ||
          (resto.length === 1 && zonaDeUnaPalabra(resto[0], frasesZona, indice?.vocab)))) continue
      fz.palabras.forEach((_, k) => usados.add(i + k))
      porPosicion.push({ pos: i, t: terminoZona(fz, toks.slice(i, i + fz.palabras.length).join(' ')) })
      break
    }
  }

  for (const frase of CERRADO_FRASES) {
    for (let i = 0; i < toks.length; i++) {
      if (!matchFrase(frase, i)) continue
      frase.forEach((_, k) => usados.add(i + k))
      if (!(frase[0] === 'barrio' && frase[1] === 'abierto')) out.cerrado = true
    }
  }

  const vistos = new Set<string>()
  let union = false
  for (let i = 0; i < toks.length; i++) {
    if (usados.has(i)) continue
    const t = toks[i]
    const parcial = esParcial(t, i)

    if (t === 'o' || t === 'u') { union = true; continue }

    // "con cochera"/"con garage": amenity, no tipo.
    if (PALABRA_TIPO[t] === 'cochera' && (toks[i - 1] === 'con' || toks[i - 1] === 'y')) {
      out.suaves.push(t)
      continue
    }

    const tipo = PALABRA_TIPO[t] ?? (!parcial ? corregir(t, PALABRA_TIPO) : undefined)
    if (tipo) { if (!out.tipos.includes(tipo)) out.tipos.push(tipo); union = false; continue }
    const op = PALABRA_OP[t] ?? (!parcial ? corregir(t, PALABRA_OP) : undefined)
    if (op) { out.operacion = out.operacion && out.operacion !== op ? null : op; continue }
    if (BARATO.has(t)) { out.barato = true; continue }
    if (RELLENO.has(t) && !parcial) continue
    if (RELLENO.has(t) && parcial && t.length < 3) continue
    if (SUAVES.has(t)) { out.suaves.push(t); continue }

    // Código de aviso: "sla7272337", "7272337" o "sho 8098748".
    if (indice) {
      const junto = /^[a-z]{2,4}$/.test(t) && /^\d{5,}$/.test(toks[i + 1] ?? '') ? t + toks[i + 1] : null
      if (junto && indice.porId.has(junto)) { out.codigo = junto; usados.add(i + 1); continue }
      if (/^([a-z]{2,4}\d{5,}|\d{6,})$/.test(t) && indice.porId.has(t)) { out.codigo = t; continue }
    }

    if (vistos.has(t)) continue
    vistos.add(t)

    if (CIUDADES.has(t)) { out.ciudades.push(t); union = false; continue }

    // Alias de zona de una palabra ("kcc", "tds", "tds1", "microcentro").
    const fz = zonaDeUnaPalabra(t, frasesZona, indice?.vocab)
    const nuevo: Termino = fz ? terminoZona(fz, t) : { crudo: t, variantes: [[t]], parcial }
    const prev = porPosicion.at(-1)
    if (union && prev) {
      prev.t.variantes.push(...nuevo.variantes)
      prev.t.crudo = `${prev.t.crudo} o ${nuevo.crudo}`
      prev.t.parcial = prev.t.parcial || nuevo.parcial
    } else {
      porPosicion.push({ pos: i, t: nuevo })
    }
    union = false
  }
  porPosicion.sort((a, b) => a.pos - b.pos)
  out.terminos = porPosicion.map(x => x.t)

  // La palabra que se está tipeando puede ser el comienzo de un tipo u
  // operación ("depa", "alqu", "terr"): vale como texto O como tipo.
  const ult = out.terminos.at(-1)
  if (ult && ult.parcial && ult.variantes.length === 1 && ult.variantes[0].length === 1) {
    const pref = ult.variantes[0][0]
    if (pref.length >= 3) {
      const tiposPref = unicos(Object.keys(PALABRA_TIPO).filter(w => w.startsWith(pref)).map(w => PALABRA_TIPO[w]))
      const opsPref = unicos(Object.keys(PALABRA_OP).filter(w => w.startsWith(pref)).map(w => PALABRA_OP[w]))
      if (tiposPref.length) ult.prefijoTipos = tiposPref
      if (opsPref.length) ult.prefijoOps = opsPref
    }
  }

  // "2 ambientes" es jerga de departamento.
  if (out.ambientes && !out.tipos.length) out.tipos.push('departamento', 'ph')
  return out
}

function unicos<T>(xs: T[]): T[] { return xs.filter((x, i) => xs.indexOf(x) === i) }

function corregir<T>(t: string, dic: Record<string, T>): T | undefined {
  const tol = tolerancia(t.length)
  if (!tol) return undefined
  let mejor: T | undefined
  let mejorD = tol + 1
  for (const [w, v] of Object.entries(dic)) {
    if (w.length < 5) continue
    const d = distancia(t, w, tol)
    if (d < mejorD) { mejorD = d; mejor = v }
  }
  return mejorD <= tol ? mejor : undefined
}

// ─── Zonas (alias) ───────────────────────────────────────────────────────────

interface FraseZona { palabras: string[]; nombre: string; variantes: string[][]; expande: boolean; zonas: Zona[] }
let FRASES_ZONA: FraseZona[] | null = null

function construirFrasesZona(): FraseZona[] {
  if (FRASES_ZONA) return FRASES_ZONA
  const nombres = new Set(ZONAS.map(z => palabras(z.nombre).join(' ')))
  const porFrase = new Map<string, Zona[]>()
  for (const z of ZONAS) {
    for (const f of [z.nombre, ...(z.aliases ?? [])]) {
      const k = palabras(f).join(' ')
      // "barrio vida", "barrio martin": "barrio" es relleno y "vida" ya se busca
      // como texto (trae los tres Vida, que es lo que se quiere).
      if (!k || CIUDADES.has(k) || /^barrio /.test(k)) continue
      porFrase.set(k, [...(porFrase.get(k) ?? []), z])
    }
  }
  const out: FraseZona[] = []
  for (const [frase, zonas] of Array.from(porFrase.entries())) {
    const ws = frase.split(' ')
    // Una palabra común ("centro", "parque", "vida", "green") se busca como texto
    // normal; se expanden solo los alias que la gente usa y el aviso no dice.
    const expande = ws.length > 1 || /\d/.test(frase) || frase.length <= 4 || ['microcentro', 'sexta'].includes(frase)
    const variantes = new Set<string>([frase])
    for (const z of zonas) {
      const nombre = palabras(z.nombre).join(' ')
      variantes.add(nombre)
      // Si se tipeó el nombre, también sus alias de varias palabras ("barrio vida",
      // "vida club"), salvo los que son el nombre de OTRA zona ("san marino").
      if (frase === nombre) {
        for (const a of z.aliases ?? []) {
          const k = palabras(a).join(' ')
          if ((k.includes(' ') || /\d/.test(k)) && !(nombres.has(k) && k !== nombre)) variantes.add(k)
        }
      }
    }
    // Frase que es comienzo de un nombre ("funes hills" → los tres Funes Hills).
    nombres.forEach(n => { if (n.startsWith(`${frase} `)) variantes.add(n) })
    out.push({ palabras: ws, nombre: zonas[0].nombre, variantes: Array.from(variantes).map(v => v.split(' ')), expande, zonas })
  }
  out.sort((a, b) => b.palabras.length - a.palabras.length)
  FRASES_ZONA = out
  return out
}

/** "kcc", "tds", "tds1", "microcentro" → zona(s) que representan. */
function zonaDeUnaPalabra(t: string, frases: FraseZona[], vocab?: Set<string>): FraseZona | null {
  const exacta = frases.find(f => f.expande && f.palabras.length === 1 && f.palabras[0] === t)
  if (exacta) return exacta
  // Sigla que es comienzo de alias: "tds" → "tds 1", "tds1", "tds roldan". Solo
  // siglas: la primera palabra de un nombre de zona ("san" de San Marino) no.
  if (t.length < 3 || t.length > 4 || primerasDeNombre().has(t)) return null
  const pref = frases.filter(f => f.expande && f.palabras[0].length <= 4 && f.palabras[0].startsWith(t) &&
    !primerasDeNombre().has(f.palabras[0]))
  if (!pref.length) return null
  const variantes = new Map<string, string[]>([[t, [t]]])
  for (const f of pref) {
    for (const v of f.variantes) variantes.set(v.join(' '), v)
    // Y los nombres largos de esas zonas ("tierra de suenos", que también
    // aparece escrito "Tierra de sueños I").
    for (const z of f.zonas) {
      for (const a of z.aliases ?? []) {
        const k = palabras(a)
        if (k.length > 1 && !primerasDeNombre().has(k.join(' '))) variantes.set(k.join(' '), k)
      }
    }
  }
  void vocab
  return { palabras: [t], nombre: t.toUpperCase(), variantes: Array.from(variantes.values()), expande: true, zonas: [] }
}

let PRIMERAS: Set<string> | null = null
function primerasDeNombre(): Set<string> {
  if (!PRIMERAS) PRIMERAS = new Set(ZONAS.map(z => palabras(z.nombre)[0]))
  return PRIMERAS
}

function terminoZona(fz: FraseZona, tipeado: string): Termino {
  return {
    // Se muestra lo que la persona escribió ("San Marino", "KCC"), no el nombre
    // largo del catálogo de zonas.
    crudo: tipeado.length <= 4 && !/\s/.test(tipeado) ? tipeado.toUpperCase() : tipeado,
    variantes: fz.variantes,
    parcial: false,
    deZona: true,
  }
}

// ─── Match ───────────────────────────────────────────────────────────────────

/** Puntaje de una palabra de búsqueda contra el aviso (0 = no aparece). */
function puntajePalabra(e: Entrada, w: string, parcial: boolean): number {
  if (e.palabras.has(w)) return 4
  if (/^\d+$/.test(w)) {
    // Altura de calle: "cordoba 1234" o "san juan al 2000" (misma cuadra).
    if (w.length >= 3) {
      const n = Number(w)
      if (e.alturas.some(a => Math.floor(a / 100) === Math.floor(n / 100) && (w.length >= 4 || a === n))) return 2.5
    }
    if (parcial) for (const x of e.lista) if (x.startsWith(w)) return 2
    return 0
  }
  // Prefijo: siempre para la palabra que se está tipeando y para palabras de
  // 3+ letras ("fisher" → "fisherton", "pichin" → "pichincha").
  if (parcial || w.length >= 4) {
    for (const x of e.lista) if (x.startsWith(w)) return 3
  }
  // Plural/singular simple.
  if (w.length >= 4) {
    if (w.endsWith('es') && e.palabras.has(w.slice(0, -2))) return 3.5
    if (w.endsWith('s') && e.palabras.has(w.slice(0, -1))) return 3.5
    if (e.palabras.has(`${w}s`) || e.palabras.has(`${w}es`)) return 3.5
  }
  const tol = tolerancia(w.length)
  if (tol) {
    for (const x of e.lista) {
      if (x.length < 4) continue
      if (distancia(w, x, tol) <= tol) return 1.5
      // Palabra a medio escribir y con typo: contra el comienzo de la palabra.
      if (parcial && x.length > w.length && distancia(w, x.slice(0, w.length), 1) <= 1) return 1.2
    }
  }
  return 0
}

function puntajeFrase(e: Entrada, v: string[], parcial: boolean, exacta: boolean): number {
  if (v.length === 1) return puntajePalabra(e, v[0], parcial)
  const frase = v.join(' ')
  if (e.texto.includes(` ${frase} `)) return 5
  if (parcial && e.texto.includes(` ${frase}`)) return 4
  if (exacta) return 0
  // Frase con algún typo: todas sus palabras, contiguas y en orden.
  for (let i = 0; i + v.length <= e.lista.length; i++) {
    let ok = true
    for (let k = 0; k < v.length && ok; k++) {
      const x = e.lista[i + k]
      const w = v[k]
      ok = x === w || (w.length >= 4 && x.startsWith(w)) ||
        (tolerancia(w.length) > 0 && x.length >= 4 && distancia(w, x, tolerancia(w.length)) <= tolerancia(w.length))
    }
    if (ok) return 3
  }
  return 0
}

function puntajeTermino(e: Entrada, t: Termino): number {
  let mejor = 0
  for (const v of t.variantes) {
    const s = puntajeFrase(e, v, t.parcial, !!t.deZona && v.length > 1)
    if (s > mejor) mejor = s
  }
  if (!mejor && (t.prefijoTipos?.length || t.prefijoOps?.length)) {
    if (t.prefijoTipos?.some(k => TIPOS[k].ids.includes(e.p.type?.id ?? -1))) mejor = 2.5
    if (t.prefijoOps?.some(op => e.p.operations?.some(o => o.operation_type === op))) mejor = Math.max(mejor, 2)
  }
  return mejor
}

function esAlquiler(op: string) { return op === 'Rent' || op === 'Temporary rent' }

// ¿Este precio se puede comparar con el monto buscado? Un "hasta 150 mil" sin
// operación no es un alquiler de USD 1.300/mes, ni un "hasta 800 dólares" es
// una venta.
function comparable(opType: string, moneda: string, v: number): boolean {
  if (esAlquiler(opType)) return moneda === 'USD' ? v < 15_000 : v < 50_000_000
  return moneda === 'USD' ? v >= 3_000 : v >= 5_000_000
}

// Restricciones que se pueden aflojar, de la menos a la más importante.
type Llave = 'precioAncho' | 'superficieAncha' | 'dormsAncho' | 'superficie' | 'precio' | 'cerrado' |
  'dorms' | 'tiposParecidos' | 'terminosParcial' | 'terminos' | 'tipos' | 'operacion'

interface Chequeo { ok: boolean; score: number; terminosOk: number }

function cumpleTipos(e: Entrada, claves: TipoClave[]) {
  return claves.some(k => TIPOS[k].ids.includes(e.p.type?.id ?? -1))
}

function evaluar(e: Entrada, it: Interpretacion, flojas: Set<Llave>): Chequeo {
  let score = 0
  const no = { ok: false, score: 0, terminosOk: 0 }
  if (it.codigo) {
    return { ok: e.codigo === it.codigo || String(e.p.id) === it.codigo, score: 100, terminosOk: 0 }
  }
  if (it.tipos.length && !flojas.has('tipos')) {
    let ok = cumpleTipos(e, it.tipos)
    if (!ok && flojas.has('tiposParecidos')) ok = cumpleTipos(e, it.tipos.flatMap(k => TIPOS[k].parecido ?? []))
    if (!ok) return no
    // El tipo "puro" (casa → 3 antes que PH) suma un poco más.
    score += it.tipos.some(k => TIPOS[k].ids[0] === e.p.type?.id) ? 2 : 1
  }
  const op = it.operacion
  if (op && !flojas.has('operacion')) {
    if (!e.p.operations?.some(o => o.operation_type === op || (op === 'Rent' && esAlquiler(o.operation_type)))) return no
    score += 1
  }

  // Lugares y palabras. Con "terminosParcial" alcanza con cumplir algunos: el
  // corte (cuántos) lo decide buscar() según lo mejor que exista.
  let terminosOk = 0
  let terminosTotal = 0
  if (it.ciudades.length) {
    terminosTotal++
    if (it.ciudades.some(c => e.texto.includes(` ${c} `))) { terminosOk++; score += 3 }
  }
  for (const t of it.terminos) {
    terminosTotal++
    const s = puntajeTermino(e, t)
    if (s) { terminosOk++; score += s }
  }
  if (!flojas.has('terminos')) {
    if (terminosOk < terminosTotal && !flojas.has('terminosParcial')) return no
    if (flojas.has('terminosParcial') && terminosTotal && !terminosOk) return no
  }

  if (it.cerrado && !flojas.has('cerrado')) {
    if (!e.cerrado) return no
    score += 1
  }
  if (it.mono && !flojas.has('dorms')) {
    if (!e.mono && !(flojas.has('dormsAncho') && e.dorms === 1)) return no
    score += e.mono ? 2 : 0
  }
  if (it.dorms && !flojas.has('dorms')) {
    const d = e.dorms
    if (d == null) return no
    const { n, modo } = it.dorms
    const ancho = flojas.has('dormsAncho') ? 1 : 0
    if (modo === 'max' && d > n + ancho) return no
    if (modo === 'min' && d < n - ancho) return no
    if (modo === 'exacto' && Math.abs(d - n) > ancho) return no
    score += d === n ? 3 : 1
  }
  if (it.ambientes && !flojas.has('dorms')) {
    const amb = e.ambientes
    const exacto = amb === it.ambientes || e.dorms === it.ambientes - 1
    const cerca = flojas.has('dormsAncho') && ((amb != null && Math.abs(amb - it.ambientes) <= 1) ||
      (e.dorms != null && Math.abs(e.dorms - (it.ambientes - 1)) <= 1))
    if (!exacto && !cerca) return no
    score += exacto ? 2 : 0.5
  }
  if (it.superficie && !flojas.has('superficie')) {
    const { min, max, aprox } = it.superficie
    const ancho = flojas.has('superficieAncha')
    const ok = e.sup.some(v => {
      if (min != null) return v >= min * (ancho ? 0.85 : 1)
      if (max != null) return v <= max * (ancho ? 1.15 : 1)
      if (aprox != null) return v >= aprox * (ancho ? 0.6 : 0.8) && v <= aprox * (ancho ? 1.6 : 1.25)
      return true
    })
    if (!ok) return no
    if (aprox) score += 2 - Math.min(2, Math.min(...e.sup.map(v => Math.abs(v - aprox))) / aprox * 4)
  }
  if (it.precio && !flojas.has('precio')) {
    const { min, max, moneda } = it.precio
    const ref = max ?? min ?? 0
    const k = flojas.has('precioAncho') ? 0.15 : 0
    if (e.p.web_price === false) return no
    const ok = (e.p.operations ?? []).some(o => {
      if (op && !flojas.has('operacion') && !(o.operation_type === op || (op === 'Rent' && esAlquiler(o.operation_type)))) return false
      return (o.prices ?? []).some(pr => pr.price > 0 &&
        (moneda ? pr.currency === moneda : comparable(o.operation_type, pr.currency, ref)) &&
        (!moneda || comparable(o.operation_type, pr.currency, ref) || !!op) &&
        (min == null || pr.price >= min * (1 - k)) && (max == null || pr.price <= max * (1 + k)))
    })
    if (!ok) return no
    score += 1
  }
  // Suaves: suman si aparecen, no filtran.
  for (const w of it.suaves) if (e.titulo.has(w) || puntajePalabra(e, w, false) >= 3) score += 1.5
  if (e.p.is_starred_on_web) score += 0.3
  return { ok: true, score, terminosOk }
}

// ─── Búsqueda ────────────────────────────────────────────────────────────────

export interface Resultado {
  /** ids en orden de relevancia. */
  ids: number[]
  score: Map<number, number>
  interpretacion: Interpretacion
  /** True si hubo que aflojar algo para no dejar la lista vacía. */
  aproximado: boolean
  /** Qué se aflojó, en lenguaje humano ("4 dormitorios", "hasta USD 100.000"). */
  aflojado: string[]
  /** Etiquetas de lo que se entendió, para mostrar arriba del listado. */
  etiquetas: string[]
  /** Pedir orden por precio ascendente ("barato"). */
  ordenarPorPrecio: boolean
}

const ESCALERA: Llave[][] = [
  ['precioAncho', 'superficieAncha'],
  ['dormsAncho'],
  ['superficie'],
  ['precio'],
  ['cerrado'],
  ['tiposParecidos'],
  ['dorms'],
  ['terminosParcial'],
  // Un galpón en Kentucky no existe: quien busca un galpón quiere galpones, así
  // que antes de soltar el tipo se suelta el lugar.
  ['terminos'],
  ['tipos'],
  ['operacion'],
]

/** Une palabras vecinas que en algún aviso forman una frase ("san juan",
 *  "fuerza aerea", "san lorenzo") y separa/junta palabras pegadas o partidas
 *  ("tierranueva" → "tierra nueva", "dock garden" → "dockgarden"). */
function afinarTerminos(indice: Indice, it: Interpretacion) {
  const hayFrase = (f: string) => indice.entradas.some(e => e.texto.includes(` ${f} `))
  const simples = (t: Termino) => !t.deZona && t.variantes.length === 1 && t.variantes[0].length === 1
  const out: Termino[] = []
  for (let i = 0; i < it.terminos.length; i++) {
    const t = it.terminos[i]
    if (!simples(t)) { out.push(t); continue }
    let fin = i
    let frase = t.variantes[0][0]
    while (fin + 1 < it.terminos.length && simples(it.terminos[fin + 1]) && fin - i < 3) {
      const sig = it.terminos[fin + 1]
      const cand = `${frase} ${sig.variantes[0][0]}`
      const ok = hayFrase(cand) || (sig.parcial && indice.entradas.some(e => e.texto.includes(` ${cand}`)))
      if (!ok) break
      frase = cand
      fin++
    }
    if (fin > i) {
      const ts = it.terminos.slice(i, fin + 1)
      out.push({ crudo: ts.map(x => x.crudo).join(' '), variantes: [frase.split(' ')], parcial: ts.at(-1)!.parcial })
      i = fin
      continue
    }
    // Pegadas: "dock" + "garden" → "dockgarden".
    const sig = it.terminos[i + 1]
    if (sig && simples(sig) && indice.vocab.has(frase + sig.variantes[0][0])) {
      const junto = frase + sig.variantes[0][0]
      out.push({ crudo: `${t.crudo} ${sig.crudo}`, variantes: [[junto], [frase, sig.variantes[0][0]]], parcial: sig.parcial })
      i++
      continue
    }
    out.push(t)
  }
  // Partidas: "tierranueva" → "tierra nueva", "funescity" → "funes city".
  for (const t of out) {
    if (!simples(t)) continue
    const w = t.variantes[0][0]
    if (w.length < 7 || indice.vocab.has(w)) continue
    for (let k = 3; k <= w.length - 3; k++) {
      const a = w.slice(0, k)
      const b = w.slice(k)
      if (indice.vocab.has(a) && indice.vocab.has(b) && hayFrase(`${a} ${b}`)) { t.variantes.push([a, b]); break }
    }
  }
  it.terminos = out
}

export function buscar(indice: Indice, query: string): Resultado | null {
  const it = interpretar(query, indice)
  if (it.vacia) return null
  afinarTerminos(indice, it)

  // Palabras que no aparecen en NINGÚN aviso: se ignoran y se informan (salvo
  // la que se está tipeando si es muy corta, que todavía puede completar algo).
  const conocidos: Termino[] = []
  for (const t of it.terminos) {
    const existe = indice.entradas.some(e => puntajeTermino(e, t) > 0)
    if (existe) conocidos.push(t)
    else if (!(t.parcial && t.crudo.length < 3)) it.ignoradas.push(t.crudo)
  }
  it.terminos = conocidos
  const ciudadesConocidas = it.ciudades.filter(c => indice.entradas.some(e => e.texto.includes(` ${c} `)))
  for (const c of it.ciudades) if (!ciudadesConocidas.includes(c)) it.ignoradas.push(CIUDADES.get(c) ?? c)
  it.ciudades = ciudadesConocidas

  const sinRestricciones = !it.codigo && !it.tipos.length && !it.operacion && !it.ciudades.length &&
    !it.terminos.length && !it.dorms && !it.ambientes && !it.mono && !it.superficie && !it.precio && !it.cerrado
  // Solo palabras que no existen ("xyzw", "ibarlucea"): lista vacía y se dice
  // qué no se encontró, en vez de mostrar todo como si se hubiera entendido.
  if (sinRestricciones && it.ignoradas.length) {
    return { ids: [], score: new Map(), interpretacion: it, aproximado: false, aflojado: [], etiquetas: [], ordenarPorPrecio: false }
  }

  type Hit = { id: number; score: number; terminosOk: number }
  const correr = (flojas: Set<Llave>): Hit[] => {
    let hs: Hit[] = []
    for (const e of indice.entradas) {
      const c = evaluar(e, it, flojas)
      if (c.ok) hs.push({ id: e.p.id, score: c.score, terminosOk: c.terminosOk })
    }
    if (flojas.has('terminosParcial') && hs.length) {
      // Lo más parecido: los que cumplen la mayor cantidad de palabras.
      const mejor = Math.max(...hs.map(h => h.terminosOk))
      hs = hs.filter(h => h.terminosOk === mejor)
    }
    return hs
  }
  let flojas = new Set<Llave>()
  let hits = correr(flojas)
  const aflojado: string[] = []
  for (let paso = 0; paso < ESCALERA.length && !hits.length && !it.codigo; paso++) {
    const llaves = ESCALERA[paso].filter(k => aplica(it, k))
    if (!llaves.length) continue
    for (const k of llaves) flojas.add(k)
    hits = correr(flojas)
  }
  // Aflojar lo mínimo: se vuelve a ajustar todo lo que no hizo falta soltar
  // (si sin el tope de precio ya aparece la de 3 dormitorios, los dormitorios
  // no se tocan). Las llaves "anchas" se prueban antes que las que sueltan del todo.
  if (hits.length && flojas.size > 1) {
    for (const k of Array.from(flojas).reverse()) {
      const prueba = new Set(Array.from(flojas).filter(x => x !== k))
      const hs = correr(prueba)
      if (hs.length) { flojas = prueba; hits = hs }
    }
  }
  for (const k of Array.from(flojas)) {
    const d = describirFloja(it, k, flojas, hits.map(h => indice.porId.get(String(h.id))!))
    if (d) aflojado.push(d)
  }
  hits.sort((a, b) => b.score - a.score)
  return {
    ids: hits.map(h => h.id),
    score: new Map(hits.map(h => [h.id, h.score])),
    interpretacion: it,
    aproximado: flojas.size > 0 && hits.length > 0,
    aflojado: unicos(aflojado),
    etiquetas: etiquetas(it, indice),
    ordenarPorPrecio: it.barato,
  }
}

function aplica(it: Interpretacion, k: Llave): boolean {
  switch (k) {
    case 'precioAncho': case 'precio': return !!it.precio
    case 'superficieAncha': case 'superficie': return !!it.superficie
    case 'dormsAncho': case 'dorms': return !!(it.dorms || it.ambientes || it.mono)
    case 'cerrado': return it.cerrado
    case 'terminosParcial': return it.terminos.length + (it.ciudades.length ? 1 : 0) > 1
    case 'terminos': return it.tipos.length > 0 && it.terminos.length + it.ciudades.length > 0
    case 'tiposParecidos': return it.tipos.some(k => TIPOS[k].parecido?.length)
    case 'tipos': return it.tipos.length > 0
    case 'operacion': return !!it.operacion
  }
}

const fmt = (n: number) => Math.round(n).toLocaleString('es-AR')

function textoPrecio(p: NonNullable<Interpretacion['precio']>): string {
  const mon = p.moneda === 'ARS' ? '$' : p.moneda === 'USD' ? 'USD' : ''
  const m = (n: number) => `${mon ? `${mon} ` : ''}${fmt(n)}`
  if (p.min != null && p.max != null) return `${m(p.min)} a ${m(p.max)}`
  if (p.max != null) return `hasta ${m(p.max)}`
  return `desde ${m(p.min ?? 0)}`
}

function textoDorms(it: Interpretacion): string {
  if (it.mono) return 'monoambiente'
  if (it.ambientes) return `${it.ambientes} ambientes`
  if (!it.dorms) return ''
  const { n, modo } = it.dorms
  const u = n === 1 ? 'dormitorio' : 'dormitorios'
  if (modo === 'min') return `${n}+ ${u}`
  if (modo === 'max') return `hasta ${n} ${u}`
  return `${n} ${u}`
}

function textoSuperficie(s: NonNullable<Interpretacion['superficie']>): string {
  if (s.min != null) return `más de ${fmt(s.min)} m²`
  if (s.max != null) return `hasta ${fmt(s.max)} m²`
  return `~${fmt(s.aprox ?? 0)} m²`
}

function capitalizar(s: string): string {
  return s.replace(/(^|\s)([a-zñáéíóú])/g, (_, a: string, b: string) => a + b.toUpperCase())
}

function textoTipos(ks: TipoClave[]) {
  return ks.map(k => TIPOS[k].plural.toLowerCase()).join(' o ').replace(/\bph\b/g, 'PH')
}

function describirFloja(it: Interpretacion, k: Llave, flojas: Set<Llave>, hits: Entrada[]): string | null {
  const lugares = () => [...it.ciudades.map(c => CIUDADES.get(c) ?? c), ...it.terminos.map(t => capitalizar(t.crudo))]
    .map(x => `«${x}»`).join(', ')
  switch (k) {
    case 'precioAncho':
      return flojas.has('precio') || !it.precio ? null : `precio ${textoPrecio(it.precio)} ±15%`
    case 'superficieAncha':
      return flojas.has('superficie') || !it.superficie ? null : `superficie aproximada a ${textoSuperficie(it.superficie).replace('~', '')}`
    case 'dormsAncho':
      return flojas.has('dorms') ? null : `${textoDorms(it)} ±1`
    case 'precio': return it.precio ? `sin el filtro de precio (${textoPrecio(it.precio)})` : null
    case 'superficie': return it.superficie ? `sin el filtro de superficie (${textoSuperficie(it.superficie)})` : null
    case 'dorms': return textoDorms(it) ? `sin el filtro de ${textoDorms(it)}` : null
    case 'cerrado': return 'no solo en barrio cerrado'
    case 'tiposParecidos': return flojas.has('tipos') ? null : `similares a ${textoTipos(it.tipos)}`
    case 'terminosParcial': {
      if (flojas.has('terminos')) return null
      // Las palabras que NINGUNO de los resultados cumple.
      const faltan: string[] = []
      if (it.ciudades.length && !hits.some(e => it.ciudades.some(c => e.texto.includes(` ${c} `)))) {
        faltan.push(`«${it.ciudades.map(c => CIUDADES.get(c) ?? c).join(' o ')}»`)
      }
      for (const t of it.terminos) if (!hits.some(e => puntajeTermino(e, t) > 0)) faltan.push(`«${capitalizar(t.crudo)}»`)
      return faltan.length ? `sin ${faltan.join(', ')}` : null
    }
    case 'terminos': return `fuera de ${lugares()}`
    case 'tipos': return `otros tipos además de ${textoTipos(it.tipos)}`
    case 'operacion': return it.operacion === 'Rent' ? 'también en venta' : 'también en alquiler'
  }
}

function etiquetas(it: Interpretacion, indice: Indice): string[] {
  const out: string[] = []
  if (it.codigo) return [`Código ${it.codigo.toUpperCase()}`]
  if (it.tipos.length) out.push(capitalizar(textoTipos(it.tipos)))
  if (it.operacion) out.push(it.operacion === 'Rent' ? 'Alquiler' : 'Venta')
  if (it.ciudades.length) out.push(it.ciudades.map(c => CIUDADES.get(c) ?? c).join(' o '))
  for (const t of it.terminos) {
    // La palabra a medio escribir todavía no es algo "entendido", salvo que ya
    // sea una palabra completa ("casa en funes" sin espacio final).
    if (t.parcial && !t.variantes.some(v => v.every(w => indice.vocab.has(w)))) continue
    out.push(/^\d+$/.test(t.crudo) ? t.crudo : capitalizar(t.crudo))
  }
  if (it.cerrado) out.push('Barrio cerrado')
  const d = textoDorms(it)
  if (d) out.push(d)
  if (it.superficie) out.push(textoSuperficie(it.superficie))
  if (it.precio) out.push(textoPrecio(it.precio))
  if (it.barato) out.push('Más baratas primero')
  return out
}

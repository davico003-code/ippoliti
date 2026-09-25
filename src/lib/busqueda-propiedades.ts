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
//   "mono", "2 amb", "p.h.", "pto", "bº", "country", "100k", "u$s", "palos").
// - Errores de tipeo y de fonética ("kentuki", "lagun"), palabras pegadas o
//   separadas ("tierranueva", "dock garden"), números romanos ("Vida II").
// - La última palabra se está tipeando (el listado filtra en vivo): vale como
//   prefijo, nunca vacía la lista ni dispara "lo más parecido" a medio escribir.
// - Rangos ("2 o 3 dormitorios", "entre 100 y 150 mil", "de 500 a 800 m2"),
//   montos a la argentina ("hasta 250" = 250 mil, "1,5 palos", "150.000.-").
// - Negaciones ("que no sea barrio cerrado", "no alquiler", "sin pileta").
// - Lugar antes que calle ("barrio martin" no es la calle San Martín) y calle +
//   altura ("cordoba 1234", "san juan al 2000": misma cuadra de ESA calle).
// - Lo que el inventario no puede verificar ("linda", "con pileta") suma orden
//   pero no filtra; lo que no aparece en ningún aviso se ignora y se informa.
// - Nunca un callejón sin salida: si la combinación exacta no existe, se afloja
//   lo mínimo (lo menos importante primero) y se avisa qué se aflojó.
//
// Módulo puro (sin React): se indexa una vez por inventario y cada tecla solo
// parsea la consulta y recorre ~300 avisos precomputados (~1 ms).

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

const ROMANOS: Record<string, string> = { i: '1', ii: '2', iii: '3' }

/** Texto → palabras (solo letras/dígitos). "Vida II" → ["vida", "2"]. */
function palabras(s: string): string[] {
  const ws = normalizar(s).split(/[^a-z0-9]+/).filter(Boolean)
  return ws.map((w, i) => (ROMANOS[w] && i > 0 && /[a-z]/.test(ws[i - 1]) ? ROMANOS[w] : w))
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

// Clave fonética: nombres en inglés escritos como suenan ("kentuki",
// "kentaky" → kentucky; "lagun" → lagoon; "siti" → city; "grin" → green).
function fonetica(w: string): string {
  return w
    .replace(/ck/g, 'k').replace(/qu/g, 'k').replace(/c([aou])/g, 'k$1').replace(/c([ei])/g, 's$1')
    .replace(/z/g, 's').replace(/y/g, 'i').replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/w/g, 'u')
    .replace(/v/g, 'b').replace(/h/g, '').replace(/(.)\1+/g, '$1')
}

function unicos<T>(xs: T[]): T[] { return xs.filter((x, i) => xs.indexOf(x) === i) }

// ─── Vocabulario ─────────────────────────────────────────────────────────────

// Tipos: ids de Tokko (ver PROPERTY_TYPE_LABELS en lib/tokko). El primer id es
// el "puro" (suma más); `parecido` es a qué tipo caer si no hay ninguno;
// `titulo` son las palabras con las que el aviso se presenta ("Salón comercial"
// cargado como galpón en Tokko sigue siendo un local para quien lo busca).
type TipoClave = 'casa' | 'departamento' | 'ph' | 'terreno' | 'quinta' | 'oficina' | 'local' |
  'campo' | 'cochera' | 'galpon'
interface TipoDef { ids: number[]; singular: string; plural: string; parecido?: TipoClave[]; titulo: string[] }
const TIPOS: Record<TipoClave, TipoDef> = {
  casa: { ids: [3, 13, 4], singular: 'Casa', plural: 'Casas', parecido: ['ph'], titulo: ['casa', 'casas', 'chalet'] },
  departamento: { ids: [2], singular: 'Departamento', plural: 'Departamentos', parecido: ['ph'], titulo: ['departamento', 'departamentos', 'depto', 'monoambiente'] },
  ph: { ids: [13], singular: 'PH', plural: 'PH', parecido: ['departamento', 'casa'], titulo: ['ph'] },
  terreno: { ids: [1], singular: 'Terreno', plural: 'Terrenos', parecido: ['campo'], titulo: ['lote', 'lotes', 'terreno', 'terrenos'] },
  quinta: { ids: [4], singular: 'Casa quinta', plural: 'Casas quinta', parecido: ['casa'], titulo: ['quinta'] },
  oficina: { ids: [5], singular: 'Oficina', plural: 'Oficinas', parecido: ['local'], titulo: ['oficina', 'oficinas', 'consultorio'] },
  local: { ids: [7], singular: 'Local', plural: 'Locales', parecido: ['oficina', 'galpon'], titulo: ['local', 'locales', 'salon'] },
  campo: { ids: [9], singular: 'Campo', plural: 'Campos', parecido: ['terreno'], titulo: ['campo', 'chacra'] },
  cochera: { ids: [10], singular: 'Cochera', plural: 'Cocheras', titulo: ['cochera', 'cocheras'] },
  galpon: { ids: [12, 24, 14], singular: 'Galpón', plural: 'Galpones', parecido: ['local'], titulo: ['galpon', 'galpones', 'nave', 'deposito'] },
}
const CLAVES_TIPO = Object.keys(TIPOS) as TipoClave[]
// Para quien busca estos, el tipo pesa más que la operación (un terreno en venta
// le sirve más que un monoambiente en alquiler); para vivienda, al revés.
const TIPOS_DUROS: TipoClave[] = ['terreno', 'galpon', 'local', 'oficina', 'cochera', 'campo']

// Palabra (normalizada) → tipo. Incluye plurales, abreviaturas y jerga.
const PALABRA_TIPO: Record<string, TipoClave> = {}
function alias(tipo: TipoClave, ...ws: string[]) { for (const w of ws) PALABRA_TIPO[w] = tipo }
alias('casa', 'casa', 'casas', 'casita', 'casitas', 'chalet', 'chalets', 'vivienda', 'viviendas')
alias('departamento', 'departamento', 'departamentos', 'depto', 'deptos', 'dpto', 'dptos', 'dto', 'dtos',
  'depa', 'depas', 'apartamento', 'apartamentos', 'monoambiente', 'monoambientes')
alias('ph', 'ph', 'phs')
alias('terreno', 'terreno', 'terrenos', 'lote', 'lotes', 'loteo', 'loteos', 'parcela', 'parcelas', 'solar',
  'fraccion', 'fracciones')
alias('quinta', 'quinta', 'quintas', 'casaquinta', 'casaquintas')
alias('oficina', 'oficina', 'oficinas', 'consultorio', 'consultorios')
alias('local', 'local', 'locales', 'comercio', 'comercios', 'negocio', 'negocios', 'salon', 'salones')
alias('campo', 'campo', 'campos', 'chacra', 'chacras', 'estancia', 'hectareas', 'hectarea')
alias('cochera', 'cochera', 'cocheras', 'garage', 'garages', 'garaje', 'garajes', 'estacionamiento')
alias('galpon', 'galpon', 'galpones', 'nave', 'naves', 'deposito', 'depositos', 'tinglado', 'tinglados')
// Sinónimos que además son nombres de lugares ("Chacra Los Raigales", "Punta
// Chacra"): si no hay ningún aviso de ese tipo, se buscan como texto.
const TIPO_O_LUGAR = new Set(['chacra', 'chacras', 'estancia', 'quinta', 'quintas'])
// Sustantivos que la gente usa como tipo ("busco un comercio") pero que junto a
// otro tipo son un adjetivo ("lote comercial").
const TIPO_DEBIL = new Set(['comercio', 'comercios', 'negocio', 'negocios', 'salon', 'salones', 'comercial', 'comerciales'])

const PALABRA_OP: Record<string, 'Sale' | 'Rent'> = {}
for (const w of ['vta', 'vtas', 'venta', 'ventas', 'vendo', 'vende', 'venden', 'vender', 'comprar', 'compra', 'compro',
  'comprando'])
  PALABRA_OP[w] = 'Sale'
for (const w of ['alq', 'alqs', 'alquiler', 'alquileres', 'alquilar', 'alquilo', 'alquila', 'alquilan', 'alquilen',
  'renta', 'rentar', 'arriendo', 'arrendar', 'alquilando', 'anual'])
  PALABRA_OP[w] = 'Rent'
const TEMPORARIO = new Set(['temporario', 'temporaria', 'temporarios', 'temporal', 'temporada', 'vacaciones', 'verano',
  'quincena', 'quincenas', 'veraneo'])

// Palabras de relleno: no filtran ni se informan como ignoradas.
const RELLENO = new Set([
  'en', 'de', 'del', 'la', 'las', 'los', 'el', 'un', 'una', 'unos', 'unas', 'con', 'para', 'por', 'que', 'y',
  'e', 'a', 'al', 'lo', 'mi', 'me', 'se', 'te', 'su', 'sus', 'tu', 'q', 'x', 'u', 'le', 'les', 'sobre', 'cerca',
  'entre', 'busco', 'buscando', 'busca', 'buscamos', 'buscar', 'quiero', 'queria', 'queremos', 'quisiera',
  'necesito', 'necesitamos', 'precisamos', 'preciso', 'hay', 'tenes', 'tienen', 'tengo', 'tenga', 'tengan',
  'tiene', 'algo', 'alguna', 'alguno', 'algun', 'ver', 'mostrame', 'muestren', 'mostrar', 'propiedad',
  'propiedades', 'inmueble', 'inmuebles', 'disponible', 'disponibles', 'zona', 'barrio', 'barrios', 'calle', 'av',
  'avenida', 'avda', 'bv', 'bvd', 'boulevard', 'bulevar', 'nro', 'numero', 'n', 'altura', 'mas', 'muy', 'bien',
  'tipo', 'estilo', 'ubicado', 'ubicada', 'ubicados', 'ubicadas', 'situado', 'situada', 'como', 'donde', 'cual',
  'favor', 'porfa', 'porfis', 'xfa', 'hola', 'gracias', 'si', 'ciudad', 'localidad', 'dormitorio', 'dormitorios',
  'dorm', 'dorms', 'ambiente', 'ambientes', 'amb', 'ambs', 'habitacion', 'habitaciones', 'provincia', 'santa',
  'fe', 'argentina', 'sea', 'mucho', 'poco', 'ya', 'hoy', 'urgente', 'ahora', 'vivir', 'mudarme', 'mudarnos',
  'dueno', 'directo', 'inmobiliaria', 'es', 'son', 'este', 'esta', 'estos', 'estas', 'solo', 'todo', 'todos',
  'toda', 'todas', 'otro', 'otra', 'otros', 'otras', 'aca', 'alla', 'ahi', 'cualquier', 'cualquiera', 'cerquita',
  'o', 'interesa', 'interesaria', 'interesado', 'interesada', 'cuanto', 'cuesta', 'cuestan', 'sale', 'salen',
  'precio', 'precios', 'valor', 'fotos', 'foto', 'info', 'informacion', 'consulta', 'consultar', 'datos',
  'whatsapp', 'contacto', 'mirar', 'visitar', 'visita', 'destacadas', 'destacados', 'destacada', 'publicadas',
  'publicados', 'pero', 'tambien', 'nomas', 'nada', 'puede', 'pueda', 'podria', 'quiere', 'quieren', 'somos',
  'soy', 'estoy', 'estamos', 'buscas', 'hasta', 'desde', 'menos', 'maximo', 'minimo', 'max', 'min', 'tope',
  'presupuesto', 'mil', 'k', 'lucas', 'luca', 'millon', 'millones', 'dolares', 'dolar', 'usd', 'us', 'dls',
  'pesos', 'peso', 'ars', 'm2', 'mts', 'mts2', 'metros', 'cuadrados', 'm', 'hectarea', 'hectareas', 'sin', 'no',
  'codigo', 'cod', 'ref', 'referencia', 'id', 'aviso', 'publicacion', 'lugar', 'sector', 'parte', 'opcion',
  'permanente', 'lo', 'sea', 'tal', 'vez', 'quizas',
])

// Suman orden si aparecen en el aviso, nunca filtran: el feed del listado no
// trae descripción ni amenities, así que "pileta" solo se ve si está en el título.
const SUAVES = new Set([
  'lindo', 'linda', 'lindos', 'lindas', 'hermoso', 'hermosa', 'hermosos', 'hermosas', 'bueno', 'buena', 'buenos',
  'buenas', 'grande', 'grandes', 'amplio', 'amplia', 'amplios', 'amplias', 'luminoso', 'luminosa', 'luminosos',
  'moderno', 'moderna', 'modernos', 'modernas', 'nuevo', 'nueva', 'nuevos', 'nuevas', 'estrenar', 'reciclado',
  'reciclada', 'reciclar', 'pileta', 'piscina', 'patio', 'jardin', 'quincho', 'parrilla', 'parrillero', 'asador',
  'balcon', 'terraza', 'vista', 'vistas', 'lujo', 'premium', 'categoria', 'comodo', 'comoda', 'tranquilo',
  'tranquila', 'seguro', 'segura', 'familia', 'familiar', 'inversion', 'invertir', 'oportunidad', 'oportunidades',
  'impecable', 'amenities', 'seguridad', 'esquina', 'frente', 'contrafrente', 'externo', 'interno', 'soleado',
  'soleada', 'verde', 'arbolado', 'arbolada', 'escuela', 'colegio', 'amueblado', 'amueblada', 'amoblado',
  'amoblada', 'mascotas', 'mascota', 'servicios', 'gas', 'agua', 'luz', 'cloacas', 'escritura', 'financiacion',
  'financiado', 'financiada', 'cuotas', 'credito', 'apto', 'construccion', 'construir', 'pozo', 'chico', 'chica',
  'chicos', 'chicas', 'pequeno', 'pequena', 'ideal', 'excelente', 'espectacular', 'unico', 'unica', 'suite',
  'suites', 'toilette', 'lavadero', 'galeria', 'deck', 'solarium', 'sum', 'gimnasio', 'gym', 'vigilancia', 'bano',
  'banos', 'planta', 'plantas', 'baja', 'alta', 'piso', 'pisos', 'permuta', 'permutas', 'comercial', 'comerciales',
  'edificio', 'estudiante', 'estudiantes', 'facultad', 'universidad', 'personas', 'autos', 'auto', 'cubierta',
  'cubierto', 'cubiertos', 'cubiertas', 'semicubierta', 'fondo', 'dependencia', 'servicio', 'cocina', 'living',
  'comedor', 'cochera', 'cocheras', 'garage', 'garaje', 'vivienda', 'compra', 'hijos', 'lista', 'listo', 'habitar',
  'sola', 'solo', 'salida', 'calles', 'material', 'espaciosa', 'espacioso', 'acepta', 'aceptan', 'contado',
  'mensual', 'mensuales', 'expensas', 'bajas', 'escalera', 'refaccionar', 'refaccionada', 'remodelar',
  'remodelada', 'remodelado', 'climatizada', 'climatizado', 'minimalista', 'estado', 'buen', 'gran', 'enorme',
  'chiquito', 'chiquita', 'mucho', 'amplitud', 'luminosidad', 'orientacion', 'renta', 'rentabilidad',
  'inquilino', 'alquilado', 'alquilada', 'habitable', 'dueno', 'propietario', 'cuadra', 'cuadras', 'metros',
  'nuevito', 'estrenado', 'rio', 'lago', 'laguna', 'golf', 'club', 'house', 'casco', 'arboles', 'verdes',
])

const BARATO = new Set(['barato', 'barata', 'baratos', 'baratas', 'economico', 'economica', 'economicos',
  'economicas', 'accesible', 'accesibles', 'oferta', 'ofertas', 'ganga', 'baratito', 'baratita'])
const CARO = new Set(['caro', 'cara', 'caros', 'caras', 'costoso', 'costosa'])
const RECIENTES = new Set(['novedades', 'novedad', 'ultimas', 'ultimos', 'recientes', 'reciente', 'ingresos',
  'ingresadas'])
const NEGADORES = new Set(['no', 'sin', 'excepto', 'salvo', 'fuera', 'menos', 'ni'])
const CENTRICO = new Set(['centrico', 'centrica', 'centricos', 'centricas'])

const CERRADO_FRASES = [
  ['barrio', 'cerrado'], ['barrios', 'cerrados'], ['barrio', 'privado'], ['barrios', 'privados'],
  ['club', 'de', 'campo'], ['clubes', 'de', 'campo'], ['country', 'club'], ['country'], ['countries'],
  ['countrys'], ['countri'], ['cerrado'], ['cerrados'], ['privado'], ['privados'], ['con', 'seguridad'],
]
const ABIERTO_FRASES = [['barrio', 'abierto'], ['barrios', 'abiertos'], ['abierto'], ['abiertos']]

// Ciudades: entre sí se suman (nadie vive en dos ciudades a la vez).
const CIUDADES = new Map<string, string>([
  ['funes', 'Funes'], ['roldan', 'Roldán'], ['rosario', 'Rosario'], ['ibarlucea', 'Ibarlucea'],
  ['perez', 'Pérez'], ['baigorria', 'Baigorria'], ['zavalla', 'Zavalla'], ['soldini', 'Soldini'],
  ['alvear', 'Alvear'],
])
// Localidades de varias palabras: se buscan como ciudad, no como palabras sueltas.
const CIUDADES_FRASE = new Map<string, string>([
  ['san lorenzo', 'San Lorenzo'], ['villa gobernador galvez', 'Villa Gobernador Gálvez'],
  ['granadero baigorria', 'Granadero Baigorria'], ['capitan bermudez', 'Capitán Bermúdez'],
  ['pueblo esther', 'Pueblo Esther'], ['puerto general san martin', 'Puerto General San Martín'],
  ['puerto gral san martin', 'Puerto General San Martín'],
])
const LOCALIDADES = ['funes', 'roldan', 'rosario', 'ibarlucea', 'perez', 'baigorria', 'zavalla', 'soldini', 'alvear',
  ...Array.from(CIUDADES_FRASE.keys())]

const NUMEROS: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7,
}
const CENTENAS: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500,
  seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900, cincuenta: 50, sesenta: 60,
  setenta: 70, ochenta: 80, noventa: 90, veinte: 20, treinta: 30, cuarenta: 40, diez: 10,
}

// Abreviaturas de direcciones y barrios.
const ABREVIATURAS: [RegExp, string][] = [
  [/\bpto\b\.?/g, 'puerto'], [/\bgral\b\.?/g, 'general'], [/\brep\b\.?/g, 'republica'], [/\bpje\b\.?/g, 'pasaje'],
  [/\bnva\b\.?/g, 'nueva'], [/\bb\s?[°º]\s?/g, 'barrio '], [/\bbo\b\.?/g, 'barrio'], [/\bb\.\s?(?=[a-z])/g, 'barrio '],
  [/\bb\s+(?=[a-z]{3,})/g, 'barrio '], [/\bmicro\s+centro\b/g, 'microcentro'], [/\bbs\s?as\b/g, ' '],
  [/\b(zona|ruta|lote|km)(\d{1,3})\b/g, '$1 $2'],
]

// Palabras de unidad a medio escribir detrás de un número ("3 do", "2 ha", "200 mi").
const UNIDADES_PREFIJO: [string, string, number][] = [
  ['dormitorios', 'dormitorios', 1], ['habitaciones', 'habitaciones', 2], ['ambientes', 'ambientes', 2],
  ['banos', 'banos', 2], ['mil', 'mil', 2], ['millones', 'millones', 4], ['cocheras', 'cocheras', 3],
]

// ─── Índice ──────────────────────────────────────────────────────────────────

type Prop = Pick<TokkoProperty,
  'id' | 'publication_title' | 'address' | 'fake_address' | 'reference_code' | 'type' | 'location' |
  'operations' | 'web_price' | 'suite_amount' | 'room_amount' | 'surface' | 'roofed_surface' |
  'total_surface' | 'development' | 'is_starred_on_web'
> & { bathroom_amount?: number | null; parking_lot_amount?: number | null }

interface Entrada {
  p: Prop
  /** " palabra palabra ... " — para frases con límites de palabra. */
  texto: string
  palabras: Set<string>
  lista: string[]
  /** Ubicación (barrio/ciudad/emprendimiento) + título: dónde se busca un lugar. */
  lugar: string
  /** Solo la ubicación (sin título ni calle). */
  ubicacion: string
  lugarPalabras: Set<string>
  ciudad: string | null
  /** Alturas de calle (números de 3+ dígitos del título/dirección). */
  alturas: number[]
  titulo: Set<string>
  tipos: Set<TipoClave>
  tiposTitulo: Set<TipoClave>
  cerrado: boolean
  dorms: number[]
  ambientes: number | null
  banos: number | null
  cocheras: number | null
  mono: boolean
  supLote: number | null
  supCubierta: number[]
  codigo: string
  ops: Set<string>
}

export interface Indice {
  entradas: Entrada[]
  vocab: Set<string>
  /** Palabras de ubicación (barrios, countries), sin ciudades ni relleno. */
  vocabLugar: Set<string>
  porId: Map<string, Entrada>
  tiposConStock: Set<TipoClave>
  frasesLugar: Set<string>
  /** Palabra normalizada → cómo se escribe en los avisos ("cordoba" → "córdoba"). */
  forma: Map<string, string>
}

const CERRADO_TEXTO = /\b(countries|country|b\.? ?cerrado|barrio cerrado|barrio privado|barrios? cerrados?|club de campo|lagoon|golf)\b/

const ZONAS_CERRADAS: string[] = ZONAS
  .filter(z => z.tipo === 'barrio_cerrado')
  .flatMap(z => [z.nombre, ...(z.aliases ?? [])])
  .map(f => palabras(f).join(' '))
  .filter(f => f.length >= 5 && !['distrito', 'distrito roldan', 'pueblos', 'quintas', 'molino', 'solares',
    'comarca', 'alameda', 'aromos', 'glorietas', 'pellegrini', 'carlos pellegrini', 'green', 'lakes', 'aldea',
    'aldea funes', 'tierra de suenos', 'tierra de suenos 1', 'tds 1', 'tds1'].includes(f))

// Barrios cerrados que el catálogo de zonas no nombra como en los avisos.
const CERRADOS_EXTRA = ['puerto roldan', 'los molinos', 'el molino', 'don mateo', 'funes lakes', 'cotos de la alameda',
  'aurea', 'kentucky', 'palos verdes', 'aldea fisherton', 'country golf', 'miraflores', 'san sebastian', 'vida']

const NO_LUGAR = new Set(['santa', 'fe', 'argentina', 'countries', 'cerrado', 'b', 'barrio', 'abierto', 'de', 'la',
  'las', 'los', 'del', 'el', 'y', 'en', 'zona', 'centro', ...Array.from(CIUDADES.keys()), 'san', 'lorenzo'])

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

function ciudadDe(texto: string): string | null {
  // La última localidad nombrada ("Santa Fe | Rosario | Fisherton" → rosario;
  // "Santa Fe | San Lorenzo" → san lorenzo, no Rosario por el título; "San
  // Lorenzo | Puerto Gral San Martin" → Puerto General San Martín).
  let mejor: string | null = null
  let pos = -1
  for (const c of LOCALIDADES) {
    const i = texto.lastIndexOf(` ${c} `)
    if (i > pos || (i === pos && i >= 0 && mejor && c.length > mejor.length)) { pos = i; mejor = c }
  }
  return mejor === 'puerto gral san martin' ? 'puerto general san martin' : mejor
}

export function construirIndice(props: Prop[]): Indice {
  const vocab = new Set<string>()
  const vocabLugar = new Set<string>()
  const porId = new Map<string, Entrada>()
  const tiposConStock = new Set<TipoClave>()
  const frasesLugar = new Set<string>()
  const forma = new Map<string, string>()
  const anotarForma = (txt: string | null | undefined) => {
    for (const w of (txt ?? '').toLowerCase().split(/[^a-záéíóúüñ0-9]+/)) {
      if (!w) continue
      const k = normalizar(w)
      if (k !== w && !forma.has(k)) forma.set(k, w)
    }
  }
  const entradas = props.map(p => {
    const loc = p.location as (Prop['location'] & { full_location?: string }) | null
    // Tokko cuelga Roldán del departamento San Lorenzo ("Santa Fe | San Lorenzo |
    // Roldan"): sin esto, "terreno san lorenzo" traía los lotes de Roldán.
    // El país y la provincia tampoco: están en todos los avisos y "santa fe"
    // (la calle) traía el inventario entero.
    const sinDepto = (s?: string | null) => (s ?? '')
      .replace(/\|\s*San Lorenzo\s*\|\s*(?=Rold)/i, '| ')
      .replace(/^\s*(Argentina\s*\|\s*)?Santa Fe\s*(\||$)/i, '')
    const ubicacion = [loc?.name, sinDepto(loc?.short_location), sinDepto(loc?.full_location), p.development?.name]
      .filter(Boolean).join(' | ')
    const fuentes = [p.publication_title, p.address, p.fake_address, ubicacion].filter(Boolean).join(' | ')
    anotarForma(fuentes)
    const lista = palabras(fuentes)
    const texto = ` ${lista.join(' ')} `
    lista.forEach(w => vocab.add(w))
    // Las localidades de varias palabras no cuentan como barrio: "martin" no es
    // Puerto General San Martín, "lorenzo" no es San Lorenzo.
    let ubicN = ` ${palabras(ubicacion).join(' ')} `
    for (const f of Array.from(CIUDADES_FRASE.keys())) ubicN = ubicN.split(` ${f} `).join(' _localidad_ ')
    const ubicLista = ubicN.trim().split(' ').filter(Boolean)
    ubicLista.forEach(w => { if (!NO_LUGAR.has(w) && !/^\d+$/.test(w)) vocabLugar.add(w) })
    const tituloLista = palabras(p.publication_title ?? '')
    const lugarLista = [...ubicLista, ...tituloLista]
    for (const n of [loc?.name, p.development?.name]) {
      // "Barrio Vida" → "vida" (texto normal); "Area Industrial Roldán" → "area
      // industrial" (la ciudad va aparte); "Puerto Roldán", "Haras de Funes" y
      // "Funes Town" quedan enteros (sin la ciudad no son nada).
      const ws = palabras(n ?? '').join(' ').replace(/^(barrio|b) /, '').split(' ').filter(Boolean)
      const sinCiudad = ws.filter(w => !CIUDADES.has(w))
      const util = sinCiudad.length >= 2 && !['de', 'del'].includes(sinCiudad[sinCiudad.length - 1])
      if (util) frasesLugar.add(sinCiudad.join(' '))
      else if (ws.length >= 2) frasesLugar.add(ws.join(' '))
    }

    const tipos = new Set<TipoClave>(CLAVES_TIPO.filter(k => TIPOS[k].ids.includes(p.type?.id ?? -1)))
    // Cómo se presenta el aviso (sus 2 primeras palabras): "Salón comercial…"
    // cargado como galpón, "Casa de pasillo…" cargada como PH.
    const tiposTitulo = new Set<TipoClave>(CLAVES_TIPO.filter(k => tituloLista.slice(0, 2).some(w => TIPOS[k].titulo.includes(w))))
    tipos.forEach(t => tiposConStock.add(t))
    tiposTitulo.forEach(t => tiposConStock.add(t))

    const abierto = /\b(barrio abierto|abierto)\b/.test(texto)
    // El barrio a veces está solo en el título ("Lote en Funes Lakes").
    const lugarN = ` ${[...ubicLista, ...tituloLista].join(' ')} `
    const cerrado = !abierto && (CERRADO_TEXTO.test(texto) || ZONAS_CERRADAS.some(f => lugarN.includes(` ${f} `)) ||
      CERRADOS_EXTRA.some(f => lugarN.includes(` ${f} `)))

    // Dormitorios: los que dice el título y los de suite_amount (la card muestra
    // uno y el título a veces otro: la persona puede estar buscando cualquiera).
    const tituloN = tituloLista.join(' ')
    const dorms: number[] = []
    const suites = typeof p.suite_amount === 'number' ? p.suite_amount : null
    if (suites != null && suites > 0) dorms.push(suites)
    const mt = tituloN.match(/\b(\d)\s*(dormitorios|dormitorio|dorm|dorms|habitaciones)\b/)
    if (mt) dorms.push(Number(mt[1]))
    const amb = num(p.room_amount)
    const esDepto = p.type?.id === 2
    // "Departamento de 1 dormitorio" con suite_amount 0 no es un monoambiente.
    const mono = esDepto && (/\bmonoambiente/.test(tituloN) || (suites === 0 && (amb ?? 0) <= 1 && !mt))
    if (mono) dorms.push(0)
    if (!dorms.length && esDepto && amb != null) dorms.push(Math.max(0, amb - 1))
    const ambTitulo = tituloN.match(/\b(\d)\s*ambientes?\b/)

    const alturas = palabras([p.publication_title, p.address, p.fake_address].join(' '))
      .filter(w => /^\d{3,5}$/.test(w)).map(Number)
    const esLote = p.type?.id === 1 || p.type?.id === 9
    const codigo = normalizar(p.reference_code ?? '').replace(/[^a-z0-9]/g, '')
    const e: Entrada = {
      p, texto, palabras: new Set(lista), lista, lugar: ` ${lugarLista.join(' ')} `, ubicacion: ` ${ubicLista.join(' ')} `,
      lugarPalabras: new Set(lugarLista),
      ciudad: ciudadDe(` ${ubicLista.join(' ')} `) ?? ciudadDe(texto), alturas, titulo: new Set(tituloLista), tipos,
      tiposTitulo, cerrado, dorms: unicos(dorms), ambientes: ambTitulo ? Number(ambTitulo[1]) : amb,
      banos: num(p.bathroom_amount), cocheras: typeof p.parking_lot_amount === 'number' ? p.parking_lot_amount : null,
      mono, supLote: num(p.surface) ?? (esLote ? num(p.total_surface) : null),
      supCubierta: esLote ? [] : [p.roofed_surface, p.total_surface].map(num).filter((n): n is number => n != null),
      codigo, ops: new Set(opsReales(p)),
    }
    porId.set(String(p.id), e)
    if (codigo) porId.set(codigo, e)
    return e
  })
  return { entradas, vocab, vocabLugar, porId, tiposConStock, frasesLugar, forma }
}

// Operaciones que el aviso realmente ofrece: una venta "en 0" junto a un
// alquiler con precio es un resto de carga, no una venta.
function opsReales(p: Prop): string[] {
  const ops = p.operations ?? []
  if (ops.length <= 1 || p.web_price === false) return ops.map(o => o.operation_type)
  const conPrecio = ops.filter(o => (o.prices ?? []).some(pr => pr.price > 0))
  return (conPrecio.length ? conPrecio : ops).map(o => o.operation_type)
}

// ─── Interpretación de la consulta ───────────────────────────────────────────

type Moneda = 'USD' | 'ARS'

interface Variante {
  ws: string[]
  /** La variante solo vale en esta ciudad ("centro" de "microcentro" → Rosario). */
  ciudad?: string
  /** Variante "ciudad" (término de ciudad). */
  soloCiudad?: string
  /** Calle + altura: la altura tiene que estar pegada a ESA calle. */
  altura?: number
  /** Solo en la ubicación del aviso (barrio), no en título ni dirección. */
  soloUbicacion?: boolean
}

interface Termino {
  /** Texto tal como se muestra al usuario. */
  crudo: string
  /** Nombre con tildes del catálogo de zonas, si lo tipeado es ese nombre. */
  mostrar?: string
  /** La entrada cumple si contiene CUALQUIERA de las variantes (OR). */
  variantes: Variante[]
  /** Posición en la consulta (para unir frases vecinas) y última palabra. */
  pos: number
  fin?: number
  /** "barrio X": solo en la ubicación del aviso (ni título ni calle). */
  soloUbicacion?: boolean
  /** Término armado con "o": varias opciones. */
  union?: boolean
  /** Última palabra a medio escribir: acepta prefijo. */
  parcial: boolean
  /** Variantes que salen de un alias de zona: solo frase exacta. */
  deZona?: boolean
  /** Es un lugar: se busca en la ubicación y el título, no en la calle. */
  soloLugar?: boolean
  /** Hay coincidencias exactas en el inventario: sin corrección de typos. */
  sinTypos?: boolean
  /** Número chico suelto ("familia de 4"): solo vale si forma frase. */
  numeroSuelto?: boolean
  /** Palabra de las que ordenan pero no filtran, salvo que forme un nombre ("tierra nueva"). */
  suave?: boolean
  /** Palabra a medio escribir que también puede ser un tipo u operación. */
  prefijoTipos?: TipoClave[]
  prefijoOps?: ('Sale' | 'Rent')[]
}

type Rango = { min: number; max: number }

export interface Interpretacion {
  tipos: TipoClave[]
  excluirTipos: TipoClave[]
  operacion: 'Sale' | 'Rent' | null
  temporario: boolean
  excluirOp: 'Sale' | 'Rent' | null
  dorms: Rango | null
  ambientes: Rango | null
  banos: number | null
  cocheras: number | null
  mono: boolean
  noMono: boolean
  sinCochera: boolean
  /** Características negadas ("sin pileta"): van al final, no se excluyen. */
  suavesNegadas: string[]
  precio: { min?: number; max?: number; moneda: Moneda | null } | null
  moneda: Moneda | null
  superficie: { min?: number; max?: number; aprox?: number } | null
  cerrado: boolean
  noCerrado: boolean
  abiertoEscrito: boolean
  orden: 'barato' | 'caro' | 'recientes' | null
  codigo: string | null
  codigoPrefijo: string | null
  codigoBuscado: string | null
  terminos: Termino[]
  excluir: Termino[]
  suaves: string[]
  ignoradas: string[]
  /** Tokens de la consulta ya limpia (para frases con relleno: "lisandro de la torre"). */
  toks: string[]
  /** Palabra normalizada → como la escribió la persona (con sus tildes). */
  originales: Map<string, string>
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

const NUM = String.raw`(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)`
const MULT = String.raw`(?:\s*(k|mil|lucas|luca|millones|millon|palos|palo|mm)\b)?`
const MON = String.raw`(?:\s*(?:de\s+|en\s+)?(usd|u\$s|u\$d|us\$|dolares|dolar|dls|pesos|ars))?`
const MON_PRE = String.raw`(?:(usd|u\$s|u\$d|us\$|dolares|dls|\$|ars)\s*)?`
const N_DORM = String.raw`(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete)`
const U_DORM = String.raw`(?:dormitorios|dormitorio|dorms|dorm|dor|habitaciones|habitacion|habs|hab|cuartos|cuarto|piezas|pieza|d)`
const U_AMB = String.raw`(?:ambientes|ambiente|ambs|amb)`
const U_SUP = String.raw`(?:m2|mts2|mts|mt2|mt|metros cuadrados|metros|mtrs|m)`

const monedaDe = (t: string | undefined): Moneda | null => {
  if (!t) return null
  if (/^(usd|u\$s|u\$d|us\$|dolares|dolar|dls)$/.test(t)) return 'USD'
  if (/^(pesos|ars)$/.test(t)) return 'ARS'
  return null // "$" solo es ambiguo: en Argentina se usa también para dólares.
}

/** Interpreta la consulta. Con `indice` además reconoce códigos y frases del inventario. */
export function interpretar(query: string, indice?: Indice): Interpretacion {
  const out: Interpretacion = {
    tipos: [], excluirTipos: [], operacion: null, temporario: false, excluirOp: null, dorms: null,
    ambientes: null, banos: null, cocheras: null, mono: false, noMono: false, sinCochera: false, suavesNegadas: [],
    precio: null, moneda: null, superficie: null,
    cerrado: false, noCerrado: false, abiertoEscrito: false, orden: null, codigo: null, codigoPrefijo: null,
    codigoBuscado: null, terminos: [], excluir: [], suaves: [], ignoradas: [], toks: [], originales: new Map(), vacia: true,
  }
  const parcialFinal = !/\s$/.test(query)
  for (const w of query.toLowerCase().split(/[^a-záéíóúüñ0-9]+/)) {
    if (w && normalizar(w) !== w) out.originales.set(normalizar(w), w)
  }
  let s = ` ${normalizar(query)
    .replace(/[“”"'`´¿?¡!]/g, ' ')
    .replace(/\bp\s?\.\s?h\b\.?/g, ' ph ')
    .replace(/\bc\s?\/\s?/g, ' con ')
    .replace(/\bs\s?\/\s?/g, ' sin ')
    .replace(/\bp\s?\/\s?/g, ' para ')
    .replace(/\bn\s?[°º]\s?(?=\d)/g, ' ')} `
  for (const [re, rep] of ABREVIATURAS) s = s.replace(re, ` ${rep} `)
  s = s.replace(/,(?=\s*[a-z])/g, ' o ')
    .replace(/(\d+(?:[.,]\d+)?)\s*por\s*(\d+(?:[.,]\d+)?)/g, '$1x$2')
    .replace(/\bmedia\s+hectarea\b/g, '0,5 hectareas')
  if (!s.trim()) return out
  out.vacia = false

  // Saludos y frases hechas que la corrección de typos convertía en barrios
  // ("buenas tardes" → Las Tardes).
  s = s.replace(/\b(buen[oa]s?\s+(dias|tardes|noches)|buen dia)\b/g, ' ')
    .replace(/\bfin(es)? de semana\b/g, ' ')
    .replace(/\b(codigo|cod|ref|referencia|id|aviso)\s*[:#nº°.]*\s*([a-z]{0,4})\s*-?\s*(\d+)/g, ' $1 #$2$3 ')
    .replace(/\bque no sea\b/g, ' no ').replace(/\bpero no\b/g, ' no ').replace(/\bfuera de\b/g, ' fuera ')

  // Montos: formatos argentinos y palabras.
  s = s
    .replace(/(\d{1,3}(?:\.\d{3})+),\d{2}\b/g, '$1')            // 150.000,00
    .replace(/(\d)\s*\.-/g, '$1')                                // 150.000.-
    .replace(/(\d)\.(?=\s|$)/g, '$1')                            // "150." 
    .replace(/(usd|u\$s|u\$d|us\$|ars)(?=\d)/g, '$1 ')           // usd90k
    .replace(/(\d)(usd|dolares|dls|pesos|ars)\b/g, '$1 $2')      // 150000usd
    .replace(/\bmedio palo\b/g, ' 500 mil ')
    .replace(/\b(un|1)\s+palo\s+y\s+medio\b/g, ' 1,5 millones ').replace(/\bpalo y medio\b/g, ' 1,5 millones ')
    .replace(/\b(un|1)\s+(palo|millon)\b/g, ' 1 millones ')
    .replace(/(\d+(?:[.,]\d+)?)\s*palos?\s+verdes\b/g, '$1 millones usd')
    .replace(/(\d|mil|k|lucas|millones)\s*verdes\b/g, '$1 usd')
  // "N m" al final, a medio escribir: con contexto de plata es "mil"; en un
  // terreno, metros; si es muy chico todavía no es nada.
  if (parcialFinal) {
    s = s.replace(/\b(hasta|desde|usd|u\$s|menos de|mas de|entre)\s*(\d+)\s*m\s*$/, '$1 $2 mil ')
      .replace(/(\d+)\s*m\s*$/, (m, n) => (Number(n) < 100 ? ` ${n} ` : `${n} m2 `))
  }
  s = s
    .replace(/\b(usd|u\$s|u\$d|us\$|\$|hasta|desde|de|menos de|mas de)\s*(\d+(?:[.,]\d+)?)\s*m\b(?!2)/g,
      (m, pre, n) => (parseFloat(n.replace(',', '.')) <= 50 ? `${pre} ${n} millones` : m))
  s = s.replace(new RegExp(String.raw`\b(${Object.keys(CENTENAS).join('|')})(\s+(?:y\s+)?(?:${Object.keys(CENTENAS).join('|')}))?\s+(mil|lucas)\b`, 'g'),
    (_m, a, b) => ` ${CENTENAS[a] + (b ? CENTENAS[b.trim().replace(/^y\s+/, '')] ?? 0 : 0)} mil `)

  if (/\b(terreno|terrenos|lote|lotes|campo|campos|chacra|quinta|hectar\w*)\b/.test(s)) {
    s = s.replace(/(\d+(?:[.,]\d+)?)\s*(ha|has)\b/g, '$1 hectareas')
  }
  // Unidades con typo o a medio escribir detrás de un número: "dormitoris",
  // "3 do", "habitacines", "2 ba", "200 mi" → forma canónica.
  s = s.replace(/(\d+|un|uno|una|dos|tres|cuatro|cinco|seis)\s+([a-z]{1,})\b(?=\s*$|\s)/g, (m, n, w, off: number) => {
    if (/^dorr/.test(w)) return m // Dorrego
    const valor = NUMEROS[n] ?? Number(n)
    const alFinal = off + m.length >= s.trimEnd().length
    // Número grande: la unidad es plata o metros ("200 d" → dólares, "200 met").
    if (valor >= 20) {
      for (const u of ['dolares', 'mil', 'millones', 'metros', 'pesos']) {
        if ((w.length >= 2 || (alFinal && w === 'd')) && u.startsWith(w) && !(u === 'millones' && w.length < 4)) return `${n} ${u}`
      }
      return m
    }
    if (w.length === 1 && !alFinal) return m
    for (const [u, canon, min] of UNIDADES_PREFIJO) {
      if ((w.length >= min || (alFinal && w.length >= 1 && canon === 'dormitorios')) && u.startsWith(w)) {
        if ((canon === 'mil' || canon === 'millones') && !/^\d/.test(n)) return m
        return `${n} ${canon}`
      }
    }
    if (w.length >= 6) {
      for (const u of ['dormitorios', 'dormitorio', 'habitaciones', 'ambientes']) {
        if (distancia(w, u, 2) <= 2) return `${n} ${u}`
      }
    }
    return m
  })
  s = s.replace(/\b(mono[a-z]*)\b/g, (m, w) => (w === 'mono' || 'monoambientes'.startsWith(w) || distancia(w, 'monoambiente', 2) <= 2 ? 'monoambiente' : m))

  const quitar = (re: RegExp, fn: (m: string[]) => string | void) => {
    s = s.replace(re, (...args) => {
      const queda = fn(args.slice(0, -2) as string[])
      return typeof queda === 'string' ? ` ${queda} ` : ' | '
    })
  }
  const rentish = /\b(alq\w*|renta\w*|arriend\w*|temporari\w*|temporada)\b/.test(s)
  const esDeLote = /\b(lote|lotes|terreno|terrenos|parcela|parcelas)\b/.test(s)

  // "casa 200", "depto alquiler 500": un número de 2-3 cifras pegado a un tipo u
  // operación (no a un lote: "lote 626" es el número de lote) es el presupuesto.
  const NO_UNIDAD = String.raw`(?=\s*$|\s+(?!(?:mil|k|lucas|m2|mts|metros|dorm|dormitorios|ambientes|amb|banos|x|de\s+[a-z]+|al|y|a|o)\b))`
  s = s.replace(new RegExp(String.raw`\b(casa|casas|depto|deptos|departamento|departamentos|dpto|ph|galpon|galpones|local|locales|oficina|alquiler|alquilar|venta|comprar|funes|roldan|rosario)\s+(?:de\s+)?(\d{2,4})` + NO_UNIDAD, 'g'),
    (m, w, n) => {
      const v = Number(n)
      // 4 cifras: se está tipeando un monto ("casa 2000" → "casa 200000").
      if (v >= 1000) return ` ${w} `
      return v >= 10 ? ` ${w} hasta ${n} ` : m
    })
  // "terreno 1000", "lote de 600": metros. Salvo que sea el número de un lote
  // que existe ("lote 626").
  s = s.replace(new RegExp(String.raw`\b(terreno|terrenos|lote|lotes)\s+(de\s+)?(\d{3,5})` + NO_UNIDAD, 'g'), (m, w, de, n) => {
    if (!de && indice && indice.entradas.some(e => e.texto.includes(` ${w.replace(/s$/, '')} ${n} `))) return m
    return ` ${w} ${n} m2 `
  })
  // Superficie: rangos, "20x50", "1000 m2", "2 hectareas". "20 metros de frente"
  // es una medida lineal: no filtra.
  quitar(new RegExp(String.raw`\b\d+(?:[.,]\d+)?\s*${U_SUP}?\s*(?:de\s+)?(?:frente|fondo)\b`, 'g'), () => undefined)
  quitar(new RegExp(String.raw`\b(?:entre|de|desde)?\s*${NUM}\s*${U_SUP}?\s*(?:y|a|al|-|hasta)\s*${NUM}\s*(${U_SUP}|hectareas|hectarea)\b`, 'g'), m => {
    let a = parseMonto(m[1], undefined)
    let b = parseMonto(m[2], undefined)
    if (/^h/.test(m[3])) { a *= 10_000; b *= 10_000 }
    if (a > 0 && b > 0) out.superficie = { min: Math.min(a, b), max: Math.max(a, b) }
  })
  quitar(/\b(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\b(?:\s*(?:m2|mts2|mts|metros|m))?/g, m => {
    const a = parseFloat(m[1].replace(',', '.')) * parseFloat(m[2].replace(',', '.'))
    if (a > 0) out.superficie = { aprox: a }
  })
  quitar(new RegExp(String.raw`\b(mas de|desde|minimo|min|arriba de|hasta|menos de|maximo|max)?\s*` + NUM +
    String.raw`\s*(${U_SUP}|hectareas|hectarea)\b`, 'g'), m => {
    let v = parseMonto(m[2], undefined)
    if (/^h/.test(m[3])) v *= 10_000
    if (!(v > 0)) return
    const cmp = m[1] ?? ''
    if (/mas de|desde|minimo|min|arriba/.test(cmp)) out.superficie = { min: v }
    else if (/hasta|menos|max/.test(cmp)) out.superficie = { max: v }
    else out.superficie = { aprox: v }
  })

  // Dormitorios / ambientes / baños / cocheras / monoambiente.
  const aNum = (t: string) => NUMEROS[t] ?? parseInt(t, 10)
  const rango = (a: number, b: number): Rango => ({ min: Math.min(a, b), max: Math.max(a, b) })
  // "2 o 3 dormitorios", "de 2 a 3 dorm", "2/3 dormitorios", "entre 2 y 3", "3 dormitorios o 4".
  quitar(new RegExp(String.raw`\b(?:entre|de)?\s*${N_DORM}\s*(?:o|a|y|al|-|\/)\s*${N_DORM}\s*${U_DORM}\b`, 'g'), m => {
    out.dorms = rango(aNum(m[1]), aNum(m[2]))
  })
  quitar(new RegExp(String.raw`\b${N_DORM}\s*${U_DORM}\s*(?:o|a|-|\/)\s*${N_DORM}\b(?!\s*(?:${U_AMB}|banos|m2|mil|k)\b)`, 'g'), m => {
    out.dorms = rango(aNum(m[1]), aNum(m[2]))
  })
  quitar(new RegExp(String.raw`\b(mas de|minimo|min|desde|al menos|hasta|maximo|max)?\s*` + N_DORM +
    String.raw`\s*(\+|o mas)?\s*${U_DORM}\b(\s*o mas|\s*\+)?`, 'g'), m => {
    const n = aNum(m[2])
    if (!(n >= 0 && n < 20)) return m[0]
    const pre = m[1] ?? ''
    if (/mas de/.test(pre)) out.dorms = { min: n + 1, max: 99 }
    else if (/minimo|min|desde|al menos/.test(pre) || m[3] || m[4]) out.dorms = { min: n, max: 99 }
    else if (/hasta|max/.test(pre)) out.dorms = { min: 0, max: n }
    else out.dorms = { min: n, max: n >= 4 ? 99 : n }
  })
  quitar(new RegExp(String.raw`\b(?:entre|de)?\s*${N_DORM}\s*(?:o|a|y|-|\/)\s*${N_DORM}\s*${U_AMB}\b`, 'g'), m => {
    out.ambientes = rango(aNum(m[1]), aNum(m[2]))
  })
  quitar(new RegExp(String.raw`\b${N_DORM}\s*${U_AMB}\b`, 'g'), m => {
    const n = aNum(m[1])
    if (n >= 1 && n < 20) out.ambientes = { min: n, max: n }
  })
  quitar(new RegExp(String.raw`\b${N_DORM}\s*(?:banos|bano)\b`, 'g'), m => {
    const n = aNum(m[1])
    if (n >= 1 && n < 10) out.banos = n
  })
  // "2 cocheras", "garage para 2 autos".
  quitar(new RegExp(String.raw`\b(?:(?:cochera|garage|garaje)\s+(?:para\s+)?)?(\d|dos|tres|cuatro)\s*(cocheras|autos)\b`, 'g'), m => {
    const n = aNum(m[1])
    if (n >= 1 && n < 10) out.cocheras = n
  })
  // "2 plantas", "4 personas", "familia de 4": el número es parte de una
  // característica que el listado no puede verificar.
  quitar(new RegExp(String.raw`\b${N_DORM}\s*(plantas|planta|pisos|personas|persona|hijos|chicos|pers)\b`, 'g'),
    m => { out.suaves.push(m[2]) })
  quitar(/\b((?:no|sin|ni|excepto|salvo)\s+(?:ser\s+|sea\s+|un\s+|una\s+)?)?monoambientes?\b/g, m => {
    if (m[1]) { out.noMono = true; return }
    out.mono = true
    if (!out.tipos.includes('departamento')) out.tipos.push('departamento')
  })

  // Precio.
  const setPrecio = (min?: number, max?: number, mon?: Moneda | null) => {
    out.precio = {
      moneda: mon ?? out.precio?.moneda ?? null,
      ...(out.precio ?? {}),
      ...(min != null ? { min } : {}),
      ...(max != null ? { max } : {}),
    }
    if (mon) out.precio.moneda = mon
  }
  // "hasta 250" es 250 mil; "alquiler hasta 800" son 800 mil pesos. Un número
  // de 1 cifra no es plata (se está tipeando).
  const implicito = (v: number, mult: string | undefined): number | null => {
    if (mult) return v
    if (v < 10) return null
    if (v < 1000) return v * 1000
    return v
  }
  if (parcialFinal) s = s.replace(/\bentre\s+\S+(\s+(y|a))?\s*$/, ' ')
  // Rangos: "entre 100 y 150 mil", "de 100 a 200 mil", "100-150k", "de 100k a 150k".
  quitar(new RegExp(String.raw`\b(entre|de|desde)?\s*` + MON_PRE + NUM + MULT + MON + String.raw`\s*(?:y|a|al|-|hasta)\s*` + MON_PRE + NUM + MULT + MON + String.raw`(?=\s|$)`, 'g'), m => {
    const [, pre, mA, nA, multA, monA, mB, nB, multB, monB] = m
    const marca = monedaDe(monA) ?? monedaDe(monB) ?? monedaDe(mA) ?? monedaDe(mB)
    const chicos = (x: number) => x >= 10 && x < 1000
    const hayContexto = !!(pre === 'entre' || multA || multB || marca || mA || mB ||
      ((pre === 'de' || pre === 'desde') && chicos(parseMonto(nA, undefined)) && chicos(parseMonto(nB, undefined))))
    const aCrudo = parseMonto(nA, undefined)
    const bCrudo = parseMonto(nB, undefined)
    // "lote entre 500 y 800": en terrenos, números así son metros, no plata.
    if (!multA && !multB && !marca && !mA && !mB && esDeLote && bCrudo >= 100 && bCrudo < 20_000) {
      out.superficie = { min: Math.min(aCrudo, bCrudo), max: Math.max(aCrudo, bCrudo) }
      return
    }
    if (!hayContexto && (aCrudo < 10_000 || bCrudo < 10_000)) return m[0] // "cordoba 1200 al 1300"
    const multComun = multB ?? multA
    const a = implicito(parseMonto(nA, multA ?? (aCrudo < 1000 ? multB : undefined)), multA ?? (aCrudo < 1000 ? multB : undefined))
    const b = implicito(parseMonto(nB, multComun), multComun)
    if (a == null || b == null || b < a) return
    setPrecio(Math.min(a, b), Math.max(a, b), marca)
  })
  quitar(new RegExp(String.raw`\b(hasta|menos de|max|maximo|tope|no mas de|por debajo de|debajo de|presupuesto de|presupuesto|desde|mas de|minimo|min|arriba de|a partir de|por encima de)\s*(?:de\s*)?` + MON_PRE + NUM + MULT + MON + String.raw`(?=\s|$)`, 'g'), m => {
    const [, cmp, mA, n, mult, monB] = m
    const marca = monedaDe(monB) ?? monedaDe(mA)
    const conSeparador = /^\d{1,3}([.,]\d{3})+$/.test(n)
    const crudo = parseMonto(n, undefined)
    let v: number | null = parseMonto(n, mult)
    if (!conSeparador) v = implicito(v, mult)
    if (v == null || !(v > 0)) return
    if (rentish && !mult && !conSeparador && crudo >= 1000 && crudo < 10_000) v = crudo // "alquiler hasta 1500 (dólares)"
    // "casa hasta 2000" sin moneda ni "mil": se está tipeando "200000".
    else if (!rentish && !mult && !conSeparador && !marca && crudo >= 1000 && crudo < 10_000) return
    if (rentish && !mult && marca === 'USD' && crudo < 1000) v = crudo // "alquiler hasta 500 dólares"
    if (/desde|mas de|minimo|min|arriba|a partir|encima/.test(cmp)) setPrecio(v, undefined, marca)
    else setPrecio(undefined, v, marca)
  })
  // Monto suelto con moneda o multiplicador: "usd 80k", "150 mil", "1,5 palos".
  quitar(new RegExp(String.raw`(?:^|\s)(usd|u\$s|u\$d|us\$|\$|dolares|dls|ars)?\s*` + NUM + MULT + MON + String.raw`(?=\s|$)`, 'g'), m => {
    const [, mA, n, mult, monB] = m
    const marca = monedaDe(monB) ?? monedaDe(mA)
    const conMarca = !!(mA || monB)
    const conSeparador = /^\d{1,3}([.,]\d{3})+$/.test(n)
    const crudo = parseMonto(n, mult)
    // Ids/códigos (enteros o a medio tipear) y números de 7+ cifras sueltos: los
    // resuelve el paso de códigos; nunca son plata.
    if (!mult && !conMarca && /^\d{4,}$/.test(n) && ((indice && esCodigoOPrefijo(indice, n)) || n.length >= 7)) return n
    if (conMarca || mult) {
      const v = conSeparador ? crudo : rentish && marca === 'USD' && !mult && crudo < 1000 ? crudo : implicito(crudo, mult)
      if (v != null && v > 0) setPrecio(undefined, v, marca)
      return
    }
    if ((conSeparador || /^\d{5,}$/.test(n)) && crudo >= 20_000) {
      setPrecio(undefined, crudo, marca)
      return
    }
    // No era plata: queda como término (altura de calle, número de lote…),
    // con separador de miles o no ("cordoba 1.500" → 1500).
    return conSeparador ? String(crudo) : n
  })
  // Moneda sin monto: "alquiler en pesos", "casas en dólares".
  const monedaSola = /\b(pesos|ars)\b/.test(s) ? 'ARS' : /\b(usd|dolares|dolar|dls)\b|u\$s/.test(s) ? 'USD' : null
  // "casa hasta usd" (todavía sin el número): no filtra por moneda.
  const esperaMonto = /\b(hasta|desde|menos|entre|presupuesto|tope|maximo|minimo|max|min)\b/.test(s)
  if (!out.precio && monedaSola && !esperaMonto) out.moneda = monedaSola

  // Lo que se sacó (dormitorios, precio…) deja un corte: "casa con 3
  // dormitorios funes" → "funes" no es "con funes".
  const toks: string[] = []
  const inicioTramo = new Set<number>()
  for (const tramo of s.split('|')) {
    if (toks.length) inicioTramo.add(toks.length)
    toks.push(...tramo.split(/[^a-z0-9]+/).filter(Boolean))
  }
  out.toks = toks
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
  // ¿Arranca una altura de calle en `j`? "2526", "al 2500".
  const esAltura = (j: number) => /^\d{3,5}$/.test(toks[j] ?? '') ||
    (toks[j] === 'al' && /^\d{3,5}$/.test(toks[j + 1] ?? ''))
  // Localidad seguida de altura que además es calle del inventario ("san lorenzo
  // 2526"): la calle. Si ninguna dirección la nombra ("alvear 1200"), la localidad.
  const esCalle = (frase: string, j: number) => esAltura(j) && !!indice?.entradas.some(e =>
    ` ${palabras(`${e.p.address ?? ''} ${e.p.fake_address ?? ''}`).join(' ')} `.includes(` ${frase} `))
  // ¿Hay un negador justo antes (saltando relleno)? "que no sea en barrio cerrado".
  const negadoEn = (i: number) => {
    for (let k = i - 1, saltos = 0; k >= 0 && saltos < 4; k--, saltos++) {
      if (NEGADORES.has(toks[k]) && !(toks[k] === 'menos' && toks[k + 1] === 'de')) return true
      if (!RELLENO.has(toks[k])) return false
    }
    return false
  }

  // Frases de lugar primero: zonas de varias palabras ("quintas del norte" no es
  // "quinta") y nombres de barrios del inventario ("tierra nueva", "las acequias").
  const frasesZona = construirFrasesZona()
  const porPosicion: Termino[] = []
  for (let i = 0; i < toks.length; i++) {
    let hecho = false
    // "santa fe 2568", "calle santa fe": la calle de Rosario, no la provincia
    // (que como relleno no filtra nada).
    if (matchFrase(['santa', 'fe'], i) && (esAltura(i + 2) || ['calle', 'av', 'avenida', 'avda'].includes(toks[i - 1] ?? ''))) {
      usados.add(i); usados.add(i + 1)
      porPosicion.push({ crudo: 'santa fe', mostrar: 'Santa Fe', variantes: [{ ws: ['santa', 'fe'] }], pos: i, fin: i + 1, parcial: false })
      continue
    }
    for (const [frase, nombre] of Array.from(CIUDADES_FRASE.entries())) {
      const ws = frase.split(' ')
      if (!matchFrase(ws, i)) continue
      // "san lorenzo 2526": con altura detrás es la calle, no la localidad.
      if (esCalle(frase, i + ws.length)) continue
      ws.forEach((_, k) => usados.add(i + k))
      const c = frase === 'puerto gral san martin' ? 'puerto general san martin' : frase
      const t: Termino = { crudo: nombre, variantes: [{ ws: [], soloCiudad: c }], pos: i, fin: i + ws.length - 1, parcial: false }
      if (negadoEn(i)) out.excluir.push(t); else porPosicion.push(t)
      hecho = true
      break
    }
    if (hecho) continue
    for (const fz of frasesZona) {
      if (fz.palabras.length < 2 || !matchFrase(fz.palabras, i, true)) continue
      // "centro rosario", "tds roldan": si sacando la ciudad queda el NOMBRE de
      // otra zona (o una sigla), la ciudad se usa como ciudad. "funes lakes"
      // ("lakes" es solo un alias) queda entero.
      const resto = fz.palabras.filter(w => !CIUDADES.has(w))
      // …salvo que sea el alias de una zona con la ciudad en su nombre ("centro
      // funes" = Funes Centro).
      const zonaConCiudad = fz.zonas.some(z => palabras(z.nombre).some(w => CIUDADES.has(w) && fz.palabras.includes(w)))
      const restoZona = frasesZona.find(f => f.palabras.join(' ') === resto.join(' '))
      const restoSigla = resto.length === 1 && esSigla(resto[0]) && !!zonaDeUnaPalabra(resto[0], frasesZona)
      if (!fz.esNombre && resto.length && resto.length < fz.palabras.length &&
        (restoSigla || (!zonaConCiudad && restoZona && (restoZona.esNombre || restoZona.expande)))) continue
      fz.palabras.forEach((_, k) => usados.add(i + k))
      const t = terminoZona(fz, toks.slice(i, i + fz.palabras.length).join(' '), i)
      t.fin = i + fz.palabras.length - 1
      if (negadoEn(i)) out.excluir.push(t); else porPosicion.push(t)
      hecho = true
      break
    }
    if (hecho || !indice) continue
    for (let largo = 4; largo >= 2; largo--) {
      const f = toks.slice(i, i + largo)
      if (f.length < largo || f.some((_, k) => usados.has(i + k))) continue
      if (!indice.frasesLugar.has(f.join(' '))) continue
      f.forEach((_, k) => usados.add(i + k))
      const t: Termino = { crudo: f.join(' '), variantes: [{ ws: f }], pos: i, fin: i + largo - 1, parcial: false }
      if (negadoEn(i)) out.excluir.push(t); else porPosicion.push(t)
      break
    }
  }

  for (const frase of CERRADO_FRASES) {
    for (let i = 0; i < toks.length; i++) {
      if (!matchFrase(frase, i)) continue
      frase.forEach((_, k) => usados.add(i + k))
      if (negadoEn(i)) out.noCerrado = true
      else out.cerrado = true
    }
  }
  for (const frase of ABIERTO_FRASES) {
    for (let i = 0; i < toks.length; i++) {
      if (!matchFrase(frase, i)) continue
      frase.forEach((_, k) => usados.add(i + k))
      out.noCerrado = true
      out.abiertoEscrito = true
    }
  }
  // "casa quinta" / "casa de campo" son un solo tipo.
  for (const [frase, tipo] of [[['casa', 'quinta'], 'quinta'], [['casa', 'de', 'campo'], 'quinta'], [['casas', 'quinta'], 'quinta']] as [string[], TipoClave][]) {
    for (let i = 0; i < toks.length; i++) {
      if (!matchFrase(frase, i)) continue
      frase.forEach((_, k) => usados.add(i + k))
      if (!out.tipos.includes(tipo)) out.tipos.push(tipo)
    }
  }

  const vistos = new Set<string>()
  const tiposDebiles: TipoClave[] = []
  // Conector de unión justo antes (saltando relleno): "casa o depto", "casas y
  // departamentos", "pichincha, echesortu o abasto" (la coma ya es "o").
  const unionAntes = (i: number, conY: boolean) => {
    for (let k = i - 1; k >= 0 && k >= i - 3; k--) {
      if (toks[k] === 'o' || toks[k] === 'u') return true
      if (conY && (toks[k] === 'y' || toks[k] === 'e')) return true
      if (!['en', 'de', 'la', 'las', 'los', 'el', 'del', 'un', 'una'].includes(toks[k])) return false
    }
    return false
  }
  const esLugarPrefijo = (t: string) => {
    if (!indice || t.length < 3) return false
    let hay = false
    indice.vocabLugar.forEach(w => { if (!hay && w.startsWith(t)) hay = true })
    return hay
  }
  // Prefijo de una palabra de tipo/operación que NO es también el comienzo de
  // otra palabra común ("com" puede ser comercial o cómodo: no es "comprar").
  const ambiguo = (t: string) => esPrefijoDe(t, SUAVES) || esPrefijoDe(t, TIPO_DEBIL) || esPrefijoDe(t, RELLENO)
  const unicoPrefijo = <T,>(t: string, dic: Record<string, T>, min: number): T | undefined => {
    if (t.length < min || ambiguo(t)) return undefined
    const cands = unicos(Object.keys(dic).filter(w => w.startsWith(t)).map(w => dic[w]))
    return cands.length === 1 ? cands[0] : undefined
  }
  const codigoLetras = new Set<string>()
  indice?.porId.forEach((_, k) => { const m = k.match(/^([a-z]{2,4})\d/); if (m) codigoLetras.add(m[1]) })

  for (let i = 0; i < toks.length; i++) {
    if (usados.has(i)) continue
    const t = toks[i]
    const parcial = esParcial(t, i)
    const prev = inicioTramo.has(i) ? undefined : toks[i - 1]
    const negado = negadoEn(i)

    if (t === 'o' || t === 'u' || t === 'y' || t === 'e') continue
    if (NEGADORES.has(t)) continue
    // Una letra suelta no dice nada (y a medio tipear, menos).
    if (t.length === 1 && !/\d/.test(t)) continue
    // "zona 7", "ruta 34", "km 12": la palabra es parte del nombre.
    if (['zona', 'ruta', 'km'].includes(t) && /^\d+$/.test(toks[i + 1] ?? '')) {
      porPosicion.push({ crudo: `${t} ${toks[i + 1]}`, variantes: [{ ws: [t, toks[i + 1]] }], pos: i, fin: i + 1, parcial: esParcial(toks[i + 1], i + 1) })
      usados.add(i + 1)
      continue
    }
    if (CENTRICO.has(t)) {
      porPosicion.push({ crudo: 'centro', variantes: [{ ws: ['centro'] }], pos: i, fin: i, parcial: false, soloLugar: true })
      continue
    }
    // "barrio ce…", "countr…", "barrio ab…": anticipa el filtro de barrio cerrado/abierto.
    if (parcial && ['cerrado', 'country', 'privado', 'countries'].some(w => w.startsWith(t)) &&
      ((prev === 'barrio' && t.length >= 2) || (t.length >= 3 && 'country'.startsWith(t)) || t.length >= 4)) {
      if (negado) out.noCerrado = true; else out.cerrado = true
      continue
    }
    if (parcial && prev === 'barrio' && t.length >= 2 && 'abierto'.startsWith(t)) {
      out.noCerrado = true
      out.abiertoEscrito = true
      continue
    }

    // Negar una característica: "sin cochera" (hay dato), "sin pileta" (va al
    // final), "no temporario".
    if (negado && ['cochera', 'cocheras', 'garage', 'garaje', 'estacionamiento'].includes(t)) { out.sinCochera = true; continue }
    if (negado && (SUAVES.has(t) || TEMPORARIO.has(t) || ['estrenar', 'reciclar', 'construccion', 'pozo'].includes(t))) {
      out.suavesNegadas.push(t)
      continue
    }

    // Tipo.
    if (TIPO_DEBIL.has(t) || (!parcial && t.length >= 8 && distancia(t, 'comercial', 1) <= 1)) {
      if (!negado && !['con', 'sin', 'para'].includes(prev ?? '')) tiposDebiles.push('local')
      out.suaves.push('comercial')
      continue
    }
    // "lote 229", "lote 058": el número de lote de la dirección (una casa en
    // Kentucky también es "Lote 229"), no el tipo terreno.
    const nroLote = toks[i + 1] ?? ''
    if (indice && (t === 'lote' || t === 'lotes') && /^\d{1,4}$/.test(nroLote) &&
      indice.entradas.some(e => e.texto.includes(` lote ${nroLote}${esParcial(nroLote, i + 1) ? '' : ' '}`))) {
      usados.add(i + 1)
      const f: Termino = { crudo: `lote ${nroLote}`, variantes: [{ ws: ['lote', nroLote] }], pos: i, fin: i + 1, parcial: esParcial(nroLote, i + 1) }
      if (negado) out.excluir.push(f); else porPosicion.push(f)
      continue
    }
    const tipo: TipoClave | undefined = PALABRA_TIPO[t] ?? (!parcial ? corregir(t, PALABRA_TIPO) : unicoPrefijo(t, PALABRA_TIPO, 4))
    if (tipo) {
      // Sin stock de ese tipo y la palabra también es nombre de lugar ("chacra
      // los raigales", "punta chacra"): se busca como texto.
      if (indice && !indice.tiposConStock.has(tipo) && TIPO_O_LUGAR.has(t) && indice.vocab.has(t)) {
        porPosicion.push({ crudo: t, variantes: [{ ws: [t] }], pos: i, fin: i, parcial })
        continue
      }
      if (negado) { out.excluirTipos.push(tipo); continue }
      // Un segundo tipo sin "o/y/," es una característica o un destino ("casa
      // con terreno", "terreno para construir mi casa", "casa 3 dorm lote 1000
      // m2", "galpón con oficina"), no otro tipo que se suma.
      const trasCon = ['con', 'sin', 'para'].includes(prev ?? '') || ['con', 'sin', 'para'].includes(toks[i - 2] ?? '')
      const esRasgo = trasCon || (out.tipos.length > 0 && !out.tipos.includes(tipo) && !unionAntes(i, true))
      if (esRasgo) { out.suaves.push(t); continue }
      if (!out.tipos.includes(tipo)) out.tipos.push(tipo)
      continue
    }

    // Operación. "con renta" es un depto en venta con inquilino, no un alquiler.
    const op: 'Sale' | 'Rent' | undefined = PALABRA_OP[t] ?? (!parcial && !RELLENO.has(t) && !SUAVES.has(t) ? corregir(t, PALABRA_OP) : unicoPrefijo(t, PALABRA_OP, 3))
    if (op && ((t === 'compra' && prev === 'a') || prev === 'con')) { out.suaves.push(t); continue }
    if (op) {
      if (negado) { out.excluirOp = op; continue }
      out.operacion = out.operacion && out.operacion !== op ? null : op
      continue
    }
    if (TEMPORARIO.has(t)) { out.temporario = true; out.operacion = 'Rent'; continue }
    if (BARATO.has(t)) { out.orden = 'barato'; continue }
    if (CARO.has(t)) { out.orden = negado ? 'barato' : 'caro'; continue }
    if (RECIENTES.has(t)) { out.orden = 'recientes'; continue }
    if (RELLENO.has(t)) continue
    if (prev === 'con' || prev === 'sin') { out.suaves.push(t); continue }
    // Un adjetivo a medio escribir es lugar solo detrás de "en/barrio" o de una
    // ciudad ("casa en agua…" → Aguadas; "casa nueva" es una casa nueva).
    const pideLugar = ['en', 'barrio', 'zona'].includes(prev ?? '') || CIUDADES.has(prev ?? '')
    if (SUAVES.has(t) && !(parcial && pideLugar && esLugarPrefijo(t))) {
      // Puede ser parte de un nombre ("tierra nueva", "vida jardin"): se decide
      // al unir frases; si no forma ninguna, solo ordena.
      porPosicion.push({ crudo: t, variantes: [{ ws: [t] }], pos: i, fin: i, parcial, suave: true })
      continue
    }
    // La palabra que se está tipeando y que empieza como un relleno o una
    // característica ("pil" → pileta, "hast" → hasta, "bus" → busco, "co" →
    // con) todavía no filtra: si no, la lista se achica y vuelve a crecer.
    if (parcial && !/\d/.test(t)) {
      const deRelleno = esPrefijoDe(t, RELLENO) || esPrefijoDe(t, NEGADORES)
      const deSuave = esPrefijoDe(t, SUAVES) || esPrefijoDe(t, BARATO) || esPrefijoDe(t, TEMPORARIO)
      const deClave = t.length >= 3 && (Object.keys(PALABRA_TIPO).some(w => w.startsWith(t) && !TIPO_DEBIL.has(w)) ||
        Object.keys(PALABRA_OP).some(w => w.startsWith(t)))
      if ((deRelleno && t.length <= 3) || ((deRelleno || deSuave) && !(pideLugar && esLugarPrefijo(t)) && !deClave)) continue
    }

    // Código de aviso: "sla7272337", "7272337", "sho 8098748", o a medio tipear.
    if (indice) {
      const sig = toks[i + 1] ?? ''
      // Solo con las letras de un código real: "san juan 2050" o "av real 9191"
      // son calle + altura, no el código JUAN2050.
      const junto = codigoLetras.has(t) && /^\d+$/.test(sig) ? t + sig : null
      if (junto) {
        usados.add(i + 1)
        if (indice.porId.has(junto)) out.codigo = junto
        else if (esCodigoOPrefijo(indice, junto) || (esParcial(sig, i + 1) && codigoLetras.has(t))) out.codigoPrefijo = junto
        else out.codigoBuscado = junto
        continue
      }
      if (/^[a-z]{2,4}\d+$/.test(t) && codigoLetras.has(t.replace(/\d+$/, ''))) {
        if (indice.porId.has(t)) out.codigo = t
        else if (esCodigoOPrefijo(indice, t) || parcial) out.codigoPrefijo = t
        else out.codigoBuscado = t
        continue
      }
      // Altura de calle: detrás de un nombre ("dorrego 1409") o de "al"
      // ("cordoba al 9000" no es el prefijo de los códigos 9000…).
      const trasPalabra = !!prev && /^[a-z]+$/.test(prev) && !['codigo', 'cod', 'ref', 'referencia', 'id', 'aviso'].includes(prev) &&
        (!RELLENO.has(prev) || prev === 'al') && t.length <= 5
      if (/^\d{4,}$/.test(t) && !trasPalabra) {
        if (indice.porId.has(t)) { out.codigo = t; continue }
        if (esCodigoOPrefijo(indice, t) && (parcial || t.length >= 5)) { out.codigoPrefijo = t; continue }
        if ((['codigo', 'cod', 'ref', 'referencia', 'id', 'aviso'].includes(prev ?? '') && t.length >= 5) || t.length >= 7) {
          out.codigoBuscado = t
          continue
        }
      }
    }

    if (vistos.has(t)) continue
    vistos.add(t)

    let nuevo: Termino
    const ciudadPref = parcial && t.length >= 3 ? Array.from(CIUDADES.keys()).find(c => c.startsWith(t) && c !== t) : undefined
    const ciudadTypo = !CIUDADES.has(t) && !ciudadPref && t.length >= 5 && !(indice?.vocab.has(t))
      ? Array.from(CIUDADES.keys()).find(c => distancia(t, c, 1) <= 1 || fonetica(t) === fonetica(c)) : undefined
    if ((CIUDADES.has(t) || ciudadPref || ciudadTypo) && !esCalle(t, i + 1)) {
      const c = CIUDADES.has(t) ? t : (ciudadPref ?? ciudadTypo)!
      nuevo = { crudo: CIUDADES.get(c)!, variantes: [{ ws: [], soloCiudad: c }], pos: i, fin: i, parcial: false }
      if (!CIUDADES.has(t)) nuevo.variantes.push({ ws: [t] })
    } else {
      // Alias de zona de una palabra ("kcc", "tds", "tds1", "microcentro", "lasexta").
      const fz = zonaDeUnaPalabra(t, frasesZona)
      nuevo = fz ? terminoZona(fz, t, i) : { crudo: t, variantes: [{ ws: [t] }], pos: i, fin: i, parcial }
      if (/^\d{1,2}$/.test(t)) nuevo.numeroSuelto = true
    }
    // "barrio martin", "barrio parque": el barrio, no la calle ni el título.
    if (['barrio', 'barrios'].includes(prev ?? '') || (prev === 'en' && toks[i - 2] === 'barrio')) {
      nuevo.soloLugar = true
      nuevo.soloUbicacion = true
    }
    if (negado) { out.excluir.push(nuevo); continue }
    porPosicion.push(nuevo)
  }
  if (!out.tipos.length && tiposDebiles.length) out.tipos.push('local')
  porPosicion.sort((a, b) => a.pos - b.pos)

  // Uniones: ciudades entre sí siempre ("funes roldan"); lugares con "o", "y" o
  // coma ("pichincha, echesortu o abasto", "fisherton o funes hills"); el resto
  // solo con "o".
  const esLugarT = (t: Termino) => !!(t.deZona || t.soloLugar || t.variantes.some(v => v.soloCiudad) ||
    (indice && t.variantes.length === 1 && t.variantes[0].ws.length === 1 && indice.vocabLugar.has(t.variantes[0].ws[0])))
  const unidos: Termino[] = []
  for (const t of porPosicion) {
    const ant = unidos[unidos.length - 1]
    const ambasCiudad = ant && ant.variantes.every(v => v.soloCiudad) && t.variantes.every(v => v.soloCiudad)
    const unir = ant && !ant.suave && !t.suave && !ant.numeroSuelto && !t.numeroSuelto &&
      (ambasCiudad || unionAntes(t.pos, esLugarT(ant) && esLugarT(t)))
    if (unir) {
      ant.variantes.push(...t.variantes)
      ant.crudo = `${ant.mostrar ?? ant.crudo} o ${t.mostrar ?? t.crudo}`
      ant.mostrar = undefined
      ant.parcial = ant.parcial || t.parcial
      ant.deZona = ant.deZona && t.deZona
      ant.soloLugar = ant.soloLugar && t.soloLugar
      ant.fin = t.fin
      ant.union = true
    } else {
      unidos.push(t)
    }
  }
  out.terminos = unidos

  // La palabra que se está tipeando puede ser el comienzo de un tipo u
  // operación ("depa", "alqu", "terr"): vale como texto O como tipo.
  const ult = out.terminos.at(-1)
  if (ult && ult.parcial && !ult.suave && ult.variantes.length === 1 && ult.variantes[0].ws.length === 1) {
    const pref = ult.variantes[0].ws[0]
    if (pref.length >= 3 && !/\d/.test(pref) && !ambiguo(pref)) {
      const tiposPref = unicos(Object.keys(PALABRA_TIPO).filter(w => w.startsWith(pref)).map(w => PALABRA_TIPO[w]))
      const opsPref = unicos(Object.keys(PALABRA_OP).filter(w => w.startsWith(pref)).map(w => PALABRA_OP[w]))
      if (tiposPref.length) ult.prefijoTipos = tiposPref
      if (opsPref.length) ult.prefijoOps = opsPref
    }
  }

  // "lote en tierra de…": la frase sigue abierta, el término anterior también
  // está a medio escribir.
  if (parcialFinal && ['de', 'del', 'la', 'las', 'los', 'el'].includes(toks[toks.length - 1] ?? '')) {
    const ult2 = out.terminos[out.terminos.length - 1]
    if (ult2 && (ult2.fin ?? ult2.pos) >= toks.length - 3) ult2.parcial = true
  }
  // "monoambiente o 1 dormitorio": de 0 a 1 dormitorios.
  if (out.mono && out.dorms) {
    out.dorms = { min: 0, max: Math.max(1, out.dorms.max) }
    out.mono = false
  }
  // "2 ambientes" es jerga de departamento.
  if (out.ambientes && !out.tipos.length) out.tipos.push('departamento', 'ph')
  return out
}

function esPrefijoDe(t: string, set: Set<string>): boolean {
  if (t.length < 2) return true
  let hay = false
  set.forEach(w => { if (!hay && w.length > t.length && w.startsWith(t)) hay = true })
  return hay
}

function esCodigoOPrefijo(indice: Indice, t: string): boolean {
  if (indice.porId.has(t)) return true
  if (t.length < 4) return false
  let hay = false
  indice.porId.forEach((_, k) => { if (!hay && k.startsWith(t) && k.length > t.length) hay = true })
  return hay
}

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

interface FraseZona {
  /** Cómo se escribe en el catálogo ("Tierra de Sueños", "República de la Sexta"). */
  mostrar: string
  palabras: string[]
  nombre: string
  variantes: Variante[]
  expande: boolean
  esNombre: boolean
  zonas: Zona[]
}
let FRASES_ZONA: FraseZona[] | null = null
let PRIMERAS: Set<string> | null = null

function primerasDeNombre(): Set<string> {
  if (!PRIMERAS) PRIMERAS = new Set(ZONAS.map(z => palabras(z.nombre)[0]))
  return PRIMERAS
}

const unaCiudad = (zs: Zona[]) => (zs.every(z => z.ciudad === zs[0].ciudad) ? normalizar(zs[0].ciudad) : undefined)

function construirFrasesZona(): FraseZona[] {
  if (FRASES_ZONA) return FRASES_ZONA
  const nombres = new Set(ZONAS.map(z => palabras(z.nombre).join(' ')))
  const porFrase = new Map<string, Zona[]>()
  const original = new Map<string, string>()
  for (const z of ZONAS) {
    for (const f of [z.nombre, ...(z.aliases ?? [])]) {
      const k = palabras(f).join(' ')
      if (!original.has(k)) original.set(k, f)
      // "barrio vida", "barrio martin": "barrio" es relleno y "vida" ya se busca
      // como texto (trae los tres Vida, que es lo que se quiere).
      if (!k || CIUDADES.has(k) || /^barrio /.test(k)) continue
      porFrase.set(k, [...(porFrase.get(k) ?? []), z])
    }
  }
  const out: FraseZona[] = []
  porFrase.forEach((zonas, frase) => {
    const ws = frase.split(' ')
    // Una palabra común ("centro", "parque", "vida", "green") se busca como texto
    // normal; se expanden solo los alias que la gente usa y el aviso no dice.
    const expande = ws.length > 1 || /\d/.test(frase) || frase.length <= 4 || ['microcentro', 'sexta'].includes(frase)
    const ciudad = unaCiudad(zonas)
    const variantes = new Map<string, Variante>([[frase, { ws }]])
    const agregar = (k: string) => {
      if (variantes.has(k)) return
      const v = k.split(' ')
      // Una variante de una sola palabra ("centro" por "microcentro") se limita a
      // la ciudad de la zona: si no, trae el centro de Roldán y de Funes.
      variantes.set(k, v.length === 1 && ciudad ? { ws: v, ciudad } : { ws: v })
    }
    for (const z of zonas) {
      const nombre = palabras(z.nombre).join(' ')
      agregar(nombre)
      // Tipeado el nombre: también sus alias de varias palabras ("barrio vida",
      // "vida club"), salvo los que son el nombre de OTRA zona ("san marino").
      if (frase === nombre) {
        for (const a of z.aliases ?? []) {
          const k = palabras(a).join(' ')
          if ((k.includes(' ') || /\d/.test(k) || k === 'microcentro') && !(nombres.has(k) && k !== nombre)) agregar(k)
        }
      }
    }
    // Frase que es comienzo de un nombre ("funes hills" → los tres Funes Hills) o
    // parte de un alias ("cadaques funes hills").
    for (const z of ZONAS) {
      const n = palabras(z.nombre).join(' ')
      if (n.startsWith(`${frase} `)) agregar(n)
      if (ws.length > 1 && (z.aliases ?? []).some(a => ` ${palabras(a).join(' ')} `.includes(` ${frase} `))) agregar(n)
    }
    // Zona con la ciudad en el nombre ("roldan norte", "funes centro"): vale el
    // resto dentro de esa ciudad ("norte" en Roldán), en cualquier orden.
    const ciudadEn = ws.find(w => CIUDADES.has(w))
    const resto = ws.filter(w => !CIUDADES.has(w))
    if (ciudadEn && resto.length) variantes.set(`${resto.join(' ')}@${ciudadEn}`, { ws: resto, ciudad: ciudadEn, soloUbicacion: true })
    out.push({
      mostrar: original.get(frase) ?? frase, palabras: ws, nombre: zonas[0].nombre, variantes: Array.from(variantes.values()), expande,
      esNombre: nombres.has(frase), zonas,
    })
  })
  out.sort((a, b) => b.palabras.length - a.palabras.length)
  FRASES_ZONA = out
  return out
}

/** "kcc", "tds", "tds1", "microcentro", "lasexta" → zona(s) que representan. */
function zonaDeUnaPalabra(t: string, frases: FraseZona[]): FraseZona | null {
  const exacta = frases.find(f => f.expande && f.palabras.length === 1 && f.palabras[0] === t)
  if (exacta) return exacta
  // Todo junto: "lasexta", "tierradesuenos".
  if (t.length >= 6) {
    const junta = frases.find(f => f.palabras.length > 1 && f.palabras.join('') === t)
    if (junta) return junta
  }
  // Sigla que es comienzo de alias: "tds" → "tds 1", "tds1", "tds roldan". Solo
  // siglas: la primera palabra de un nombre de zona ("san" de San Marino) no.
  if (t.length < 3 || t.length > 4 || primerasDeNombre().has(t)) return null
  const pref = frases.filter(f => f.expande && f.palabras[0].length <= 4 && f.palabras[0].startsWith(t) &&
    !primerasDeNombre().has(f.palabras[0]))
  if (!pref.length) return null
  const variantes = new Map<string, Variante>([[t, { ws: [t] }]])
  for (const f of pref) {
    for (const v of f.variantes) variantes.set(v.ws.join(' ') + (v.ciudad ? `@${v.ciudad}` : ''), v)
    // Y los nombres largos de esas zonas ("tierra de suenos", que también
    // aparece escrito "Tierra de sueños I").
    for (const z of f.zonas) {
      for (const a of z.aliases ?? []) {
        const k = palabras(a)
        if (k.length > 1 && !primerasDeNombre().has(k.join(' '))) variantes.set(k.join(' '), { ws: k })
      }
    }
  }
  return { mostrar: t.toUpperCase(), palabras: [t], nombre: t.toUpperCase(), variantes: Array.from(variantes.values()), expande: true, esNombre: false, zonas: [] }
}

function terminoZona(fz: FraseZona, tipeado: string, pos: number): Termino {
  return {
    crudo: tipeado,
    mostrar: tipeado === fz.palabras.join(' ') && !/^[a-z]{2,4}\d?$/.test(tipeado) ? fz.mostrar : undefined,
    variantes: fz.variantes.map(v => ({ ...v })),
    pos,
    parcial: false,
    deZona: true,
    soloLugar: true,
  }
}

// ─── Match ───────────────────────────────────────────────────────────────────

/** Puntaje de una palabra de búsqueda contra el aviso (0 = no aparece). */
/** ¿La frase aparece en el aviso como lugar? En la ubicación o el título, o en
 *  la dirección sin altura detrás ("Acequias del Aire, Roldán" sí; "San Martín
 *  753" no: esa es la calle). */
function comoLugar(e: Entrada, frase: string): boolean {
  if (e.lugar.includes(` ${frase} `)) return true
  let i = e.texto.indexOf(` ${frase} `)
  while (i >= 0) {
    const resto = e.texto.slice(i + frase.length + 2).split(' ')
    const esCalle = /^\d/.test(resto[0] ?? '') || (resto[0] === 'al' && /^\d/.test(resto[1] ?? ''))
    if (!esCalle) return true
    i = e.texto.indexOf(` ${frase} `, i + 1)
  }
  return false
}

function puntajePalabra(e: Entrada, w: string, parcial: boolean, sinTypos = false, soloLugar = false): number {
  const ws = soloLugar ? e.lugarPalabras : e.palabras
  if (ws.has(w)) return e.lugarPalabras.has(w) ? 4.5 : 4
  if (soloLugar && e.palabras.has(w) && comoLugar(e, w)) return 4
  // "centro" también es el Microcentro.
  if (w === 'centro' && ws.has('microcentro')) return 4
  const lista = soloLugar ? Array.from(e.lugarPalabras) : e.lista
  if (/^\d+$/.test(w)) {
    if (soloLugar) return 0
    // Altura de calle suelta ("1409"): misma cuadra.
    if (w.length >= 3) {
      const n = Number(w)
      if (e.alturas.some(a => Math.floor(a / 100) === Math.floor(n / 100) && (w.length >= 4 || a === n))) return 2.5
    }
    if (parcial) for (const x of lista) if (x.startsWith(w)) return 2
    return 0
  }
  // Prefijo: siempre para la palabra que se está tipeando y para palabras de
  // 4+ letras ("fisher" → "fisherton", "pichin" → "pichincha").
  if ((parcial && w.length >= 2) || w.length >= 4) {
    for (const x of lista) if (x.startsWith(w)) return 3
  }
  // Plural/singular simple.
  if (w.length >= 4) {
    if (w.endsWith('es') && ws.has(w.slice(0, -2))) return 3.5
    if (w.endsWith('s') && ws.has(w.slice(0, -1))) return 3.5
    if (ws.has(`${w}s`) || ws.has(`${w}es`)) return 3.5
  }
  if (sinTypos) return 0
  const tol = tolerancia(w.length)
  const fw = w.length >= 4 ? fonetica(w) : ''
  for (const x of lista) {
    if (x.length < 4 || /\d/.test(x)) continue
    if (tol && distancia(w, x, tol) <= tol) return 1.5
    // Fonética ("kentuki" → kentucky, "lagun" → lagoon).
    if (fw.length >= 4) {
      const fx = fonetica(x)
      if (fx === fw || (fw.length >= 5 && distancia(fw, fx, 1) <= 1)) return 1.4
    }
    // Palabra a medio escribir y con typo: contra el comienzo de la palabra.
    if (parcial && w.length >= 4 && x.length > w.length && distancia(w, x.slice(0, w.length), 1) <= 1) return 1.2
  }
  return 0
}

function puntajeVariante(e: Entrada, v: Variante, t: Termino): number {
  if (v.soloCiudad) return e.ciudad === v.soloCiudad ? 4 : 0
  if (v.ciudad && e.ciudad && e.ciudad !== v.ciudad) return 0
  const ws = v.ws
  if (v.soloUbicacion || t.soloUbicacion) {
    const frase = ws.join(' ')
    if (e.ubicacion.includes(` ${frase} `)) return 5
    if (t.parcial && e.ubicacion.includes(` ${frase}`)) return 4
    // Typo en un barrio escrito con "barrio" adelante ("barrio martn").
    if (ws.length === 1 && !t.sinTypos && tolerancia(ws[0].length) &&
      e.ubicacion.trim().split(' ').some(x => x.length >= 4 && distancia(ws[0], x, tolerancia(ws[0].length)) <= tolerancia(ws[0].length))) return 1.5
    return 0
  }
  if (v.altura != null) {
    // Calle + altura: la altura (misma cuadra) tiene que venir detrás de esa calle.
    for (let i = 0; i < e.lista.length; i++) {
      const hasta = i + ws.length
      if (!ws.every((w, k) => e.lista[i + k] === w || (w.length >= 4 && e.lista[i + k]?.startsWith(w)) ||
        (!t.sinTypos && tolerancia(w.length) > 0 && (e.lista[i + k]?.length ?? 0) >= 4 &&
          distancia(w, e.lista[i + k], tolerancia(w.length)) <= tolerancia(w.length)))) continue
      for (let k = hasta; k < Math.min(hasta + 3, e.lista.length); k++) {
        const x = e.lista[k]
        if (!/^\d{2,5}$/.test(x)) continue
        const a = Number(x)
        if (a === v.altura) return 6
        if (String(v.altura).length >= 3 && Math.floor(a / 100) === Math.floor(v.altura / 100)) return 4.5
      }
    }
    return 0
  }
  if (ws.length === 1) return puntajePalabra(e, ws[0], t.parcial, t.sinTypos, t.soloLugar)
  const donde = t.soloLugar ? e.lugar : e.texto
  const frase = ws.join(' ')
  if (t.soloLugar ? comoLugar(e, frase) : donde.includes(` ${frase} `)) return e.lugar.includes(` ${frase} `) ? 5.5 : 5
  if (t.parcial && donde.includes(` ${frase}`)) return 4
  if (t.deZona) return 0
  // Frase con algún typo: todas sus palabras, contiguas y en orden.
  const lista = t.soloLugar ? donde.trim().split(' ') : e.lista
  for (let i = 0; i + ws.length <= lista.length; i++) {
    let ok = true
    for (let k = 0; k < ws.length && ok; k++) {
      const x = lista[i + k]
      const w = ws[k]
      const tol = tolerancia(w.length)
      ok = x === w || (w.length >= 4 && x.startsWith(w)) ||
        (!t.sinTypos && tol > 0 && x.length >= 4 && distancia(w, x, tol) <= tol)
    }
    if (ok) return 3
  }
  return 0
}

function puntajeTermino(e: Entrada, t: Termino): number {
  let mejor = 0
  for (const v of t.variantes) {
    const s = puntajeVariante(e, v, t)
    if (s > mejor) mejor = s
  }
  if (!mejor && (t.prefijoTipos?.length || t.prefijoOps?.length)) {
    if (t.prefijoTipos?.some(k => e.tipos.has(k))) mejor = 2.5
    if (t.prefijoOps?.some(op => e.ops.has(op))) mejor = Math.max(mejor, 2)
  }
  return mejor
}

/** Peso de un término cuando hay que quedarse con parte: un lugar puntual pesa
 *  más que una ciudad, y una ciudad más que una palabra suelta. */
const GENERICOS = new Set(['norte', 'sur', 'este', 'oeste', 'centro', 'zona', 'barrio'])
function pesoTermino(t: Termino, indice?: Indice): number {
  if (t.variantes.every(v => v.ws.length === 1 && GENERICOS.has(v.ws[0]))) return 0.9
  if (t.deZona || t.soloLugar) return 1.3
  // Un barrio con nombre propio ("aurea", "aldea", "kentucky") pesa más que la
  // ciudad: "aurea funes" muestra Aurea (que está en Roldán) y lo avisa.
  const w = t.variantes.length === 1 && t.variantes[0].ws.length === 1 ? t.variantes[0].ws[0] : ''
  if (w.length >= 5 && indice?.vocabLugar.has(w)) return 1.3
  if (t.variantes.some(v => v.soloCiudad)) return 1.2
  return 1
}

function esAlquiler(op: string) { return op === 'Rent' || op === 'Temporary rent' }

/** El precio que muestra la card para la operación pedida (o la principal). */
function precioPara(e: Entrada, op: 'Sale' | 'Rent' | null): { price: number; currency: string; op: string } | null {
  if (e.p.web_price === false) return null
  const ops = (e.p.operations ?? []).filter(o => e.ops.has(o.operation_type))
  const elegida = (op ? ops.find(o => o.operation_type === op || (op === 'Rent' && esAlquiler(o.operation_type))) : null) ??
    ops.find(o => (o.prices ?? []).some(pr => pr.price > 0))
  const pr = elegida?.prices?.find(x => x.price > 0)
  return elegida && pr ? { price: pr.price, currency: pr.currency, op: elegida.operation_type } : null
}
function tieneOp(e: Entrada, op: 'Sale' | 'Rent', temporario = false): boolean {
  if (temporario) return e.ops.has('Temporary rent')
  return op === 'Rent' ? e.ops.has('Rent') || e.ops.has('Temporary rent') : e.ops.has('Sale')
}

// ¿Este precio se puede comparar con el monto buscado? Sin operación escrita,
// "hasta 150 mil" es una compra (no un alquiler de USD 1.300/mes), salvo que se
// pidan pesos; "hasta 800 dólares" es un alquiler.
function comparable(opType: string, moneda: string, v: number, opEscrita: boolean, monedaEscrita: Moneda | null): boolean {
  if (esAlquiler(opType)) {
    if (moneda === 'USD') return v < 15_000
    return opEscrita || monedaEscrita === 'ARS' ? v < 50_000_000 : false
  }
  return moneda === 'USD' ? v >= 3_000 : v >= 5_000_000
}

// Restricciones que se pueden aflojar, de la menos a la más importante.
type Llave = 'lugarComoCalle' | 'precioAncho' | 'superficieAncha' | 'dormsAncho' | 'banos' | 'cocheras' | 'superficie' | 'precio' |
  'moneda' | 'cerrado' | 'temporario' | 'dorms' | 'tiposParecidos' | 'terminosParcial' | 'terminosACiudad' |
  'terminos' | 'tipos' | 'operacion'

interface Chequeo { ok: boolean; score: number; terminosOk: number }

function cumpleTipos(e: Entrada, claves: TipoClave[]): number {
  if (claves.some(k => e.tipos.has(k) && TIPOS[k].ids[0] === e.p.type?.id)) return 2
  if (claves.some(k => e.tipos.has(k))) return 1.5
  if (claves.some(k => e.tiposTitulo.has(k))) return 1
  return 0
}

interface Contexto {
  /** Ciudad dominante de cada término (para "Funes City" sin casas → Funes). */
  ciudadDeTermino: Map<Termino, string>
  indice: Indice
}

function evaluar(e: Entrada, it: Interpretacion, flojas: Set<Llave>, ctx: Contexto): Chequeo {
  let score = 0
  const no = { ok: false, score: 0, terminosOk: 0 }
  if (it.codigo) return { ok: e.codigo === it.codigo || String(e.p.id) === it.codigo, score: 100, terminosOk: 0 }
  if (it.codigoPrefijo) {
    const ok = e.codigo.startsWith(it.codigoPrefijo) || String(e.p.id).startsWith(it.codigoPrefijo)
    if (!ok) return no
    score += 5
  }
  if (it.excluirTipos.length && it.excluirTipos.some(k => e.tipos.has(k))) return no
  if (it.tipos.length && !flojas.has('tipos')) {
    let s = cumpleTipos(e, it.tipos)
    if (!s && flojas.has('tiposParecidos')) {
      s = cumpleTipos(e, it.tipos.flatMap(k => TIPOS[k].parecido ?? [])) ? 0.5 : 0
      // Un campo no es un lote de country: solo tierra de verdad (media hectárea o más).
      if (s && it.tipos.every(k => k === 'campo') && (e.supLote ?? 0) < 5000) s = 0
    }
    if (!s) return no
    score += s
  }
  const op = it.operacion
  if (it.excluirOp && tieneOp(e, it.excluirOp) && !tieneOp(e, it.excluirOp === 'Sale' ? 'Rent' : 'Sale')) return no
  if (op && !flojas.has('operacion')) {
    if (!tieneOp(e, op, it.temporario && !flojas.has('temporario'))) return no
    score += 1
  }

  // Lugares y palabras. Con "terminosParcial" alcanza con cumplir algunos: el
  // corte (cuántos) lo decide buscar() según lo mejor que exista.
  let terminosOk = 0
  for (const t of it.terminos) {
    let s = puntajeTermino(e, t)
    if (!s && t.soloLugar && flojas.has('lugarComoCalle')) s = puntajeTermino(e, { ...t, soloLugar: false })
    if (!s && flojas.has('terminosACiudad')) {
      const c = ctx.ciudadDeTermino.get(t)
      if (c && e.ciudad === c) s = 0.5
    }
    if (s) { terminosOk += pesoTermino(t, ctx.indice); score += s }
  }
  const total = it.terminos.reduce((a, t) => a + pesoTermino(t, ctx.indice), 0)
  if (!flojas.has('terminos')) {
    if (terminosOk < total - 1e-9 && !flojas.has('terminosParcial')) return no
    if (flojas.has('terminosParcial') && it.terminos.length && !terminosOk) return no
  }
  for (const t of it.excluir) if (puntajeTermino(e, t) >= 3) return no

  if (it.noCerrado && e.cerrado) return no
  if (it.noMono && e.mono) return no
  if (it.sinCochera && (e.cocheras ?? 0) > 0) return no
  if (it.cerrado && !flojas.has('cerrado')) {
    if (!e.cerrado) return no
    score += 1
  }
  if ((it.mono || it.dorms || it.ambientes) && !flojas.has('dorms')) {
    const ancho = flojas.has('dormsAncho') ? 1 : 0
    if (it.mono) {
      if (!e.mono && !(ancho && e.dorms.includes(1))) return no
      score += e.mono ? 2 : 0
    }
    if (it.dorms) {
      const { min, max } = it.dorms
      const dentro = e.dorms.filter(d => d >= min - ancho && d <= max + ancho)
      if (!dentro.length) return no
      // Mejor si card y título dicen lo mismo que se pidió.
      score += e.dorms.every(d => d >= min && d <= max) ? 3.5 : dentro.some(d => d >= min && d <= max) ? 2.5 : 1
    }
    if (it.ambientes) {
      const { min, max } = it.ambientes
      // Ambientes = dormitorios + 1 (el living). Si no hay dormitorios cargados,
      // room_amount.
      const ambs = e.dorms.length ? e.dorms.map(d => d + 1) : e.ambientes != null ? [e.ambientes] : []
      const dentro = ambs.filter(a => a >= min - ancho && a <= max + ancho)
      if (!dentro.length) return no
      score += dentro.some(a => a >= min && a <= max) ? 2 : 0.5
    }
  }
  if (it.banos && !flojas.has('banos')) {
    if (e.banos == null || e.banos < it.banos) return no
    score += e.banos === it.banos ? 1 : 0.5
  }
  if (it.cocheras && !flojas.has('cocheras')) {
    if (e.cocheras == null || e.cocheras < it.cocheras) return no
    score += 0.5
  }
  if (it.superficie && !flojas.has('superficie')) {
    const { min, max, aprox } = it.superficie
    const ancho = flojas.has('superficieAncha')
    // Terrenos (o "casa con lote de 1000 m2"): la del lote. Construidos: la
    // cubierta/total.
    const pideLote = it.suaves.some(w => ['lote', 'lotes', 'terreno', 'terrenos'].includes(w))
    const pideCubierta = it.suaves.some(w => /^cubiert/.test(w))
    const quiereLote = pideLote || (it.tipos.length ? it.tipos.every(k => k === 'terreno' || k === 'campo') : e.supLote != null && !e.supCubierta.length)
    const cubierta = pideCubierta && num(e.p.roofed_surface) != null ? [num(e.p.roofed_surface)!] : e.supCubierta
    const sups = quiereLote ? (e.supLote != null ? [e.supLote] : []) : cubierta.length ? cubierta : e.supLote != null ? [e.supLote] : []
    const ok = sups.some(v => {
      if (min != null && max != null) return v >= min * (ancho ? 0.85 : 1) && v <= max * (ancho ? 1.15 : 1)
      if (min != null) return v >= min * (ancho ? 0.85 : 1)
      if (max != null) return v <= max * (ancho ? 1.15 : 1)
      if (aprox != null) return v >= aprox * (ancho ? 0.6 : 0.8) && v <= aprox * (ancho ? 1.6 : 1.25)
      return true
    })
    if (!ok) return no
    if (aprox) score += 2 - Math.min(2, Math.min(...sups.map(v => Math.abs(v - aprox))) / aprox * 4)
  }
  if ((it.precio || it.moneda) && !flojas.has('precio') && !(it.moneda && !it.precio && flojas.has('moneda'))) {
    const min = it.precio?.min
    const max = it.precio?.max
    const moneda = it.precio?.moneda ?? it.moneda
    const ref = max ?? min ?? 0
    const k = flojas.has('precioAncho') ? 0.15 : 0
    if (e.p.web_price === false) return no
    const ok = (e.p.operations ?? []).some(o => {
      if (!e.ops.has(o.operation_type)) return false
      if (op && !flojas.has('operacion') && !(o.operation_type === op || (op === 'Rent' && esAlquiler(o.operation_type)))) return false
      return (o.prices ?? []).some(pr => pr.price > 0 &&
        (!moneda || pr.currency === moneda) &&
        (!it.precio || comparable(o.operation_type, pr.currency, ref, !!op, moneda)) &&
        (min == null || pr.price >= min * (1 - k)) && (max == null || pr.price <= max * (1 + k)))
    })
    if (!ok) return no
    score += 1
  }
  // Suaves: suman si aparecen, no filtran. Las negadas ("sin pileta") restan.
  for (const w of it.suaves) {
    if ((e.titulo.has(w) || puntajePalabra(e, w, false, true) >= 3) && !e.ubicacion.includes(` ${w} `)) score += 1.5
    if ((w === 'cochera' || w === 'cocheras' || w === 'garage' || w === 'garaje') && (e.cocheras ?? 0) > 0) score += 1
    // "grande", "mucho terreno": las más grandes primero; "chico": al revés.
    const sup = e.supLote ?? e.supCubierta[0] ?? null
    if (sup && ['grande', 'grandes', 'amplio', 'amplia', 'enorme', 'gran', 'mucho'].includes(w)) score += Math.log10(sup) / 2
    if (sup && ['chico', 'chica', 'chiquito', 'chiquita', 'pequeno', 'pequena'].includes(w)) score -= Math.log10(sup) / 2
  }
  for (const w of it.suavesNegadas) if (e.titulo.has(w) || puntajePalabra(e, w, false, true) >= 3) score -= 2
  // Sin tipo escrito, primero vivienda (no cocheras ni galpones); sin
  // operación, primero ventas.
  if (!it.tipos.length) score += e.tipos.has('casa') || e.tipos.has('departamento') || e.tipos.has('ph') ? 0.8 : e.tipos.has('terreno') ? 0.4 : 0
  if (!op && !it.orden) score += e.ops.has('Sale') ? 0.4 : 0
  if (e.p.is_starred_on_web) score += 0.3
  return { ok: true, score, terminosOk }
}

// ─── Búsqueda ────────────────────────────────────────────────────────────────

export interface Resultado {
  /** ids en orden de relevancia. */
  ids: number[]
  score: Map<number, number>
  /** Posición de cada id en el orden final (relevancia, o precio si se pidió). */
  rango: Map<number, number>
  interpretacion: Interpretacion
  /** True si hubo que aflojar algo para no dejar la lista vacía. */
  aproximado: boolean
  /** Qué se aflojó, en lenguaje humano. */
  aflojado: string[]
  /** Etiquetas de lo que se entendió, para mostrar arriba del listado. */
  etiquetas: string[]
  /** Orden pedido con palabras ("barato", "lo más caro", "novedades"), o por
   *  precio cuando se soltó el tope ("hasta 50 mil" sin nada: lo más cercano). */
  orden: 'barato' | 'caro' | 'recientes' | null
}

function escalera(it: Interpretacion): Llave[][] {
  const tipoPrimero = it.tipos.length > 0 && it.tipos.every(k => TIPOS_DUROS.includes(k))
  const lugar: Llave[][] = [
    // "san martin roldan": como barrio no hay, como calle sí.
    ['lugarComoCalle'],
    ['terminosParcial'],
    // Un barrio sin nada de lo pedido → su ciudad ("casa en Funes City" → casas en Funes).
    ['terminosACiudad'],
    // Un galpón en Kentucky no existe: quien busca un galpón quiere galpones, así
    // que antes de soltar el tipo se suelta el lugar.
    ['terminos'],
  ]
  return [
    ['precioAncho', 'superficieAncha'],
    ['dormsAncho'],
    ['banos', 'cocheras'],
    ['superficie'],
    ['temporario'],
    ['precio', 'moneda'],
    ['cerrado'],
    // Local/galpón/terreno: mejor el mismo tipo en otro lado que otro tipo acá.
    ...(tipoPrimero ? lugar : []),
    ['tiposParecidos'],
    ['dorms'],
    ...(tipoPrimero ? [] : lugar),
    // Terreno/galpón/local: el tipo pesa más que la operación; vivienda, al revés.
    ...(tipoPrimero ? [['operacion'], ['tipos']] as Llave[][] : [['tipos'], ['operacion']] as Llave[][]),
  ]
}

/** Une palabras vecinas que en algún aviso forman una frase ("san juan",
 *  "lisandro de la torre", "tierra nueva"), ata la altura a su calle ("cordoba
 *  1500") y separa/junta palabras pegadas o partidas ("tierranueva",
 *  "dock garden"). */
function afinarTerminos(indice: Indice, it: Interpretacion) {
  const hayFrase = (f: string, prefijo = false) =>
    indice.entradas.some(e => e.texto.includes(prefijo ? ` ${f}` : ` ${f} `))
  const simple = (t: Termino) => !t.deZona && !t.union && t.variantes.length === 1 &&
    t.variantes[0].ws.length === 1 && !t.variantes[0].soloCiudad && t.variantes[0].altura == null
  const finDe = (t: Termino) => t.fin ?? t.pos
  // "vida" (alias que se expande a los tres Vida) + "jardin" = "Vida Jardín".
  for (let i = 0; i + 1 < it.terminos.length; i++) {
    const a = it.terminos[i]
    const b = it.terminos[i + 1]
    if (!a.deZona || a.union || a.crudo.includes(' ') || !simple(b) || b.pos !== finDe(a) + 1) continue
    const frase = `${a.crudo} ${b.variantes[0].ws[0]}`
    if (hayFrase(frase) || (b.parcial && hayFrase(frase, true))) {
      it.terminos.splice(i, 2, { crudo: frase, variantes: [{ ws: frase.split(' ') }], pos: a.pos, fin: finDe(b), parcial: b.parcial })
    }
  }
  const out: Termino[] = []
  for (let i = 0; i < it.terminos.length; i++) {
    const t = it.terminos[i]
    if (!simple(t)) { out.push(t); continue }
    // Frase con lo que haya entre medio en la consulta ("lisandro de la torre").
    let fin = i
    let frase = t.variantes[0].ws
    for (let j = i + 1; j < it.terminos.length && j - i <= 3; j++) {
      const sig = it.terminos[j]
      if (!simple(sig)) break
      const entre = it.toks.slice(finDe(it.terminos[j - 1]) + 1, sig.pos)
      if (entre.some(w => !['de', 'del', 'la', 'las', 'los', 'el'].includes(w)) || entre.length > 2) break
      const cands = [[...frase, sig.variantes[0].ws[0]], [...frase, ...entre, sig.variantes[0].ws[0]]]
      const ok = cands.find(c => hayFrase(c.join(' ')) || (sig.parcial && hayFrase(c.join(' '), true)))
      if (!ok) break
      frase = ok
      fin = j
    }
    if (fin > i) {
      const ts = it.terminos.slice(i, fin + 1)
      const f: Termino = { crudo: frase.join(' '), variantes: [{ ws: frase }], pos: t.pos, fin: finDe(ts[ts.length - 1]), parcial: ts[ts.length - 1].parcial }
      // Si esa frase es el nombre de un lugar ("tierra nueva", "san lorenzo"), se
      // busca como lugar: no la calle del mismo nombre.
      if (indice.entradas.some(e => e.ubicacion.includes(` ${f.crudo} `))) f.soloLugar = true
      out.push(f)
      i = fin
      continue
    }
    // Pegadas: "dock" + "garden" → "dockgarden".
    const sig = it.terminos[i + 1]
    if (sig && simple(sig) && indice.vocab.has(frase[0] + sig.variantes[0].ws[0])) {
      const junto = frase[0] + sig.variantes[0].ws[0]
      out.push({ crudo: `${t.crudo} ${sig.crudo}`, variantes: [{ ws: [junto] }, { ws: [frase[0], sig.variantes[0].ws[0]] }], pos: t.pos, fin: finDe(sig), parcial: sig.parcial })
      i++
      continue
    }
    out.push(t)
  }

  // Calle + altura ("pellegrini 2632", "san martin 700", "san juan al 2000"):
  // la altura tiene que estar pegada a ESA calle. Si esa altura no existe, se
  // busca la calle y se avisa ("cordoba 1500" no es el pasaje 1519).
  const esNumero = (t: Termino) => simple(t) && /^\d{2,5}$/.test(t.variantes[0].ws[0])
  const conAltura: Termino[] = []
  for (let i = 0; i < out.length; i++) {
    const t = out[i]
    const sig = out[i + 1]
    const pegado = sig && it.toks.slice(finDe(t) + 1, sig.pos).every(w => ['al', 'n', 'nro', 'numero', 'altura'].includes(w))
    if (sig && pegado && esNumero(sig) && !esNumero(t) && !t.union && !t.variantes.some(v => v.soloCiudad) &&
      (t.deZona || t.variantes.length === 1)) {
      const calle = t.deZona ? t.crudo.split(' ') : t.variantes[0].ws
      const altura = Number(sig.variantes[0].ws[0])
      const cand: Termino = { crudo: `${t.crudo} ${sig.crudo}`, variantes: [{ ws: calle, altura }], pos: t.pos, fin: finDe(sig), parcial: sig.parcial }
      if (indice.entradas.some(e => puntajeVariante(e, cand.variantes[0], cand) > 0)) {
        conAltura.push(cand)
        i++
        continue
      }
      if (String(altura).length >= 3) {
        // La calle sí, esa altura no (y si se está tipeando, todavía no se dice nada).
        conAltura.push({ ...t, soloLugar: false, deZona: false, variantes: [{ ws: calle }] })
        if (!sig.parcial) it.ignoradas.push(`${capitalizar(t.crudo)} ${altura}`)
        i++
        continue
      }
    }
    conAltura.push(t)
  }

  // Partidas: "tierranueva" → "tierra nueva", "funescity" → "funes city".
  for (const t of conAltura) {
    if (!simple(t)) continue
    const w = t.variantes[0].ws[0]
    if (w.length < 7 || indice.vocab.has(w)) continue
    for (let k = 3; k <= w.length - 3; k++) {
      const a = w.slice(0, k)
      const b = w.slice(k)
      if (indice.vocab.has(a) && indice.vocab.has(b) && hayFrase(`${a} ${b}`)) { t.variantes.push({ ws: [a, b] }); t.suave = false; break }
    }
  }
  // Sinónimos: un tríplex también es un dúplex para quien busca varias plantas.
  for (const t of conAltura) {
    if (simple(t) && t.variantes[0].ws[0] === 'triplex') t.variantes.push({ ws: ['duplex'] })
  }
  // Lo que no formó frase: suaves ordenan, números chicos sueltos ("familia de 4")
  // no filtran.
  it.terminos = conAltura.filter(t => {
    if (t.suave && simple(t)) { it.suaves.push(t.variantes[0].ws[0]); return false }
    if (t.numeroSuelto && simple(t)) { it.suaves.push(t.crudo); return false }
    return true
  })
  // Un nombre de barrio que también es calle ("martin", "belgrano", "centro"):
  // se busca como lugar. La calle se busca con altura ("san martin 700").
  for (const t of it.terminos) {
    if (!simple(t) || t.soloLugar) continue
    const w = t.variantes[0].ws[0]
    if (/\d/.test(w) || !indice.vocabLugar.has(w)) continue
    const enUbicacion = indice.entradas.filter(e => e.lugarPalabras.has(w)).length
    const enCalle = indice.entradas.filter(e => e.palabras.has(w) && !e.lugarPalabras.has(w)).length
    if (enUbicacion && enCalle) t.soloLugar = true
  }
  // Una frase que es una localidad ("san lorenzo") se busca como ciudad.
  for (const t of it.terminos) {
    if (t.variantes.length !== 1 || t.variantes[0].altura != null) continue
    const f = t.variantes[0].ws.join(' ')
    if (CIUDADES_FRASE.has(f)) {
      t.variantes = [{ ws: [], soloCiudad: f === 'puerto gral san martin' ? 'puerto general san martin' : f }]
      t.crudo = CIUDADES_FRASE.get(f)!
    }
  }
}

/** Una palabra "completa" (no a medio escribir): existe tal cual en el inventario. */
function completa(indice: Indice, t: Termino): boolean {
  // Números a medio tipear ("casa 20" → "casa 200 mil") nunca están completos.
  if (t.parcial && /^\d+$/.test(t.crudo)) return false
  return t.variantes.some(v => (v.soloCiudad ? true : v.ws.length > 0 && v.ws.every(w => indice.vocab.has(w))))
}

export function buscar(indice: Indice, query: string): Resultado | null {
  const r = buscarInterno(indice, query)
  if (!r || !/\S$/.test(query)) return r
  // La última palabra está a medio escribir: si con ella la lista se vacía o hay
  // que aflojar algo, se muestra lo que ya estaba escrito. Evita el parpadeo
  // "casa hasta" → vacío → "casa hasta 200 mil" → bien.
  const malo = r.aproximado || !r.ids.length
  const q = query.trim()
  // Frase abierta ("lote en tierra de…"): lo de antes de la frase.
  if (malo && /\s(de|del|la|las|los|el)$/.test(q)) {
    const antes = q.split(/\s+/).slice(0, -2).join(' ')
    if (!antes) return null
    const estable = buscar(indice, `${antes} `)
    if (estable && estable.ids.length) return estable
  }
  // Una o dos letras sueltas al final ("lote en tierra de s"): todavía nada.
  if (malo && /(^|\s)[a-z]{1,2}$/i.test(q)) {
    const sin = q.replace(/\S+$/, '').trimEnd()
    return sin ? buscar(indice, sin) : null
  }
  const it = r.interpretacion
  const ult = it.terminos.find(t => t.parcial)
  const ultimaPalabra = palabras(query).at(-1) ?? ''
  // Ignorada y corta ("xy"): se está tipeando. Una palabra de 4+ letras que no
  // existe ("plaza", "sur") se informa.
  const ultimaIgnorada = ultimaPalabra.length < 4 && !indice.vocab.has(ultimaPalabra) && it.ignoradas.length > 0 &&
    normalizar(it.ignoradas[it.ignoradas.length - 1]) === ultimaPalabra
  // Un número al final se está tipeando ("casa 20" → "casa 200 mil").
  const numeroEnCurso = /\d$/.test(ultimaPalabra) && ultimaPalabra.length <= 6 && !it.codigo && !it.codigoPrefijo && !it.codigoBuscado
  const enProceso = (ult && !completa(indice, ult)) || ultimaIgnorada || numeroEnCurso
  if (enProceso && (malo || ultimaIgnorada)) {
    const sin = q.replace(/\S+$/, '').trimEnd()
    if (!sin) return null
    const estable = buscar(indice, sin)
    if (estable && (estable.ids.length || !r.ids.length)) return estable
  }
  return r
}

function buscarInterno(indice: Indice, query: string): Resultado | null {
  const it = interpretar(query, indice)
  if (it.vacia) return null
  afinarTerminos(indice, it)

  // Sin corrección de typos para lo que existe tal cual: "aurea" es el barrio
  // Aurea, no "Aérea"; "pasos" no es "pesos".
  for (const t of [...it.terminos, ...it.excluir]) {
    t.sinTypos = t.variantes.every(v => v.soloCiudad || v.ws.length > 1) ||
      indice.entradas.some(e => t.variantes.some(v => v.ws.length === 1 && puntajePalabra(e, v.ws[0], t.parcial, true, t.soloLugar) >= 3))
  }

  // La guarda de ciudad de un alias ("centro" por "microcentro" → Rosario) solo
  // hace falta si esa palabra existe en varias ciudades; si no, sobra (y el
  // catálogo de zonas a veces tiene mal la ciudad: Dockgarden está en Rosario).
  for (const t of it.terminos) {
    for (const v of t.variantes) {
      if (!v.ciudad || v.ws.length !== 1 || v.altura != null) continue
      const cs = new Set(indice.entradas.filter(e => e.lugarPalabras.has(v.ws[0])).map(e => e.ciudad))
      if (cs.size <= 1) delete v.ciudad
    }
  }

  // Palabras que no aparecen en NINGÚN aviso: se ignoran y se informan.
  const conocidos: Termino[] = []
  for (const t of it.terminos) {
    if (indice.entradas.some(e => puntajeTermino(e, t) > 0)) { conocidos.push(t); continue }
    // "funes sur", "roldan este": el barrio no está, pero la ciudad sí.
    const ciudad = t.crudo.split(' ').find(w => CIUDADES.has(w))
    if (ciudad && t.crudo.includes(' ')) {
      conocidos.push({ crudo: CIUDADES.get(ciudad)!, variantes: [{ ws: [], soloCiudad: ciudad }], pos: t.pos, parcial: false })
      it.ignoradas.push(capitalizar(t.crudo.split(' ').filter(w => w !== ciudad).join(' ')))
      continue
    }
    // "tds 3", "tierra de sueños 3": no hay en esa etapa → las otras.
    const sinNumero = t.crudo.replace(/\s*\d+$/, '')
    if (sinNumero !== t.crudo && sinNumero.length >= 3) {
      const fam = zonaDeUnaPalabra(sinNumero.replace(/\s+/g, ''), construirFrasesZona()) ??
        construirFrasesZona().find(f => f.palabras.join(' ') === sinNumero)
      if (fam) {
        const alt = terminoZona(fam, sinNumero, t.pos)
        if (indice.entradas.some(e => puntajeTermino(e, alt) > 0)) {
          conocidos.push(alt)
          it.ignoradas.push(esSigla(sinNumero) ? t.crudo.toUpperCase() : capitalizar(t.crudo))
          continue
        }
      }
    }
    // A medio escribir, corta y sin coincidencias: todavía no es nada.
    if (t.parcial && t.crudo.length < 4) continue
    it.ignoradas.push(esSigla(t.crudo) ? t.crudo.toUpperCase() : t.crudo)
  }
  it.terminos = conocidos
  MOSTRAR = { indice, originales: it.originales }
  it.ignoradas = it.ignoradas.map(w => (/[A-ZÁÉÍÓÚÑ]/.test(w) && /[áéíóúñ]/i.test(w) ? w
    : esSigla(normalizar(w).replace(/\s+/g, '')) ? w.toUpperCase()
      : capitalizar(normalizar(w).split(' ').map(x => it.originales.get(x) ?? x).join(' '))))

  // Código pedido que no existe: vacío, con el aviso (no se toma como precio).
  if (it.codigoBuscado) {
    return { ids: [], score: new Map(), rango: new Map(), interpretacion: it, aproximado: false, aflojado: [], etiquetas: [`Código ${it.codigoBuscado.toUpperCase()}`], orden: null }
  }

  const sinRestricciones = () => !it.codigo && !it.codigoPrefijo && !it.tipos.length && !it.operacion &&
    !it.terminos.length && !it.dorms && !it.ambientes && !it.mono && !it.superficie && !it.precio && !it.moneda &&
    !it.cerrado && !it.noCerrado && !it.banos && !it.cocheras && !it.excluir.length && !it.excluirTipos.length && !it.excluirOp
  // Solo características ("pileta", "golf"): ahí sí filtran, porque es todo lo
  // que se pidió ("pileta" y "piscina" son lo mismo).
  if (sinRestricciones() && it.suaves.length) {
    const ws = unicos(it.suaves.filter(w => !/^\d+$/.test(w)).map(w => (w === 'piscina' ? 'pileta' : w)))
    const raiz = (w: string) => (w.length >= 8 ? w.slice(0, w.length - 3) : w)
    const ts: Termino[] = ws.map((w, k) => ({
      crudo: w, pos: 900 + k, parcial: false, sinTypos: true,
      variantes: w === 'pileta' ? [{ ws: ['pileta'] }, { ws: ['piscina'] }] : unicos([w, raiz(w)]).map(x => ({ ws: [x] })),
    }))
    const existen = ts.filter(t => indice.entradas.some(e => puntajeTermino(e, t) > 0))
    if (existen.length) { it.terminos = existen; it.suaves = [] }
  }
  // Solo palabras que no existen ("xyzw", "ibarlucea"): lista vacía y se dice qué
  // no se encontró, en vez de mostrar todo como si se hubiera entendido. Si
  // además se entendió un orden ("lo más barato que hay"), se ordena todo.
  if (sinRestricciones() && it.ignoradas.length && !it.orden) {
    return { ids: [], score: new Map(), rango: new Map(), interpretacion: it, aproximado: false, aflojado: [], etiquetas: [], orden: null }
  }

  // Ciudad dominante de cada término (para caer del barrio a su ciudad).
  const ctx: Contexto = { ciudadDeTermino: new Map(), indice }
  for (const t of it.terminos) {
    if (t.variantes.some(v => v.soloCiudad)) continue
    const cs = indice.entradas.filter(e => puntajeTermino(e, t) > 0).map(e => e.ciudad).filter(Boolean) as string[]
    const cont = new Map<string, number>()
    cs.forEach(c => cont.set(c, (cont.get(c) ?? 0) + 1))
    cont.forEach((n, c) => { if (n >= cs.length * 0.8 && cs.length) ctx.ciudadDeTermino.set(t, c) })
  }

  type Hit = { id: number; score: number; terminosOk: number }
  const correr = (flojas: Set<Llave>): Hit[] => {
    let hs: Hit[] = []
    for (const e of indice.entradas) {
      const c = evaluar(e, it, flojas, ctx)
      if (c.ok) hs.push({ id: e.p.id, score: c.score, terminosOk: c.terminosOk })
    }
    if ((flojas.has('terminosParcial') || flojas.has('terminosACiudad')) && !flojas.has('terminos') && hs.length) {
      // Lo más parecido: los que cumplen más (y más importantes) palabras.
      const mejor = Math.max(...hs.map(h => h.terminosOk))
      hs = hs.filter(h => h.terminosOk >= mejor - 1e-9)
    }
    return hs
  }
  let flojas = new Set<Llave>()
  let hits = correr(flojas)
  const pasos = escalera(it)
  for (let paso = 0; paso < pasos.length && !hits.length && !it.codigo; paso++) {
    const llaves = pasos[paso].filter(k => aplica(it, k, ctx))
    if (!llaves.length) continue
    for (const k of llaves) flojas.add(k)
    hits = correr(flojas)
  }
  // Aflojar lo mínimo: se vuelve a ajustar todo lo que no hizo falta soltar
  // (si sin el tope de precio ya aparece la de 3 dormitorios, los dormitorios
  // no se tocan).
  if (hits.length && flojas.size > 1) {
    for (const k of Array.from(flojas).reverse()) {
      const prueba = new Set(Array.from(flojas).filter(x => x !== k))
      const hs = correr(prueba)
      if (hs.length) { flojas = prueba; hits = hs }
    }
  }
  const aflojado: string[] = []
  const hitsE = hits.map(h => indice.porId.get(String(h.id))!)
  Array.from(flojas).forEach(k => {
    const d = describirFloja(it, k, flojas, hitsE, ctx)
    if (d) aflojado.push(d)
  })
  // No hay campos: los terrenos más grandes primero.
  if (flojas.has('tiposParecidos') && it.tipos.includes('campo')) {
    for (const h of hits) h.score += Math.log10(indice.porId.get(String(h.id))!.supLote ?? 1)
  }
  hits.sort((a, b) => b.score - a.score)
  // Se soltó el tope de precio: lo más cercano al presupuesto primero.
  const orden = it.orden ?? (flojas.has('precio') && it.precio?.max != null ? 'barato'
    : flojas.has('precio') && it.precio?.min != null ? 'caro' : null)
  if (orden === 'recientes') hits.sort((a, b) => b.id - a.id)
  if (orden === 'barato' || orden === 'caro') {
    // Por precio, sin mezclar peras con manzanas: ventas antes que alquileres
    // (salvo que se haya pedido alquiler), vivienda antes que cocheras o locales
    // (salvo que se haya pedido un tipo), dólares antes que pesos en venta y
    // pesos antes que dólares en alquiler. Sin precio publicado, al final.
    const clave = (h: Hit) => {
      const e = indice.porId.get(String(h.id))!
      const pr = precioPara(e, it.operacion)
      const alquiler = pr ? esAlquiler(pr.op) : false
      const vivienda = e.tipos.has('casa') || e.tipos.has('departamento') || e.tipos.has('ph')
      return {
        grupo: (it.operacion ? 0 : alquiler ? 2 : 0) + (it.tipos.length ? 0 : vivienda ? 0 : 1),
        moneda: pr ? (pr.currency === (alquiler ? 'ARS' : 'USD') ? 0 : 1) : 2,
        precio: pr?.price ?? 0,
      }
    }
    const k = new Map(hits.map(h => [h.id, clave(h)]))
    hits.sort((a, b) => {
      const ka = k.get(a.id)!
      const kb = k.get(b.id)!
      if (ka.grupo !== kb.grupo) return ka.grupo - kb.grupo
      if (ka.moneda !== kb.moneda) return ka.moneda - kb.moneda
      return orden === 'barato' ? ka.precio - kb.precio : kb.precio - ka.precio
    })
  }
  return {
    ids: hits.map(h => h.id),
    score: new Map(hits.map(h => [h.id, h.score])),
    rango: new Map(hits.map((h, i) => [h.id, i])),
    interpretacion: it,
    aproximado: Array.from(flojas).some(k => k !== 'lugarComoCalle') && hits.length > 0,
    aflojado: unicos(aflojado),
    etiquetas: etiquetas(it, indice),
    orden,
  }
}

function aplica(it: Interpretacion, k: Llave, ctx: Contexto): boolean {
  switch (k) {
    case 'lugarComoCalle': return it.terminos.some(t => t.soloLugar)
    case 'precioAncho': case 'precio': return !!it.precio
    case 'moneda': return !!it.moneda
    case 'superficieAncha': case 'superficie': return !!it.superficie
    case 'dormsAncho': case 'dorms': return !!(it.dorms || it.ambientes || it.mono)
    case 'banos': return !!it.banos
    case 'cocheras': return !!it.cocheras
    case 'cerrado': return it.cerrado
    case 'temporario': return it.temporario
    case 'terminosParcial': return it.terminos.length > 1
    case 'terminosACiudad': return it.terminos.some(t => ctx.ciudadDeTermino.has(t))
    case 'terminos': return (it.tipos.length > 0 || !!it.operacion) && it.terminos.length > 0
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

function textoRango(r: Rango, uno: string, varios: string): string {
  const u = (n: number) => (n === 1 ? uno : varios)
  if (r.min === 0 && r.max === 1 && uno === 'dormitorio') return 'monoambiente o 1 dormitorio'
  if (r.min === r.max) return `${r.min} ${u(r.min)}`
  if (r.max >= 99) return `${r.min}+ ${varios}`
  if (r.min <= 0) return `hasta ${r.max} ${u(r.max)}`
  return `${r.min} a ${r.max} ${varios}`
}

function textoDorms(it: Interpretacion): string {
  if (it.mono) return 'monoambiente'
  if (it.ambientes) return textoRango(it.ambientes, 'ambiente', 'ambientes')
  if (!it.dorms) return ''
  return textoRango(it.dorms, 'dormitorio', 'dormitorios')
}

function textoSuperficie(s: NonNullable<Interpretacion['superficie']>): string {
  if (s.min != null && s.max != null) return `${fmt(s.min)} a ${fmt(s.max)} m²`
  if (s.min != null) return `más de ${fmt(s.min)} m²`
  if (s.max != null) return `hasta ${fmt(s.max)} m²`
  return `~${fmt(s.aprox ?? 0)} m²`
}

const MENORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'o', 'e', 'en', 'al'])
function capitalizar(s: string): string {
  return s.split(' ').map((w, i) => (i > 0 && MENORES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
}
function primeraMayuscula(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1) }

/** "kcc", "tds": siglas (sin vocales) → en mayúsculas. */
function esSigla(w: string): boolean {
  return /^[b-df-hj-np-tv-z]{2,4}\d?$/.test(w) && !RELLENO.has(w)
}

function textoTipos(ks: TipoClave[]) {
  return ks.map(k => TIPOS[k].plural.toLowerCase()).join(' o ').replace(/\bph\b/g, 'PH')
}

// Cómo mostrar una palabra: como la escribió la persona (si tenía tildes), como
// aparece en los avisos, o corregida si tenía un error ("rosairo" → Rosario).
let MOSTRAR: { indice: Indice; originales: Map<string, string> } | null = null
function palabraVisible(w: string): string {
  if (!MOSTRAR || /^\d+$/.test(w) || MENORES.has(w)) return w
  const { indice, originales } = MOSTRAR
  if (originales.has(w)) return originales.get(w)!
  if (indice.vocab.has(w)) return indice.forma.get(w) ?? w
  // Error de tipeo: la palabra del inventario más parecida (si hay una sola clara).
  const tol = tolerancia(w.length)
  if (tol) {
    let mejor: string | null = null
    let mejorD = tol + 1
    indice.vocab.forEach(x => {
      if (x.length < 4 || /\d/.test(x) || Math.abs(x.length - w.length) > tol) return
      const d = distancia(w, x, tol)
      if (d < mejorD) { mejorD = d; mejor = x }
    })
    if (mejor) return indice.forma.get(mejor) ?? mejor
  }
  return w
}

function nombreTermino(t: Termino): string {
  if (t.mostrar) return t.mostrar
  if (t.variantes.every(v => v.soloCiudad)) return t.crudo
  if (esSigla(t.crudo)) return t.crudo.toUpperCase()
  if (/^\d+$/.test(t.crudo)) return t.crudo
  return capitalizar(t.crudo.split(' ').map(palabraVisible).join(' '))
}

const esTerminoDeLugar = (t: Termino) => !!(t.deZona || t.soloLugar || t.variantes.some(v => v.soloCiudad))

function describirFloja(it: Interpretacion, k: Llave, flojas: Set<Llave>, hits: Entrada[], ctx: Contexto): string | null {
  const nombre = (t: Termino) => `«${nombreTermino(t)}»`
  const ciudad = (c: string) => CIUDADES.get(c) ?? CIUDADES_FRASE.get(c) ?? capitalizar(c)
  switch (k) {
    case 'lugarComoCalle': return null
    case 'precioAncho': {
      if (flojas.has('precio') || !it.precio) return null
      const p = it.precio
      return `precio un poco más flexible (${textoPrecio({ ...p, min: p.min != null ? p.min * 0.85 : undefined, max: p.max != null ? p.max * 1.15 : undefined })})`
    }
    case 'superficieAncha':
      return flojas.has('superficie') || !it.superficie ? null : `superficie aproximada (${textoSuperficie(it.superficie).replace('~', 'alrededor de ')})`
    case 'dormsAncho': {
      if (flojas.has('dorms')) return null
      if (it.mono) return 'monoambientes o de 1 dormitorio'
      if (it.dorms) return `${Math.max(0, it.dorms.min - 1)} a ${Math.min(99, it.dorms.max + 1)} dormitorios`.replace(/^0 a /, 'hasta ')
      if (it.ambientes) return `${Math.max(1, it.ambientes.min - 1)} a ${it.ambientes.max + 1} ambientes`
      return null
    }
    case 'banos': return `con menos de ${it.banos} baño${it.banos === 1 ? '' : 's'}`
    case 'cocheras': return `con menos de ${it.cocheras} cochera${it.cocheras === 1 ? '' : 's'}`
    case 'precio': return it.precio ? `sin el filtro de precio (${textoPrecio(it.precio)})` : null
    case 'moneda': return it.moneda ? `también en ${it.moneda === 'ARS' ? 'dólares' : 'pesos'}` : null
    case 'superficie': return it.superficie ? `sin el filtro de superficie (${textoSuperficie(it.superficie).replace('~', 'alrededor de ')})` : null
    case 'dorms': return textoDorms(it) ? `sin el filtro de ${textoDorms(it)}` : null
    case 'cerrado': return 'también fuera de barrio cerrado'
    case 'temporario': return 'alquileres comunes (no hay temporarios)'
    case 'tiposParecidos': return flojas.has('tipos') ? null : `parecidos a ${textoTipos(it.tipos)}`
    case 'terminosParcial': case 'terminosACiudad': {
      if (flojas.has('terminos') || (k === 'terminosParcial' && flojas.has('terminosACiudad'))) return null
      // Las palabras que no cumplen todos los resultados.
      const faltan = it.terminos.filter(t => !hits.every(e => puntajeTermino(e, t) > 0))
      if (!faltan.length) return null
      const ninguno = faltan.filter(t => !hits.some(e => puntajeTermino(e, t) > 0))
      const conCiudad = (t: Termino) => {
        const c = ctx.ciudadDeTermino.get(t)
        return flojas.has('terminosACiudad') && c && hits.every(e => e.ciudad === c)
          ? `en ${ciudad(c)}, fuera de ${nombre(t)}` : null
      }
      if (ninguno.length === faltan.length) {
        return faltan.map(t => conCiudad(t) ?? (esTerminoDeLugar(t) ? `fuera de ${nombre(t)}` : `sin ${nombre(t)}`)).join(' · ')
      }
      return `coinciden con ${faltan.map(nombre).join(' o con ')}, no con todo`
    }
    case 'terminos': {
      const lugares = it.terminos.filter(esTerminoDeLugar)
      const otros = it.terminos.filter(t => !esTerminoDeLugar(t))
      return [lugares.length ? `fuera de ${lugares.map(nombre).join(', ')}` : '', otros.length ? `sin ${otros.map(nombre).join(', ')}` : '']
        .filter(Boolean).join(' · ')
    }
    case 'tipos': return `otros tipos además de ${textoTipos(it.tipos)}`
    case 'operacion': return it.operacion === 'Rent' ? 'en venta (no hay en alquiler)' : 'en alquiler (no hay en venta)'
  }
}

function etiquetas(it: Interpretacion, indice: Indice): string[] {
  const out: string[] = []
  if (it.codigo) return [`Código ${it.codigo.toUpperCase()}`]
  if (it.codigoPrefijo) out.push(`Código ${it.codigoPrefijo.toUpperCase()}…`)
  if (it.tipos.length) out.push(primeraMayuscula(textoTipos(it.tipos)))
  if (it.excluirTipos.length) out.push(`Sin ${textoTipos(it.excluirTipos)}`)
  if (it.operacion) out.push(it.temporario ? 'Alquiler temporario' : it.operacion === 'Rent' ? 'Alquiler' : 'Venta')
  if (it.excluirOp) out.push(it.excluirOp === 'Rent' ? 'Sin alquileres' : 'Sin ventas')
  for (const t of it.terminos) {
    // La palabra a medio escribir todavía no es algo "entendido", salvo que ya
    // sea una palabra completa ("casa en funes" sin espacio final).
    if (t.parcial && !completa(indice, t)) continue
    out.push(nombreTermino(t))
  }
  for (const t of it.excluir) out.push(`${esTerminoDeLugar(t) ? 'Fuera de' : 'Sin'} ${nombreTermino(t)}`)
  if (it.cerrado) out.push('Barrio cerrado')
  if (it.noCerrado) out.push(it.abiertoEscrito ? 'Barrio abierto' : 'Fuera de barrio cerrado')
  const d = textoDorms(it)
  if (d) out.push(primeraMayuscula(d))
  if (it.noMono) out.push('Sin monoambientes')
  if (it.banos) out.push(`${it.banos}+ baño${it.banos === 1 ? '' : 's'}`)
  if (it.cocheras) out.push(`${it.cocheras}+ cochera${it.cocheras === 1 ? '' : 's'}`)
  if (it.sinCochera) out.push('Sin cochera')
  if (it.superficie) out.push(primeraMayuscula(textoSuperficie(it.superficie)))
  if (it.precio) out.push(primeraMayuscula(textoPrecio(it.precio)))
  if (it.moneda) out.push(it.moneda === 'ARS' ? 'En pesos' : 'En dólares')
  if (it.orden === 'barato') out.push('Más baratas primero')
  if (it.orden === 'caro') out.push('Más caras primero')
  if (it.orden === 'recientes') out.push('Más recientes primero')
  return out
}

// Edificios: agrupación automática de departamentos que comparten dirección.
//
// Cuando cargamos varias unidades del mismo edificio, cada una es una
// publicación suelta y el visitante no ve que pertenecen al mismo lugar. Acá
// las agrupamos por dirección para armar una página única del edificio
// (/edificios/[slug]) sin sacar las unidades del listado: al filtrar por
// "1 dormitorio" el depto sigue apareciendo, y además se ve de qué edificio es.
//
// La detección es automática: si mañana se carga otra unidad en esa dirección,
// entra sola. EDIFICIOS_META es opcional y solo sirve para ponerle un nombre
// lindo y una bajada a los edificios que lo merezcan.

import {
  type TokkoProperty,
  formatPrice,
  getMainPhoto,
  generatePropertySlug,
} from './tokko'

/** Mínimo de unidades para considerar que es un edificio. */
const MIN_UNIDADES = 2

/** id de tipo "Apartment" en el catálogo del CRM. */
const TIPO_DEPARTAMENTO = 2

export interface Edificio {
  slug: string
  clave: string
  nombre: string
  direccion: string
  descripcion?: string
  ciudad: string
  unidades: TokkoProperty[]
  desdeUSD: number | null
  lat: string | null
  lon: string | null
  foto: string | null
}

// Metadata opcional por dirección normalizada. Sin entrada acá, el edificio usa
// la dirección como nombre.
const EDIFICIOS_META: Record<string, { nombre: string; descripcion?: string }> = {
  'juan manuel de rosas 2348': {
    nombre: 'Edificio Juan Manuel de Rosas 2348',
    descripcion:
      'Departamentos en pleno barrio Martin, a metros de bulevar Oroño y del corredor gastronómico de Pellegrini.',
  },
  'cordoba 2680': {
    nombre: 'Edificio Córdoba 2680',
    descripcion:
      'Unidades a estrenar sobre calle Córdoba, en el corazón del macrocentro rosarino.',
  },
  'urquiza al 2000': {
    nombre: 'Edificio Urquiza al 2000',
    descripcion: 'Departamentos en zona centro de Rosario, a pasos del río y del Parque España.',
  },
}

/**
 * Normaliza una dirección para agrupar: saca piso, departamento, unidad y la
 * ciudad al final, que es lo que hace que dos unidades del mismo edificio
 * parezcan direcciones distintas.
 */
export function normalizarDireccion(direccion: string | null | undefined): string {
  return String(direccion ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s*[-–]\s*piso\s*\S+/g, '')
    .replace(/\s*[-–]\s*departamento\s*\S+/g, '')
    .replace(/\s*[-–]\s*(depto|dpto|unidad|uf)\s*\S+/g, '')
    .replace(/\s*[-–]\s*rosario\s*$/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tituloDesdeDireccion(direccion: string): string {
  const limpia = direccion
    .replace(/\s*[-–]\s*piso[\s\S]*$/i, '')
    .replace(/\s*[-–]\s*departamento[\s\S]*$/i, '')
    .replace(/\s*[-–]\s*rosario\s*$/i, '')
    // Algunas direcciones vienen prefijadas con ciudad y barrio
    // ("Rosario - Centro - Brown al 1900"): nos quedamos con la calle.
    .replace(/^\s*(rosario|funes|rold[áa]n)\s*[-–]\s*/i, '')
    .replace(/^\s*(centro|macrocentro|microcentro|pichincha|echesortu|abasto|martin)\s*[-–]\s*/i, '')
    .trim()
  return `Edificio ${limpia}`
}

export function generarSlugEdificio(clave: string): string {
  return clave.replace(/\s+/g, '-').slice(0, 60)
}

function precioUSD(p: TokkoProperty): number {
  const op = (p.operations ?? []).find((o) => o.operation_type === 'Sale')
  const precio = (op?.prices ?? []).find((pr) => pr.currency === 'USD')
  return precio?.price ?? 0
}

/**
 * Agrupa un listado de propiedades en edificios. Solo departamentos y solo los
 * que NO tienen emprendimiento asignado en el CRM: esos ya tienen su propia
 * página en /emprendimientos y no hay que duplicarlos.
 */
export function detectarEdificios(propiedades: TokkoProperty[]): Edificio[] {
  const grupos = new Map<string, TokkoProperty[]>()

  for (const p of propiedades) {
    if (p.type?.id !== TIPO_DEPARTAMENTO) continue
    if (p.development) continue
    const clave = normalizarDireccion(p.fake_address || p.address)
    if (!clave || clave.length < 6) continue
    const actual = grupos.get(clave)
    if (actual) actual.push(p)
    else grupos.set(clave, [p])
  }

  const edificios: Edificio[] = []
  for (const [clave, unidades] of Array.from(grupos.entries())) {
    if (unidades.length < MIN_UNIDADES) continue
    const primera = unidades[0]
    const meta = EDIFICIOS_META[clave]
    const precios = unidades.map(precioUSD).filter((n: number) => n > 0)
    const conFoto = unidades.find((u: TokkoProperty) => getMainPhoto(u))
    const conCoords = unidades.find((u: TokkoProperty) => u.geo_lat && u.geo_long)

    edificios.push({
      slug: generarSlugEdificio(clave),
      clave,
      nombre: meta?.nombre ?? tituloDesdeDireccion(primera.fake_address || primera.address),
      direccion: primera.fake_address || primera.address,
      descripcion: meta?.descripcion,
      ciudad:
        (primera.location?.short_location ?? '')
          .split('|')
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(-2, -1)[0] ?? primera.location?.name ?? '',
      unidades: unidades.slice().sort((a, b) => precioUSD(a) - precioUSD(b)),
      desdeUSD: precios.length ? Math.min(...precios) : null,
      lat: conCoords?.geo_lat ?? null,
      lon: conCoords?.geo_long ?? null,
      foto: conFoto ? getMainPhoto(conFoto) : null,
    })
  }

  return edificios.sort((a, b) => b.unidades.length - a.unidades.length)
}

/** Devuelve el edificio al que pertenece una propiedad, si hay alguno. */
export function edificioDe(
  propiedad: TokkoProperty,
  edificios: Edificio[],
): Edificio | undefined {
  if (propiedad.type?.id !== TIPO_DEPARTAMENTO || propiedad.development) return undefined
  const clave = normalizarDireccion(propiedad.fake_address || propiedad.address)
  return edificios.find((e) => e.clave === clave)
}

/** Texto "desde USD X" listo para mostrar. */
export function desdeTexto(edificio: Edificio): string | null {
  if (!edificio.desdeUSD) return null
  return `USD ${edificio.desdeUSD.toLocaleString('es-AR')}`
}

// Reexport para las vistas que arman las cards de unidades.
export { formatPrice, generatePropertySlug, getMainPhoto }

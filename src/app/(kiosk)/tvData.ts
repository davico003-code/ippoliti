// Datos de los kioscos de TV (/tv y /tv-vertical, la misma lista). Trae el stock
// en venta, arma el "mix inteligente" (destacadas + más nuevas + variedad de
// zonas) y devuelve TODAS las que entran (sin tope: David, 22-oct-2026), con un
// emprendimiento "de presentación" cada PROPIEDADES_POR_EMPRENDIMIENTO.

import {
  getProperties,
  getMainPhoto,
  getAllPhotos,
  getRoofedArea,
  getLotSurface,
  formatPrice,
  translatePropertyType,
  type TokkoProperty,
} from '@/lib/tokko'
import { formatUbicacion, resolverUbicacion } from '@/lib/ubicacion'
import { fotoJpgDeLaWeb } from '@/lib/fotos-fijas'
import { getTarjetasEmprendimientos } from '@/lib/emprendimientos-tarjetas'

interface SlideBase {
  photo: string          // foto de portada
  photos: string[]       // hasta 4 fotos de la MISMA propiedad/emprendimiento, portada primero
}

export interface SlidePropiedad extends SlideBase {
  kind: 'propiedad'
  precio: string
  tipo: string
  ubicacion: string
  titulo: string
  destacada: boolean
  specs: { v: string; l: string }[]
}

// Presentación especial de un emprendimiento (David, 22-oct-2026: "mechar con
// los desarrollos que tenemos, para destacar"). Sale de la misma lista que
// /emprendimientos (lib/emprendimientos-tarjetas.ts).
export interface SlideEmprendimiento extends SlideBase {
  kind: 'emprendimiento'
  nombre: string
  bajada: string | null
  ubicacion: string | null
  descripcion: string | null
  chips: string[]
  marcas: { rol: string; nombre: string; logo: string | null; mostrarNombre: boolean }[]
}

export type Slide = SlidePropiedad | SlideEmprendimiento

const PROPIEDADES_POR_EMPRENDIMIENTO = 6
// Las unidades de un mismo emprendimiento se ven todas iguales (David,
// 22-oct-2026: "no muestres tantos departamentos de Tierra Nueva"): pasan las 2
// primeras (destacadas y más nuevas) y el emprendimiento tiene su presentación.
const MAX_UNIDADES_POR_EMPRENDIMIENTO = 2

// Qué pasa por la tele (David, 22-oct-2026): casas desde USD 250.000,
// departamentos desde USD 125.000 y lotes desde USD 70.000. Nada más: ni PH,
// ni locales, ni galpones, ni las de precio a consultar. Por id de tipo de
// Tokko (3 casa, 2 departamento, 1 lote): por nombre, "Warehouse" contiene "house".
const PISO_USD: Partial<Record<number, number>> = { 3: 250000, 2: 125000, 1: 70000 }

function entraEnLaTele(p: TokkoProperty): boolean {
  const piso = p.type?.id != null ? PISO_USD[p.type.id] : undefined
  if (!piso || formatPrice(p) === 'Consultar precio') return false
  const venta = p.operations?.find((op) => op.operation_type === 'Sale')
  const usd = venta?.prices?.find((pr) => pr.currency === 'USD')?.price ?? 0
  return usd >= piso
}

// Traducción de tipología: usa el mapa canónico de tokko.ts (única fuente de
// verdad) para no repetir un mapa parcial. El local previo tenía 'Business'
// (nunca matcheaba: el feed manda 'Bussiness Premises') y le faltaban 'Garage'
// y 'Countryside', que caían crudos en inglés en pantalla.
function tipoEs(p: TokkoProperty): string {
  return translatePropertyType(p.type?.name)
}

function buildSpecs(p: TokkoProperty): { v: string; l: string }[] {
  const specs: { v: string; l: string }[] = []
  const dorm = p.suite_amount || 0
  const amb = p.room_amount || 0
  if (dorm > 0) specs.push({ v: String(dorm), l: dorm === 1 ? 'Dormitorio' : 'Dormitorios' })
  else if (amb > 0) specs.push({ v: String(amb), l: amb === 1 ? 'Ambiente' : 'Ambientes' })
  if (p.bathroom_amount > 0) specs.push({ v: String(p.bathroom_amount), l: p.bathroom_amount === 1 ? 'Baño' : 'Baños' })
  const cub = getRoofedArea(p)
  if (cub) specs.push({ v: cub.toLocaleString('es-AR'), l: 'm² cubiertos' })
  const lote = getLotSurface(p)
  if (lote) specs.push({ v: lote.toLocaleString('es-AR'), l: 'm² de lote' })
  return specs.slice(0, 4)
}

// Reordena para no repetir ciudad en slides consecutivos (variedad de zonas).
// Por ciudad y no por "barrio, ciudad": si no, "Funes" → "Funes Lakes, Funes"
// contaban como zonas distintas y la TV encadenaba Funes tras Funes.
// De qué emprendimiento es una unidad: el del feed, o Tierra Nueva (los Condos
// 22-24 no traen emprendimiento en el feed; los delata el barrio).
function emprendimientoDe(p: TokkoProperty): string | null {
  if (p.development?.id) return `dev-${p.development.id}`
  const barrio = (p.location?.name ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return barrio.includes('tierra nueva') ? 'tierra-nueva' : null
}

function sinRepetirEmprendimiento(list: TokkoProperty[]): TokkoProperty[] {
  const vistas = new Map<string, number>()
  return list.filter((p) => {
    const emp = emprendimientoDe(p)
    if (!emp) return true
    const n = vistas.get(emp) ?? 0
    vistas.set(emp, n + 1)
    return n < MAX_UNIDADES_POR_EMPRENDIMIENTO
  })
}

// Texto plano y corto para la tele: la primera oración entera (la descripción
// de las tarjetas puede traer HTML); si es muy larga, cortada en una palabra.
function recortar(texto: string | undefined, max: number): string | null {
  let limpio = (texto ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(/…$/, '').trim()
  // Encabezado tipo "CONDOMINIO | PASEO COMERCIAL | ALDEA – FISHERTON" pegado al
  // texto (Dock Garden): se corta después de la última palabra en mayúsculas.
  const mayusculas = limpio.includes('|') ? Array.from(limpio.slice(0, 160).matchAll(/[A-ZÁÉÍÓÚÑ]{3,}/g)).pop() : undefined
  if (mayusculas?.index !== undefined) limpio = limpio.slice(mayusculas.index + mayusculas[0].length).replace(/^[\s|–-]+/, '')
  if (!limpio) return null
  const oracion = limpio.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? limpio
  if (oracion.length <= max) return oracion
  return `${oracion.slice(0, oracion.lastIndexOf(' ', max)).replace(/[,;:.]$/, '')}…`
}

async function getEmprendimientos(): Promise<SlideEmprendimiento[]> {
  let tarjetas: Awaited<ReturnType<typeof getTarjetasEmprendimientos>> = []
  try {
    tarjetas = await getTarjetasEmprendimientos()
  } catch {
    return []
  }
  return tarjetas.flatMap((t): SlideEmprendimiento[] => {
    const photos = (t.fotos?.length ? t.fotos : [t.image]).filter((x): x is string => !!x).slice(0, 4)
    if (!photos.length) return []
    return [{
      kind: 'emprendimiento',
      photo: photos[0],
      photos,
      nombre: t.title,
      bajada: t.eyebrow ?? null,
      ubicacion: t.location ?? null,
      descripcion: recortar(t.description, 170),
      chips: t.chips.slice(0, 3),
      marcas: (t.marcas ?? []).map((m) => ({ rol: m.rol, nombre: m.nombre, logo: m.logo?.src ?? null, mostrarNombre: !!m.mostrarNombre })),
    }]
  })
}

function spreadByZone(list: TokkoProperty[]): TokkoProperty[] {
  const out: TokkoProperty[] = []
  const pool = [...list]
  const ciudad = (p: TokkoProperty) => resolverUbicacion(p).ciudad ?? ''
  let lastZone = ''
  while (pool.length) {
    let pick = pool.findIndex((p) => ciudad(p) !== lastZone)
    if (pick === -1) pick = 0
    const [p] = pool.splice(pick, 1)
    out.push(p)
    lastZone = ciudad(p)
  }
  return out
}

export async function getSlides(): Promise<Slide[]> {
  let objects: TokkoProperty[] = []
  const emprendimientos = getEmprendimientos()
  try {
    const resp = await getProperties({ operation: 'Sale', limit: 500 })
    objects = resp.objects ?? []
  } catch {
    return emprendimientos
  }

  const seen = new Set<number>()
  const props = objects.filter((p) => {
    if (!getMainPhoto(p)) return false
    if (!p.operations?.length) return false
    if (!entraEnLaTele(p)) return false
    if (p.id && seen.has(p.id)) return false
    if (p.id) seen.add(p.id)
    return true
  })

  const starred = props.filter((p) => p.is_starred_on_web)
  const rest = props.filter((p) => !p.is_starred_on_web).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  // Sin tope: pasan todas las que entran (antes eran siempre las mismas 30).
  const propiedades = spreadByZone(sinRepetirEmprendimiento([...starred, ...rest])).map((p): SlidePropiedad => {
    const portada = getMainPhoto(p) as string
    // Hasta 4 fotos de la misma propiedad (portada primero, sin duplicar): la
    // foto grande + la tira de miniaturas. En JPG desde /fotos: el televisor no
    // muestra las de R2 (ver fotoJpgDeLaWeb).
    const photos = [portada, ...getAllPhotos(p).filter((x) => x !== portada)].slice(0, 4).map((x) => fotoJpgDeLaWeb(p.id, x))
    return {
      kind: 'propiedad',
      photo: photos[0],
      photos,
      precio: formatPrice(p),
      tipo: tipoEs(p),
      ubicacion: formatUbicacion(p),
      titulo: p.publication_title ?? '',
      destacada: !!p.is_starred_on_web,
      specs: buildSpecs(p),
    }
  })

  // Un emprendimiento cada PROPIEDADES_POR_EMPRENDIMIENTO, en el orden comercial
  // de /emprendimientos y dando la vuelta a la lista.
  const emps = await emprendimientos
  if (!emps.length) return propiedades
  const slides: Slide[] = []
  propiedades.forEach((p, i) => {
    slides.push(p)
    if ((i + 1) % PROPIEDADES_POR_EMPRENDIMIENTO === 0) {
      slides.push(emps[Math.floor(i / PROPIEDADES_POR_EMPRENDIMIENTO) % emps.length])
    }
  })
  return slides
}

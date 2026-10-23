// Datos de los kioscos de TV (/tv y /tv-vertical, la misma lista). Trae el stock
// en venta, arma el "mix inteligente" (destacadas + más nuevas + variedad de
// zonas) y devuelve TODAS las que entran (sin tope: David, 22-oct-2026).

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

export interface Slide {
  photo: string          // foto de portada (kiosco horizontal)
  photos: string[]       // hasta 4 fotos de la MISMA propiedad, portada primero
  precio: string
  tipo: string
  ubicacion: string
  titulo: string
  destacada: boolean
  specs: { v: string; l: string }[]
}

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
  try {
    const resp = await getProperties({ operation: 'Sale', limit: 500 })
    objects = resp.objects ?? []
  } catch {
    return []
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
  return spreadByZone([...starred, ...rest]).map((p): Slide => {
    const portada = getMainPhoto(p) as string
    // Hasta 4 fotos de la misma propiedad (portada primero, sin duplicar): la
    // foto grande + la tira de miniaturas. En JPG desde /fotos: el televisor no
    // muestra las de R2 (ver fotoJpgDeLaWeb).
    const photos = [portada, ...getAllPhotos(p).filter((x) => x !== portada)].slice(0, 4).map((x) => fotoJpgDeLaWeb(p.id, x))
    return {
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
}

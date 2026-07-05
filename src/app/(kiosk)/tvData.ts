// Datos compartidos de los kioscos de TV (horizontal y vertical). Trae el stock
// en venta, arma el "mix inteligente" (destacadas + más nuevas + variedad de
// zonas) y devuelve slides listos con QR precomputado server-side.

import QRCode from 'qrcode'
import {
  getProperties,
  getMainPhoto,
  getAllPhotos,
  getRoofedArea,
  getLotSurface,
  formatPrice,
  formatLocation,
  generatePropertySlug,
  type TokkoProperty,
} from '@/lib/tokko'

export interface Slide {
  photo: string          // foto de portada (kiosco horizontal)
  photos: string[]       // hasta 3 fotos de la MISMA propiedad (kiosco vertical)
  precio: string
  tipo: string
  ubicacion: string
  titulo: string
  destacada: boolean
  specs: { v: string; l: string }[]
  qr: string
}

const SITE = 'https://siinmobiliaria.com'
const MAX_SLIDES = 30

const TIPO_ES: Record<string, string> = {
  House: 'Casa', Apartment: 'Departamento', Land: 'Terreno', Office: 'Oficina',
  Warehouse: 'Galpón', Condo: 'Casa', PH: 'PH', Business: 'Fondo de comercio',
  Store: 'Local', Local: 'Local', Terreno: 'Terreno', Casa: 'Casa',
}

function tipoEs(p: TokkoProperty): string {
  const n = p.type?.name ?? ''
  return TIPO_ES[n] ?? n
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

// Reordena para no repetir localidad en slides consecutivos (variedad de zonas).
function spreadByZone(list: TokkoProperty[]): TokkoProperty[] {
  const out: TokkoProperty[] = []
  const pool = [...list]
  let lastZone = ''
  while (pool.length) {
    let pick = pool.findIndex((p) => formatLocation(p) !== lastZone)
    if (pick === -1) pick = 0
    const [p] = pool.splice(pick, 1)
    out.push(p)
    lastZone = formatLocation(p)
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
    if (p.id && seen.has(p.id)) return false
    if (p.id) seen.add(p.id)
    return true
  })

  const starred = props.filter((p) => p.is_starred_on_web)
  const rest = props.filter((p) => !p.is_starred_on_web).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  const ordered = spreadByZone([...starred, ...rest]).slice(0, MAX_SLIDES)

  return Promise.all(
    ordered.map(async (p): Promise<Slide> => {
      const slug = generatePropertySlug(p)
      const url = `${SITE}/propiedades/${slug}`
      const photo = getMainPhoto(p) as string
      // Hasta 3 fotos de la misma propiedad (portada primero, sin duplicar).
      const photos = [photo, ...getAllPhotos(p).filter((x) => x !== photo)].slice(0, 3)
      let qr = ''
      try {
        qr = await QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: '#0E1A14', light: '#FFFFFF' } })
      } catch { /* sin QR si falla */ }
      return {
        photo,
        photos,
        precio: formatPrice(p),
        tipo: tipoEs(p),
        ubicacion: formatLocation(p),
        titulo: p.publication_title ?? '',
        destacada: !!p.is_starred_on_web,
        specs: buildSpecs(p),
        qr,
      }
    }),
  )
}

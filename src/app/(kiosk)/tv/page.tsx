// Página /tv — modo KIOSCO para televisor. Trae el stock en venta, arma un
// "mix inteligente" (destacadas + más nuevas + variedad de zonas) y le pasa al
// cliente los slides ya listos (con QR precomputado server-side). El cliente
// cicla con animaciones (Ken Burns + crossfade) en loop infinito.

import QRCode from 'qrcode'
import {
  getProperties,
  getMainPhoto,
  getRoofedArea,
  getLotSurface,
  formatPrice,
  formatLocation,
  generatePropertySlug,
  type TokkoProperty,
} from '@/lib/tokko'
import TvKioskClient, { type Slide } from './TvKioskClient'

// Refresca el stock cada 30 min (el cliente además recarga la página sola).
export const revalidate = 1800

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

async function getSlides(): Promise<Slide[]> {
  let objects: TokkoProperty[] = []
  try {
    const resp = await getProperties({ operation: 'Sale', limit: 500 })
    objects = resp.objects ?? []
  } catch {
    return []
  }

  // Con foto + precio, deduplicadas por id.
  const seen = new Set<number>()
  const props = objects.filter((p) => {
    if (!getMainPhoto(p)) return false
    if (!p.operations?.length) return false
    if (p.id && seen.has(p.id)) return false
    if (p.id) seen.add(p.id)
    return true
  })

  // Mix: destacadas primero, luego las más nuevas (id desc), y variedad de zona.
  const starred = props.filter((p) => p.is_starred_on_web)
  const rest = props.filter((p) => !p.is_starred_on_web).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  const ordered = spreadByZone([...starred, ...rest]).slice(0, MAX_SLIDES)

  return Promise.all(
    ordered.map(async (p): Promise<Slide> => {
      const slug = generatePropertySlug(p)
      const url = `${SITE}/propiedades/${slug}`
      const photo = getMainPhoto(p) as string
      let qr = ''
      try {
        qr = await QRCode.toDataURL(url, {
          margin: 1,
          width: 260,
          color: { dark: '#0E1A14', light: '#FFFFFF' },
        })
      } catch { /* sin QR si falla */ }
      return {
        photo,
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

export default async function TvPage() {
  const slides = await getSlides()
  return <TvKioskClient slides={slides} />
}

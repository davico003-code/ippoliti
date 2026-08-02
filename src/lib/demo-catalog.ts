import 'server-only'

import type { TokkoPhoto, TokkoProperty } from '@/lib/tokko'

const photo = (image: string, order: number): TokkoPhoto => ({
  description: null,
  image,
  is_blueprint: false,
  is_front_cover: order === 0,
  order,
  original: image,
  thumb: image,
})

type DemoInput = {
  id: number
  title: string
  barrio: string
  localidad: 'Funes' | 'Roldán'
  price: number
  roofed: number
  lot: number
  bedrooms: number
  bathrooms: number
  photos: string[]
  market?: { uuid: string; discount: number; rights: 'autorizadas' | 'sin_confirmar' }
  tags?: string[]
}

function property(input: DemoInput): TokkoProperty {
  const isMarket = !!input.market
  return {
    id: input.id,
    publication_title: input.title,
    address: input.barrio,
    fake_address: input.barrio,
    real_address: '',
    reference_code: isMarket ? `OP-DEMO${String(input.id).slice(-3)}` : `SI-DEMO${String(input.id).slice(-3)}`,
    description: isMarket
      ? `Casa seleccionada por su relación entre precio, superficie y ubicación. La disponibilidad se reconfirma antes de coordinar una visita.`
      : `Propiedad del stock de SI INMOBILIARIA incluida para mostrar cómo convive con las oportunidades verificadas del mercado.`,
    description_only: '',
    rich_description: '',
    age: isMarket ? 4 : 2,
    roofed_surface: String(input.roofed),
    surface: String(input.lot),
    total_surface: String(input.lot),
    semiroofed_surface: '0',
    unroofed_surface: '0',
    lot_number: '',
    room_amount: input.bedrooms,
    bathroom_amount: input.bathrooms,
    toilet_amount: 0,
    parking_lot_amount: 2,
    covered_parking_lot: 2,
    suite_amount: input.bedrooms,
    floors_amount: 2,
    floor: '',
    photos: input.photos.map(photo),
    operations: [{
      operation_id: 1,
      operation_type: 'Sale',
      prices: [{ currency: 'USD', is_promotional: false, period: null, price: input.price }],
    }],
    type: { code: 'HOUSE', id: 3, name: 'Casa' },
    location: {
      id: input.id,
      name: input.barrio,
      full_location: `Argentina | Santa Fe | ${input.localidad} | ${input.barrio}`,
      short_location: `${input.localidad} | ${input.barrio}`,
      divisions: [{ id: input.id, name: input.barrio }],
    },
    geo_lat: input.localidad === 'Funes' ? '-32.925' : '-32.899',
    geo_long: input.localidad === 'Funes' ? '-60.823' : '-60.903',
    web_price: true,
    is_starred_on_web: !isMarket,
    status: 2,
    deleted_at: null,
    tags: (input.tags ?? ['Pileta', 'Jardín', 'Barrio cerrado']).map((name, index) => ({ id: index + 1, name, type: 1 })),
    videos: [],
    property_condition: 'Excelente',
    orientation: null,
    disposition: null,
    situation: null,
    files: [],
    public_url: '',
    development: null,
    producer: isMarket ? null : { id: 1, name: 'SI INMOBILIARIA', phone: null, email: null, picture: null },
    catalog_source: isMarket ? 'mercado' : 'propio',
    market_id: input.market?.uuid,
    market_verified_at: isMarket ? '2026-08-01T12:00:00.000Z' : null,
    market_discount_pct: input.market?.discount ?? null,
    market_photo_rights: input.market?.rights ?? null,
  }
}

const DEMO_PROPERTIES: TokkoProperty[] = [
  property({
    id: 7_990_000_001,
    title: 'Casa de SI en Cadaqués · 3 dormitorios',
    barrio: 'Cadaqués',
    localidad: 'Funes',
    price: 365_000,
    roofed: 205,
    lot: 800,
    bedrooms: 3,
    bathrooms: 2,
    photos: ['/casa-cadaques-openhouse.webp'],
  }),
  property({
    id: 8_990_000_001,
    title: 'Casa en Vida · 3 dormitorios y pileta',
    barrio: 'Vida',
    localidad: 'Funes',
    price: 250_000,
    roofed: 210,
    lot: 800,
    bedrooms: 3,
    bathrooms: 2,
    photos: ['/barrios/vida-jardin/01.webp', '/barrios/vida-jardin/02.webp', '/barrios/vida-jardin/03.webp'],
    market: { uuid: 'b3b27d42-3fd2-4bc0-b17d-fd2e1212792a', discount: 31, rights: 'autorizadas' },
  }),
  property({
    id: 8_990_000_002,
    title: 'Casa en Tierra de Sueños 3 · 3 dormitorios',
    barrio: 'Tierra de Sueños 3',
    localidad: 'Roldán',
    price: 195_000,
    roofed: 168,
    lot: 600,
    bedrooms: 3,
    bathrooms: 2,
    photos: [],
    market: { uuid: 'c4c38e53-4ae3-4cd1-a28e-fe3f2323803b', discount: 19, rights: 'sin_confirmar' },
  }),
  property({
    id: 8_990_000_003,
    title: 'Casa en San Sebastián · 4 dormitorios',
    barrio: 'San Sebastián',
    localidad: 'Funes',
    price: 428_000,
    roofed: 255,
    lot: 900,
    bedrooms: 4,
    bathrooms: 3,
    photos: ['/barrios/san-sebastian/01.webp'],
    market: { uuid: 'd5d49f64-5bf4-4de2-b39f-af4f3434914c', discount: 14, rights: 'autorizadas' },
  }),
]

export function isCatalogDemoEnabled(value?: string | null): boolean {
  const safeRuntime = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
  return value === 'catalogo-experto' && safeRuntime
}

export function getDemoCatalogProperties(): TokkoProperty[] {
  return DEMO_PROPERTIES
}

export function getDemoCatalogProperty(id: number): TokkoProperty | null {
  const safeRuntime = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
  if (!safeRuntime) return null
  return DEMO_PROPERTIES.find((candidate) => candidate.id === id) ?? null
}

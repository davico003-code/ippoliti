// Projecciones livianas de TokkoProperty para evitar serializar la data
// completa (descriptions largas, photos array de 30 entries, tags, videos,
// etc.) cuando solo necesitamos los campos de card o de marker en mapa.
//
// PropertyCardProjection: lo que consumen PropiedadCardGrid + PropiedadesMap
// + filtros de PropiedadesView. Mantiene shape parcial de TokkoProperty
// para que getMainPhoto/formatPrice/generatePropertySlug compilen sin tocar.
//
// NearbyProperty: ultra-light, solo lo que el popup del marker en
// NearbyPropertiesMap muestra (price + title + link al slug).

import { getAudioUrlsBulk } from './audio'
import type { TokkoProperty } from './tokko'

function isStaticBuild() {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

export interface PropertyCardProjection {
  id: number
  publication_title: string | null
  address: string
  fake_address: string | null
  reference_code: string

  // `id` es imprescindible: el filtro de tipología y el label de las cards
  // mapean por `type.id` contra PROPERTY_TYPE_LABELS. Si se omite, todo cae en
  // 'Otros' y el dropdown queda sin opciones.
  type: { id: number | null; name: string }
  location: { name: string; short_location: string } | null

  operations: Array<{
    operation_type: 'Sale' | 'Rent'
    prices: Array<{
      price: number
      currency: string
    }>
  }>

  // "Sin Precio" en Tokko: si es false, formatPrice/mostrarPrecio muestran
  // "Consultar precio" en vez del monto. Sin este campo, las cards perderían
  // el flag al proyectarse y filtrarían el precio igual.
  web_price: boolean

  geo_lat: string | null
  geo_long: string | null

  suite_amount: number
  room_amount: number
  bathroom_amount: number
  roofed_surface: string
  total_surface: string
  surface: string

  // Hasta 5 fotos (cover primero). Mantiene shape TokkoPhoto-compat para que
  // getMainPhoto/getAllPhotos y el carrusel de la card funcionen sin cambios.
  photos: Array<{
    image: string
    thumb: string
    is_front_cover: boolean
    is_blueprint: boolean
    order: number
  }>

  is_starred_on_web: boolean

  // Para search por nombre de emprendimiento (PropiedadesView.tsx:611)
  // y clustering de markers en el mapa (PropiedadesMap.tsx:36-39, 68-70).
  development: { id: number; name: string } | null

  // URL pública del audio narrado (Vercel Blob). Si la propiedad no tiene
  // audio generado, queda null y el card no renderiza el botón de play.
  // Se popula vía enrichCardsWithAudio() después de projectToCard().
  audioUrl: string | null
}

export interface NearbyProperty {
  id: number
  lat: number
  lng: number
  title: string
  price: string
  slug: string
}

// Cuántas fotos lleva cada card. La proyección antes mandaba solo la cover
// (1 foto), lo que dejaba a PropiedadCardGrid sin carrusel (su guard es
// images.length > 1). Llevamos hasta 5 — calza con el tope de 5 dots y suma
// poco payload (5 URLs vs 1) comparado con mandar las ~30 fotos completas.
const CARD_PHOTO_MAX = 5

// Devuelve hasta CARD_PHOTO_MAX fotos no-blueprint, con la cover primero y el
// resto en su orden original. `order` se reasigna a la posición final (0..n)
// para que getAllPhotos (que ordena por `order`) preserve la cover al frente.
function pickCardPhotos(p: TokkoProperty) {
  if (!p.photos || p.photos.length === 0) return []
  const nonBlueprint = p.photos.filter(ph => !ph.is_blueprint)
  const pool = nonBlueprint.length > 0 ? nonBlueprint : p.photos
  const cover = pool.find(ph => ph.is_front_cover) ?? pool[0]
  const rest = pool
    .filter(ph => ph !== cover)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return [cover, ...rest].slice(0, CARD_PHOTO_MAX).map((ph, i) => ({
    image: ph.image,
    // `thumb` NO viaja: ningún consumidor de la proyección lo lee (getMainPhoto
    // y getAllPhotos usan .image) y duplicaba una URL larga por foto — eran
    // ~350 kB del payload de /propiedades.
    thumb: '',
    is_front_cover: i === 0,     // la primera es la cover para getMainPhoto
    is_blueprint: false,
    order: i,
  }))
}

export function projectToCard(p: TokkoProperty): PropertyCardProjection {
  return {
    id: p.id,
    publication_title: p.publication_title,
    address: p.address,
    fake_address: p.fake_address,
    reference_code: p.reference_code,
    type: { id: p.type?.id ?? null, name: p.type?.name ?? '' },
    location: p.location
      ? { name: p.location.name, short_location: p.location.short_location }
      : null,
    operations: (p.operations ?? []).map(op => ({
      operation_type: op.operation_type,
      prices: (op.prices ?? []).map(pr => ({
        price: pr.price,
        currency: pr.currency,
      })),
    })),
    web_price: p.web_price,
    geo_lat: p.geo_lat,
    geo_long: p.geo_long,
    suite_amount: p.suite_amount,
    room_amount: p.room_amount,
    bathroom_amount: p.bathroom_amount,
    roofed_surface: p.roofed_surface,
    total_surface: p.total_surface,
    surface: p.surface,
    photos: pickCardPhotos(p),
    is_starred_on_web: p.is_starred_on_web,
    development: p.development
      ? { id: p.development.id, name: p.development.name }
      : null,
    audioUrl: null,
  }
}

/**
 * Enriquece un set de cards con la URL del audio narrado vía un único MGET
 * a Redis. Si una propiedad no tiene audio, queda con audioUrl=null.
 * Soft-fail: si Redis falla, todas las cards quedan en null (no rompe el
 * listado).
 */
export async function enrichCardsWithAudio<T extends { id: number; audioUrl: string | null }>(
  cards: T[],
): Promise<T[]> {
  if (cards.length === 0) return cards
  if (isStaticBuild()) return cards
  const ids = cards.map(c => c.id)
  const urls = await getAudioUrlsBulk(ids)
  for (const card of cards) {
    card.audioUrl = urls[card.id] ?? null
  }
  return cards
}

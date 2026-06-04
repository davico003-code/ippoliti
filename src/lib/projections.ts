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

  geo_lat: string | null
  geo_long: string | null

  suite_amount: number
  room_amount: number
  bathroom_amount: number
  roofed_surface: string
  total_surface: string
  surface: string

  // Solo la cover (1 entry). Mantiene shape TokkoPhoto-compat para que
  // getMainPhoto/getAllPhotos sigan funcionando sin cambios en el lib.
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

// Devuelve la cover photo (front_cover && !blueprint), o el primer
// no-blueprint, o null si no hay fotos. Replica getMainPhoto pero
// devolviendo el objeto entero (no solo URL).
function pickCoverPhoto(p: TokkoProperty) {
  if (!p.photos || p.photos.length === 0) return null
  const cover = p.photos.find(ph => ph.is_front_cover && !ph.is_blueprint)
  const first = p.photos.find(ph => !ph.is_blueprint)
  const chosen = cover || first || p.photos[0]
  return {
    image: chosen.image,
    thumb: chosen.thumb,
    is_front_cover: true,        // forzamos el flag para el helper getMainPhoto
    is_blueprint: false,
    order: chosen.order ?? 0,
  }
}

export function projectToCard(p: TokkoProperty): PropertyCardProjection {
  const cover = pickCoverPhoto(p)
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
    geo_lat: p.geo_lat,
    geo_long: p.geo_long,
    suite_amount: p.suite_amount,
    room_amount: p.room_amount,
    bathroom_amount: p.bathroom_amount,
    roofed_surface: p.roofed_surface,
    total_surface: p.total_surface,
    surface: p.surface,
    photos: cover ? [cover] : [],
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
  const ids = cards.map(c => c.id)
  const urls = await getAudioUrlsBulk(ids)
  for (const card of cards) {
    card.audioUrl = urls[card.id] ?? null
  }
  return cards
}

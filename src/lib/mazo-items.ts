// Las nuestras con la forma del mazo (sello verde, link a su ficha). Lo usan
// la ficha ("Más casas en <barrio>") y "Conocé tu próximo hogar" de la home.

import {
  type TokkoProperty,
  formatPrice,
  generatePropertySlug,
  getAllPhotos,
  getMainPhoto,
  getTotalSurface,
  tituloVisible,
  translatePropertyType,
} from '@/lib/tokko'
import type { ItemFeed } from '@/lib/feed-en-red'

export function itemDeNuestra(p: TokkoProperty): ItemFeed {
  const fotos = getAllPhotos(p)
  const principal = getMainPhoto(p)
  const beds = p.suite_amount || p.room_amount || 0
  const baths = p.bathroom_amount || 0
  const m2 = getTotalSurface(p)
  return {
    key: `n:${p.id}`,
    esNuestra: true,
    fotos: fotos.length ? fotos : principal ? [principal] : [],
    precio: formatPrice(p),
    datos: [
      translatePropertyType(p.type?.name),
      beds ? `${beds} dorm` : null,
      baths ? `${baths} baño${baths > 1 ? 's' : ''}` : null,
      m2 ? `${Math.round(m2).toLocaleString('es-AR')} m²` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    titulo: tituloVisible(p) || p.fake_address || p.address || '',
    zona: p.location?.name ?? null,
    href: `/propiedades/${generatePropertySlug(p)}`,
    masVista: false,
  }
}

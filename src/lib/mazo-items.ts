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
import { type ItemFeed, superficiesTarjeta, tipoHogarDeTokko } from '@/lib/feed-en-red'
import { formatDireccionCompleta } from '@/lib/ubicacion'

/** Hasta 5 pares de fotos por casa en el Tinder (David, 4-oct-2026). */
export const MAX_FOTOS_MAZO = 10

/**
 * Suma las del álbum a las de la tarjeta (que ya se ven) sin repetir, hasta
 * MAX_FOTOS_MAZO. Compara sin la query (una URL firmada cambia de firma).
 */
export function completarFotos(actuales: readonly string[], album: readonly string[]): string[] {
  const clave = (u: string) => u.split('?')[0]
  const vistas = new Set(actuales.map(clave))
  const out = [...actuales]
  for (const u of album) {
    if (out.length >= MAX_FOTOS_MAZO) break
    if (vistas.has(clave(u))) continue
    vistas.add(clave(u))
    out.push(u)
  }
  return out.slice(0, MAX_FOTOS_MAZO)
}

/** Precio de venta en dólares (una propiedad puede estar en venta y alquiler). */
export function precioVentaUsd(p: TokkoProperty): number | null {
  const venta = (p.operations ?? []).find((o) => o.operation_type === 'Sale')
  const precio = venta?.prices?.find((x) => x.currency === 'USD' && x.price > 0)
  return precio?.price ?? null
}

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
    dorm: beds || null,
    // Total, o la cubierta si la total es el lote (regla 10-sep); `surface` del feed = el terreno.
    ...superficiesTarjeta({
      tipo: tipoHogarDeTokko(p.type?.id),
      total: Number(p.total_surface),
      cubierta: Number(p.roofed_surface),
      lote: Number(p.surface),
    }),
    esLote: tipoHogarDeTokko(p.type?.id) === 'lot',
    precioUsd: precioVentaUsd(p),
    masVista: false,
    // Misma línea que las tarjetas del listado ("Av Fuerza Aerea 1515 | San Sebastián | Funes").
    direccion: formatDireccionCompleta(p, p.fake_address || p.address, ' | ') || null,
  }
}

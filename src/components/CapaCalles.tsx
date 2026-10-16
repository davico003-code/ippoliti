'use client'

// Capa de calles de los mapas Leaflet del sitio. En modo claro, la de siempre;
// en modo oscuro, Dark Matter de CARTO. Antes se invertían los colores de la
// clara: las calles (blancas) quedaban negras sobre fondo negro y no se veía
// nada. La foto satelital no pasa por acá.

import { TileLayer } from 'react-leaflet'
import { DARK_TILES, VOYAGER_TILES, type BaseTiles } from '@/lib/map-tiles'
import { useTemaOscuro } from '@/hooks/useTemaOscuro'

export default function CapaCalles({ claras = VOYAGER_TILES, maxZoom }: {
  claras?: BaseTiles
  maxZoom?: number
}) {
  const oscuras = useTemaOscuro() ? DARK_TILES : null
  const tiles = oscuras ?? claras
  return (
    <TileLayer
      // className no se actualiza en caliente: al cambiar de tema se remonta.
      key={tiles.url}
      className={oscuras ? 'si-tiles-oscuras' : 'si-street-tiles'}
      url={tiles.url}
      attribution={tiles.attribution}
      maxNativeZoom={tiles.maxNativeZoom}
      {...(maxZoom != null ? { maxZoom } : {})}
    />
  )
}

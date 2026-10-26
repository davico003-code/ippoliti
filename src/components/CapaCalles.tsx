'use client'

// Capa de calles de los mapas Leaflet del sitio. En modo claro, la de siempre;
// en modo oscuro, Dark Matter de CARTO teñido azul pizarra como Google Maps
// (fondo y nombres en capas separadas, así los nombres se aclaran aparte).
// Antes se invertían los colores de la clara: las calles (blancas) quedaban
// negras sobre fondo negro y no se veía nada. La foto satelital no pasa por acá.

import { TileLayer } from 'react-leaflet'
import { DARK_BASE_TILES, DARK_LABEL_TILES, VOYAGER_TILES, type BaseTiles } from '@/lib/map-tiles'
import { useTemaOscuro } from '@/hooks/useTemaOscuro'

export default function CapaCalles({ claras = VOYAGER_TILES, maxZoom }: {
  claras?: BaseTiles
  maxZoom?: number
}) {
  const oscuro = useTemaOscuro()
  const zoom = maxZoom != null ? { maxZoom } : {}

  if (oscuro && DARK_BASE_TILES && DARK_LABEL_TILES) {
    return (
      <>
        <TileLayer
          key={DARK_BASE_TILES.url}
          className="si-tiles-oscuras"
          url={DARK_BASE_TILES.url}
          attribution={DARK_BASE_TILES.attribution}
          maxNativeZoom={DARK_BASE_TILES.maxNativeZoom}
          {...zoom}
        />
        <TileLayer
          key={DARK_LABEL_TILES.url}
          className="si-tiles-oscuras-nombres"
          url={DARK_LABEL_TILES.url}
          maxNativeZoom={DARK_LABEL_TILES.maxNativeZoom}
          zIndex={2}
          {...zoom}
        />
      </>
    )
  }

  return (
    <TileLayer
      // className no se actualiza en caliente: al cambiar de tema se remonta.
      key={claras.url}
      className="si-street-tiles"
      url={claras.url}
      attribution={claras.attribution}
      maxNativeZoom={claras.maxNativeZoom}
      {...zoom}
    />
  )
}

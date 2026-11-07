'use client'

// Capa de calles de los mapas Leaflet del sitio. En modo claro, la de siempre;
// en modo oscuro, el mapa vectorial estilo noche de Google (CapaOscuraVectorial).
// Si ese no puede dibujarse (sin WebGL o servidor caído), Dark Matter de CARTO
// como antes. La foto satelital no pasa por acá.

import { useLayoutEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TileLayer, useMap } from 'react-leaflet'
import { DARK_TILES, VOYAGER_TILES, type BaseTiles } from '@/lib/map-tiles'
import { useTemaOscuro } from '@/hooks/useTemaOscuro'

// MapLibre (~250 KB) se baja solo cuando hace falta: modo oscuro.
const CapaOscuraVectorial = dynamic(() => import('./CapaOscuraVectorial'), { ssr: false })

export default function CapaCalles({ claras = VOYAGER_TILES, maxZoom }: {
  claras?: BaseTiles
  maxZoom?: number
}) {
  const map = useMap()
  const oscuro = useTemaOscuro()
  const [vectorialFallo, setVectorialFallo] = useState(false)
  const vectorial = oscuro && !vectorialFallo

  // Leaflet saca el zoom máximo del mapa de sus capas de tejas, y el agrupador de
  // pines lo exige ("Map has no maxZoom specified"). La vectorial no es de tejas
  // y se monta tarde: se fija acá, antes de los efectos de los pines. 18 es el
  // tope por defecto de una TileLayer.
  useLayoutEffect(() => {
    if (vectorial) map.setMaxZoom(maxZoom ?? 18)
  }, [map, vectorial, maxZoom])

  if (vectorial) {
    return <CapaOscuraVectorial onFalla={() => setVectorialFallo(true)} />
  }

  const oscuras = oscuro ? DARK_TILES : null
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

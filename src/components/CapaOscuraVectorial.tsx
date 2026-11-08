'use client'

// Mapa de calles en modo oscuro, estilo Google (ver lib/estilo-mapa-oscuro.ts).
// MapLibre se carga recién acá, solo en modo oscuro, y dibuja dentro del pane
// de tiles de Leaflet: pines, grupos y popups quedan arriba como siempre. Si el
// navegador no tiene WebGL o el estilo no carga, avisa con onFalla y CapaCalles
// vuelve a las tejas raster.

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ATRIBUCION_OSM, ESTILO_MAPA_OSCURO } from '@/lib/estilo-mapa-oscuro'

export default function CapaOscuraVectorial({ onFalla }: { onFalla: () => void }) {
  const map = useMap()
  const fallaRef = useRef(onFalla)
  fallaRef.current = onFalla

  useEffect(() => {
    let vivo = true
    let capa: import('leaflet').Layer | null = null

    import('@maplibre/maplibre-gl-leaflet')
      .then(({ maplibreGL }) => {
        if (!vivo) return
        const nueva = maplibreGL({ style: ESTILO_MAPA_OSCURO, attributionControl: false })
        nueva.options.attribution = ATRIBUCION_OSM
        nueva.addTo(map)
        capa = nueva
        const gl = nueva.getMaplibreMap()
        let cargo = false
        gl.once('load', () => { cargo = true })
        // Un error antes del primer dibujo (estilo o fuente caída) = sin mapa: volver
        // a las raster. Después, una teja suelta que falla no justifica cambiar.
        gl.on('error', () => { if (!cargo && vivo) fallaRef.current() })
      })
      .catch(() => { if (vivo) fallaRef.current() })

    return () => {
      vivo = false
      if (capa) map.removeLayer(capa)
    }
  }, [map])

  return null
}

'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LIGHT_TILES } from '@/lib/map-tiles'
import { SEDES, VERDE } from './datos'

function pin(n: string, activo: boolean) {
  const t = activo ? 46 : 36
  return L.divIcon({
    className: '',
    iconSize: [t, t],
    iconAnchor: [t / 2, t / 2],
    html: `<div style="width:${t}px;height:${t}px;border-radius:999px;display:grid;place-items:center;background:${activo ? VERDE : '#fff'};color:${activo ? '#fff' : VERDE};box-shadow:0 0 0 ${activo ? 6 : 2}px ${activo ? 'rgba(26,92,56,.22)' : VERDE},0 8px 20px -6px rgba(0,0,0,.35);font:700 ${activo ? 15 : 13}px var(--font-poppins),Poppins,sans-serif;transition:all .3s">${n}</div>`,
  })
}

// Al abrir se ven las tres sedes; recién cuando se elige una, el mapa vuela.
function Seguir({ activo }: { activo: number }) {
  const map = useMap()
  const previa = useRef(activo)
  useEffect(() => {
    if (previa.current === activo) return
    previa.current = activo
    const s = SEDES[activo]
    map.flyTo([s.lat, s.lng], 15, { duration: 1.1 })
  }, [activo, map])
  return null
}

export default function MapaSedesLeaflet({ activo, onElegir }: { activo: number; onElegir: (i: number) => void }) {
  const bounds = L.latLngBounds(SEDES.map(s => [s.lat, s.lng] as [number, number]))
  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [60, 60] }}
      scrollWheelZoom={false}
      attributionControl
      className="h-full w-full"
      style={{ background: '#F5F5F7' }}
    >
      <TileLayer url={LIGHT_TILES.url} attribution={LIGHT_TILES.attribution} maxNativeZoom={LIGHT_TILES.maxNativeZoom} maxZoom={19} />
      {SEDES.map((s, i) => (
        <Marker key={s.n} position={[s.lat, s.lng]} icon={pin(s.n, i === activo)} eventHandlers={{ click: () => onElegir(i) }} zIndexOffset={i === activo ? 1000 : 0} />
      ))}
      <Seguir activo={activo} />
    </MapContainer>
  )
}

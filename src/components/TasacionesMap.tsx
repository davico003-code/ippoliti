'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

const markerIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="45" viewBox="0 0 30 42" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.444 15 27 15 27S30 25.444 30 15C30 6.716 23.284 0 15 0z" fill="#1A5C38" stroke="white" stroke-width="2.5"/>
    <circle cx="15" cy="15" r="6" fill="white"/>
  </svg>`,
  iconSize: [32, 45],
  iconAnchor: [16, 45],
})

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  const prev = useRef<string>('')
  useEffect(() => {
    const key = center.join(',')
    if (key !== prev.current) {
      prev.current = key
      map.flyTo(center, 15, { duration: 0.8 })
    }
  }, [center, map])
  return null
}

interface Props {
  center: [number, number]
  onPositionChange: (lat: number, lng: number) => void
}

export default function TasacionesMap({ center, onPositionChange }: Props) {
  const handlers = useMemo(() => ({
    dragend(e: L.DragEndEvent) {
      const latlng = e.target.getLatLng()
      onPositionChange(latlng.lat, latlng.lng)
    },
  }), [onPositionChange])

  return (
    <div className="w-full h-[280px] rounded-2xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <FlyTo center={center} />
        <Marker position={center} icon={markerIcon} draggable eventHandlers={handlers} />
      </MapContainer>
    </div>
  )
}

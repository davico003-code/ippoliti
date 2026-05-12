'use client'

// Mapa neutro con Leaflet. Tile OSM standard (sin CartoDB ni nada con marca de
// terceros). Renderiza un Circle de radio 300m sobre las coordenadas EXACTAS
// de la propiedad — NO usa Marker para no puntualizar la dirección.

import { MapContainer, TileLayer, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function NeutralMapInner({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div
      style={{
        height: 280,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #EAEAEA',
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Circle
          center={[lat, lng]}
          radius={300}
          pathOptions={{
            color: '#1A1A1A',
            weight: 1,
            fillColor: '#1A1A1A',
            fillOpacity: 0.08,
          }}
        />
      </MapContainer>
    </div>
  )
}

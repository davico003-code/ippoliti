'use client'

// Mapa de ubicación con pin clásico. Las coords ya vienen con offset 30-50m
// del lib (FichaSnapshot.lat/lng son las coords offseteadas, no las reales).
// Tile OSM standard, zoom 16, scroll-wheel desactivado para no chocar con el
// scroll vertical de la página.

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet por default busca el icon en /images/marker-icon.png que no existe
// en Next. Usamos los assets del CDN oficial para que el pin se vea siempre.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function LocationMapInner({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div
      className="locmap-wrap"
      style={{
        height: 350,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]} icon={defaultIcon} />
      </MapContainer>
      <style>{`
        @media (min-width: 768px) {
          .locmap-wrap { height: 450px !important; }
        }
      `}</style>
    </div>
  )
}

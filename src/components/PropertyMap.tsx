'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

function createMainMarker() {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="45" viewBox="0 0 30 42" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.444 15 27 15 27S30 25.444 30 15C30 6.716 23.284 0 15 0z" fill="#1A5C38" stroke="white" stroke-width="2.5"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`,
    iconSize: [32, 45],
    iconAnchor: [16, 45],
  })
}

function SetView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 15)
  }, [center, map])
  return null
}

export interface NearbyProperty {
  id: number
  lat: number
  lng: number
  title: string
  price: string
  slug: string
}

interface Props {
  lat: number | null
  lng: number | null
  address: string
}

export default function PropertyMap({ lat, lng, address }: Props) {
  const [coords, setCoords] = useState<[number, number] | null>(
    lat && lng && !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null
  )
  const [loading, setLoading] = useState(!coords)

  useEffect(() => {
    if (coords || !address) { setLoading(false); return }

    const q = encodeURIComponent(address + ', Santa Fe, Argentina')
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'es' },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [coords, address])

  if (loading) {
    return (
      <div className="w-full h-[280px] md:h-[380px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="w-6 h-6 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!coords) return null

  return (
    <div className="relative w-full h-[280px] md:h-[380px] rounded-xl overflow-hidden">
      <MapContainer
        center={coords}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <SetView center={coords} />
        <Marker position={coords} icon={createMainMarker()} />
      </MapContainer>
    </div>
  )
}

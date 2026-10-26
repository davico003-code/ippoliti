'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, Marker, useMap } from 'react-leaflet'
import { Crosshair, Maximize2, X } from 'lucide-react'
import CapaCalles from './CapaCalles'
import L from 'leaflet'
import type { BaseTiles } from '@/lib/map-tiles'

// En modo claro la ficha sigue con OpenStreetMap; en oscuro, la capa oscura.
const OSM_CLARAS: BaseTiles = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxNativeZoom: 19,
}

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

// Botón "Centrar en la propiedad" del mapa grande: vuelve a la vista inicial.
function Recentrar({ center }: { center: [number, number] }) {
  const map = useMap()
  return (
    <button
      type="button"
      onClick={() => map.setView(center, 15)}
      className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#24292B] shadow-lg"
    >
      <Crosshair className="h-4 w-4" aria-hidden />
      Centrar en la propiedad
    </button>
  )
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
  // Mapa grande: otro mapa encima de todo. El chico no se toca, así que al
  // cerrar la ficha queda exactamente en la vista de antes.
  const [grande, setGrande] = useState(false)

  useEffect(() => {
    if (!grande) return
    // En captura y cortando: Esc cierra el mapa grande, no la ficha que está debajo.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      setGrande(false)
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey, true)
    }
  }, [grande])

  // El estado se inicializa de props UNA vez: sin esto, al navegar de una ficha
  // a otra (mismo componente, sin key) el mapa se quedaba en la ubicación de la
  // propiedad anterior. Re-sincronizamos coords cuando cambian lat/lng.
  useEffect(() => {
    const has = lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
    setCoords(has ? [lat, lng] : null)
    setLoading(!has)
  }, [lat, lng])

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
        <CapaCalles claras={OSM_CLARAS} maxZoom={19} />
        <SetView center={coords} />
        <Marker position={coords} icon={createMainMarker()} />
      </MapContainer>
      <button
        type="button"
        onClick={() => setGrande(true)}
        aria-label="Ampliar mapa"
        className="absolute top-2.5 right-2.5 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#24292B] shadow-md"
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
      </button>

      {grande && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Mapa de la propiedad" className="fixed inset-0 z-[10500] bg-black">
          <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl>
            <CapaCalles claras={OSM_CLARAS} maxZoom={19} />
            <Marker position={coords} icon={createMainMarker()} />
            <Recentrar center={coords} />
          </MapContainer>
          <button
            type="button"
            onClick={() => setGrande(false)}
            aria-label="Cerrar mapa"
            className="absolute top-4 right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#24292B] shadow-lg"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}

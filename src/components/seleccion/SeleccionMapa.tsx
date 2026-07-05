'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Mapa de la selección del cliente (verficha) — pines teardrop verdes numerados
 * con la casita, sobre tiles CARTO light. Basado en el diseño de David.
 * Las propiedades sin coordenadas (externas sin geocodificar) no reciben pin:
 * igual aparecen en el listado lateral.
 */

export interface MapaProp {
  id: string
  num: number
  lat: number
  lng: number
  title: string
  liked?: boolean | null
}

const HOUSE = `<svg viewBox="0 0 24 24" fill="none"><path d="M3 11L12 3l9 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

function pinIcon(num: number, liked?: boolean | null): L.DivIcon {
  const bg = liked === false ? '#FF3B30' : '#1A5C38'
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;">
      <div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${bg};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.28);border:2px solid #fff;">
        <div style="transform:rotate(45deg);width:15px;height:15px;">${HOUSE}</div>
      </div>
      <div style="position:absolute;top:-7px;left:30px;background:#fff;border-radius:20px;padding:2px 8px;font:700 11px 'Poppins',system-ui,sans-serif;color:#123f27;box-shadow:0 2px 6px rgba(0,0,0,.16);white-space:nowrap;">#${num}</div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [17, 34],
  })
}

/** Encaja el viewport a todas las propiedades con coordenadas. */
function FitBounds({ props }: { props: MapaProp[] }) {
  const map = useMap()
  useEffect(() => {
    if (!props.length) return
    if (props.length === 1) {
      map.setView([props[0].lat, props[0].lng], 14)
      return
    }
    const bounds = L.latLngBounds(props.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [64, 64], maxZoom: 14 })
  }, [props, map])
  return null
}

export default function SeleccionMapa({
  props,
  onSelect,
}: {
  props: MapaProp[]
  onSelect?: (id: string) => void
}) {
  const center: [number, number] = props[0] ? [props[0].lat, props[0].lng] : [-32.93, -60.82]
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      zoomControl
      style={{ width: '100%', height: '100%', minHeight: '100%', background: '#eef1ee' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
        subdomains="abcd"
        maxZoom={19}
      />
      <FitBounds props={props} />
      {props.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={pinIcon(p.num, p.liked)}
          eventHandlers={onSelect ? { click: () => onSelect(p.id) } : undefined}
        />
      ))}
    </MapContainer>
  )
}

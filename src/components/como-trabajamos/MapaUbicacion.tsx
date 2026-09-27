'use client'

// Mapa de /como-trabajamos: la oficina de Funes destacada, las dos de Roldán
// y Rosario como referencia, para que se entienda la ubicación estratégica.
// Leaflet se importa recién en el cliente (igual que /nosotros) y sin zoom
// con la rueda: es una página para mostrar en la TV o recorrer con el dedo.

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { LIGHT_TILES } from '@/lib/map-tiles'

const PUNTOS = [
  { lat: -32.9263509, lng: -60.8115424, nombre: 'SI INMOBILIARIA · Funes', tipo: 'principal' as const },
  { lat: -32.9018631, lng: -60.9107469, nombre: 'Roldán · casa matriz', tipo: 'oficina' as const },
  { lat: -32.905467, lng: -60.909775, nombre: 'Roldán · sede comercial', tipo: 'oficina' as const },
  { lat: -32.9468, lng: -60.6393, nombre: 'Rosario', tipo: 'referencia' as const },
]

export default function MapaUbicacion({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapa = useRef<unknown>(null)

  useEffect(() => {
    if (mapa.current || !ref.current) return
    let cancelado = false
    import('leaflet').then((L) => {
      if (cancelado || !ref.current) return
      const map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true })
      mapa.current = map
      L.tileLayer(LIGHT_TILES.url, {
        attribution: LIGHT_TILES.attribution,
        subdomains: 'abcd',
        maxZoom: 19,
        maxNativeZoom: LIGHT_TILES.maxNativeZoom,
      }).addTo(map)

      PUNTOS.forEach((p) => {
        const principal = p.tipo === 'principal'
        const referencia = p.tipo === 'referencia'
        const html = referencia
          ? `<div style="transform:translate(-50%,-50%);white-space:nowrap;font:800 13px Raleway,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5b6170;background:rgba(255,255,255,.85);padding:4px 10px;border-radius:999px">${p.nombre}</div>`
          : `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center">
               <div style="white-space:nowrap;font:${principal ? '800 13px' : '700 11.5px'} Raleway,sans-serif;color:#fff;background:${principal ? '#1A5C38' : '#0E3521'};padding:${principal ? '7px 12px' : '5px 10px'};border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.25)">${p.nombre}</div>
               <div style="width:2px;height:${principal ? 14 : 10}px;background:${principal ? '#1A5C38' : '#0E3521'}"></div>
               <div style="width:${principal ? 14 : 10}px;height:${principal ? 14 : 10}px;border-radius:50%;background:${principal ? '#1A5C38' : '#0E3521'};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>
             </div>`
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({ html, className: '', iconSize: [0, 0] }),
          interactive: false,
          zIndexOffset: principal ? 1000 : 0,
        }).addTo(map)
      })

      map.fitBounds(
        L.latLngBounds(PUNTOS.map((p) => [p.lat, p.lng] as [number, number])),
        { padding: [70, 70] },
      )
    })
    return () => {
      cancelado = true
    }
  }, [])

  return <div ref={ref} className={className} role="img" aria-label="Mapa con la oficina de Funes, las dos oficinas de Roldán y Rosario como referencia" />
}

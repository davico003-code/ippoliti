// Datos y piezas compartidas de las sedes (las usan las tres variantes).

import { MapPin } from 'lucide-react'
import type { Horario } from './EstadoSede'

export const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
export const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
export const VERDE = '#1A5C38'
const WHATSAPP = '5493413340916'

export type Sede = {
  n: string
  anio: string
  nombre: string
  subtitulo: string
  ciudad: string
  direccion: string
  foto: string
  lat: number
  lng: number
  horario: Horario | null
}

// Coordenadas por número de calle (OpenStreetMap / Nominatim, 27-sep-2026).
export const SEDES: Sede[] = [
  { n: '01', anio: '1983', nombre: 'Oficina Histórica', subtitulo: 'Donde empezó todo', ciudad: 'Roldán', direccion: '1ro de Mayo 258, Roldán', foto: '/images/sedes/historica.webp', lat: -32.901262, lng: -60.9106239, horario: null },
  { n: '02', anio: '2015', nombre: 'Oficina Ventas', subtitulo: 'Sede comercial', ciudad: 'Roldán', direccion: 'Catamarca 775, Roldán', foto: '/images/sedes/ventas.webp', lat: -32.9054168, lng: -60.9097686, horario: null },
  { n: '03', anio: '2024', nombre: 'Oficina Funes', subtitulo: 'Inmobiliaria + Galería de Arte', ciudad: 'Funes', direccion: 'Hipólito Yrigoyen 2643, Funes', foto: '/images/sedes/funes.webp', lat: -32.9263523, lng: -60.8117412, horario: { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 13] } },
]

export const linkMapa = (s: Sede) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`SI INMOBILIARIA ${s.direccion}, Santa Fe`)}`
export const linkWsp = (s: Sede) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Quiero pasar por la ${s.nombre} (${s.direccion}).`)}`

function IconoWsp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
  )
}

/** "Cómo llegar" + WhatsApp. `claro` para usar sobre foto oscura. */
export function Acciones({ s, claro = false }: { s: Sede; claro?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={linkMapa(s)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${claro ? 'bg-white/15 text-white backdrop-blur-md hover:bg-white/25' : 'border border-gray-300 text-gray-900 hover:border-gray-900'}`}
        style={{ fontFamily: RALEWAY, textDecoration: 'none' }}
      >
        <MapPin className="h-3.5 w-3.5" /> Cómo llegar
      </a>
      <a
        href={linkWsp(s)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-opacity hover:opacity-90 ${claro ? 'bg-white text-gray-900' : 'text-white'}`}
        style={{ background: claro ? undefined : VERDE, fontFamily: RALEWAY, textDecoration: 'none' }}
      >
        <IconoWsp /> WhatsApp
      </a>
    </div>
  )
}

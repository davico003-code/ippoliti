'use client'

// "Cerca": lo más cercano de cada rubro en UN renglón de chips
// ("Escuela · 333 m", "Farmacia · 210 m"…). Reemplaza la grilla de 7 tarjetas.
//
// Overpass (OpenStreetMap) en UNA sola consulta. Antes eran 7 en paralelo y
// Overpass corta a ~2 simultáneas por IP: las demás volvían 429 y se mostraban
// como "Sin resultados en la zona" (en Pichincha decía que no había farmacias).
// Un rubro sin resultado ahora simplemente no aparece; sin nada, la fila no se
// dibuja. Lazy (IntersectionObserver) + cache localStorage 24 h por coords.

import { useEffect, useRef, useState } from 'react'
import {
  Bus,
  GraduationCap,
  Landmark,
  Pill,
  ShoppingCart,
  Stethoscope,
  TrainFront,
  Trees,
  type LucideIcon,
} from 'lucide-react'
import { FONDO_SUAVE, TEXTO, TINTA } from './estilos'

interface Rubro {
  key: string
  label: string
  Icon: LucideIcon
  radio: number
  filtro: string
  es: (t: Record<string, string>) => boolean
}

// Orden = orden de los chips.
const RUBROS: Rubro[] = [
  { key: 'escuela', label: 'Escuela', Icon: GraduationCap, radio: 1500, filtro: 'nwr["amenity"="school"]', es: t => t.amenity === 'school' },
  { key: 'super', label: 'Súper', Icon: ShoppingCart, radio: 1200, filtro: 'nwr["shop"~"^(supermarket|convenience)$"]', es: t => t.shop === 'supermarket' || t.shop === 'convenience' },
  { key: 'farmacia', label: 'Farmacia', Icon: Pill, radio: 1200, filtro: 'nwr["amenity"="pharmacy"]', es: t => t.amenity === 'pharmacy' },
  { key: 'colectivo', label: 'Colectivo', Icon: Bus, radio: 500, filtro: 'node["highway"="bus_stop"]', es: t => t.highway === 'bus_stop' },
  { key: 'tren', label: 'Tren', Icon: TrainFront, radio: 2000, filtro: 'nwr["railway"~"^(station|halt)$"]', es: t => t.railway === 'station' || t.railway === 'halt' },
  { key: 'plaza', label: 'Plaza', Icon: Trees, radio: 1000, filtro: 'nwr["leisure"~"^(park|playground)$"]', es: t => t.leisure === 'park' || t.leisure === 'playground' },
  { key: 'salud', label: 'Salud', Icon: Stethoscope, radio: 2500, filtro: 'nwr["amenity"~"^(hospital|clinic)$"]', es: t => t.amenity === 'hospital' || t.amenity === 'clinic' },
  { key: 'banco', label: 'Banco', Icon: Landmark, radio: 1200, filtro: 'nwr["amenity"="bank"]', es: t => t.amenity === 'bank' },
]

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const TIMEOUT_MS = 9000
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface Cercano {
  key: string
  distancia: number
  nombre?: string
}

interface OverpassElement {
  tags?: Record<string, string>
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.max(50, Math.round(m / 10) * 10)} m`
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`
}

const cacheKey = (lat: number, lng: number) => `vfc_cerca_v1_${lat.toFixed(4)}_${lng.toFixed(4)}`

function leerCache(key: string): Cercano[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { t: number; v: Cercano[] }
    if (!parsed || typeof parsed.t !== 'number' || Date.now() - parsed.t > CACHE_TTL_MS) return null
    return parsed.v
  } catch {
    return null
  }
}

function guardarCache(key: string, v: Cercano[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }))
  } catch {
    /* quota / modo privado */
  }
}

async function buscarCercanos(lat: number, lng: number, signal: AbortSignal): Promise<Cercano[] | null> {
  const partes = RUBROS.map(r => `${r.filtro}(around:${r.radio},${lat},${lng});`).join('')
  const body = `data=${encodeURIComponent(`[out:json][timeout:8];(${partes});out center 600;`)}`

  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal,
      })
      if (!r.ok) continue
      const data = (await r.json()) as { elements?: OverpassElement[] }
      if (!Array.isArray(data.elements)) continue

      const mejor = new Map<string, Cercano>()
      for (const el of data.elements) {
        const tags = el.tags || {}
        const elLat = el.lat ?? el.center?.lat
        const elLng = el.lon ?? el.center?.lon
        if (!elLat || !elLng) continue
        const rubro = RUBROS.find(rb => rb.es(tags))
        if (!rubro) continue
        const distancia = Math.round(haversineMeters(lat, lng, elLat, elLng))
        const prev = mejor.get(rubro.key)
        if (!prev || distancia < prev.distancia) mejor.set(rubro.key, { key: rubro.key, distancia, nombre: tags.name })
      }
      return RUBROS.map(rb => mejor.get(rb.key)).filter((c): c is Cercano => Boolean(c))
    } catch {
      /* probar el siguiente endpoint */
    }
  }
  return null
}

export default function CercaChips({ lat, lng }: { lat: number; lng: number }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [cercanos, setCercanos] = useState<Cercano[] | null>(null)
  const [termino, setTermino] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const key = cacheKey(lat, lng)
    const cache = leerCache(key)
    if (cache) {
      setCercanos(cache)
      setTermino(true)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    buscarCercanos(lat, lng, controller.signal)
      .then(res => {
        if (res) {
          guardarCache(key, res)
          setCercanos(res)
        }
      })
      .finally(() => {
        clearTimeout(timer)
        setTermino(true)
      })
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [visible, lat, lng])

  // Sin nada que mostrar (o Overpass caído): no se dibuja la fila.
  if (termino && (!cercanos || cercanos.length === 0)) return null

  return (
    <div ref={rootRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 36 }}>
      {!termino &&
        [92, 84, 104].map((w, i) => (
          <span key={i} aria-hidden style={{ width: w, height: 36, borderRadius: 999, background: FONDO_SUAVE }} />
        ))}
      {termino &&
        cercanos?.map(c => {
          const rubro = RUBROS.find(r => r.key === c.key)
          if (!rubro) return null
          return (
            <span
              key={c.key}
              title={c.nombre}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 36,
                padding: '0 12px',
                borderRadius: 999,
                background: FONDO_SUAVE,
                fontSize: 14,
                color: TEXTO,
                whiteSpace: 'nowrap',
              }}
            >
              <rubro.Icon size={16} strokeWidth={1.7} color={TINTA} aria-hidden />
              {rubro.label} · {formatDistance(c.distancia)}
            </span>
          )
        })}
    </div>
  )
}

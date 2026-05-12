'use client'

// Lugares cercanos vía Overpass API (OpenStreetMap).
//
// Replica de la lógica de components/NearbyPlaces del sitio SI con paleta
// neutra y AMPLIADA a 7 categorías. Sin API key, sin env vars: Overpass es
// público (rate-limited pero suficiente para uso ocasional).
//
// Optimizaciones (heredadas del original SI):
//   • 7 fetches PARALELOS, streaming visual (cada categoría aparece apenas
//     llega su fetch).
//   • Cache localStorage prefix vfc_nearby_* por bucket de coords (4 dec).
//     TTL 1h. Distinto al cache del sitio SI (si_nearby_*) para no chocar.
//   • IntersectionObserver con rootMargin 300px — fetch lazy.
//   • Timeout 5s por request vía AbortController.
//   • Fallback al mirror overpass.kumi.systems si el primer endpoint falla.
//   • Skeleton loader durante carga.
//   • Si una categoría falla, no rompe — solo no aparece esa card.

import { useEffect, useRef, useState } from 'react'
import {
  Bus,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Landmark,
  Plus,
  ShoppingCart,
  Train,
  Trees,
  type LucideIcon,
} from 'lucide-react'

interface Place {
  name: string
  distance: number
  category: string
  level?: string
  levelColor?: string
  access?: 'Público' | 'Privado'
  badge?: string // Para transporte ("Colectivo", "Tren", ...) y bancos ("Banco", "Cajero")
}

interface CategoryDef {
  key: string
  label: string
  Icon: LucideIcon
  color: string
  radius: number
  // Función que construye la query Overpass. Algunas categorías combinan
  // varios tags (transporte: bus_stop + railway station).
  buildQuery: (lat: number, lng: number, radius: number) => string
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'hospital',
    label: 'Hospitales y sanatorios',
    Icon: HeartPulse,
    color: '#DC2626',
    radius: 2000,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["amenity"~"^(hospital|clinic)$"](around:${r},${lat},${lng}););out center 30;`,
  },
  {
    key: 'pharmacy',
    label: 'Farmacias',
    Icon: Plus,
    color: '#059669',
    radius: 1500,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["amenity"="pharmacy"](around:${r},${lat},${lng}););out center 30;`,
  },
  {
    key: 'school',
    label: 'Escuelas',
    Icon: GraduationCap,
    color: '#2563EB',
    radius: 2000,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["amenity"="school"](around:${r},${lat},${lng}););out center 30;`,
  },
  {
    key: 'supermarket',
    label: 'Supermercados',
    Icon: ShoppingCart,
    color: '#EA580C',
    radius: 1500,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["shop"~"^(supermarket|convenience)$"](around:${r},${lat},${lng}););out center 30;`,
  },
  {
    key: 'transport',
    label: 'Transporte',
    Icon: Bus,
    color: '#7C3AED',
    radius: 1000,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["highway"="bus_stop"](around:${r},${lat},${lng});nwr["railway"~"^(station|halt|tram_stop)$"](around:${r},${lat},${lng}););out center 30;`,
  },
  {
    key: 'bank',
    label: 'Bancos y cajeros',
    Icon: Landmark,
    color: '#0891B2',
    radius: 1500,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["amenity"~"^(bank|atm)$"](around:${r},${lat},${lng}););out center 30;`,
  },
  {
    key: 'park',
    label: 'Plazas y parques',
    Icon: Trees,
    color: '#16A34A',
    radius: 1000,
    buildQuery: (lat, lng, r) =>
      `[out:json][timeout:8];(nwr["leisure"~"^(park|garden|playground)$"](around:${r},${lat},${lng}););out center 30;`,
  },
]

const PRIVATE_PATTERNS = /\b(san |santa |sagrado|nuestra|instituto|colegio|privad|parish|parroquial)/i
const TIMEOUT_MS = 5000
const CACHE_TTL_MS = 60 * 60 * 1000
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function cacheKey(lat: number, lng: number, k: string) {
  return `vfc_nearby_${k}_${lat.toFixed(4)}_${lng.toFixed(4)}`
}
function readCache(key: string): Place[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { t: number; v: Place[] }
    if (!parsed || typeof parsed.t !== 'number') return null
    if (Date.now() - parsed.t > CACHE_TTL_MS) return null
    return parsed.v
  } catch {
    return null
  }
}
function writeCache(key: string, places: Place[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: places }))
  } catch {
    /* quota */
  }
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`
  const km = m / 1000
  return `${km.toFixed(1).replace('.', ',')} km`
}

interface OverpassElement {
  tags?: Record<string, string>
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
}

async function fetchCategory(
  cat: CategoryDef,
  lat: number,
  lng: number,
  signal: AbortSignal,
): Promise<Place[]> {
  const key = cacheKey(lat, lng, cat.key)
  const cached = readCache(key)
  if (cached) return cached

  const body = `data=${encodeURIComponent(cat.buildQuery(lat, lng, cat.radius))}`
  let data: { elements?: OverpassElement[] } | null = null

  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal,
      })
      if (!r.ok) continue
      data = await r.json()
      break
    } catch {
      /* try next */
    }
  }
  if (!data || !Array.isArray(data.elements)) return []

  const places: Place[] = []
  for (const el of data.elements) {
    const tags = el.tags || {}
    const elLat = el.lat ?? el.center?.lat
    const elLng = el.lon ?? el.center?.lon
    if (!elLat || !elLng) continue
    const name = tags.name
    if (!name) continue
    const dist = Math.round(haversineMeters(lat, lng, elLat, elLng))

    if (cat.key === 'school') {
      const isPrivate =
        tags['operator:type'] === 'private' || PRIVATE_PATTERNS.test(name)
      const access: 'Público' | 'Privado' = isPrivate ? 'Privado' : 'Público'
      const isced = tags['isced:level'] || tags['school:type'] || ''
      const nameLower = name.toLowerCase()
      let level = 'Escuela'
      let levelColor = '#6b7280'
      if (/jard[ií]n|inicial|infantil|preescolar/i.test(nameLower) || isced === '0') {
        level = 'Inicial'
        levelColor = '#16a34a'
      } else if (/primari[ao]|elemental/i.test(nameLower) || isced === '1') {
        level = 'Primario'
        levelColor = '#2563eb'
      } else if (
        /secundari[ao]|bachiller|t[eé]cnic|medio/i.test(nameLower) ||
        isced === '2' ||
        isced === '3'
      ) {
        level = 'Secundario'
        levelColor = '#ea580c'
      } else if (
        /universid|facultad|instituto\s+(superior|terciario)/i.test(nameLower) ||
        isced === '4' ||
        isced === '5' ||
        isced === '6'
      ) {
        level = 'Terciario'
        levelColor = '#7c3aed'
      }
      places.push({ name, distance: dist, category: cat.key, level, levelColor, access })
    } else if (cat.key === 'transport') {
      let badge = 'Parada'
      if (tags.railway === 'station' || tags.railway === 'halt') badge = 'Tren'
      else if (tags.railway === 'tram_stop') badge = 'Tranvía'
      else if (tags.highway === 'bus_stop') badge = 'Colectivo'
      places.push({ name, distance: dist, category: cat.key, badge })
    } else if (cat.key === 'bank') {
      const badge = tags.amenity === 'atm' ? 'Cajero' : 'Banco'
      places.push({ name, distance: dist, category: cat.key, badge })
    } else {
      places.push({ name, distance: dist, category: cat.key })
    }
  }
  places.sort((a, b) => a.distance - b.distance)
  const top = places.slice(0, 5)
  writeCache(key, top)
  return top
}

function Skeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
      }}
    >
      {CATEGORIES.map((c, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F3F4F6' }} />
            <div style={{ height: 14, width: 140, background: '#F3F4F6', borderRadius: 4 }} />
          </div>
          <div>
            {[0, 1, 2].map(j => (
              <div
                key={j}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #F3F4F6',
                }}
              >
                <div style={{ height: 12, width: 160, background: '#F3F4F6', borderRadius: 4 }} />
                <div style={{ height: 12, width: 36, background: '#F3F4F6', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NearbyPlacesNeutral({ lat, lng }: { lat: number; lng: number }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [places, setPlaces] = useState<Record<string, Place[]>>({})
  const [doneCats, setDoneCats] = useState<Set<string>>(new Set())
  const [error, setError] = useState(false)

  // Lazy intersection
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
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  // Fetch en paralelo con timeout
  useEffect(() => {
    if (!visible) return
    setError(false)
    setDoneCats(new Set())
    setPlaces({})
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const tasks = CATEGORIES.map(cat =>
      fetchCategory(cat, lat, lng, controller.signal)
        .then(result => {
          setPlaces(prev => ({ ...prev, [cat.key]: result }))
          setDoneCats(prev => {
            const next = new Set(prev)
            next.add(cat.key)
            return next
          })
        })
        .catch(() => {
          setDoneCats(prev => {
            const next = new Set(prev)
            next.add(cat.key)
            return next
          })
        }),
    )

    Promise.allSettled(tasks).finally(() => {
      clearTimeout(timer)
      setPlaces(current => {
        const any = Object.values(current).some(arr => arr.length > 0)
        if (!any) setError(true)
        return current
      })
    })

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [visible, lat, lng])

  const loading = visible && doneCats.size < CATEGORIES.length
  const hasAny = Object.values(places).some(arr => arr.length > 0)

  return (
    <section ref={rootRef} style={{ marginTop: 36 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        Qué hay cerca
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 18px' }}>
        Servicios y puntos de interés en la zona
      </p>

      {!visible && <Skeleton />}
      {visible && loading && !hasAny && <Skeleton />}

      {visible && error && !hasAny && (
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>
          Servicio de lugares cercanos temporalmente no disponible. Probá recargar en unos minutos.
        </p>
      )}

      {visible && hasAny && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {CATEGORIES.map(cat => {
            // Si la categoría todavía no terminó (loading) o falló completamente,
            // no la mostramos. Sí la mostramos cuando terminó con array vacío
            // ("Sin resultados en la zona") para que el usuario sepa que se buscó.
            if (!doneCats.has(cat.key)) return null
            const items = places[cat.key] || []
            return (
              <div
                key={cat.key}
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${cat.color}1A`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <cat.Icon size={20} color={cat.color} strokeWidth={1.8} />
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      margin: 0,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {cat.label}
                  </h3>
                </div>

                {items.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#9CA3AF', padding: '6px 0' }}>
                    Sin resultados en la zona
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((p, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '10px 0',
                          borderBottom: i === items.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {p.level && (
                            <span
                              style={{
                                padding: '2px 6px',
                                fontSize: 9,
                                fontWeight: 700,
                                borderRadius: 4,
                                color: '#fff',
                                background: p.levelColor,
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {p.level}
                            </span>
                          )}
                          {p.access && (
                            <span
                              style={{
                                padding: '2px 6px',
                                fontSize: 9,
                                fontWeight: 700,
                                borderRadius: 4,
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                background: p.access === 'Privado' ? '#F3E8FF' : '#F3F4F6',
                                color: p.access === 'Privado' ? '#7C3AED' : '#6B7280',
                              }}
                            >
                              {p.access}
                            </span>
                          )}
                          {p.badge && (
                            <span
                              style={{
                                padding: '2px 6px',
                                fontSize: 9,
                                fontWeight: 700,
                                borderRadius: 4,
                                color: '#fff',
                                background: cat.color,
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {p.badge}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 14,
                              color: '#1A1A1A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: '#9CA3AF',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {formatDistance(p.distance)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// Silenciamos el warning de ESLint por las imports que se ven como no usados;
// CreditCard y Train están listados como alternativas semánticas si el equipo
// quiere swap-ear los íconos sin tocar el resto del archivo.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _alternates = { CreditCard, Train }

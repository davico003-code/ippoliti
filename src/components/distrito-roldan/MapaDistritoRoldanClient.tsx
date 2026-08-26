'use client'

// Mapa interactivo de Distrito Roldán (slug 67178).
// Leaflet crudo (imperativo) para la animación de rutas, React state solo para
// botones/banner. Réplica 1:1 de ~/Downloads/mapa-distrito-preview.html.
// Se monta vía dynamic(ssr:false) desde MapaDistritoRoldan.tsx — por eso es
// seguro importar leaflet a tope (nunca corre en SSR).

import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Building2, TreePine, MapPin } from 'lucide-react'
import { LIGHT_TILES } from '@/lib/map-tiles'

const MONTSERRAT = 'var(--font-montserrat), Montserrat, sans-serif'

// Coordenadas exactas (verificadas en Google Maps).
const DISTRITO: [number, number] = [-32.9098725, -60.8876773]

type DestKey = 'rosario' | 'funes' | 'roldan'

// km/min son manuales (los reales), no se derivan de OSRM. La geometría de la
// ruta se pide a OSRM en runtime y se cachea.
const DESTINOS: Record<DestKey, { nombre: string; coords: [number, number]; km: number; min: number }> = {
  roldan: { nombre: 'Centro de Roldán', coords: [-32.899, -60.902], km: 3, min: 2 },
  funes: { nombre: 'Funes', coords: [-32.9168, -60.8092], km: 10, min: 12 },
  rosario: { nombre: 'Rosario centro', coords: [-32.9468, -60.6396], km: 20, min: 25 },
}

// Waypoints de fallback (si OSRM falla / timeout).
const FALLBACK_ROUTES: Record<DestKey, [number, number][]> = {
  roldan: [
    [-32.9098725, -60.8876773],
    [-32.9055, -60.892],
    [-32.899, -60.902],
  ],
  funes: [
    [-32.9098725, -60.8876773],
    [-32.912, -60.87],
    [-32.915, -60.84],
    [-32.9168, -60.8092],
  ],
  rosario: [
    [-32.9098725, -60.8876773],
    [-32.913, -60.865],
    [-32.918, -60.8],
    [-32.93, -60.75],
    [-32.945, -60.7],
    [-32.9468, -60.6396],
  ],
}

// Orden visual de los botones + íconos lucide.
const BOTONES: { key: DestKey; Icon: typeof Building2 }[] = [
  { key: 'rosario', Icon: Building2 },
  { key: 'funes', Icon: TreePine },
  { key: 'roldan', Icon: MapPin },
]

const PIN_SVG =
  '<svg viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg"><path d="M14 0 C6.3 0 0 6.3 0 14 C0 24.5 14 40 14 40 C14 40 28 24.5 28 14 C28 6.3 21.7 0 14 0 Z" fill="#1a1a1a"/><circle cx="14" cy="14" r="5" fill="#ffffff"/></svg>'

// Pide la ruta real a OSRM público. OSRM espera lng,lat (al revés que Leaflet).
async function fetchOSRM(origen: [number, number], destino: [number, number]): Promise<[number, number][]> {
  const url =
    'https://router.project-osrm.org/route/v1/driving/' +
    `${origen[1]},${origen[0]};${destino[1]},${destino[0]}` +
    '?overview=full&geometries=geojson'
  const ctrl = new AbortController()
  const timeoutId = setTimeout(() => ctrl.abort(), 4000)
  try {
    const r = await fetch(url, { signal: ctrl.signal })
    if (!r.ok) throw new Error(`OSRM HTTP ${r.status}`)
    const data = await r.json()
    if (!data.routes || !data.routes.length) throw new Error('Sin rutas')
    // GeoJSON viene [lng, lat] → invertir a [lat, lng].
    return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
  } finally {
    clearTimeout(timeoutId)
  }
}

// Distancia acumulada por segmento (en grados; sirve solo para interpolar).
function totalLength(coords: [number, number][]) {
  let total = 0
  const segs = [0]
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0]
    const dy = coords[i][1] - coords[i - 1][1]
    total += Math.sqrt(dx * dx + dy * dy)
    segs.push(total)
  }
  return { total, segs }
}

// Devuelve la porción de la ruta hasta la fracción t (0..1) interpolando.
function pathUpTo(coords: [number, number][], t: number): [number, number][] {
  const { total, segs } = totalLength(coords)
  const targetDist = total * t
  const result: [number, number][] = [coords[0]]
  for (let i = 1; i < coords.length; i++) {
    if (segs[i] <= targetDist) {
      result.push(coords[i])
    } else {
      const prevDist = segs[i - 1]
      const segDist = segs[i] - prevDist
      const ratio = (targetDist - prevDist) / segDist
      const lat = coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * ratio
      const lng = coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * ratio
      result.push([lat, lng])
      break
    }
  }
  return result
}

export default function MapaDistritoRoldanClient() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)
  const destMarkerRef = useRef<L.Marker | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const countFrameRef = useRef<number | null>(null)
  const routeCacheRef = useRef<Partial<Record<DestKey, [number, number][]>>>({})

  const [activeDest, setActiveDest] = useState<DestKey | null>(null)
  const [loadingDest, setLoadingDest] = useState<DestKey | null>(null)
  const [banner, setBanner] = useState<{ nombre: string; km: number; min: number } | null>(null)

  // Inicialización del mapa (una sola vez).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    }).setView(DISTRITO, 14)
    mapRef.current = map

    L.tileLayer(LIGHT_TILES.url, {
      attribution: LIGHT_TILES.attribution,
      maxZoom: 19,
    }).addTo(map)

    const iconMain = L.divIcon({
      className: '',
      html: `<div class="dr-pin-classic">${PIN_SVG}</div>`,
      iconSize: [28, 40],
      iconAnchor: [14, 40],
    })
    L.marker(DISTRITO, { icon: iconMain, zIndexOffset: 1000 })
      .addTo(map)
      .bindTooltip('Distrito Roldán', {
        permanent: true,
        direction: 'top',
        offset: [0, -42],
        className: 'tt-main',
      })

    // El contenedor se mide tarde (sección lejos del fold, aspect-ratio que
    // resuelve después del primer paint) → Leaflet renderiza tiles grises si
    // su tamaño quedó en 0. Re-medimos de forma agresiva:
    //  - rAF + varios timeouts para cubrir el primer layout,
    //  - ResizeObserver para cualquier cambio de tamaño posterior.
    const safeInvalidate = () => {
      if (mapRef.current) mapRef.current.invalidateSize()
    }
    const raf = requestAnimationFrame(safeInvalidate)
    const timeouts = [0, 200, 600].map((ms) => setTimeout(safeInvalidate, ms))

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(safeInvalidate)
      ro.observe(containerRef.current)
    }

    return () => {
      cancelAnimationFrame(raf)
      timeouts.forEach(clearTimeout)
      if (ro) ro.disconnect()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (countFrameRef.current) cancelAnimationFrame(countFrameRef.current)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Cancela animaciones en curso y limpia línea + marker del destino anterior.
  const clearAnim = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (countFrameRef.current) {
      cancelAnimationFrame(countFrameRef.current)
      countFrameRef.current = null
    }
    const map = mapRef.current
    if (lineRef.current && map) {
      map.removeLayer(lineRef.current)
      lineRef.current = null
    }
    if (destMarkerRef.current && map) {
      map.removeLayer(destMarkerRef.current)
      destMarkerRef.current = null
    }
  }, [])

  // Ejecuta la animación de recorrido una vez que tenemos la geometría.
  const ejecutarAnimacion = useCallback((destKey: DestKey, ruta: [number, number][]) => {
    const map = mapRef.current
    if (!map) return
    const d = DESTINOS[destKey]

    setLoadingDest(null)
    setActiveDest(destKey)

    map.fitBounds(L.latLngBounds(ruta), { padding: [80, 80], maxZoom: 13, animate: true })

    const endPoint = ruta[ruta.length - 1]
    destMarkerRef.current = L.marker(endPoint, {
      icon: L.divIcon({ className: '', html: '<div class="dr-pin-dest"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
    })
      .addTo(map)
      .bindTooltip(d.nombre, { permanent: true, direction: 'top', offset: [0, -10], className: 'tt-dest' })

    const line = L.polyline([ruta[0]], {
      color: '#1a1a1a',
      weight: 3.5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1,
    }).addTo(map)
    lineRef.current = line

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      line.setLatLngs(ruta)
      setBanner({ nombre: d.nombre, km: d.km, min: d.min })
      return
    }

    let t0: number | null = null
    const duration = 1700
    const step = (ts: number) => {
      if (t0 === null) t0 = ts
      const t = Math.min(1, (ts - t0) / duration)
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      line.setLatLngs(pathUpTo(ruta, ease))
      if (t < 1) animFrameRef.current = requestAnimationFrame(step)
    }
    animFrameRef.current = requestAnimationFrame(step)

    // Count-up del banner (km / min).
    setBanner({ nombre: d.nombre, km: 0, min: 0 })
    let c0: number | null = null
    const countUp = (ts: number) => {
      if (c0 === null) c0 = ts
      const t = Math.min(1, (ts - c0) / 1300)
      const ease = 1 - Math.pow(1 - t, 3)
      setBanner({ nombre: d.nombre, km: Math.round(d.km * ease), min: Math.round(d.min * ease) })
      if (t < 1) countFrameRef.current = requestAnimationFrame(countUp)
    }
    countFrameRef.current = requestAnimationFrame(countUp)
  }, [])

  const animar = useCallback(
    async (destKey: DestKey) => {
      if (!mapRef.current) return
      clearAnim()
      setActiveDest(destKey)

      const cached = routeCacheRef.current[destKey]
      if (cached) {
        ejecutarAnimacion(destKey, cached)
        return
      }

      setLoadingDest(destKey)
      try {
        const ruta = await fetchOSRM(DISTRITO, DESTINOS[destKey].coords)
        routeCacheRef.current[destKey] = ruta
        ejecutarAnimacion(destKey, ruta)
      } catch (err) {
        console.warn('OSRM falló, usando fallback:', err)
        const ruta = FALLBACK_ROUTES[destKey]
        routeCacheRef.current[destKey] = ruta
        ejecutarAnimacion(destKey, ruta)
      }
    },
    [clearAnim, ejecutarAnimacion]
  )

  return (
    <div>
      {/* Mapa — altura fija en px (no aspect-ratio): el contenedor de Leaflet
          recibe `position:relative !important` desde globals.css, que pisaría un
          `absolute inset-0` y colapsaría el alto a 0. Con alto definido + hijo
          h-full, `height:100%` resuelve y los tiles se miden bien. */}
      <div className="h-[380px] w-full overflow-hidden border border-[#345544]/[0.15] bg-[#345544]/10 md:h-[520px]">
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Botones */}
      <div className="mt-[18px] grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {BOTONES.map(({ key, Icon }) => {
          const isActive = activeDest === key
          const isLoading = loadingDest === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => animar(key)}
              disabled={isLoading}
              className="dr-btn flex min-h-14 items-center gap-3 rounded-full border px-[18px] py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35E21] focus-visible:ring-offset-2"
              style={{
                fontFamily: MONTSERRAT,
                background: isActive ? '#345544' : '#fff',
                color: isActive ? '#fff' : '#345544',
                borderColor: isActive ? '#345544' : 'rgba(52,85,68,.2)',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
              data-active={isActive ? 'true' : 'false'}
            >
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200"
                style={{ background: isActive ? 'rgba(255,255,255,0.18)' : '#F8F1E6' }}
              >
                <Icon
                  size={16}
                  className={isLoading ? 'dr-pulse' : undefined}
                  style={{ color: isActive ? '#fff' : '#B35E21' }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block uppercase"
                  style={{ fontSize: 10, fontWeight: 500, opacity: 0.65, letterSpacing: '0.1em', marginBottom: 2 }}
                >
                  Distancia a
                </span>
                <span className="block" style={{ fontSize: 14, fontWeight: 600 }}>
                  {DESTINOS[key].nombre}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Banner */}
      <div
        className="dr-banner mt-3.5 flex items-center justify-around gap-4 border border-[#345544]/[0.15] bg-white px-[22px] py-[18px] transition-[opacity,transform] duration-[350ms]"
        style={{
          opacity: banner ? 1 : 0,
          transform: banner ? 'translateY(0)' : 'translateY(4px)',
          pointerEvents: banner ? 'auto' : 'none',
        }}
        aria-hidden={!banner}
      >
        <div className="dr-stat flex flex-col gap-1 text-center">
          <span className="dr-label uppercase" style={{ fontSize: 10, color: '#345544', letterSpacing: '0.12em', fontWeight: 600, opacity: 0.65 }}>
            Destino
          </span>
          <span style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 18, color: '#345544', letterSpacing: '-0.01em' }}>
            {banner?.nombre ?? '—'}
          </span>
        </div>
        <div className="dr-sep h-9 w-px bg-[#345544]/[0.15]" />
        <div className="dr-stat flex flex-col gap-1 text-center">
          <span className="dr-label uppercase" style={{ fontSize: 10, color: '#345544', letterSpacing: '0.12em', fontWeight: 600, opacity: 0.65 }}>
            Distancia
          </span>
          <span style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 26, color: '#345544', letterSpacing: '-0.01em' }}>
            {banner?.km ?? 0}
            <small style={{ fontSize: 13, fontWeight: 400, color: '#345544', opacity: 0.7, marginLeft: 3 }}>km</small>
          </span>
        </div>
        <div className="dr-sep h-9 w-px bg-[#345544]/[0.15]" />
        <div className="dr-stat flex flex-col gap-1 text-center">
          <span className="dr-label uppercase" style={{ fontSize: 10, color: '#345544', letterSpacing: '0.12em', fontWeight: 600, opacity: 0.65 }}>
            Tiempo
          </span>
          <span style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 26, color: '#345544', letterSpacing: '-0.01em' }}>
            {banner?.min ?? 0}
            <small style={{ fontSize: 13, fontWeight: 400, color: '#345544', opacity: 0.7, marginLeft: 3 }}>min en auto</small>
          </span>
        </div>
      </div>

      <style jsx global>{`
        .dr-pin-classic {
          width: 28px;
          height: 40px;
        }
        .dr-pin-classic svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
        }
        .dr-pin-dest {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2.5px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .leaflet-tooltip.tt-main {
          background: #1a1a1a;
          color: #fff;
          border: 0;
          padding: 6px 14px;
          border-radius: 6px;
          font: 600 12px/1 ${MONTSERRAT};
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
          letter-spacing: 0.02em;
        }
        .leaflet-tooltip.tt-main::before {
          display: none;
        }
        .leaflet-tooltip.tt-dest {
          background: #fff;
          color: #1a1a1a;
          border: 0;
          padding: 5px 12px;
          border-radius: 6px;
          font: 500 12px/1 ${MONTSERRAT};
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
        }
        .leaflet-tooltip.tt-dest::before {
          display: none;
        }
        .dr-btn:hover:not([data-active='true']) {
          border-color: #b35e21 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(15, 63, 38, 0.08);
        }
        @keyframes dr-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .dr-pulse {
          animation: dr-pulse 1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .dr-btn,
          .dr-banner,
          .dr-pulse {
            animation: none !important;
            transition: none !important;
          }
        }
        @media (max-width: 640px) {
          .dr-banner {
            flex-direction: column;
            align-items: stretch;
          }
          .dr-sep {
            width: 100% !important;
            height: 1px !important;
          }
          .dr-stat {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}

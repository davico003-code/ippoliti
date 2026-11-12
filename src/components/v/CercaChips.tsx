'use client'

// "Cerca": lo más cercano de cada rubro en UN renglón de chips
// ("Escuela · 333 m", "Farmacia · 210 m"…). Reemplaza la grilla de 7 tarjetas.
//
// Los datos salen de /api/cercanos (Overpass consultado desde el servidor, UNA
// vez por coordenada, guardado un año; ver lib/cercanos.ts). Antes el navegador
// le pedía a Overpass directo y con los servidores públicos saturados la fila no
// aparecía nunca. Un rubro sin resultado no aparece; sin nada, la fila no se
// dibuja. Lazy (IntersectionObserver).

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
import type { CercanoChip as Cercano } from '@/lib/cercanos'

interface Rubro {
  key: string
  label: string
  Icon: LucideIcon
}

// Orden = orden de los chips (el servidor ya los devuelve en este orden).
const RUBROS: Rubro[] = [
  { key: 'escuela', label: 'Escuela', Icon: GraduationCap },
  { key: 'super', label: 'Súper', Icon: ShoppingCart },
  { key: 'farmacia', label: 'Farmacia', Icon: Pill },
  { key: 'colectivo', label: 'Colectivo', Icon: Bus },
  { key: 'tren', label: 'Tren', Icon: TrainFront },
  { key: 'plaza', label: 'Plaza', Icon: Trees },
  { key: 'salud', label: 'Salud', Icon: Stethoscope },
  { key: 'banco', label: 'Banco', Icon: Landmark },
]

// La primera vez de una coordenada el servidor puede tardar ~20 s (Overpass).
const TIMEOUT_MS = 30000

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.max(50, Math.round(m / 10) * 10)} m`
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`
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
    let vivo = true
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    fetch(`/api/cercanos?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`, { signal: controller.signal })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { chips?: Cercano[] } | null) => {
        if (vivo && d?.chips) setCercanos(d.chips)
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        if (vivo) setTermino(true)
      })
    return () => {
      vivo = false
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

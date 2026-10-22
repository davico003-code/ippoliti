'use client'

// "¿Cuánto tardás desde acá?" en la ficha (David, 20-oct-2026): minutos en auto
// un día de semana a las 8 a los lugares de todos los días, y "¿Trabajás en otro
// lado?" para el tiempo a su propia dirección. Los tiempos vienen del servidor
// cuando ya están guardados (así Google lee "a 28 min del centro de Rosario");
// si no, se piden una vez acá. Sin datos (fuera de zona, nadie respondió) la
// sección no aparece. Mientras Google no ande son los minutos sin tránsito de
// OpenStreetMap (sin "¿Trabajás en otro lado?", que necesita Google para ubicar
// la dirección) y se vuelven a pedir por si ya hay hora pico.

import { useEffect, useState } from 'react'
import { Briefcase, Building2, Home, MapPin, Plane, type LucideIcon } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import type { TiempoDestino, TiemposViaje as Tiempos } from '@/lib/tiempos-viaje'

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const VERDE = '#1A5C38'

const ICONOS: Record<TiempoDestino['icono'], LucideIcon> = {
  ciudad: Building2,
  barrio: MapPin,
  pueblo: Home,
  avion: Plane,
  trabajo: Briefcase,
}

const ERRORES: Record<string, string> = {
  vacia: 'Escribí la dirección de tu trabajo.',
  no_encontrada: 'No encontramos esa dirección. Probá con calle, número y ciudad.',
  demasiados: 'Probaste muchas seguidas. Esperá unos minutos.',
  sin_servicio: 'Ahora no lo podemos calcular. Probá más tarde.',
}

// La ficha tiene dos cuerpos (celu y compu, uno oculto): un solo pedido por
// propiedad, así una recién publicada no se le pide dos veces a Google.
const pedidos = new Map<number, Promise<Tiempos | null>>()
function pedirTiempos(id: number): Promise<Tiempos | null> {
  let p = pedidos.get(id)
  if (!p) {
    p = fetch(`/api/tiempos-viaje?id=${id}`)
      .then((r) => (r.ok ? (r.json() as Promise<Tiempos>) : null))
      .catch(() => null)
    pedidos.set(id, p)
  }
  return p
}

function Fila({ t, escala }: { t: TiempoDestino; escala: number }) {
  const Icono = ICONOS[t.icono]
  return (
    <li className="grid grid-cols-[32px_minmax(0,1fr)_78px] items-center gap-3 py-2.5">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${VERDE}15` }}>
        <Icono size={18} color={VERDE} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="break-words text-[14px] font-semibold leading-snug" style={{ fontFamily: P, color: 'var(--foreground)' }}>{t.nombre}</p>
        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100" aria-hidden="true">
          <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((t.minutos / escala) * 100))}%`, background: VERDE }} />
        </div>
        <p className="text-[12px] mt-1" style={{ fontFamily: P, color: 'var(--tinta-mute)', fontVariantNumeric: 'tabular-nums' }}>
          {t.minutosLibre != null && t.minutosLibre < t.minutos ? `${t.minutosLibre} min sin tránsito · ` : ''}
          {t.km.toLocaleString('es-AR')} km
        </p>
      </div>
      <p className="text-right whitespace-nowrap" style={{ fontFamily: P, fontVariantNumeric: 'tabular-nums', color: 'var(--foreground)' }}>
        <span className="text-[22px] font-extrabold leading-none">{t.minutos}</span>
        <span className="text-[13px] font-semibold"> min</span>
      </p>
    </li>
  )
}

export default function TiemposViaje({
  propertyId,
  tiempos: inicial,
  className = '',
}: {
  propertyId: number
  /** Ya guardados (los lee la ficha en el servidor). null = pedirlos acá. */
  tiempos: Tiempos | null
  className?: string
}) {
  const [tiempos, setTiempos] = useState<Tiempos | null>(inicial)
  const [direccion, setDireccion] = useState('')
  const [trabajo, setTrabajo] = useState<TiempoDestino | null>(null)
  const [estado, setEstado] = useState<'quieto' | 'calculando'>('quieto')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (inicial && inicial.fuente !== 'osm') return
    let vivo = true
    pedirTiempos(propertyId).then((d) => { if (vivo && d?.destinos?.length) setTiempos(d) })
    return () => { vivo = false }
  }, [inicial, propertyId])

  if (!tiempos?.destinos.length) return null

  const horaPico = tiempos.fuente !== 'osm'
  const filas = trabajo ? [...tiempos.destinos, trabajo] : tiempos.destinos
  const escala = Math.max(30, ...filas.map((t) => t.minutos))

  const calcular = async (e: React.FormEvent) => {
    e.preventDefault()
    if (direccion.trim().length < 4) { setError(ERRORES.vacia); return }
    setEstado('calculando')
    setError(null)
    try {
      const r = await fetch('/api/tiempos-viaje/trabajo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: propertyId, direccion }),
      })
      const d = (await r.json().catch(() => ({ error: 'sin_servicio' }))) as TiempoDestino | { error: string }
      if ('error' in d) {
        setError(ERRORES[d.error] ?? ERRORES.sin_servicio)
        trackEvent('tiempo_trabajo', { property_id: propertyId, ok: false })
      } else {
        setTrabajo(d)
        trackEvent('tiempo_trabajo', { property_id: propertyId, ok: true, minutos: d.minutos })
      }
    } catch {
      setError(ERRORES.sin_servicio)
    } finally {
      setEstado('quieto')
    }
  }

  return (
    <section id="tiempos" className={className}>
      <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: 'var(--foreground)', marginBottom: 4 }}>¿Cuánto tardás desde acá?</h2>
      <p className="text-[13px] mb-2" style={{ fontFamily: P, color: 'var(--tinta-mute)' }}>
        {horaPico ? 'En auto, un día de semana a las 8 de la mañana.' : 'En auto, sin tránsito.'}
      </p>
      <ul className="divide-y divide-gray-100">
        {filas.map((t) => <Fila key={t.clave + t.nombre} t={t} escala={escala} />)}
      </ul>
      {horaPico && (
      <form onSubmit={calcular} noValidate className="mt-3 rounded-2xl bg-[#F6F8F6] p-3.5">
        <label htmlFor={`trabajo-${propertyId}`} className="block text-[15px] font-semibold text-gray-900">¿Trabajás en otro lado?</label>
        <div className="mt-2.5 flex gap-2">
          <input
            id={`trabajo-${propertyId}`}
            type="text"
            inputMode="text"
            autoComplete="street-address"
            placeholder="Bv. Oroño 1200, Rosario"
            value={direccion}
            onChange={(e) => { setDireccion(e.target.value); setError(null) }}
            maxLength={120}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `trabajo-error-${propertyId}` : undefined}
            className="min-w-0 flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-[16px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
          />
          <button type="submit" disabled={estado === 'calculando'} className="flex-none h-11 px-4 rounded-xl text-white font-bold disabled:opacity-70" style={{ background: VERDE }}>
            {estado === 'calculando' ? 'Calculando…' : 'Calcular'}
          </button>
        </div>
        {error && <p id={`trabajo-error-${propertyId}`} className="text-sm text-[#E0245E] mt-2" role="alert">{error}</p>}
      </form>
      )}
    </section>
  )
}

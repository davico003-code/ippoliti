'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { LocateFixed } from 'lucide-react'

const TasacionesMap = dynamic(() => import('@/components/TasacionesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-[10px] bg-[#f5f5f7] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#d0d0d0] border-t-[#1A5C38] rounded-full animate-spin" />
    </div>
  ),
})

const URGENCIA_OPTIONS = ['Sin apuro', 'En 3 meses', 'Urgente'] as const
const MOTIVO_OPTIONS = ['Vender', 'Alquilar', 'Conocer valor', 'Otro'] as const

const inputClass = 'w-full bg-[#f5f5f7] border border-[#d0d0d0] rounded-[10px] px-4 py-3.5 text-sm text-[#1d1d1f] placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20 focus:border-[#1A5C38] transition-all'
const labelClass = 'text-xs font-medium text-[#1d1d1f] uppercase tracking-wide mb-2 block'

export default function TasacionesPage() {
  const [form, setForm] = useState({
    nombre: '', direccion: '', tipo: '', urgencia: '', motivo: '', mensaje: '',
  })
  const [coords, setCoords] = useState<[number, number]>([-32.9167, -60.9167])
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState(false)
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setCoords([lat, lng])
  }, [])

  // Solo se llama desde el click del botón LocateFixed; nunca al montar.
  const handleGeolocate = () => {
    if (!navigator.geolocation || geoLoading) return
    setGeoError(false)
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude])
        setGeoLoading(false)
      },
      () => {
        setGeoError(true)
        setGeoLoading(false)
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  const handleAddressChange = (value: string) => {
    update('direccion', value)
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    if (value.length < 5) return
    geocodeTimer.current = setTimeout(() => {
      const q = encodeURIComponent(value + ', Santa Fe, Argentina')
      fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'es' },
      })
        .then(r => r.json())
        .then(data => { if (data?.[0]) setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]) })
        .catch(() => {})
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Track submission
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'submit_tasacion', { method: 'whatsapp' })
      window.fbq?.('track', 'Lead', { content_name: 'Tasación' })
    }
    const lines = [
      'Hola! Quiero tasar mi propiedad', '',
      form.nombre && `Nombre: ${form.nombre}`,
      form.direccion && `Dirección: ${form.direccion}`,
      form.tipo && `Tipo: ${form.tipo}`,
      form.urgencia && `Urgencia: ${form.urgencia}`,
      form.motivo && `Motivo: ${form.motivo}`,
      form.mensaje && `Mensaje: ${form.mensaje}`,
      coords[0] !== -32.9167 && `Ubicación: https://maps.google.com/?q=${coords[0]},${coords[1]}`,
      '', '*Solicito tasación en 24hs*',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/5493412101694?text=${encodeURIComponent(lines)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ── LEFT — Imagen ── */}
          <div>
            <Image
              src="/images/tasaciones/tasacion-941.webp"
              alt="Tasación profesional de propiedades en Funes, Roldán y Rosario — SI INMOBILIARIA"
              width={941}
              height={1672}
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 600px"
              priority
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRrwCAABXRUJQVlA4WAoAAAAgAAAAFwAAKgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggzgAAAPAGAJ0BKhgAKwA+hS6UR6UiIiE1W/wAoBCJQBOmX2hZIYg5+fa/HdekNGgcX2yEguy/4QvzYW27vl4g7fdDPMAA/vja8UEmW+PJHbuNpgR6k2m5Up7VGuZFmXdhjibxxsi0UmAI3WocuB0c2KpXVC9Wd84ZpxJIVZGvLrpwTgVUADmR6Y+KTo2p+CL2PxxkP3ZEqCt8u0f0bkKAmE3VUj9K+hs06jjDLuExpbBxHzBUjv78wzR0+3Y5VeerqiADJCIoJm1ye8lEonS51oAA"
              className="w-full h-auto rounded-2xl shadow-lg object-cover"
            />
          </div>

          {/* ── RIGHT — Form ── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl p-6 md:p-8" style={{ border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Solicitar tasación
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} className={inputClass} placeholder="Tu nombre" />
                </div>

                <div>
                  <label className={labelClass}>Dirección del inmueble</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.direccion}
                      onChange={e => handleAddressChange(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="Calle, número, localidad"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={geoLoading}
                      aria-label="Usar mi ubicación actual"
                      title="Usar mi ubicación actual"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1A5C38] disabled:cursor-not-allowed transition-colors"
                    >
                      {geoLoading ? (
                        <span className="block w-5 h-5 border-2 border-slate-300 border-t-[#1A5C38] rounded-full animate-spin" />
                      ) : (
                        <LocateFixed size={20} />
                      )}
                    </button>
                  </div>
                  {geoError && (
                    <p className="text-slate-600 mt-1.5" style={{ fontSize: 13 }}>
                      No pudimos obtener tu ubicación. Ingresala manualmente.
                    </p>
                  )}
                </div>

                <div>
                  <TasacionesMap center={coords} onPositionChange={handlePositionChange} />
                  <p className="text-[#9a9a9a] text-xs mt-2 text-center">Arrastrá el pin para ajustar la ubicación</p>
                </div>

                <div>
                  <label className={labelClass}>Tipo de propiedad</label>
                  <select value={form.tipo} onChange={e => update('tipo', e.target.value)} className={`${inputClass} ${!form.tipo ? 'text-[#9a9a9a]' : 'text-[#1d1d1f]'}`}>
                    <option value="" disabled>Seleccionar</option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Local Comercial">Local Comercial</option>
                    <option value="Galpón">Galpón</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Urgencia</label>
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCIA_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => update('urgencia', opt)}
                        className={`py-3 rounded-[10px] text-sm font-semibold transition-all ${
                          form.urgencia === opt ? 'bg-[#1A5C38] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] border border-[#d0d0d0] hover:border-[#1A5C38]'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Motivo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOTIVO_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => update('motivo', opt)}
                        className={`py-3 rounded-[10px] text-sm font-semibold transition-all ${
                          form.motivo === opt ? 'bg-[#1A5C38] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] border border-[#d0d0d0] hover:border-[#1A5C38]'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Mensaje</label>
                  <textarea value={form.mensaje} onChange={e => update('mensaje', e.target.value)}
                    className={`${inputClass} min-h-[100px] resize-none`} placeholder="Detalles adicionales (opcional)" />
                </div>

                <button type="submit" className="w-full bg-[#1A5C38] hover:bg-[#0f3d25] text-white rounded-[10px] py-4 font-semibold text-base shadow-lg shadow-green-900/15 transition-all">
                  Solicitar tasación por WhatsApp
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

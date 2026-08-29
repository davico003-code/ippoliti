'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { LocateFixed } from 'lucide-react'
import { trackFbEvent } from '@/lib/analytics'

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

const FAQS = [
  {
    q: '¿Qué diferencia hay entre una estimación online y una tasación profesional?',
    a: 'La estimación online ofrece una referencia inicial. La tasación profesional incorpora visita, estado, ubicación exacta, documentación y comparables seleccionados por un corredor inmobiliario matriculado.',
  },
  {
    q: '¿En qué zonas realiza tasaciones SI INMOBILIARIA?',
    a: 'Principalmente en Funes y Roldán, y también en Fisherton, Rosario y el corredor oeste, según el tipo de propiedad.',
  },
  {
    q: '¿Qué información necesitan para comenzar?',
    a: 'La dirección, el tipo de inmueble, el objetivo de la tasación y un medio de contacto. Luego confirmamos qué documentación y visita requiere el caso.',
  },
]

const inputClass = 'w-full bg-[#f5f5f7] border border-[#d0d0d0] rounded-[10px] px-4 py-3.5 text-sm text-[#1d1d1f] placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20 focus:border-[#1A5C38] transition-all'
const labelClass = 'text-xs font-medium text-[#1d1d1f] uppercase tracking-wide mb-2 block'

export default function TasacionesPage() {
  const [form, setForm] = useState({
    nombre: '', direccion: '', tipo: '', urgencia: '', motivo: '', mensaje: '',
  })
  const [coords, setCoords] = useState<[number, number]>([-32.9167, -60.9167])
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState(false)
  const [showMap, setShowMap] = useState(false)
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
        setShowMap(true)
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
    // Track submission — este formulario recibe pauta paga: en Meta va como
    // 'SubmitApplication' (los 'Lead' quedan reservados a señales de compra).
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'submit_tasacion', { method: 'whatsapp' })
      trackFbEvent('SubmitApplication', { content_name: 'Tasación' })
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
      '', '*Solicito una tasación profesional*',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/5493412101694?text=${encodeURIComponent(lines)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#1A5C38]">
            Funes · Roldán · Fisherton · Rosario
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-[#1d1d1f] md:text-5xl">
            Tasación inmobiliaria con criterio local
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f6368] md:text-lg">
            Analizamos comparables de la zona, estado, documentación y ubicación para ayudarte a
            tomar una decisión de venta, alquiler o patrimonio con una referencia defendible.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-[#374151]">
            <span>Corredores matriculados</span>
            <span aria-hidden="true" className="text-[#1A5C38]">•</span>
            <span>Comparables locales</span>
            <span aria-hidden="true" className="text-[#1A5C38]">•</span>
            <span>Atención personalizada</span>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ── LEFT — Imagen ── */}
          <div className="order-2 lg:order-1">
            <Image
              src="/images/tasaciones/tasacion-941.webp"
              alt="Tasación profesional de propiedades en Funes, Roldán y Rosario — SI INMOBILIARIA"
              width={941}
              height={1672}
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 600px"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRrwCAABXRUJQVlA4WAoAAAAgAAAAFwAAKgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggzgAAAPAGAJ0BKhgAKwA+hS6UR6UiIiE1W/wAoBCJQBOmX2hZIYg5+fa/HdekNGgcX2yEguy/4QvzYW27vl4g7fdDPMAA/vja8UEmW+PJHbuNpgR6k2m5Up7VGuZFmXdhjibxxsi0UmAI3WocuB0c2KpXVC9Wd84ZpxJIVZGvLrpwTgVUADmR6Y+KTo2p+CL2PxxkP3ZEqCt8u0f0bkKAmE3VUj9K+hs06jjDLuExpbBxHzBUjv78wzR0+3Y5VeerqiADJCIoJm1ye8lEonS51oAA"
              className="w-full h-auto rounded-2xl shadow-lg object-cover"
            />
          </div>

          {/* ── RIGHT — Form ── */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl p-6 md:p-8" style={{ border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Contanos sobre la propiedad
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="nombre" className={labelClass}>Nombre</label>
                  <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} className={inputClass} placeholder="Tu nombre" autoComplete="name" required />
                </div>

                <div>
                  <label htmlFor="direccion" className={labelClass}>Dirección del inmueble</label>
                  <div className="relative">
                    <input
                      id="direccion"
                      name="direccion"
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
                      className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-slate-600 transition-colors hover:text-[#1A5C38] disabled:cursor-not-allowed"
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
                  {showMap ? (
                    <>
                      <TasacionesMap center={coords} onPositionChange={handlePositionChange} />
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-[#5f6368]">Arrastrá el pin para ajustar la ubicación</p>
                        <button
                          type="button"
                          onClick={() => setShowMap(false)}
                          className="min-h-11 text-xs font-semibold text-[#1A5C38] hover:underline"
                        >
                          Ocultar mapa
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="min-h-11 w-full rounded-[10px] border border-[#c9d1cc] bg-white px-4 text-sm font-semibold text-[#1A5C38] transition-colors hover:bg-[#f1f7f3]"
                    >
                      Ajustar la ubicación en el mapa (opcional)
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="tipo-propiedad" className={labelClass}>Tipo de propiedad</label>
                  <select id="tipo-propiedad" name="tipo" value={form.tipo} onChange={e => update('tipo', e.target.value)} className={`${inputClass} ${!form.tipo ? 'text-[#5f6368]' : 'text-[#1d1d1f]'}`} required>
                    <option value="" disabled>Seleccionar</option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Local Comercial">Local Comercial</option>
                    <option value="Galpón">Galpón</option>
                  </select>
                </div>

                <div>
                  <p className={labelClass}>Urgencia</p>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Urgencia">
                    {URGENCIA_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => update('urgencia', opt)}
                        aria-pressed={form.urgencia === opt}
                        className={`py-3 rounded-[10px] text-sm font-semibold transition-all ${
                          form.urgencia === opt ? 'bg-[#1A5C38] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] border border-[#d0d0d0] hover:border-[#1A5C38]'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={labelClass}>Motivo</p>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Motivo">
                    {MOTIVO_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => update('motivo', opt)}
                        aria-pressed={form.motivo === opt}
                        className={`py-3 rounded-[10px] text-sm font-semibold transition-all ${
                          form.motivo === opt ? 'bg-[#1A5C38] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] border border-[#d0d0d0] hover:border-[#1A5C38]'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className={labelClass}>Mensaje</label>
                  <textarea id="mensaje" name="mensaje" value={form.mensaje} onChange={e => update('mensaje', e.target.value)}
                    className={`${inputClass} min-h-[100px] resize-none`} placeholder="Detalles adicionales (opcional)" />
                </div>

                <button type="submit" className="w-full bg-[#1A5C38] hover:bg-[#0f3d25] text-white rounded-[10px] py-4 font-semibold text-base shadow-lg shadow-green-900/15 transition-all">
                  Solicitar tasación por WhatsApp
                </button>
              </form>
            </div>
          </div>

        </div>

        <section className="mx-auto max-w-[1100px] px-5 py-14" aria-labelledby="preguntas-tasaciones">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1A5C38]">
            Antes de empezar
          </p>
          <h2 id="preguntas-tasaciones" className="mb-5 text-2xl font-extrabold text-[#1d1d1f] md:text-3xl">
            Cómo trabajamos una tasación
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {FAQS.map((item) => (
              <article key={item.q} className="rounded-2xl border border-[#dedede] bg-white p-5">
                <h3 className="text-base font-bold leading-6 text-[#1d1d1f]">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f6368]">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Tasadores online por zona: entrada SEO y descubrimiento interno de
            las landings /tasar/{tipo}-{barrio}. */}
        <div className="mx-auto max-w-[1100px] px-5 pb-14">
          <h2 className="mb-1 text-[19px] font-extrabold text-[#1d1d1f]">
            ¿Preferís una estimación al instante?
          </h2>
          <p className="mb-4 text-[14.5px] text-[#6e6e73]">
            Probá el estimador online de tu zona para obtener una referencia inicial sin registrarte.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ['casa-roldan', 'Casa en Roldán'],
              ['casa-funes', 'Casa en Funes'],
              ['lote-roldan', 'Lote en Roldán'],
              ['lote-funes', 'Lote en Funes'],
              ['casa-kentucky', 'Casa en Kentucky'],
              ['casa-san-sebastian', 'Casa en San Sebastián'],
              ['casa-tierra-de-suenos-2', 'Casa en Tierra de Sueños 2'],
              ['lote-funes-lakes', 'Lote en Funes Lakes'],
              ['departamento-centro-rosario', 'Depto en Centro (Rosario)'],
              ['departamento-pichincha', 'Depto en Pichincha'],
              ['departamento-echesortu', 'Depto en Echesortu'],
              ['departamento-fisherton', 'Depto en Fisherton'],
            ].map(([slug, label]) => (
              <a
                key={slug}
                href={`/tasar/${slug}`}
                className="rounded-[10px] bg-[#f5f5f7] px-3.5 py-2 text-[13.5px] font-semibold text-[#374151] transition-colors hover:bg-[#e7f2eb] hover:text-[#1A5C38]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

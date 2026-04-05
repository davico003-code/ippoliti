'use client'

import { useState, useCallback, useRef } from 'react'
import { Camera, Megaphone, Share2, Globe, Newspaper, Database } from 'lucide-react'
import dynamic from 'next/dynamic'

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
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setCoords([lat, lng])
  }, [])

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

          {/* ── LEFT ── */}
          <div>
            {/* Hero */}
            <h1 className="text-[#1d1d1f] mb-3" style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'Raleway, sans-serif' }}>
              Tasá tu propiedad con criterio
            </h1>
            <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Más de 43 años tasando propiedades en Funes, Roldán y Rosario. Informe profesional en 24 horas.
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80"
              alt="Análisis inmobiliario profesional"
              className="w-full h-[220px] object-cover rounded-2xl mb-10"
            />

            {/* Cómo trabajamos */}
            <div className="bg-white rounded-2xl p-6 md:p-8 mb-8">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>Cómo trabajamos</h3>
              <div className="space-y-0">
                {[
                  { num: '01', title: 'Coordinamos la visita', desc: 'Nos contactamos, agendamos y visitamos la propiedad en persona. Necesitamos los planos para un análisis preciso.' },
                  { num: '02', title: 'Relevamiento completo', desc: 'Fotografía aérea con drone DJI Mavic 4 Pro, estado general, entorno, servicios y comparativa con operaciones reales de la zona.' },
                  { num: '03', title: 'Informe en 24 horas', desc: 'Recibís un informe digital profesional con el valor real de tu propiedad y una estrategia de publicación personalizada.' },
                ].map((step, i) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[#1A5C38] text-sm font-bold font-numeric w-9 h-9 rounded-full border-2 border-[#1A5C38] flex items-center justify-center shrink-0">
                        {step.num}
                      </span>
                      {i < 2 && <div className="w-px flex-1 bg-[#1A5C38]/15 my-1" />}
                    </div>
                    <div className="pb-7">
                      <h4 className="font-bold text-[#1d1d1f] text-sm mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{step.title}</h4>
                      <p className="text-sm text-[#6e6e73] leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cómo publicamos */}
            <h3 className="text-lg font-bold text-[#1d1d1f] mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>Cómo publicamos tu propiedad</h3>
            <p className="text-sm text-[#6e6e73] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Una vez tasada, tu propiedad tiene máxima exposición</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Camera, title: 'Fotografía aérea con drone', desc: 'DJI Mavic 4 Pro para fotos y video profesional que destacan tu propiedad.' },
                { icon: Megaphone, title: 'Meta Ads', desc: 'Campañas publicitarias en Facebook e Instagram para maximizar la exposición de tu propiedad.' },
                { icon: Share2, title: 'Presencia en redes sociales', desc: '+20K seguidores en Instagram @inmobiliaria.si y presencia activa en TikTok @si.inmobiliaria' },
                { icon: Globe, title: 'Portales inmobiliarios', desc: 'Publicación en Zonaprop, Argenprop y MercadoLibre — los tres principales portales del país.' },
                { icon: Newspaper, title: 'Medios locales', desc: 'Presencia en InfoFunes y El Roldanense, los medios de referencia de la zona.' },
                { icon: Database, title: 'CRM profesional', desc: 'Gestión de leads y seguimiento de interesados con Tokko Broker.' },
              ].map(c => (
                <div key={c.title} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e5ea', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <c.icon className="w-5 h-5 text-[#1A5C38] mb-2" />
                  <h5 className="text-sm font-bold text-[#1d1d1f] mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{c.title}</h5>
                  <p className="text-xs text-[#6e6e73] leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{c.desc}</p>
                </div>
              ))}
            </div>
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
                  <input type="text" value={form.direccion} onChange={e => handleAddressChange(e.target.value)} className={inputClass} placeholder="Calle, número, localidad" required />
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

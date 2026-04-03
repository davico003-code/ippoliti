'use client'

import { useState, useCallback, useRef } from 'react'
import { CheckCircle, Clock, ShieldCheck, MessageCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const TasacionesMap = dynamic(() => import('@/components/TasacionesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-xl bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
    </div>
  ),
})

const URGENCIA_OPTIONS = ['Sin apuro', 'En 3 meses', 'Urgente'] as const
const MOTIVO_OPTIONS = ['Vender', 'Alquilar', 'Conocer valor', 'Otro'] as const

const inputClass = 'w-full border border-gray-200 bg-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20 focus:border-[#1A5C38] transition-all'
const labelClass = 'text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block'

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

  const handleWhatsApp = () => {
    window.open('https://wa.me/5493412101694?text=Hola!%20Quiero%20tasar%20mi%20propiedad', '_blank')
  }

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* LEFT — Copy */}
          <div className="md:sticky md:top-24">
            <h1 className="text-gray-900 mb-3" style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, fontFamily: 'Raleway, sans-serif' }}>
              Tasá tu propiedad
            </h1>
            <p className="text-gray-500 text-base mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Completá el formulario y te contactamos en menos de 24hs
            </p>

            {/* Benefits */}
            <div className="space-y-5 mb-10">
              {[
                { icon: Clock, text: 'Respuesta en menos de 24 horas' },
                { icon: CheckCircle, text: 'Tasación basada en operaciones reales' },
                { icon: ShieldCheck, text: 'Sin costo y sin compromiso' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-3">
                  <b.icon className="w-5 h-5 text-[#1A5C38] shrink-0" />
                  <span className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Stats card */}
            <div className="bg-[#1A5C38] rounded-2xl p-8 text-white">
              <p className="text-5xl font-bold font-numeric mb-1">43</p>
              <p className="text-white/70 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                años tasando propiedades en Roldán, Funes y Rosario
              </p>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Solicitar tasación gratuita
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
                <p className="text-gray-400 text-xs mt-2 text-center">Arrastrá el pin para ajustar la ubicación</p>
              </div>

              <div>
                <label className={labelClass}>Tipo de propiedad</label>
                <select value={form.tipo} onChange={e => update('tipo', e.target.value)} className={`${inputClass} ${!form.tipo ? 'text-gray-400' : 'text-gray-900'}`}>
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
                      className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                        form.urgencia === opt ? 'bg-[#1A5C38] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                      className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                        form.motivo === opt ? 'bg-[#1A5C38] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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

              <button type="submit" className="w-full bg-[#1A5C38] hover:bg-[#0f3d25] text-white rounded-xl py-4 font-semibold text-base shadow-lg shadow-green-900/15 transition-all">
                Solicitar tasación por WhatsApp
              </button>

              <button type="button" onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 border-2 border-[#1A5C38] text-[#1A5C38] rounded-xl py-3.5 font-semibold text-sm hover:bg-[#1A5C38]/5 transition-colors">
                <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp directamente
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

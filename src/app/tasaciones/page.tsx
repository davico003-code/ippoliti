'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'

const TasacionesMap = dynamic(() => import('@/components/TasacionesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-2xl bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
    </div>
  ),
})

const URGENCIA_OPTIONS = ['Sin apuro', 'En 3 meses', 'Urgente'] as const
const MOTIVO_OPTIONS = ['Vender', 'Alquilar', 'Conocer valor', 'Otro'] as const

const inputClass = 'w-full border-0 bg-gray-50 rounded-2xl px-5 py-4 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20 transition-all'
const labelClass = 'text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block'

export default function TasacionesPage() {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    tipo: '',
    urgencia: '',
    motivo: '',
    mensaje: '',
  })
  const [coords, setCoords] = useState<[number, number]>([-32.9167, -60.9167])
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

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
        .then(data => {
          if (data?.[0]) {
            setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
          }
        })
        .catch(() => {})
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lines = [
      'Hola! Quiero tasar mi propiedad',
      '',
      form.nombre && `Nombre: ${form.nombre}`,
      form.direccion && `Dirección: ${form.direccion}`,
      form.tipo && `Tipo: ${form.tipo}`,
      form.urgencia && `Urgencia: ${form.urgencia}`,
      form.motivo && `Motivo: ${form.motivo}`,
      form.mensaje && `Mensaje: ${form.mensaje}`,
      coords[0] !== -32.9167 && `Ubicación: https://maps.google.com/?q=${coords[0]},${coords[1]}`,
      '',
      '*Solicito tasación en 24hs*',
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/5493412101694?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-16">
        <h1
          className="text-center text-gray-900"
          style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1, fontFamily: 'Raleway, sans-serif' }}
        >
          Tasá tu propiedad
        </h1>
        <p className="text-gray-400 text-base text-center mt-3 mb-12">
          Completá el formulario y te contactamos en menos de 24hs
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => update('nombre', e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className={labelClass}>Dirección del inmueble</label>
            <input
              type="text"
              value={form.direccion}
              onChange={e => handleAddressChange(e.target.value)}
              className={inputClass}
              placeholder="Calle, número, localidad"
              required
            />
          </div>

          {/* Map */}
          <div>
            <TasacionesMap center={coords} onPositionChange={handlePositionChange} />
            <p className="text-gray-400 text-xs mt-2 text-center">
              Arrastrá el pin para ajustar la ubicación exacta
            </p>
          </div>

          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo de propiedad</label>
            <select
              value={form.tipo}
              onChange={e => update('tipo', e.target.value)}
              className={`${inputClass} ${!form.tipo ? 'text-gray-400' : 'text-gray-900'}`}
            >
              <option value="" disabled>Seleccionar</option>
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Terreno">Terreno</option>
              <option value="Local Comercial">Local Comercial</option>
              <option value="Galpón">Galpón</option>
            </select>
          </div>

          {/* Urgencia */}
          <div>
            <label className={labelClass}>Urgencia</label>
            <div className="grid grid-cols-3 gap-2">
              {URGENCIA_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update('urgencia', opt)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                    form.urgencia === opt
                      ? 'bg-[#1A5C38] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className={labelClass}>Motivo</label>
            <div className="grid grid-cols-2 gap-2">
              {MOTIVO_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update('motivo', opt)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                    form.motivo === opt
                      ? 'bg-[#1A5C38] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label className={labelClass}>Mensaje</label>
            <textarea
              value={form.mensaje}
              onChange={e => update('mensaje', e.target.value)}
              className={`${inputClass} min-h-[100px]`}
              placeholder="Detalles adicionales (opcional)"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#1A5C38] hover:bg-[#0f3d25] text-white rounded-2xl py-5 font-semibold text-lg shadow-lg shadow-green-900/20 transition-all"
          >
            Solicitar tasación por WhatsApp
          </button>
        </form>

        {/* ¿Qué hacemos para vender? */}
        <div className="mt-20">
          <h2
            className="text-center text-gray-900 mb-2"
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'Raleway, sans-serif' }}
          >
            ¿Qué hacemos para vender?
          </h2>
          <p className="text-gray-400 text-sm text-center mb-10">
            Equipamiento profesional para que tu propiedad destaque
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', label: 'Fotos profesionales', sub: 'Cámaras Sony' },
              { img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80', label: 'Plano redibujado', sub: 'Digitalización HD' },
              { img: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=400&q=80', label: 'Drone 4K', sub: 'Mavic 4 Pro' },
              { img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80', label: 'Meta Ads', sub: 'Campaña paga' },
              { img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', label: 'Aviso destacado', sub: 'Máxima exposición' },
              { img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', label: 'Video iPhone', sub: 'iPhone 17 Pro Max' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.label} className="w-full h-28 object-cover" />
                <div className="px-3 py-3 text-center">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

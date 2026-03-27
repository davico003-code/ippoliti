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
        <p className="text-gray-400 text-base text-center mt-3 mb-16">
          Completá el formulario y te contactamos en menos de 24hs
        </p>

        {/* Services section */}
        <div className="mb-16">
          <p className="text-[#1A5C38] text-xs font-bold tracking-widest uppercase text-center mb-3">NUESTRO MÉTODO</p>
          <h2
            className="text-center text-gray-900 mb-2"
            style={{ fontSize: 40, fontWeight: 700, letterSpacing: -0.5, fontFamily: 'Raleway, sans-serif' }}
          >
            Lo que hacemos para vender tu propiedad
          </h2>
          <p className="text-gray-400 text-base text-center mb-12">
            Tecnología profesional al servicio de cada operación
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>, tag: 'SONY α7 IV · 33MP', title: 'Fotografía profesional', desc: 'Cámaras Sony serie α con lentes gran angular. 20 a 40 fotos optimizadas para portales y redes.' },
              { icon: <><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.8 3.4-2.1 2.1L5 13l-1 1 3 2 2 3 1-1 .8-2.4 2.1-2.1 3.4 5.8c.2.4.7.5 1.1.3l.5-.3c.4-.2.6-.6.5-1.1z" /></>, tag: 'DJI MAVIC 4 PRO · 4K', title: 'Drone 4K', desc: 'Tomas aéreas que muestran el entorno, el barrio y la propiedad desde el aire.' },
              { icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>, tag: 'iPHONE 17 PRO MAX · 4K', title: 'Video tour', desc: 'Recorridos cinematográficos con estabilización óptica y edición profesional.' },
              { icon: <><path d="M3 3h18v18H3zM3 9h18M9 21V9" /></>, tag: 'DIGITALIZACIÓN HD', title: 'Plano redibujado', desc: 'El plano original redibujado digitalmente en alta resolución para el comprador.' },
              { icon: <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>, tag: 'META ADS · ABC1', title: 'Campaña en redes', desc: 'Campañas pagas en Facebook e Instagram dirigidas al segmento ABC1 de la zona.' },
              { icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>, tag: 'ZONAPROP · ARGENPROP', title: 'Aviso destacado', desc: 'Máxima visibilidad en los portales más visitados de Argentina.' },
            ].map(item => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#1A5C38]/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#1A5C38]/8 rounded-xl flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                </div>
                <p className="text-xs font-bold text-[#1A5C38] tracking-widest mt-4 mb-1">{item.tag}</p>
                <p className="text-base font-bold text-gray-900 mb-2">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

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

      </div>
    </div>
  )
}

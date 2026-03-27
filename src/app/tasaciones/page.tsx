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
          <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Lo que hacemos para vender tu propiedad
          </h2>
          <p className="text-[#1A5C38] text-sm font-semibold mb-8">
            Tecnología y estrategia al servicio de tu venta
          </p>
          <div className="flex flex-col gap-3">
            {[
              { img: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&q=80', tag: 'SONY α7 IV · 33MP', title: 'Fotografía profesional', desc: 'Cámaras Sony serie α con lentes gran angular. Edición profesional de color, HDR y retoque digital. Cada propiedad recibe entre 20 y 40 fotos optimizadas para portales.', num: '01' },
              { img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80', tag: 'DJI MAVIC 4 PRO · 4K', title: 'Aerial & video drone', desc: 'Tomas aéreas con DJI Mavic 4 Pro, el drone más avanzado del mercado. Video 4K y fotos de alta resolución que muestran el entorno, el barrio y la propiedad desde el aire.', num: '02' },
              { img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80', tag: 'iPHONE 17 PRO MAX · 4K', title: 'Video tour profesional', desc: 'Recorridos cinematográficos filmados con iPhone 17 Pro Max. Estabilización óptica, modo ProRes y edición con música de fondo para generar impacto emocional en el comprador.', num: '03' },
              { img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', tag: 'DIGITALIZACIÓN HD', title: 'Plano redibujado en alta resolución', desc: 'El plano original de la propiedad es escaneado y redibujado digitalmente en alta resolución. Permite al comprador entender los espacios antes de la visita.', num: '04' },
              { img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80', tag: 'META ADS · SEGMENTACIÓN ABC1', title: 'Campaña publicitaria en redes', desc: 'Campañas pagas en Facebook e Instagram dirigidas exclusivamente al segmento ABC1 de Funes, Roldán, Fisherton y Rosario. Impacto garantizado en el comprador ideal de tu propiedad.', num: '05' },
              { img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', tag: 'ZONAPROP · ARGENPROP', title: 'Máxima visibilidad en portales', desc: 'Aviso super destacado en Zonaprop y Argenprop, los portales inmobiliarios más visitados de Argentina. Tu propiedad aparece primero en los resultados de búsqueda.', num: '06' },
            ].map(item => (
              <div
                key={item.num}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                style={{ height: 140 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl font-black text-white/10 select-none">{item.num}</span>
                <div className="relative h-full flex flex-col justify-center p-8">
                  <p className="text-xs font-bold tracking-widest text-[#4ADE80] mb-2">{item.tag}</p>
                  <p className="text-2xl font-bold text-white mb-0 group-hover:mb-3 transition-all duration-500">{item.title}</p>
                  <p className="text-white/70 text-sm leading-relaxed max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500">{item.desc}</p>
                </div>
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

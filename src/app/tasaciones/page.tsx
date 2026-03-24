'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

export default function TasacionesPage() {
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', direccion: '',
    tipo: '', dormitorios: '', banos: '', cochera: '',
    superficie: '', antiguedad: '', mensaje: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lines = [
      'Hola! Quiero tasar mi propiedad 🏠',
      '',
      form.direccion && `📍 Dirección: ${form.direccion}`,
      form.tipo && `🏡 Tipo: ${form.tipo}`,
      form.superficie && `📐 Superficie: ${form.superficie}m²`,
      (form.dormitorios || form.banos) && `🛏 Ambientes: ${form.dormitorios ? form.dormitorios + ' dorm' : ''}${form.dormitorios && form.banos ? ' / ' : ''}${form.banos ? form.banos + ' baños' : ''}`,
      form.antiguedad && `📅 Antigüedad: ${form.antiguedad} años`,
      form.cochera && `🚗 Cochera: ${form.cochera}`,
      form.mensaje && `💬 Consulta: ${form.mensaje}`,
      '',
      form.nombre && `👤 ${form.nombre}`,
      form.telefono && `📱 ${form.telefono}`,
      form.email && `✉️ ${form.email}`,
      '',
      '*Solicito tasación en 24hs*',
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/5493412101694?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen">

      {/* 1. Header with background image */}
      <section className="relative h-[280px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Tasaciones inmobiliarias"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-600/70" />
        <div className="relative z-10 text-center px-4">
          <p className="text-white/70 text-sm uppercase tracking-widest font-semibold mb-3">TASACIONES PROFESIONALES</p>
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md">Tasá tu propiedad en 24hs</h1>
        </div>
      </section>

      {/* 2. Two-column content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Left column: Steps */}
          <div>
            <h2 className="font-black text-gray-900 text-2xl mb-8">
              Seguí estos simples pasos para tasar tu propiedad
            </h2>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 font-numeric">1</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Completá el formulario</p>
                <p className="text-gray-500 text-sm">Ingresá los datos de tu propiedad en el formulario.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 font-numeric">2</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">
                  Envianos <span className="font-black uppercase">FOTOS</span>,{' '}
                  <span className="font-black uppercase">PLANOS</span> e{' '}
                  <span className="font-black uppercase">IMPUESTOS</span>
                </p>
                <p className="text-gray-500 text-sm">Adjuntá la documentación para una tasación más precisa.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 font-numeric">3</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Recibís tu tasación</p>
                <p className="text-gray-500 text-sm">Te enviamos el informe de tasación profesional por email.</p>
              </div>
            </div>

            <div className="p-6 bg-brand-50 rounded-xl border border-brand-100">
              <p className="font-bold text-brand-600 mb-2">¿Preferís llamarnos?</p>
              <p className="text-3xl font-black text-brand-600 font-numeric">(341) 210-1694</p>
              <p className="text-gray-500 text-sm mt-2">Lunes a Viernes 9 a 17hs</p>
            </div>
          </div>

          {/* Right column: Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 text-xl mb-6">Solicitar Tasación</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)}
                    className={inputClass} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input type="tel" value={form.telefono} onChange={e => update('telefono', e.target.value)}
                    className={inputClass} placeholder="341 000 0000" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className={inputClass} placeholder="tu@email.com" />
              </div>

              <div>
                <label className={labelClass}>Dirección del inmueble</label>
                <input type="text" value={form.direccion} onChange={e => update('direccion', e.target.value)}
                  className={inputClass} placeholder="Calle, número, localidad" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo de propiedad</label>
                  <select value={form.tipo} onChange={e => update('tipo', e.target.value)} className={inputClass}>
                    <option value="">Seleccionar</option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Local Comercial">Local Comercial</option>
                    <option value="Galpón">Galpón</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Superficie (m²)</label>
                  <input type="number" value={form.superficie} onChange={e => update('superficie', e.target.value)}
                    className={inputClass} placeholder="Ej: 180" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Dormitorios</label>
                  <select value={form.dormitorios} onChange={e => update('dormitorios', e.target.value)} className={inputClass}>
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Baños</label>
                  <select value={form.banos} onChange={e => update('banos', e.target.value)} className={inputClass}>
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cochera</label>
                  <select value={form.cochera} onChange={e => update('cochera', e.target.value)} className={inputClass}>
                    <option value="">-</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Antigüedad (años)</label>
                <input type="number" value={form.antiguedad} onChange={e => update('antiguedad', e.target.value)}
                  className={inputClass} placeholder="Ej: 10 (0 = a estrenar)" />
              </div>

              <div>
                <label className={labelClass}>Mensaje</label>
                <textarea
                  value={form.mensaje} onChange={e => update('mensaje', e.target.value)}
                  rows={3} className={inputClass}
                  placeholder="Contanos más detalles: ¿querés vender? ¿alquilar? ¿en qué plazo?"
                />
              </div>

              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                ENVIAR POR WHATSAPP
              </button>

              <p className="text-center text-gray-400 text-xs mt-2">
                Al enviar se abre WhatsApp con los datos del formulario
              </p>

            </form>
          </div>

        </div>
      </section>

    </div>
  )
}

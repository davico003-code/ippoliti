'use client'

import { useState } from 'react'

export default function TasacionesPage() {
  const [form, setForm] = useState({
    nombre: '', telefono: '', direccion: '',
    tipo: '', mensaje: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lines = [
      'Hola! Quiero tasar mi propiedad',
      '',
      form.direccion && `Dirección: ${form.direccion}`,
      form.tipo && `Tipo: ${form.tipo}`,
      form.mensaje && `Consulta: ${form.mensaje}`,
      '',
      form.nombre && `${form.nombre}`,
      form.telefono && `${form.telefono}`,
      '',
      '*Solicito tasación en 24hs*',
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/5493412101694?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank')
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1A5C38] focus:ring-1 focus:ring-[#1A5C38]/20 transition-all'

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 pt-20 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
          Tasá tu propiedad
        </h1>
        <p className="text-gray-400 text-sm text-center mt-3 mb-12">
          Completá el formulario y te contactamos en menos de 24hs
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={form.nombre}
            onChange={e => update('nombre', e.target.value)}
            className={inputClass}
            placeholder="Nombre"
          />

          <input
            type="tel"
            value={form.telefono}
            onChange={e => update('telefono', e.target.value)}
            className={inputClass}
            placeholder="Teléfono"
          />

          <input
            type="text"
            value={form.direccion}
            onChange={e => update('direccion', e.target.value)}
            className={inputClass}
            placeholder="Dirección del inmueble"
            required
          />

          <select
            value={form.tipo}
            onChange={e => update('tipo', e.target.value)}
            className={`${inputClass} ${!form.tipo ? 'text-gray-400' : 'text-gray-900'}`}
          >
            <option value="" disabled>Tipo de propiedad</option>
            <option value="Casa">Casa</option>
            <option value="Departamento">Departamento</option>
            <option value="Terreno">Terreno</option>
            <option value="Local Comercial">Local Comercial</option>
            <option value="Galpón">Galpón</option>
          </select>

          <textarea
            value={form.mensaje}
            onChange={e => update('mensaje', e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Mensaje (opcional)"
          />

          <button
            type="submit"
            className="w-full bg-[#1A5C38] hover:bg-[#145030] text-white rounded-xl py-4 font-semibold text-base transition-colors"
          >
            Solicitar tasación por WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}

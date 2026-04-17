'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  open: boolean
  onClose: () => void
}

export default function GuiaModal({ open, onClose }: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!open) return null

  async function handleSubmit() {
    if (!nombre.trim() || !email.trim()) {
      setError('Nombre y email son obligatorios')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/guia/acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al procesar')
        setLoading(false)
        return
      }

      // Cookie JWT seteada por el endpoint. Redirigir a la guía.
      router.push('/guia-comprador')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white w-full rounded-t-3xl px-5 pt-6 pb-8"
        style={{ maxWidth: 390, animation: 'guiaSlideUp 300ms ease' }}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

        <p className="font-poppins text-[#1A5C38] text-[11px] font-bold tracking-[0.15em] uppercase">
          Acceso a la guía
        </p>
        <h3 className="font-raleway font-black text-[22px] leading-tight mt-1 text-gray-900">
          Dejanos tus datos una sola vez.
        </h3>
        <p className="font-poppins text-gray-500 text-[13px] mt-2 leading-relaxed">
          Después podés volver a leerla cuando quieras, sin volver a loguearte.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="font-poppins text-[12px] font-semibold text-gray-700 mb-1.5 block">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1A5C38] focus:ring-2 focus:ring-[#1A5C38]/20 outline-none font-poppins text-[14px] text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="font-poppins text-[12px] font-semibold text-gray-700 mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1A5C38] focus:ring-2 focus:ring-[#1A5C38]/20 outline-none font-poppins text-[14px] text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="font-poppins text-[12px] font-semibold text-gray-700 mb-1.5 block">
              WhatsApp <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <div className="px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 font-poppins text-[14px] text-gray-700 shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                +54
              </div>
              <input
                type="tel"
                placeholder="341 5 123456"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1A5C38] focus:ring-2 focus:ring-[#1A5C38]/20 outline-none font-poppins text-[14px] text-gray-900 placeholder-gray-400"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="font-poppins text-red-500 text-[13px] mt-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full text-white font-poppins font-bold text-[15px] flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition"
          style={{ background: loading ? '#6b7280' : '#1A5C38', opacity: loading ? 0.7 : 1 }}
        >
          <span>{loading ? 'Procesando...' : 'Empezar a leer'}</span>
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>

        <p className="font-poppins text-gray-400 text-[11px] mt-4 text-center leading-relaxed px-2">
          No compartimos tus datos. Te escribimos solo si nos buscás vos primero.
        </p>
      </div>

      <style>{`@keyframes guiaSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  )
}

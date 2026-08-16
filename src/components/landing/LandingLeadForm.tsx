'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

/**
 * Formulario corto de las landings por cluster (Growth OS §24: pedir lo
 * mínimo — el resto lo averigua la conversación). Postea a /api/leads, que ya
 * reenvía a Hilo con la cookie de atribución (utm/gclid/fbclid) — así el click
 * de Google queda pegado al lead y las conversiones offline cierran el círculo.
 */
export default function LandingLeadForm({
  origen,
  operation,
  propertyType,
  ciudad,
  budgetMin,
  budgetMax,
}: {
  origen: string
  operation: 'Sale' | 'Rent'
  propertyType: string | null
  ciudad: string
  budgetMin: number | null
  budgetMax: number | null
}) {
  const [form, setForm] = useState({ nombre: '', whatsapp: '', mensaje: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    if (!form.nombre.trim() || !form.whatsapp.trim()) {
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          whatsapp: form.whatsapp,
          mensaje: form.mensaje || undefined,
          origen,
          eventType: 'property.inquiry',
          operation,
          propertyType: propertyType ?? undefined,
          preferredZones: [ciudad],
          budgetMin: budgetMin ?? undefined,
          budgetMax: budgetMax ?? undefined,
        }),
      })
      if (!res.ok) throw new Error('bad status')
      setStatus('sent')
      trackEvent('generate_lead', { origen })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-center">
        <p className="text-lg font-bold text-white">¡Listo! Te contactamos en el día.</p>
        <p className="text-sm text-white/80 mt-1">Un asesor de la zona te escribe por WhatsApp.</p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2">
      <input
        type="text"
        placeholder="Tu nombre"
        value={form.nombre}
        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
        className="rounded-xl px-4 py-3 text-gray-900 text-sm w-full"
        required
      />
      <input
        type="tel"
        placeholder="Tu WhatsApp"
        value={form.whatsapp}
        onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
        className="rounded-xl px-4 py-3 text-gray-900 text-sm w-full"
        required
      />
      <input
        type="text"
        placeholder="¿Qué estás buscando? (opcional)"
        value={form.mensaje}
        onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
        className="rounded-xl px-4 py-3 text-gray-900 text-sm w-full sm:col-span-2"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="sm:col-span-2 px-6 py-3 bg-[#25D366] hover:brightness-105 text-white font-bold rounded-xl transition disabled:opacity-60"
      >
        {status === 'sending' ? 'Enviando…' : 'Quiero que me contacten'}
      </button>
      {status === 'error' && (
        <p className="sm:col-span-2 text-sm text-red-200">Completá nombre y WhatsApp, o probá de nuevo.</p>
      )}
    </form>
  )
}

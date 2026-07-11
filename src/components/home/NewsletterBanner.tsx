'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const GREEN = '#1A5C38'

export default function NewsletterBanner() {
  const [form, setForm] = useState({ nombre: '', email: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, email: form.email, origen: 'newsletter' }),
      })
      if (!res.ok) throw new Error('bad status')
      setStatus('sent')
      trackEvent('generate_lead', { origen: 'newsletter_banner' })
      trackFbEvent('Lead', { content_name: 'Newsletter oportunidades' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[46%_1fr]">
        <Image
          src="/newsletter-placa.jpg"
          alt="Recibí oportunidades reales — propiedades seleccionadas por IA y revisión humana de SI INMOBILIARIA"
          width={1122}
          height={1402}
          sizes="(max-width: 768px) 100vw, 46vw"
          className="h-auto w-full"
        />

        <div className="flex flex-col px-6 pb-10 pt-8 md:px-12 md:pt-24">
          {status === 'sent' ? (
            <div
              className="flex items-center gap-3 rounded-xl border px-5 py-4 font-raleway text-[15px] font-semibold"
              style={{ borderColor: 'rgba(26,92,56,0.3)', background: 'rgba(26,92,56,0.06)', color: GREEN }}
              role="status"
            >
              <CheckCircle2 size={22} style={{ color: GREEN }} className="shrink-0" />
              ¡Listo! Te van a empezar a llegar las oportunidades seleccionadas.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2.5">
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Tu nombre"
                autoComplete="name"
                required
                minLength={3}
                className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 font-raleway text-[15px] text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Tu email"
                autoComplete="email"
                required
                className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 font-raleway text-[15px] text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-[52px] w-full rounded-xl font-raleway text-[15px] font-bold text-white transition-colors disabled:opacity-70"
                style={{ background: GREEN }}
              >
                {status === 'sending' ? 'Enviando…' : 'Quiero recibirlas'}
              </button>
              {status === 'error' && (
                <p className="font-raleway text-sm text-red-600">
                  No pudimos anotarte. Probá de nuevo en un momento.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BarChart3, CheckCircle2, Cpu, MapPin, UserRound } from 'lucide-react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const GREEN = '#1A5C38'

const selectionSteps = [
  {
    title: 'IA detectó',
    body: 'Propiedades con señales de buen precio o potencial.',
    Icon: Cpu,
  },
  {
    title: 'Comparamos',
    body: 'Analizamos precio/m² y referencias en la zona.',
    Icon: BarChart3,
  },
  {
    title: 'Cruzamos datos',
    body: 'Ubicación, metros, tipología y contexto de mercado.',
    Icon: MapPin,
  },
  {
    title: 'Revisión humana',
    body: 'Nuestro equipo verifica y aprueba lo que realmente vale.',
    Icon: UserRound,
  },
]

function NewsletterPlate() {
  return (
    <figure className="w-full overflow-hidden bg-white">
      <div className="relative aspect-[1122/1110] w-full overflow-hidden bg-[#07110d]">
        <Image
          src="/newsletter-placa.jpg"
          alt="Recibí oportunidades reales — propiedades seleccionadas por IA y revisión humana de SI INMOBILIARIA"
          fill
          sizes="(max-width: 768px) 100vw, 46vw"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <figcaption className="bg-white px-5 py-6 sm:px-7">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-[#2C8C45]" aria-hidden="true" />
          <h3 className="shrink-0 text-center font-poppins text-[16px] font-semibold leading-tight text-[#111] sm:text-[18px]">
            Así seleccionamos cada oportunidad
          </h3>
          <span className="h-px flex-1 bg-[#2C8C45]" aria-hidden="true" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4 sm:gap-x-3">
          {selectionSteps.map(({ title, body, Icon }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#D7E6D9] bg-[#F2F8EE] text-[#2E9B22] shadow-[inset_0_0_0_5px_rgba(255,255,255,0.72)]">
                <Icon size={30} strokeWidth={2.35} aria-hidden="true" />
              </div>
              <h4 className="mt-3 font-poppins text-[13px] font-bold leading-tight text-[#161616]">
                {title}
              </h4>
              <p className="mx-auto mt-1.5 max-w-[122px] font-raleway text-[12px] font-medium leading-snug text-[#404040]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </figcaption>
    </figure>
  )
}

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
      trackFbEvent('CompleteRegistration', { content_name: 'Newsletter oportunidades' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[46%_1fr]">
        <NewsletterPlate />

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

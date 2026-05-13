'use client'

import { useState } from 'react'
import { BARRIOS } from '@/lib/barrios'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

interface Props {
  defaultBarrioSlug?: string
  origen?: string
  title?: string
  subtitle?: string
}

export default function BarrioNewsletter({
  defaultBarrioSlug,
  origen = 'newsletter-barrios',
  title = 'Avísenme cuando entren lotes',
  subtitle = 'Cuando entre un lote que matchee con tu búsqueda, te aviso por WhatsApp. Sin spam.',
}: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [barriosSel, setBarriosSel] = useState<string[]>(defaultBarrioSlug ? [defaultBarrioSlug] : [])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleBarrio = (slug: string) => {
    setBarriosSel((curr) => (curr.includes(slug) ? curr.filter((s) => s !== slug) : [...curr, slug]))
  }

  const submit = async () => {
    setError(null)
    if (nombre.trim().length < 3) {
      setError('Decinos tu nombre (mínimo 3 caracteres)')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/barrios/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          whatsapp,
          barrios: barriosSel,
          presupuesto,
          origen,
          mensaje: 'Quiero que me avisen cuando entren lotes.',
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'No pudimos enviar el formulario')
        return
      }
      setDone(true)
      trackEvent('barrios_lead_submit', { slug: barriosSel.join(',') || 'sin-slug', origen })
      trackFbEvent('Lead', { content_name: 'Barrios Privados Newsletter' })
    } catch {
      setError('Error de red — probá de nuevo')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-brand-50 p-8 text-center">
        <h3 className="mb-2 font-raleway text-2xl font-semibold text-brand-700">Listo ✓</h3>
        <p className="text-sm text-stone-700">
          Cuando entre un lote que matchee con tu búsqueda, te aviso por WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-stone-50 p-6 md:p-10">
      <h3 className="mb-2 font-raleway text-2xl font-semibold text-navy-700">{title}</h3>
      <p className="mb-6 text-sm text-stone-600">{subtitle}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-700">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-700">WhatsApp</label>
          <input
            type="tel"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            placeholder="+54 9 341 ..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-700">Presupuesto (USD)</label>
          <select
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
          >
            <option value="">— Sin definir —</option>
            <option value="menos-80k">Menos de USD 80.000</option>
            <option value="80-150k">USD 80.000 – 150.000</option>
            <option value="150-300k">USD 150.000 – 300.000</option>
            <option value="mas-300k">Más de USD 300.000</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium text-stone-700">
          Barrios que te interesan
        </label>
        <div className="flex flex-wrap gap-2">
          {BARRIOS.map((b) => {
            const active = barriosSel.includes(b.slug)
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => toggleBarrio(b.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-brand-600'
                }`}
              >
                {b.nombre}
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-accent-500">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50 md:w-auto md:px-8"
      >
        {submitting ? 'Enviando…' : 'Avísenme cuando entren lotes'}
      </button>
    </div>
  )
}

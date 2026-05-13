'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

interface Props {
  title?: string
  subtitle?: string
  waText?: string
  ubicacion?: string
  slug?: string
}

export default function BarrioCTAFinal({
  title = '¿Querés que un broker local te ayude a elegir?',
  subtitle = 'Ahorrate semanas de búsqueda. Te organizamos visitas a los barrios que te interesan en una sola tarde.',
  waText = 'Hola David, vi la página de barrios privados y quiero que me orienten.',
  ubicacion = 'cta-final-hub',
  slug,
}: Props) {
  const wa = `https://wa.me/5493412101694?text=${encodeURIComponent(waText)}`
  return (
    <section className="bg-brand-600 px-6 py-16 text-white md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 font-raleway text-3xl font-semibold md:text-4xl">{title}</h2>
        <p className="mb-8 text-base text-white/80 md:text-lg">{subtitle}</p>
        <Link
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('barrios_whatsapp_click', { slug: slug ?? 'hub', ubicacion })}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-raleway text-base font-semibold text-brand-700 shadow-lg transition hover:scale-105"
        >
          Hablar con David por WhatsApp
        </Link>
        <p className="mt-6 text-xs text-white/60">
          David Flores · Mat. N° 0621 · SI INMOBILIARIA
        </p>
      </div>
    </section>
  )
}

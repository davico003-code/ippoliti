import type { Metadata } from 'next'
import Link from 'next/link'
import { BARRIOS } from '@/lib/barrios'
import { HUB_FAQS } from '@/lib/barrios/faq'

import BarrioMapaWrapper from '@/components/barrios/BarrioMapaWrapper'
import BarrioCalculadora from '@/components/barrios/BarrioCalculadora'
import BarrioGrid from '@/components/barrios/BarrioGrid'
import BarrioComparador from '@/components/barrios/BarrioComparador'
import BarrioStatStrip from '@/components/barrios/BarrioStatStrip'
import BarrioMediosLocales from '@/components/barrios/BarrioMediosLocales'
import BarrioFAQ from '@/components/barrios/BarrioFAQ'
import BarrioNewsletter from '@/components/barrios/BarrioNewsletter'
import BarrioCTAFinal from '@/components/barrios/BarrioCTAFinal'
import HubTracker from './HubTracker'

const CANONICAL = 'https://siinmobiliaria.com/barrios-privados'

export const metadata: Metadata = {
  title: 'Barrios privados del corredor Funes–Roldán — Guía 2026 | SI INMOBILIARIA',
  description:
    '11 barrios privados del corredor Funes–Roldán analizados por brokers locales: precios, lotes, amenities, comparativas y stock actualizado. Mat. N° 0621.',
  keywords: [
    'barrios privados funes',
    'barrios cerrados funes',
    'barrios privados roldan',
    'lotes barrio cerrado funes',
    'comprar lote funes',
    'barrio nautico funes',
    'barrios con golf funes',
  ].join(', '),
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Barrios privados del corredor Funes–Roldán | SI INMOBILIARIA',
    description:
      '11 barrios, una sola guía hecha por brokers que viven en la zona. Datos reales, precios actualizados, comparativas honestas.',
    url: CANONICAL,
    type: 'website',
    siteName: 'SI INMOBILIARIA',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barrios privados del corredor Funes–Roldán',
    description: '11 barrios analizados por SI INMOBILIARIA — Mat. N° 0621',
    images: ['/og-default.jpg'],
  },
}

export default function BarriosPrivadosHub() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Barrios privados del corredor Funes–Roldán',
    description:
      '11 barrios privados analizados por SI INMOBILIARIA — Mat. N° 0621. Funes y Roldán, Santa Fe, Argentina.',
    itemListElement: BARRIOS.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${CANONICAL}/${b.slug}`,
      name: b.nombre,
    })),
  }

  const hubFaqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HUB_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubFaqJsonLd) }}
      />
      <HubTracker />

      {/* 1. HERO */}
      <section className="relative isolate overflow-hidden bg-navy-700 px-6 py-20 text-white md:py-28">
        <div className="absolute inset-0 -z-10 opacity-30">
          <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            <defs>
              <linearGradient id="hub-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1A5C38" />
                <stop offset="100%" stopColor="#0D3620" />
              </linearGradient>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hub-bg)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Guía 2026 · SI INMOBILIARIA
          </p>
          <h1 className="mb-6 font-raleway text-4xl font-semibold leading-tight md:text-6xl">
            Barrios privados del corredor Funes–Roldán
          </h1>
          <p className="mb-8 text-base text-white/85 md:text-xl">
            11 barrios, una sola guía hecha por brokers que viven en la zona. Datos reales, precios
            actualizados, comparativas honestas.
          </p>
          <ul className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70 md:text-sm">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gold-300" />
              11 barrios analizados
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gold-300" />
              +1.500 operaciones cerradas
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gold-300" />
              Mat. N° 0621
            </li>
          </ul>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#calculadora"
              className="rounded-lg bg-gold-500 px-6 py-3 font-raleway text-sm font-semibold text-navy-900 shadow-lg transition hover:scale-105"
            >
              Encontrar mi barrio ideal
            </a>
            <a
              href="#listado"
              className="rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-raleway text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Ver todos los barrios
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-24 px-6 py-16">
        {/* 2. MAPA */}
        <section>
          <div className="mb-6 max-w-2xl">
            <h2 className="mb-2 font-raleway text-3xl font-semibold text-navy-700 md:text-4xl">
              Dónde está cada barrio
            </h2>
            <p className="text-base text-stone-600">
              Mapa del corredor con todos los barrios. Tocá un marcador para ver el detalle. Los
              colores indican el tier de cada producto.
            </p>
          </div>
          <BarrioMapaWrapper />
        </section>

        {/* 3. CALCULADORA */}
        <section id="calculadora" className="scroll-mt-24">
          <div className="mb-6 max-w-2xl">
            <h2 className="mb-2 font-raleway text-3xl font-semibold text-navy-700 md:text-4xl">
              Encontrá tu lote ideal
            </h2>
            <p className="text-base text-stone-600">
              Contestá 3 preguntas y te mostramos los barrios que mejor matchean con lo que buscás.
              Sin spam, sin email obligatorio.
            </p>
          </div>
          <BarrioCalculadora />
        </section>

        {/* 4. FILTROS + GRID */}
        <section id="listado" className="scroll-mt-24">
          <div className="mb-6 max-w-2xl">
            <h2 className="mb-2 font-raleway text-3xl font-semibold text-navy-700 md:text-4xl">
              Los 11 barrios del corredor
            </h2>
            <p className="text-base text-stone-600">
              Filtrá por tier, zona, tamaño de lote o característica. Default: premium primero,
              consolidados después, en desarrollo al final.
            </p>
          </div>
          <BarrioGrid barrios={BARRIOS} />
        </section>

        {/* 5. COMPARADOR */}
        <section id="comparador" className="scroll-mt-24">
          <div className="mb-6 max-w-2xl">
            <h2 className="mb-2 font-raleway text-3xl font-semibold text-navy-700 md:text-4xl">
              Compará barrios lado a lado
            </h2>
            <p className="text-base text-stone-600">
              Seleccioná hasta 3 barrios para verlos en una tabla comparativa. Podés compartir la
              comparativa por WhatsApp con un link.
            </p>
          </div>
          <BarrioComparador />
        </section>
      </div>

      {/* 6. STAT STRIP */}
      <BarrioStatStrip />

      {/* 7. MEDIOS LOCALES */}
      <BarrioMediosLocales />

      <div className="mx-auto max-w-4xl space-y-24 px-6 py-16">
        {/* 8. FAQ */}
        <section id="faq">
          <BarrioFAQ faqs={HUB_FAQS} title="Preguntas frecuentes del corredor" />
          <p className="mt-6 text-xs text-stone-500">
            ¿Falta tu pregunta?{' '}
            <Link
              href="https://wa.me/5493412101694"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline"
            >
              Preguntale a David directo por WhatsApp
            </Link>
            .
          </p>
        </section>

        {/* 9. NEWSLETTER */}
        <section id="newsletter">
          <BarrioNewsletter origen="newsletter-barrios" />
        </section>
      </div>

      {/* 10. CTA FINAL */}
      <BarrioCTAFinal />
    </>
  )
}

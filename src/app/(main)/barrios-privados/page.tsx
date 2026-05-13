import type { Metadata } from 'next'
import Link from 'next/link'
import { BARRIOS } from '@/lib/barrios'
import { HUB_FAQS } from '@/lib/barrios/faq'

import BarrioMapaWrapper from '@/components/barrios/BarrioMapaWrapper'
import BarrioCalculadora from '@/components/barrios/BarrioCalculadora'
import BarrioHubTierGrid from '@/components/barrios/BarrioHubTierGrid'
import BarrioComparador from '@/components/barrios/BarrioComparador'
import BarrioStatStrip from '@/components/barrios/BarrioStatStrip'
import BarrioMediosLocales from '@/components/barrios/BarrioMediosLocales'
import BarrioFAQ from '@/components/barrios/BarrioFAQ'
import BarrioNewsletter from '@/components/barrios/BarrioNewsletter'
import BarrioCTAFinal from '@/components/barrios/BarrioCTAFinal'
import HubTracker from './HubTracker'

const CANONICAL = 'https://siinmobiliaria.com/barrios-privados'

export const metadata: Metadata = {
  title: 'Barrios privados de Funes y Roldán | SI Inmobiliaria',
  description:
    'Los 11 barrios cerrados de Funes y Roldán analizados sin filtro. Premium, consolidados y en desarrollo. Conocelos con la mirada de un broker de dos generaciones.',
  keywords: [
    'barrios privados funes',
    'barrios cerrados roldan',
    'barrios privados funes roldan',
    'club de campo santa fe',
    'lotes en venta funes',
    'country messi rosario',
  ].join(', '),
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Barrios privados de Funes y Roldán | SI Inmobiliaria',
    description:
      'Una guía completa, escrita por brokers que viven y trabajan en la zona. Los 11 barrios cerrados de Funes y Roldán analizados sin filtro.',
    url: CANONICAL,
    type: 'website',
    siteName: 'SI INMOBILIARIA',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barrios privados de Funes y Roldán',
    description: '11 barrios analizados por SI Inmobiliaria — Mat. 0621',
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

      {/* 1. HERO editorial (referencia: 11-landings/index.html) */}
      <section className="border-b border-[rgba(15,15,15,0.08)] bg-white px-6 pb-24 pt-32 text-[#0F0F0F] md:px-10 md:pb-28 md:pt-44">
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-8 flex items-center gap-4 font-raleway text-[16px] font-light italic text-[#8B7355] md:text-[18px]">
            <span className="block h-px w-[60px] bg-[#8B7355]" aria-hidden />
            Funes y Roldán · Santa Fe
          </p>
          <h1 className="mb-8 max-w-[1100px] font-raleway text-[clamp(48px,7vw,112px)] font-bold leading-none tracking-tight">
            Los 11 barrios privados de{' '}
            <span className="font-bold italic text-[#8B7355]">Funes y Roldán.</span>
          </h1>
          <p className="mb-14 max-w-[760px] font-raleway text-[18px] font-normal leading-[1.55] text-[#2A2A2A] md:text-[22px]">
            Una guía completa, escrita por brokers que viven y trabajan en la zona. Los 11 barrios
            cerrados de Funes y Roldán analizados sin filtro: lo que tienen, lo que les falta, y
            para quién es cada uno. Si querés comprar bien, primero tenés que entender bien.
          </p>
          <ul className="flex flex-wrap gap-x-16 gap-y-6 border-t border-[rgba(15,15,15,0.08)] pt-8">
            <li>
              <div className="font-poppins text-[36px] font-semibold leading-none tabular-nums">
                11
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B]">
                Barrios analizados
              </div>
            </li>
            <li>
              <div className="font-poppins text-[36px] font-semibold leading-none tabular-nums">
                4.500+
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B]">
                Lotes en la zona
              </div>
            </li>
            <li>
              <div className="font-poppins text-[36px] font-semibold leading-none tabular-nums">
                1.500+
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B]">
                Propiedades vendidas por SI
              </div>
            </li>
            <li>
              <div className="font-poppins text-[36px] font-semibold leading-none tabular-nums">
                2
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B]">
                Generaciones
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 2. TIER-GROUPED GRID (4 secciones: Premium → Consolidado → Consolidado con vida joven → En desarrollo) */}
      <BarrioHubTierGrid />

      <div className="mx-auto max-w-6xl space-y-24 px-6 py-20">
        {/* 3. MAPA — herramienta visual del corredor */}
        <section id="mapa" className="scroll-mt-24">
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

        {/* 4. CALCULADORA */}
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

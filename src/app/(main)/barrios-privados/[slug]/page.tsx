import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BARRIOS, getBarrioBySlug } from '@/lib/barrios'
import { buildBarrioFaqs } from '@/lib/barrios/faq'
import { getPlanoUrl } from '@/lib/barrios/planos'

import BarrioHero from '@/components/barrios/BarrioHero'
import BarrioContenidoEditorial from '@/components/barrios/BarrioContenidoEditorial'
import BarrioDescargas from '@/components/barrios/BarrioDescargas'
import BarrioStockTokko from '@/components/barrios/BarrioStockTokko'
import BarrioNewsletter from '@/components/barrios/BarrioNewsletter'
import BarrioCTAFinal from '@/components/barrios/BarrioCTAFinal'
import LandingTracker from './LandingTracker'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return BARRIOS.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const barrio = getBarrioBySlug(params.slug)
  if (!barrio) return {}
  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`

  // Prefer editorial subtitulo + 155 chars del intro cuando existen.
  const title = barrio.subtitulo
    ? `${barrio.nombre} · ${barrio.subtitulo} | SI Inmobiliaria`
    : barrio.seo.metaTitle
  const description = barrio.contenidoSEO?.intro
    ? barrio.contenidoSEO.intro.slice(0, 155).trim()
    : barrio.seo.metaDescription
  const keywords = barrio.keywords ?? barrio.seo.keywordsLongTail.join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [barrio.imagenes.hero ?? '/og-default.jpg'],
      type: 'website',
      siteName: 'SI INMOBILIARIA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [barrio.imagenes.hero ?? '/og-default.jpg'],
    },
  }
}

export default function BarrioPage({ params }: Props) {
  const barrio = getBarrioBySlug(params.slug)
  if (!barrio) notFound()

  // FAQ del JSON-LD: priorizar la editorial (faqExtendida del JSON) sobre
  // la generada heurística (buildBarrioFaqs). Si no hay editorial, fallback.
  const faqsParaJsonLd = barrio.faqExtendida?.length
    ? barrio.faqExtendida
    : buildBarrioFaqs(barrio)

  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`
  const description = barrio.contenidoSEO?.intro
    ? barrio.contenidoSEO.intro.slice(0, 300).trim()
    : barrio.seo.metaDescription

  const placeJsonLd = {
    '@type': 'Place',
    '@id': `${canonical}#place`,
    name: barrio.nombreCompleto,
    description,
    url: canonical,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Funes',
      addressRegion: 'Santa Fe',
      addressCountry: 'AR',
      streetAddress: barrio.ubicacion.direccionIngreso,
    },
    geo: barrio.ubicacion.coordenadas
      ? {
          '@type': 'GeoCoordinates',
          latitude: barrio.ubicacion.coordenadas.lat,
          longitude: barrio.ubicacion.coordenadas.lng,
        }
      : undefined,
    image: barrio.imagenes.hero
      ? `https://siinmobiliaria.com${barrio.imagenes.hero}`
      : undefined,
  }

  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://siinmobiliaria.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Barrios privados',
        item: 'https://siinmobiliaria.com/barrios-privados',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: barrio.nombre,
        item: canonical,
      },
    ],
  }

  const faqJsonLd = {
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    mainEntity: faqsParaJsonLd.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  }

  const graphJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [placeJsonLd, breadcrumbJsonLd, faqJsonLd],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
      />
      <LandingTracker slug={barrio.slug} nombre={barrio.nombre} />

      {/* 1. HERO — foto real o placeholder SVG por barrio */}
      <BarrioHero barrio={barrio} />

      {/* 2. CONTENIDO EDITORIAL SEO — 8 capítulos según 11-landings/{slug}.html.
         Hero + 8 bloques + CTA = exactamente lo del HTML maestro. */}
      <BarrioContenidoEditorial barrio={barrio} />

      {/* 3. DESCARGAS — plano PDF si está cargado, sino fallback WhatsApp.
         Drop el archivo en /public/barrios/{slug}/plano.pdf y se conecta. */}
      <BarrioDescargas
        slug={barrio.slug}
        nombre={barrio.nombre}
        planoUrl={getPlanoUrl(barrio.slug)}
      />

      {/* Funcionales que no están en el HTML maestro pero suman valor:
         stock vivo de Tokko + form de captura de lead. */}
      <div className="mx-auto max-w-[1280px] space-y-20 px-6 py-16 md:px-10">
        <section id="lotes" className="scroll-mt-24">
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Lotes disponibles en {barrio.nombre}
          </h2>
          <BarrioStockTokko slug={barrio.slug} nombre={barrio.nombre} tipo="Terreno" />
        </section>

        <section>
          <BarrioStockTokko
            slug={barrio.slug}
            nombre={barrio.nombre}
            tipo="Casa"
            title={`Casas en venta en ${barrio.nombre}`}
          />
        </section>

        <section id="contacto" className="scroll-mt-24">
          <BarrioNewsletter
            defaultBarrioSlug={barrio.slug}
            origen={`barrio-${barrio.slug}-interesado`}
            title={`Avísenme cuando entre un lote en ${barrio.nombre}`}
            subtitle="Dejanos tu contacto. Cuando entre un lote nuevo en este barrio, te avisamos primero por WhatsApp."
          />
        </section>
      </div>

      {/* 3. CTA FINAL — referencia: cta-finale del HTML maestro */}
      <BarrioCTAFinal
        slug={barrio.slug}
        ubicacion={`cta-final-${barrio.slug}`}
        title={`Conocer ${barrio.nombre} de la manera correcta.`}
        subtitle="Pedinos una visita guiada al barrio y el listado real de propiedades disponibles. Te respondemos por WhatsApp el mismo día."
        waText={`Hola SI, quiero info sobre ${barrio.nombre}.`}
      />
    </>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BARRIOS, getBarrioBySlug } from '@/lib/barrios'
import { buildBarrioFaqs } from '@/lib/barrios/faq'

import BarrioHero from '@/components/barrios/BarrioHero'
import BarrioTabsNav from '@/components/barrios/BarrioTabsNav'
import BarrioContenidoEditorial from '@/components/barrios/BarrioContenidoEditorial'
import BarrioMiradaBroker from '@/components/barrios/BarrioMiradaBroker'
import BarrioFichaTecnica from '@/components/barrios/BarrioFichaTecnica'
import BarrioAmenities from '@/components/barrios/BarrioAmenities'
import BarrioSeguridadAnillos from '@/components/barrios/BarrioSeguridadAnillos'
import BarrioPerfil from '@/components/barrios/BarrioPerfil'
import BarrioLinderos from '@/components/barrios/BarrioLinderos'
import BarrioStockTokko from '@/components/barrios/BarrioStockTokko'
import BarrioComoSeCompra from '@/components/barrios/BarrioComoSeCompra'
import BarrioUbicacion from '@/components/barrios/BarrioUbicacion'
import BarrioFAQ from '@/components/barrios/BarrioFAQ'
import BarrioCTAFinal from '@/components/barrios/BarrioCTAFinal'
import BarrioNewsletter from '@/components/barrios/BarrioNewsletter'
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

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'lotes', label: 'Lotes' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'comparar', label: 'Comparar' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacto', label: 'Contacto' },
]

export default function BarrioPage({ params }: Props) {
  const barrio = getBarrioBySlug(params.slug)
  if (!barrio) notFound()

  // FAQ del JSON-LD: priorizar la editorial (faqExtendida del JSON) sobre
  // la generada heurística (buildBarrioFaqs). Si no hay editorial, fallback.
  const faqsParaJsonLd = barrio.faqExtendida?.length
    ? barrio.faqExtendida
    : buildBarrioFaqs(barrio)
  const faqsLegacy = buildBarrioFaqs(barrio)

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

      {/* 1. HERO */}
      <BarrioHero barrio={barrio} />

      {/* 2. STICKY TAB NAV */}
      <BarrioTabsNav items={TABS} />

      {/* 3. CONTENIDO EDITORIAL SEO (8 bloques) — renderea null si no hay
         contenidoSEO en este barrio, garantizando no romper barrios sin
         editorial cargado. */}
      <section id="resumen" className="scroll-mt-24">
        <BarrioContenidoEditorial barrio={barrio} />
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-6 py-16">
        {/* 3-bis. MIRADA DEL BROKER (legacy — coexiste con el callout dark del editorial) */}
        <section className="scroll-mt-24">
          <BarrioMiradaBroker barrio={barrio} />
        </section>

        {/* 4. FICHA TÉCNICA */}
        <section>
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Ficha técnica
          </h2>
          <BarrioFichaTecnica barrio={barrio} />
        </section>

        {/* 5. DISTINTIVOS */}
        {barrio.datosDuros.distintivos && barrio.datosDuros.distintivos.length > 0 && (
          <section>
            <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
              Lo que hace distinto a {barrio.nombre}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {barrio.datosDuros.distintivos.map((d) => (
                <li
                  key={d}
                  className="rounded-xl border-l-4 border-brand-600 bg-white p-5 ring-1 ring-stone-200"
                >
                  <p className="text-sm leading-relaxed text-stone-700">{d}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 6. AMENITIES */}
        <section id="amenities" className="scroll-mt-24">
          <h2 className="mb-2 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Lo que vas a encontrar adentro
          </h2>
          <p className="mb-6 text-sm text-stone-600">
            {barrio.amenities.length} amenities disponibles dentro del barrio
          </p>
          <BarrioAmenities amenities={barrio.amenities} />
        </section>

        {/* 7. INFRAESTRUCTURA */}
        <section>
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Infraestructura
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {barrio.infraestructura.map((i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-stone-200"
              >
                <span className="mt-0.5 text-brand-600">✓</span>
                <span className="text-sm text-stone-700">{i}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 8. SEGURIDAD */}
        <section>
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Seguridad
          </h2>
          <BarrioSeguridadAnillos niveles={barrio.seguridad} />
        </section>

        {/* 9. PERFIL DE COMPRADOR */}
        <section>
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            ¿Te conviene este barrio?
          </h2>
          <BarrioPerfil barrio={barrio} />
        </section>

        {/* 10. COMPARATIVA LINDEROS */}
        <section id="comparar" className="scroll-mt-24">
          <h2 className="mb-2 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Otros barrios cerca
          </h2>
          <p className="mb-6 text-sm text-stone-600">Comparativa rápida con barrios linderos.</p>
          <BarrioLinderos barrio={barrio} />
        </section>

        {/* 11. LOTES */}
        <section id="lotes" className="scroll-mt-24">
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Lotes disponibles en {barrio.nombre}
          </h2>
          <BarrioStockTokko slug={barrio.slug} nombre={barrio.nombre} tipo="Terreno" />
        </section>

        {/* 12. CASAS */}
        <section>
          <BarrioStockTokko
            slug={barrio.slug}
            nombre={barrio.nombre}
            tipo="Casa"
            title={`Casas en venta en ${barrio.nombre}`}
          />
        </section>

        {/* 13. CÓMO SE COMPRA */}
        <section>
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Cómo se compra en un barrio privado
          </h2>
          <BarrioComoSeCompra />
        </section>

        {/* 14. UBICACIÓN */}
        <section id="ubicacion" className="scroll-mt-24">
          <h2 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
            Ubicación y accesos
          </h2>
          <BarrioUbicacion
            nombre={barrio.nombre}
            coords={barrio.ubicacion.coordenadas}
            accesos={barrio.ubicacion.accesos}
            distanciaCentroRosarioMin={barrio.ubicacion.distanciaCentroRosarioMin}
          />
        </section>

        {/* 15. FAQ legacy (solo si NO hay faqExtendida del editorial — para evitar duplicar el FAQ rich del bloque 8 editorial) */}
        {!barrio.faqExtendida?.length && (
          <section id="faq" className="scroll-mt-24">
            <BarrioFAQ faqs={faqsLegacy} title={`Preguntas frecuentes sobre ${barrio.nombre}`} />
          </section>
        )}

        {/* CONTACTO (newsletter por barrio) */}
        <section id="contacto" className="scroll-mt-24">
          <BarrioNewsletter
            defaultBarrioSlug={barrio.slug}
            origen={`barrio-${barrio.slug}-interesado`}
            title={`Avísenme cuando entre un lote en ${barrio.nombre}`}
            subtitle="Dejanos tu contacto. Cuando entre un lote nuevo en este barrio, te avisamos primero por WhatsApp."
          />
        </section>
      </div>

      {/* 16. CTA FINAL */}
      <BarrioCTAFinal
        slug={barrio.slug}
        ubicacion={`cta-final-${barrio.slug}`}
        title={`¿Querés que te avise cuando entre un lote bueno en ${barrio.nombre}?`}
        subtitle="Te lo paso a vos primero. Te organizamos visita guiada el día que mejor te queda."
        waText={`Hola David, me interesa ${barrio.nombre} y quiero que me organicen visita.`}
      />
    </>
  )
}

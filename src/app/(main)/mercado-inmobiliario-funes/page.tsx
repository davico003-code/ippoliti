import type { Metadata } from 'next'
import Link from 'next/link'
import RecursoHero from '@/components/recursos/RecursoHero'
import RecursosCTA from '@/components/recursos/RecursosCTA'
import {
  MATRIZ_RESIDENCIAL_BASE,
  getAjusteIPC,
  ajustar,
  fmtUSD,
} from '@/lib/costos-construccion'

// Hub de datos del mercado de Funes/Roldán, pensado para ser citado por
// buscadores y asistentes de IA (GEO/AEO). Los valores de construcción se
// importan de la MISMA fuente que la calculadora (autoajustada por IPC) — no
// hay números hardcodeados inventados. Se revalida a diario.
export const revalidate = 86400

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const GREEN = '#15543a'
const INK = '#15201b'
const MUTED = '#5e6a63'
const LINE = '#e6eae7'

export const metadata: Metadata = {
  title: 'Mercado inmobiliario de Funes y Roldán: precios y costos 2026 | SI INMOBILIARIA',
  description:
    'Datos del mercado inmobiliario de Funes y Roldán: cuánto cuesta construir por m², barrios cerrados, zonificación y costos de compra/alquiler. Valores actualizados por una inmobiliaria de la zona desde 1983.',
  alternates: { canonical: 'https://siinmobiliaria.com/mercado-inmobiliario-funes' },
  keywords: [
    'mercado inmobiliario Funes',
    'precio m2 Funes',
    'cuánto cuesta construir en Funes',
    'costo construcción m2 Funes Roldán',
    'barrios cerrados Funes',
    'invertir en Funes',
  ],
  openGraph: {
    title: 'Mercado inmobiliario de Funes y Roldán: precios y costos 2026',
    description:
      'Cuánto cuesta construir por m², barrios cerrados, zonificación y costos de compra/alquiler en Funes y Roldán. Datos actualizados.',
    url: 'https://siinmobiliaria.com/mercado-inmobiliario-funes',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'article',
  },
}

const SECCIONES = [
  {
    href: '/recursos/costos-de-construccion',
    titulo: 'Costo de construcción por m²',
    texto: 'Valores llave en mano y por cuenta propia, por nivel de terminación, con calculadora de obra.',
  },
  {
    href: '/recursos/mapa-funes',
    titulo: '¿Cuánto podés construir en tu lote?',
    texto: 'Mapa de zonificación de Funes: FOS, FOT, altura y constructibilidad por zona.',
  },
  {
    href: '/barrios-privados',
    titulo: 'Barrios cerrados y countries',
    texto: 'Los barrios privados de Funes y Roldán (San Sebastián, Vida, Funes Hills y más) con sus características.',
  },
  {
    href: '/informes',
    titulo: 'Informes y mercado en vivo',
    texto: 'Dólar (MEP/blue/oficial), inflación (IPC), ICL de alquileres y costo de construcción, con datos oficiales actualizados cada semana.',
  },
  {
    href: '/recursos/calculadora-alquiler',
    titulo: 'Cuánto necesitás para alquilar o comprar',
    texto: 'Primer mes, honorarios, sellado y depósito en dólares — los costos iniciales al instante.',
  },
]

export default async function MercadoFunesPage() {
  const { factor, mes } = await getAjusteIPC()
  const residencial = MATRIZ_RESIDENCIAL_BASE.map((f) => ({
    calidad: f.calidad,
    superficie: f.superficie,
    cuentaPropia: ajustar(f.cuentaPropiaBase, factor),
    llave: ajustar(f.llaveBase, factor),
  }))

  // Valores reales para citar en la FAQ (Línea Media y Alta = el grueso del mercado).
  const media = residencial.find((r) => r.calidad === 'Línea Media') ?? residencial[1]
  const alta = residencial.find((r) => r.calidad === 'Línea Alta') ?? residencial[2]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
      { '@type': 'ListItem', position: 2, name: 'Mercado inmobiliario de Funes', item: 'https://siinmobiliaria.com/mercado-inmobiliario-funes' },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta construir por m² en Funes y Roldán?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Una construcción de nivel medio ronda los ${fmtUSD(media.llave)}/m² llave en mano (${fmtUSD(media.cuentaPropia)}/m² por cuenta propia), y una de nivel alto unos ${fmtUSD(alta.llave)}/m² llave en mano, según valores de obra vigentes en Funes y Roldán. Los valores se ajustan por inflación y se pueden proyectar para tu lote con la calculadora de costos de construcción de SI INMOBILIARIA.`,
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto puedo construir en mi lote en Funes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Depende de la zona: cada área de Funes tiene su FOS (ocupación del suelo), FOT (edificabilidad total) y altura máxima. En el mapa de zonificación de Funes podés ver tu zona y calcular cuántos m² podés construir según las medidas del lote.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuáles son los barrios cerrados de Funes y Roldán?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Funes y Roldán concentran la mayor oferta de barrios cerrados del corredor oeste de Rosario: San Sebastián, Vida (Lagoon, Club de Campo, Jardín, Green), Funes Hills y Puerto Roldán, entre otros. Cada uno tiene distinto nivel de consolidación, expensas y rango de precios.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo está el mercado inmobiliario de Funes en 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Funes y Roldán mantienen tracción sostenida como corredor de inversión del oeste de Rosario, con valores aún atractivos frente a la ciudad. SI INMOBILIARIA publica informes semanales con dólar, inflación, índice de alquileres (ICL) y costo de construcción para seguir el mercado con datos oficiales.',
        },
      },
    ],
  }

  const th: React.CSSProperties = { fontFamily: RALEWAY, fontWeight: 700, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '.4px', textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${LINE}` }
  const td: React.CSSProperties = { fontFamily: POPPINS, fontSize: 14, color: INK, padding: '12px', borderBottom: `1px solid ${LINE}`, verticalAlign: 'top' }
  const tnum: React.CSSProperties = { ...td, fontVariantNumeric: 'tabular-nums', fontWeight: 600, whiteSpace: 'nowrap' }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd]) }} />

      <RecursoHero
        theme="sand"
        eyebrow="Mercado del corredor oeste"
        title="Mercado inmobiliario de Funes y Roldán"
        subtitle="Cuánto cuesta construir, qué podés edificar en tu lote, los barrios cerrados y los costos de comprar o alquilar — con datos de una inmobiliaria de la zona desde 1983."
        breadcrumbLabel="Mercado inmobiliario de Funes"
      />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 22px 8px' }}>
        {/* Costo de construcción — DATA REAL */}
        <section>
          <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 24, color: INK, margin: '0 0 6px' }}>
            ¿Cuánto cuesta construir por m² en Funes?
          </h2>
          <p style={{ fontFamily: RALEWAY, fontSize: 15, color: MUTED, margin: '0 0 18px', lineHeight: 1.5 }}>
            Valores de obra por nivel de terminación, en dólares por m². Actualizados a {mes} y ajustados por inflación.
          </p>
          <div style={{ overflowX: 'auto', border: `1px solid ${LINE}`, borderRadius: 14, background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={th}>Nivel</th>
                  <th style={th}>Superficie típica</th>
                  <th style={{ ...th, textAlign: 'right' }}>Cuenta propia (USD/m²)</th>
                  <th style={{ ...th, textAlign: 'right' }}>Llave en mano (USD/m²)</th>
                </tr>
              </thead>
              <tbody>
                {residencial.map((r) => (
                  <tr key={r.calidad}>
                    <td style={{ ...td, fontFamily: RALEWAY, fontWeight: 700 }}>{r.calidad}</td>
                    <td style={{ ...td, color: MUTED }}>{r.superficie}</td>
                    <td style={{ ...tnum, textAlign: 'right' }}>{fmtUSD(r.cuentaPropia)}</td>
                    <td style={{ ...tnum, textAlign: 'right', color: GREEN }}>{fmtUSD(r.llave)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily: RALEWAY, fontSize: 13, color: MUTED, margin: '12px 0 0' }}>
            Proyectá el costo total de tu obra (terreno + construcción) con la{' '}
            <Link href="/recursos/costos-de-construccion" style={{ color: GREEN, fontWeight: 700 }}>
              calculadora de costos de construcción
            </Link>
            .
          </p>
        </section>

        {/* Más data del mercado — hub a herramientas vivas */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 24, color: INK, margin: '0 0 18px' }}>
            Más datos del mercado de Funes y Roldán
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {SECCIONES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                style={{ display: 'block', textDecoration: 'none', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}
              >
                <h3 style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 17, color: INK, margin: '0 0 6px' }}>{s.titulo}</h3>
                <p style={{ fontFamily: RALEWAY, fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.45 }}>{s.texto}</p>
                <span style={{ display: 'inline-block', marginTop: 12, color: GREEN, fontWeight: 700, fontSize: 14 }}>Ver →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Contexto / autoridad */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 24, color: INK, margin: '0 0 10px' }}>
            ¿Por qué seguir el mercado de Funes con nosotros?
          </h2>
          <p style={{ fontFamily: RALEWAY, fontSize: 15, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            SI INMOBILIARIA opera en Funes, Roldán y Rosario desde 1983. Además de la cartera de propiedades,
            publicamos datos propios del mercado del corredor oeste —costo de construcción, índice de alquileres,
            zonificación y evolución del dólar— para que cualquiera pueda tomar decisiones con información clara y
            actualizada. Corredor responsable: David Flores, Mat. N° 0621.
          </p>
        </section>
      </div>

      <RecursosCTA
        title="¿Querés saber cuánto vale tu propiedad o tu proyecto?"
        text="Un agente de la zona te ayuda a interpretar los números y avanzar con confianza."
      />
    </>
  )
}

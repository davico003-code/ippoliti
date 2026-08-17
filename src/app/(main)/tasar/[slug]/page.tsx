// Landing programática de tasación: /tasar/{tipo}-{barrio}
//   /tasar/casa-kentucky · /tasar/lote-tierra-de-suenos-2 · /tasar/casa-roldan
//
// Estrategia SEO (top of the funnel): capturar la intención transaccional del
// dueño que busca "cuánto vale mi casa en X". Cada combinación tipo×barrio es
// una URL propia con su H1, su precio de tierra real y su contenido local — y
// el tasador va EMBEBIDO acá (no en una página central): la misma página que
// rankea es la que convierte.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TasadorWidget from '@/components/tasador/TasadorWidget'
import { BARRIOS_TASADOR, getBarrio, precioTierra, precioDepto } from '@/lib/tasador/barrios'
import { MATRIZ_RESIDENCIAL_BASE, ajustar, getAjusteMensual } from '@/lib/costos-construccion'

export const revalidate = 86400
export const dynamicParams = true

const BASE = 'https://siinmobiliaria.com'
const WSP = 'https://wa.me/5493412101694'

type TipoId = 'casa' | 'lote' | 'departamento'
const TIPOS: Record<TipoId, { label: string; articulo: string; esLote: boolean }> = {
  casa: { label: 'casa', articulo: 'tu casa', esLote: false },
  lote: { label: 'lote', articulo: 'tu lote', esLote: true },
  departamento: { label: 'departamento', articulo: 'tu departamento', esLote: false },
}

// El slug es "{tipo}-{barrioSlug}". Como los slugs de barrio pueden tener
// guiones, resolvemos por prefijo de tipo.
function parseSlug(slug: string): { tipo: TipoId; barrioSlug: string } | null {
  for (const t of Object.keys(TIPOS) as TipoId[]) {
    if (slug.startsWith(`${t}-`)) return { tipo: t, barrioSlug: slug.slice(t.length + 1) }
  }
  return null
}

function resolver(slug: string) {
  const parsed = parseSlug(slug)
  if (!parsed) return null
  const barrio = getBarrio(parsed.barrioSlug)
  if (!barrio) return null
  return { ...parsed, barrio, tipoInfo: TIPOS[parsed.tipo] }
}

// Pre-renderizamos los que más tráfico y margen tienen (criterio Magnin: no
// gastar en barrios sin negocio). El resto se genera on-demand vía ISR.
export function generateStaticParams() {
  const params: { slug: string }[] = []
  for (const b of BARRIOS_TASADOR) {
    // Casas y lotes: barrios cerrados o con muestras de tierra.
    if (b.cerrado || b.muestras > 0) {
      params.push({ slug: `casa-${b.slug}` }, { slug: `lote-${b.slug}` })
    }
    // Departamentos: donde hay mercado real de deptos (muestras propias) o es
    // una ciudad. En Rosario el depto es la operación principal.
    if (b.muestrasDepto > 0 || b.ciudad === 'Rosario') {
      params.push({ slug: `departamento-${b.slug}` })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const r = resolver(params.slug)
  if (!r) return { title: 'Tasación | SI INMOBILIARIA' }
  const { barrio, tipoInfo, tipo } = r
  const title = `¿Cuánto vale ${tipoInfo.articulo} en ${barrio.nombre}? Tasador online gratis`
  const comoCalcula =
    tipo === 'departamento'
      ? 'Calculamos con el valor real del m² de departamentos en la zona.'
      : 'Calculamos con el valor real de la tierra en la zona y el costo de construcción actualizado.'
  const description = `Tasá ${tipoInfo.articulo} en ${barrio.nombre}, ${barrio.ciudad}, gratis y al instante. ${comoCalcula} Tasación profesional sin cargo en 24 hs.`
  const url = `${BASE}/tasar/${params.slug}`
  return {
    title: `${title} | SI INMOBILIARIA`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  }
}

export default async function TasarPage({ params }: { params: { slug: string } }) {
  const r = resolver(params.slug)
  if (!r) notFound()
  const { tipo, barrio, tipoInfo } = r
  const esDepto = tipo === 'departamento'
  const { ppm2, fuente, muestras } = esDepto ? precioDepto(barrio) : precioTierra(barrio)

  // Costos de construcción vigentes (base ago-2026 + 2% mensual) — misma
  // fuente que la Calculadora de Costos de /recursos.
  const { factor } = await getAjusteMensual()
  const calidades = MATRIZ_RESIDENCIAL_BASE.map((f) => ({
    slug: f.slug,
    label: f.calidad.replace('Línea ', ''),
    costoM2: ajustar(f.llaveBase, factor),
    superficie: f.superficie ?? '',
  }))

  // Vecinos de la misma ciudad para el cross-linking interno.
  const vecinos = BARRIOS_TASADOR.filter(
    (b) => b.ciudad === barrio.ciudad && b.slug !== barrio.slug && (b.cerrado || b.muestras > 0),
  ).slice(0, 8)

  const faq = [
    {
      q: '¿La estimación online es una tasación oficial?',
      a: 'No. Es un valor orientativo para que tengas una referencia seria en dos minutos. La tasación oficial la firma un martillero matriculado después de visitar la propiedad, y en SI INMOBILIARIA la hacemos sin cargo.',
    },
    {
      q: `¿De dónde sale el precio del m² en ${barrio.nombre}?`,
      a:
        fuente !== 'ciudad'
          ? esDepto
            ? `De los departamentos en venta en ${barrio.nombre} que relevamos y publicamos. Hoy el promedio está en USD ${ppm2} por m² cubierto, calculado sobre ${muestras} ${muestras === 1 ? 'unidad' : 'unidades'}. Es un dato vivo: se mueve con la oferta real de la zona.`
            : `De terrenos reales en venta en ${barrio.nombre} que relevamos y publicamos. Hoy el promedio está en USD ${ppm2} por m² de tierra, calculado sobre ${muestras} ${muestras === 1 ? 'lote' : 'lotes'}. Es un dato vivo: se actualiza solo cuando cambia la oferta de la zona.`
          : esDepto
            ? `Del promedio de departamentos en venta en ${barrio.ciudad}, hoy USD ${ppm2} por m² cubierto. Todavía no tenemos suficientes unidades publicadas dentro de ${barrio.nombre} como para dar un valor propio del barrio, así que usamos el de la ciudad y ampliamos el rango.`
            : `Del promedio de terrenos en venta en ${barrio.ciudad}, hoy USD ${ppm2} por m². Todavía no tenemos suficientes lotes publicados dentro de ${barrio.nombre} como para dar un valor propio del barrio, así que usamos el de la ciudad y ampliamos el rango de la estimación.`,
    },
    {
      q: '¿Por qué me piden tan pocos datos?',
      a: 'Porque el objetivo es que tengas un número enseguida, sin registrarte ni dejar tus datos. Los detalles que mueven el valor de verdad (la orientación, la calidad de las terminaciones, el estado real) los mira un tasador en la visita.',
    },
    {
      q: '¿Cuánto tarda la tasación profesional?',
      a: 'Coordinamos la visita y en 24 horas tenés el valor. La hacemos gratis: conocer bien tu propiedad es la mejor forma de ayudarte a venderla al precio justo.',
    },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Tasación de ${tipoInfo.label} en ${barrio.nombre}`,
      serviceType: 'Tasación inmobiliaria',
      areaServed: { '@type': 'Place', name: `${barrio.nombre}, ${barrio.ciudad}, Santa Fe` },
      provider: { '@id': `${BASE}/#organization` },
      url: `${BASE}/tasar/${params.slug}`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS', description: 'Tasación profesional sin cargo' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  const R = "'Raleway', system-ui, sans-serif"

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[1080px] px-5">
        {/* HERO */}
        <div className="pt-11 pb-2 text-center">
          <span
            className="inline-block rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: '#e7f2eb', color: '#1A5C38' }}
          >
            Tasador online · {barrio.nombre}
          </span>
          <h1
            className="mt-4 text-[clamp(30px,5vw,46px)] font-extrabold leading-[1.08] tracking-tight"
            style={{ fontFamily: R }}
          >
            ¿Cuánto vale {tipoInfo.articulo} en {barrio.nombre}?
          </h1>
          <p className="mx-auto mt-3 max-w-[640px] text-[17px] font-medium text-[#6e6e73]">
            Estimación <b style={{ color: '#1A5C38' }}>gratis y al instante</b>, sin registrarte.{' '}
            {esDepto
              ? `Calculada con el valor real del m² de departamentos en ${fuente !== 'ciudad' ? barrio.nombre : barrio.ciudad}.`
              : `Calculada con el valor real de la tierra en ${fuente !== 'ciudad' ? barrio.nombre : barrio.ciudad} y el costo de construcción actualizado.`}
          </p>
        </div>

        {/* TASADOR EMBEBIDO */}
        <div className="py-8">
          <TasadorWidget
            barrioNombre={barrio.nombre}
            ciudad={barrio.ciudad}
            ppm2Tierra={ppm2}
            fuenteTierra={fuente}
            muestras={muestras}
            calidades={calidades}
            esLote={tipoInfo.esLote}
            esDepto={esDepto}
            whatsappBase={WSP}
          />
        </div>

        {/* MÉTODO */}
        <section className="py-8">
          <h2 className="mb-3 text-2xl font-extrabold" style={{ fontFamily: R }}>
            Cómo calculamos el valor en {barrio.nombre}
          </h2>
          {esDepto ? (
            <p className="max-w-[760px] text-[15.5px] leading-[1.7] text-[#374151]">
              Un departamento no se valúa por lo que costaría construirlo: se compara contra
              unidades parecidas de la misma zona. Tomamos el valor del m² cubierto que hoy piden
              los departamentos en venta {fuente !== 'ciudad' ? `en ${barrio.nombre}` : `en ${barrio.ciudad}`},
              lo multiplicamos por tus metros y lo ajustamos por antigüedad, estado, amenities del
              edificio y cochera. Es el mismo criterio con el que arranca una tasación profesional;
              la diferencia es que los comparables salen de propiedades que publicamos y seguimos
              nosotros, no de un promedio nacional.
            </p>
          ) : (
            <p className="max-w-[760px] text-[15.5px] leading-[1.7] text-[#374151]">
              Usamos el método del costo, el mismo con el que arranca cualquier tasador
              profesional: cuánto vale la tierra en la zona más cuánto costaría construir hoy lo
              que está edificado, descontando antigüedad y estado. La diferencia con una
              calculadora genérica es de dónde sacamos los números: el valor de la tierra sale de
              los terrenos que relevamos en {barrio.ciudad} y el costo de construcción es el mismo
              que publicamos en nuestro informe de costos, actualizado todos los meses.
            </p>
          )}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              esDepto
                ? {
                    n: 1,
                    t: 'El m² de tu zona',
                    d: `Lo que hoy piden los departamentos en venta en ${fuente !== 'ciudad' ? barrio.nombre : barrio.ciudad}: USD ${ppm2} por m² cubierto.`,
                  }
                : {
                    n: 1,
                    t: 'Tu tierra, a valor de la zona',
                    d: `Los m² de tu lote por el precio real del m² en ${fuente !== 'ciudad' ? barrio.nombre : barrio.ciudad}: hoy USD ${ppm2}.`,
                  },
              esDepto
                ? {
                    n: 2,
                    t: 'Los ajustes de tu unidad',
                    d: 'Antigüedad, estado, amenities del edificio y cochera mueven el valor sobre ese m² de referencia.',
                  }
                : {
                    n: 2,
                    t: 'Tu construcción, a costo de hoy',
                    d: 'Los m² cubiertos al costo actual de construir, con la depreciación que corresponde por antigüedad y estado.',
                  },
              {
                n: 3,
                t: 'El ajuste fino, con un matriculado',
                d: 'La ubicación exacta dentro del barrio, la calidad y el momento del mercado los ajusta la tasación profesional. Esa es gratis.',
              },
            ].map((p) => (
              <div key={p.n} className="rounded-2xl border border-[#e5e7eb] p-4">
                <div
                  className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-full font-extrabold"
                  style={{ background: '#e7f2eb', color: '#1A5C38' }}
                >
                  {p.n}
                </div>
                <b className="mb-1 block text-[15px]">{p.t}</b>
                <span className="text-[13.5px] leading-[1.5] text-[#6e6e73]">{p.d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-8">
          <h2 className="mb-3 text-2xl font-extrabold" style={{ fontFamily: R }}>
            Preguntas frecuentes
          </h2>
          <div className="max-w-[760px]">
            {faq.map((f) => (
              <details key={f.q} className="border-b border-[#e5e7eb] py-3.5">
                <summary className="cursor-pointer text-[15.5px] font-bold">{f.q}</summary>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-[#374151]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CROSS-LINKING */}
        <section className="pb-12">
          <h2 className="mb-3 text-[18px] font-extrabold" style={{ fontFamily: R }}>
            Tasá otras propiedades en la zona
          </h2>
          <div className="flex flex-wrap gap-2">
            {tipo !== 'lote' && (
              <Link
                href={`/tasar/lote-${barrio.slug}`}
                className="rounded-[10px] bg-[#f5f5f7] px-3.5 py-2 text-[13.5px] font-semibold text-[#374151] hover:bg-[#e7f2eb] hover:text-[#1A5C38]"
              >
                Tasar lote en {barrio.nombre}
              </Link>
            )}
            {tipo !== 'casa' && (
              <Link
                href={`/tasar/casa-${barrio.slug}`}
                className="rounded-[10px] bg-[#f5f5f7] px-3.5 py-2 text-[13.5px] font-semibold text-[#374151] hover:bg-[#e7f2eb] hover:text-[#1A5C38]"
              >
                Tasar casa en {barrio.nombre}
              </Link>
            )}
            {vecinos.map((v) => (
              <Link
                key={v.slug}
                href={`/tasar/${tipo}-${v.slug}`}
                className="rounded-[10px] bg-[#f5f5f7] px-3.5 py-2 text-[13.5px] font-semibold text-[#374151] hover:bg-[#e7f2eb] hover:text-[#1A5C38]"
              >
                Tasar {tipoInfo.label} en {v.nombre}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

// Landing de tasación por barrio: /tasar/{tipo}-{barrio}
//   /tasar/casa-kentucky · /tasar/lote-tierra-de-suenos-2 · /tasar/casa-funes
//   /tasar/casa-vida-lagoon-funes (zonas medidas que la lista vieja no tenía)
//
// Captar al dueño que busca "tasar mi casa en X": la página que rankea es la
// que convierte. Arriba el valor de referencia del barrio (los números los arma
// Hilo con todos los avisos en venta: terreno y construcción por m², ajuste por
// tamaño y antigüedad y el margen real del barrio) y, siempre, el pedido de la
// tasación a un corredor (/tasaciones). Si en el barrio no se da número (pocos
// avisos o precios muy dispares), solo el pedido. David, 8-oct-2026: "con valor
// + pedir tasación"; /tasaciones (anuncios) sigue sin número.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import TasadorBarrio from '@/components/tasador/TasadorBarrio'
import { estimar, porcentaje, resultado } from '@/lib/tasador/estimar'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { HILO_DE, TEXTO_TIPO, TIPOS_TASAR, esIndexableTasar, hrefPedido, landingsDeCiudad, resolverTasar, type Landing } from '@/lib/seo/tasar'

export const revalidate = 3600
export const dynamicParams = true
// No se arma en el build: la primera visita la arma (con los números de Hilo) y queda una hora.
export const generateStaticParams = () => []

const BASE = 'https://siinmobiliaria.com'
const n = (x: number) => x.toLocaleString('es-AR')
const usd = (x: number) => `USD ${n(x)}`

type Props = { params: { slug: string } }

async function datos(slug: string) {
  const { tasador, indice } = await cargarTasar()
  const r = resolverTasar(slug, indice)
  return r ? { r, tasador, indice } : null
}

const lugar = (l: Landing) => (l.zona.esCiudad ? l.nombre : `${l.nombre}, ${l.zona.ciudad}`)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await datos(params.slug).catch(() => null)
  if (!d || 'redirigir' in d.r) return { title: 'Tasación | SI INMOBILIARIA', robots: { index: false, follow: true } }
  const l = d.r.landing
  const t = TEXTO_TIPO[l.tipo]
  const p = l.zona.params[l.tipo]!
  const title = l.conNumero ? `Tasación de ${t.plural} en ${lugar(l)}: valor de referencia hoy` : `Tasación de ${t.plural} en ${lugar(l)}, con un corredor matriculado`
  const m2 =
    l.tipo === 'casa' && l.zona.mixto && p.tierraM2 != null && p.construccionM2 != null
      ? `El terreno se publica a USD ${n(p.tierraM2)}/m² y la construcción a USD ${n(p.construccionM2)}/m².`
      : `Se publica a unos USD ${n(p.usdM2)} por m² ${l.tipo === 'lote' ? 'de terreno' : 'cubierto'}.`
  const description = l.conNumero
    ? `Cuánto vale ${t.tu} en ${lugar(l)} hoy. ${m2} Calculá el valor de referencia y pedí la tasación de un corredor matriculado de SI INMOBILIARIA.`
    : `Tasación de ${t.plural} en ${lugar(l)}: un corredor matriculado de SI INMOBILIARIA la hace con lo que se vendió en el barrio. Te escribimos por WhatsApp en menos de 24 h.`
  const url = `${BASE}/tasar/${l.slug}`
  return {
    title: `${title} | SI INMOBILIARIA`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
    robots: esIndexableTasar(l) ? { index: true, follow: true } : { index: false, follow: true },
  }
}

export default async function TasarPage({ params }: Props) {
  const d = await datos(params.slug)
  if (!d) notFound()
  if ('redirigir' in d.r) permanentRedirect(d.r.redirigir)
  const { tasador, indice } = d
  const l = d.r.landing
  const t = TEXTO_TIPO[l.tipo]
  const p = l.zona.params[l.tipo]!
  const conTerreno = l.tipo === 'casa' && l.zona.mixto && p.tierraM2 != null && p.construccionM2 != null
  const tipica = l.conNumero ? resultado(estimar({ tipo: HILO_DE[l.tipo], m2: p.m2Tipico, ant: l.tipo === 'lote' ? null : (p.antTipica ?? null) }, p, tasador.modelo, l.zona.mixto), p.error) : null
  const pedido = hrefPedido(l)
  const otrosTipos = TIPOS_TASAR.filter((x) => x !== l.tipo)
    .map((x) => Array.from(indice.landings.values()).find((y) => y.tipo === x && y.zona === l.zona && y.conNumero))
    .filter((x): x is Landing => !!x)
  const vecinos = landingsDeCiudad(indice, l.zona.ciudad, l.tipo).filter((x) => x.slug !== l.slug && x.conNumero && !x.zona.esCiudad).slice(0, 12)
  const ciudadLanding = !l.zona.esCiudad ? indice.landings.get(`${l.tipo}-${l.zona.ciudad.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`) : null

  const faq: { q: string; a: string }[] = []
  if (l.conNumero) {
    faq.push({
      q: `¿Cuánto vale el m² en ${l.nombre}?`,
      a: conTerreno
        ? `Con lo que se publica hoy en ${l.nombre}: el terreno, unos USD ${n(p.tierraM2!)} por m², y la construcción, unos USD ${n(p.construccionM2!)} por m² cubierto (el precio de cada casa menos su terreno).`
        : `Con lo que se publica hoy en ${l.nombre}: unos USD ${n(p.usdM2)} por m² ${l.tipo === 'lote' ? 'de terreno' : 'cubierto'}, valor del medio.`,
    })
    if (tipica) faq.push({ q: `¿Cuánto vale ${t.singular === 'casa' ? 'una casa' : `un ${t.singular}`} en ${l.nombre}?`, a: `${t.singular === 'casa' ? 'Una casa típica' : `Un ${t.singular} típico`} de ${n(p.m2Tipico)} m² tiene un valor de referencia de ${usd(tipica.valor)} (entre ${usd(tipica.desde)} y ${usd(tipica.hasta)}). Es precio de publicación: para vender, el precio lo fija la tasación.` })
    faq.push({
      q: '¿Qué tan cerca está el valor de referencia?',
      a: p.errorPropio
        ? `Lo medimos contra lo publicado en ${l.nombre}: la mitad de ${t.singular === 'casa' ? 'las casas' : `los ${t.plural}`} está a menos de ${porcentaje(p.error)} de la cuenta. La ubicación exacta, el estado y la documentación los revisa un corredor en la tasación.`
        : `En ${l.nombre} todavía hay pocos avisos para medirlo aparte; en los barrios de ${l.zona.ciudad}, la mitad de lo publicado está a menos de ${porcentaje(p.error)} de la cuenta.`,
    })
  }
  faq.push({ q: '¿El valor de referencia es una tasación?', a: 'No. Es una referencia con precios de publicación. La tasación la firma un corredor inmobiliario matriculado: revisa las ventas del barrio, la documentación y el estado, y recomienda el precio de publicación.' })
  faq.push({ q: '¿Cuánto tarda la tasación?', a: 'Después de tu pedido te escribimos por WhatsApp en menos de 24 h para coordinar. El informe depende del tipo de propiedad y de la documentación.' })

  const migas = [
    { name: 'Inicio', item: `${BASE}/` },
    { name: 'Tasaciones por barrio', item: `${BASE}/tasar` },
    { name: `${t.corto} en ${l.nombre}`, item: `${BASE}/tasar/${l.slug}` },
  ]
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Tasación de ${t.plural} en ${lugar(l)}`,
      serviceType: 'Tasación inmobiliaria',
      areaServed: { '@type': 'Place', name: `${lugar(l)}, Santa Fe` },
      provider: { '@id': `${BASE}/#organization` },
      url: `${BASE}/tasar/${l.slug}`,
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: migas.map((m, i) => ({ '@type': 'ListItem', position: i + 1, ...m })) },
  ]

  const datosBarrio: { valor: string; texto: string }[] = []
  if (l.conNumero) {
    if (conTerreno) {
      datosBarrio.push({ valor: `${usd(p.tierraM2!)}/m²`, texto: 'el terreno' })
      datosBarrio.push({ valor: `${usd(p.construccionM2!)}/m²`, texto: 'la construcción, sin el terreno' })
    } else datosBarrio.push({ valor: `${usd(p.usdM2)}/m²`, texto: l.tipo === 'lote' ? 'de terreno, valor del medio' : 'cubierto, valor del medio' })
    datosBarrio.push({ valor: `${n(p.m2Tipico)} m²`, texto: l.tipo === 'lote' ? 'el lote típico' : `${t.singular === 'casa' ? 'la casa típica' : 'el depto típico'}${l.tipo === 'casa' && p.loteTipico ? `, en ${n(p.loteTipico)} m² de terreno` : ''}` })
    datosBarrio.push({ valor: n(p.n), texto: `${t.plural} publicad${t.singular === 'casa' ? 'as' : 'os'} hoy en la cuenta` })
  }

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1080px] px-5">
        <nav aria-label="Estás en" className="pt-6 text-[13.5px] font-medium text-[#5B6B62]">
          <Link href="/tasar" className="hover:text-[#17613C]">
            Tasaciones por barrio
          </Link>
          {ciudadLanding && ciudadLanding !== l && (
            <>
              {' › '}
              <Link href={`/tasar/${ciudadLanding.slug}`} className="hover:text-[#17613C]">
                {l.zona.ciudad}
              </Link>
            </>
          )}
          {' › '}
          <span className="text-[#3C4A42]">{l.nombre}</span>
        </nav>

        {/* En el celu: título, calculadora (o pedido) y después los números del barrio. En la compu, la calculadora a la derecha. */}
        <div className="grid items-start gap-8 pb-10 pt-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-12 lg:gap-y-6">
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="inline-block rounded-full bg-[#e7f2eb] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#17613C]">Tasación · {l.zona.ciudad}</span>
            <h1 className="mt-4 font-raleway text-[clamp(30px,5vw,46px)] font-extrabold leading-[1.08] tracking-tight text-[#121A15]">
              Tasación de {t.plural} en {l.nombre}
            </h1>
            {l.conNumero ? (
              <p className="mt-3 text-[17px] font-medium leading-relaxed text-[#3C4A42]">
                Con {n(p.n)} {t.plural} publicad{t.singular === 'casa' ? 'as' : 'os'} hoy en {l.nombre} armamos un valor de referencia para {t.tu}
                {tipica ? (
                  <>
                    : {t.singular === 'casa' ? 'una típica' : 'uno típico'} de {n(p.m2Tipico)} m² ronda los <b className="text-[#17613C]">{usd(tipica.valor)}</b>
                  </>
                ) : null}
                . Para vender, la tasación la hace un corredor del equipo.
              </p>
            ) : (
              <p className="mt-3 text-[17px] font-medium leading-relaxed text-[#3C4A42]">
                Un corredor matriculado del equipo te hace la tasación con lo que se vendió en {l.nombre} y te recomienda el precio de publicación.
              </p>
            )}
            <p className="mt-3 text-[14px] text-[#5B6B62]">SI INMOBILIARIA · desde 1983 · Corredor responsable Mat. N° 0621</p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {l.conNumero ? (
            <TasadorBarrio tipo={l.tipo} barrio={l.nombre} ciudad={l.zona.ciudad} params={p} modelo={tasador.modelo} mixto={l.zona.mixto} hrefPedido={pedido} />
          ) : (
            <div className="rounded-[22px] bg-[#17613C] p-6 text-white sm:p-8">
              <p className="font-raleway text-[24px] font-extrabold leading-tight">¿Querés vender {t.tu} en {l.nombre}?</p>
              <p className="mt-2 text-[16px] leading-relaxed text-white/85">
                {p.n < 5
                  ? `En ${l.nombre} hay pocos ${t.plural} publicados para dar un valor de referencia sin errar.`
                  : `En ${l.nombre} los precios publicados varían demasiado para dar un valor de referencia solo con los metros.`}{' '}
                Un corredor matriculado te la tasa con lo que se vendió en el barrio. Te escribimos por WhatsApp en menos de 24 h. Sin compromiso.
              </p>
              <Link href={pedido} className="si-tap mt-5 inline-flex h-12 items-center rounded-full bg-white px-6 text-[16px] font-bold text-[#17613C]">
                Pedir la tasación
              </Link>
            </div>
          )}
          </div>
          {datosBarrio.length > 0 && (
            <ul className="grid grid-cols-2 gap-2.5 lg:col-start-1 lg:row-start-2">
                {datosBarrio.map((x) => (
                  <li key={x.texto} className="rounded-2xl border border-[#E1E6E1] px-4 py-3.5">
                    <p className="font-raleway text-[20px] font-extrabold leading-tight text-[#121A15]">{x.valor}</p>
                    <p className="mt-0.5 text-[14.5px] leading-snug text-[#3C4A42]">{x.texto}</p>
                  </li>
                ))}
              </ul>
            )}
        </div>

        <section className="border-t border-[#E1E6E1] py-10">
          <h2 className="font-raleway text-[26px] font-extrabold text-[#121A15]">Cómo hacemos la tasación</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { t: 'Nos contás qué tenés', d: 'El tipo de propiedad, el barrio y cuándo pensás vender. Te escribimos por WhatsApp en menos de 24 h.' },
              { t: 'Lo vemos con un corredor', d: `Revisamos lo que se vendió y lo que se publica en ${l.nombre}, la documentación y el estado.` },
              { t: 'Te recomendamos el precio', d: 'Un precio de publicación que venda, con el porqué. La firma un corredor matriculado.' },
            ].map((x, i) => (
              <li key={x.t} className="rounded-2xl border border-[#E1E6E1] p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f2eb] font-extrabold text-[#17613C]">{i + 1}</span>
                <b className="mt-3 block text-[16px] text-[#121A15]">{x.t}</b>
                <span className="mt-1 block text-[15px] leading-relaxed text-[#3C4A42]">{x.d}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-[#E1E6E1] py-10">
          <h2 className="font-raleway text-[26px] font-extrabold text-[#121A15]">Preguntas frecuentes</h2>
          <div className="mt-4 max-w-[760px]">
            {faq.map((f) => (
              <details key={f.q} className="border-b border-[#E1E6E1] py-4">
                <summary className="cursor-pointer text-[16px] font-bold text-[#121A15]">{f.q}</summary>
                <p className="mt-2 text-[15.5px] leading-relaxed text-[#3C4A42]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {(otrosTipos.length > 0 || vecinos.length > 0) && (
          <section className="border-t border-[#E1E6E1] py-10">
            {otrosTipos.length > 0 && (
              <>
                <h2 className="font-raleway text-[20px] font-extrabold text-[#121A15]">En {l.nombre} también</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otrosTipos.map((x) => (
                    <Link key={x.slug} href={`/tasar/${x.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
                      Tasación de {TEXTO_TIPO[x.tipo].plural}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {vecinos.length > 0 && (
              <>
                <h2 className="mt-8 font-raleway text-[20px] font-extrabold text-[#121A15]">Otros barrios de {l.zona.ciudad}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vecinos.map((x) => (
                    <Link key={x.slug} href={`/tasar/${x.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
                      {x.nombre}
                    </Link>
                  ))}
                  <Link href="/tasar" className="rounded-full px-4 py-2.5 text-[15px] font-bold text-[#17613C]">
                    Todos los barrios →
                  </Link>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

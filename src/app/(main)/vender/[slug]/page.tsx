// Landing para vender, por barrio: /vender/{tipo}-{barrio}
//   /vender/casa-kentucky · /vender/lote-don-mateo · /vender/casa-funes
//
// Para el que busca "vender mi casa en X" (David, 8-oct-2026: "tasar, vender
// mi casa en, tasar mi casa en… y ahí vas al tasador y abre directamente al
// barrio"). Mismo slug que su gemela /tasar/{slug}, pero otra intención: acá
// manda el mercado del barrio (cuántas hay en venta y a qué precios, de Hilo),
// cómo vendemos y el pedido. El tasador abre con el barrio ya elegido.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Tasador from '@/components/tasador/Tasador'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { TEXTO_TIPO, TIPOS_TASAR, esIndexableTasar, landingDeCiudad, landingsDeCiudad, mercadoDe, opcionesTasar, resolverTasar, type Landing } from '@/lib/seo/tasar'
import type { ResumenMercado } from '@/lib/tasador/tipos'

export const revalidate = 3600
export const dynamicParams = true
// No se arma en el build: la primera visita la arma (con los números de Hilo) y queda una hora.
export const generateStaticParams = () => []

const BASE = 'https://siinmobiliaria.com'
const n = (x: number) => x.toLocaleString('es-AR')
const usd = (x: number) => `USD ${n(x)}`
/** USD 1.425.000 → "1,4 millones"; USD 860.000 → "860 mil" (para el texto corrido). */
const usdCorto = (x: number) => (x >= 1_000_000 ? `USD ${(Math.round(x / 100_000) / 10).toLocaleString('es-AR')} millones` : `USD ${n(Math.round(x / 1000))} mil`)

type Props = { params: { slug: string } }

async function datos(slug: string) {
  const { tasador, mercado, indice, actualizado } = await cargarTasar()
  const r = resolverTasar(slug, indice, '/vender')
  return r ? { r, tasador, mercado, indice, actualizado } : null
}

/** A Google: con número (Hilo) y con el mercado del barrio; si no, sería una página floja que compite con /tasar. */
const indexable = (l: Landing, m: ResumenMercado | null) => esIndexableTasar(l) && !!m

const lugar = (l: Landing) => (l.zona.esCiudad ? l.nombre : `${l.nombre}, ${l.zona.ciudad}`)

/** "Hoy hay 63 casas en venta en Kentucky: la mitad pide entre USD 860 mil y USD 1,4 millones." */
function frasesMercado(l: Landing, m: ResumenMercado) {
  const t = TEXTO_TIPO[l.tipo]
  // En la ciudad, el mercado es el de toda la ciudad (barrios incluidos).
  return `Hoy hay ${n(m.n)} ${t.plural} en venta en ${l.zona.esCiudad ? 'todo ' : ''}${l.nombre}: la mitad pide entre ${usdCorto(m.p25)} y ${usdCorto(m.p75)}.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await datos(params.slug).catch(() => null)
  if (!d || 'redirigir' in d.r) return { title: 'Vender | SI INMOBILIARIA', robots: { index: false, follow: true } }
  const l = d.r.landing
  const t = TEXTO_TIPO[l.tipo]
  const m = mercadoDe(d.mercado, l)
  // "Vender mi casa en …": lo que la gente escribe en Google.
  const title = `Vender mi ${t.singular} en ${lugar(l)}: precio y cómo venderl${t.singular === 'casa' ? 'a' : 'o'}`
  const description = `¿Querés vender ${t.tu} en ${lugar(l)}? ${m ? `${frasesMercado(l, m)} ` : ''}Tasala online en segundos y vendela con SI INMOBILIARIA: corredores matriculados en Funes, Roldán y Rosario desde 1983.`
  const url = `${BASE}/vender/${l.slug}`
  return {
    title: `${title} | SI INMOBILIARIA`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website', locale: 'es_AR' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
    robots: indexable(l, m) ? { index: true, follow: true } : { index: false, follow: true },
  }
}

export default async function VenderBarrioPage({ params }: Props) {
  const d = await datos(params.slug)
  if (!d) notFound()
  // 307: a dónde va depende de los datos de hoy (igual que /tasar).
  if ('redirigir' in d.r) redirect(d.r.redirigir)
  const { tasador, mercado, indice, actualizado } = d
  const l = d.r.landing
  const t = TEXTO_TIPO[l.tipo]
  const ella = t.singular === 'casa'
  const opciones = opcionesTasar(indice)
  const clave = opciones.find((o) => o.slugs[l.tipo] === l.slug)?.clave ?? null
  const m = mercadoDe(mercado, l)
  const ciudadLanding = !l.zona.esCiudad ? landingDeCiudad(indice, l) : null
  const otrosTipos = TIPOS_TASAR.filter((x) => x !== l.tipo)
    .map((x) => Array.from(indice.landings.values()).find((y) => y.tipo === x && y.zona === l.zona && y.conNumero))
    .filter((x): x is Landing => !!x)
  const vecinos = landingsDeCiudad(indice, l.zona.ciudad, l.tipo).filter((x) => x.slug !== l.slug && x.conNumero && !x.zona.esCiudad).slice(0, 16)
  const tipoBusqueda = l.tipo === 'lote' ? 'terreno' : l.tipo
  const enVenta = `/propiedades?op=venta&tipo=${tipoBusqueda}&q=${encodeURIComponent(l.zona.esCiudad ? l.zona.ciudad : l.nombre)}`

  const mercadoTiles: { valor: string; texto: string }[] = []
  if (m) {
    mercadoTiles.push({ valor: n(m.n), texto: `${t.plural} en venta hoy` })
    mercadoTiles.push({ valor: usd(m.mediana), texto: 'el precio del medio' })
    mercadoTiles.push({ valor: `${usdCorto(m.p25).replace('USD ', '')} a ${usdCorto(m.p75).replace('USD ', '')}`, texto: 'lo que pide la mitad (USD)' })
    if (l.tipo === 'lote' && m.lote) mercadoTiles.push({ valor: `${n(m.lote)} m²`, texto: 'el lote típico en venta' })
    else if (m.m2) mercadoTiles.push({ valor: `${n(m.m2)} m²${m.dorm ? ` · ${m.dorm} dorm.` : ''}`, texto: `${ella ? 'la casa típica' : 'el depto típico'} en venta` })
  }

  const pasos = [
    { t: 'La tasación', d: `Un corredor matriculado mira lo que se vendió y lo que compite hoy en ${l.nombre} y te recomienda a qué precio salir, con el porqué.` },
    { t: 'La presentación', d: `Fotos, una ficha propia en siinmobiliaria.com y anuncios para que ${ella ? 'tu casa' : `tu ${t.singular}`} se vea como tiene que verse.` },
    { t: 'La difusión', d: 'Publicada en Zonaprop, Argenprop y Mercado Libre, en nuestras redes y en la red de inmobiliarias con las que trabajamos.' },
    { t: 'El seguimiento', d: 'Te contamos las consultas y las visitas, y qué dice el mercado, para ajustar a tiempo si hace falta.' },
    { t: 'El cierre', d: 'Te acompañamos en la negociación, la reserva y hasta la escritura.' },
  ]

  const faq: { q: string; a: string }[] = []
  if (m)
    faq.push({
      q: `¿Cuánt${ella ? 'as' : 'os'} ${t.plural} hay en venta en ${l.zona.esCiudad ? 'todo ' : ''}${l.nombre}?`,
      a: `${frasesMercado(l, m)} El precio del medio es ${usd(m.mediana)}. Es lo que compite con ${ella ? 'la tuya' : 'el tuyo'} cuando la publicás.`,
    })
  faq.push({
    q: '¿A qué precio conviene publicar?',
    a: m
      ? `Al que diga la tasación, no al que más nos guste. En ${l.nombre}, la mitad de ${ella ? 'las casas' : `los ${t.plural}`} en venta pide entre ${usdCorto(m.p25)} y ${usdCorto(m.p75)}: salir muy arriba de lo que vale ${ella ? 'la tuya' : 'el tuyo'} hace que la vean, la comparen y sigan de largo. Salir bien de entrada es lo que más acorta la venta.`
      : 'Al que diga la tasación, no al que más nos guste. Salir muy arriba hace que la vean, la comparen y sigan de largo; salir bien de entrada es lo que más acorta la venta.',
  })
  faq.push({
    q: '¿Qué papeles necesito para vender?',
    a: `La escritura, los planos y los libre deuda de impuestos y servicios${l.zona.esCiudad ? '' : ' (y de expensas, si es un barrio cerrado)'}. El escribano pide el resto; te ayudamos a juntarlo antes de publicar para no frenar la venta.`,
  })
  faq.push({ q: '¿Cuánto tarda en llegar la tasación?', a: 'Después de tu pedido te escribimos por WhatsApp en menos de 24 h para coordinar la visita. Sin compromiso.' })

  const migas = [
    { name: 'Inicio', item: `${BASE}/` },
    { name: 'Vender', item: `${BASE}/vender` },
    ...(ciudadLanding && ciudadLanding !== l ? [{ name: l.zona.ciudad, item: `${BASE}/vender/${ciudadLanding.slug}` }] : []),
    { name: `${t.corto} en ${l.nombre}`, item: `${BASE}/vender/${l.slug}` },
  ]
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Venta de ${t.plural} en ${lugar(l)}`,
      serviceType: 'Venta de inmuebles',
      areaServed: { '@type': 'Place', name: `${lugar(l)}, Santa Fe, Argentina` },
      provider: { '@id': `${BASE}/#organization` },
      url: `${BASE}/vender/${l.slug}`,
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: migas.map((x, i) => ({ '@type': 'ListItem', position: i + 1, ...x })) },
  ]

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1120px] px-4 sm:px-5">
        <nav aria-label="Estás en" className="pt-6 text-[13.5px] font-medium text-[#5B6B62]">
          <Link href="/vender" className="hover:text-[#17613C]">
            Vender
          </Link>
          {ciudadLanding && ciudadLanding !== l && (
            <>
              {' › '}
              <Link href={`/vender/${ciudadLanding.slug}`} className="hover:text-[#17613C]">
                {l.zona.ciudad}
              </Link>
            </>
          )}
          {' › '}
          <span className="text-[#3C4A42]">{l.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 pb-12 pt-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-12 lg:gap-y-6">
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="inline-block rounded-full bg-[#e7f2eb] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#17613C]">Vender · {l.zona.ciudad}</span>
            <h1 className="mt-4 font-raleway text-[clamp(30px,5vw,46px)] font-extrabold leading-[1.08] tracking-tight text-[#121A15]">
              Vendé {t.tu} en {l.nombre}
            </h1>
            <p className="mt-3 text-[17px] font-medium leading-relaxed text-[#3C4A42]">
              {m ? `${frasesMercado(l, m)} ` : ''}
              Para vender {ella ? 'la tuya' : 'el tuyo'}, todo arranca por el precio: calculá cuánto vale hoy y, si querés, un corredor te la tasa y la vendemos juntos.
            </p>
            <p className="mt-3 text-[14px] text-[#5B6B62]">SI INMOBILIARIA · desde 1983 · Corredor responsable Mat. N° 0621</p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Tasador opciones={opciones} modelo={tasador.modelo} modo="vender" actualizado={actualizado} tipoInicial={l.tipo} inicial={clave} sinDatosDelBarrio />
          </div>

          {mercadoTiles.length > 0 && (
            <div className="lg:col-start-1 lg:row-start-2">
              <h2 className="text-[15px] font-bold uppercase tracking-wider text-[#5B6B62]">El mercado en {l.zona.esCiudad ? 'todo ' : ''}{l.nombre}{actualizado ? ` · al ${actualizado}` : ' hoy'}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2.5">
                {mercadoTiles.map((x) => (
                  <li key={x.texto} className="rounded-2xl border border-[#E1E6E1] px-4 py-3.5">
                    <p className="font-numeric text-[19px] font-semibold leading-tight text-[#121A15]">{x.valor}</p>
                    <p className="mt-0.5 text-[14.5px] leading-snug text-[#3C4A42]">{x.texto}</p>
                  </li>
                ))}
              </ul>
              <Link href={enVenta} className="mt-3 inline-flex min-h-11 items-center text-[15px] font-bold text-[#17613C] hover:underline">
                Ver {t.plural} en venta en {l.nombre} →
              </Link>
            </div>
          )}
        </div>

        <section aria-labelledby="como" className="border-t border-[#E1E6E1] py-12">
          <h2 id="como" className="font-raleway text-[26px] font-extrabold text-[#121A15]">
            Cómo vendemos {t.tu} en {l.nombre}
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pasos.map((x, i) => (
              <li key={x.t} className="rounded-2xl border border-[#E1E6E1] p-5">
                <span className="font-numeric flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f2eb] font-semibold text-[#17613C]">{i + 1}</span>
                <b className="mt-3 block text-[16px] text-[#121A15]">{x.t}</b>
                <span className="mt-1 block text-[15px] leading-relaxed text-[#3C4A42]">{x.d}</span>
              </li>
            ))}
          </ol>
        </section>

        {m && (
          <section aria-labelledby="precio" className="border-t border-[#E1E6E1] py-12">
            <h2 id="precio" className="font-raleway text-[26px] font-extrabold text-[#121A15]">
              ¿A qué precio salir en {l.nombre}?
            </h2>
            <div className="mt-4 max-w-[46rem] space-y-4 text-[16px] leading-relaxed text-[#3C4A42]">
              <p>
                En {l.zona.esCiudad ? 'todo ' : ''}{l.nombre} compiten hoy <b className="font-numeric font-semibold text-[#121A15]">{n(m.n)}</b> {t.plural}. La mitad pide entre <b className="font-numeric font-semibold text-[#121A15]">{usd(m.p25)}</b> y <b className="font-numeric font-semibold text-[#121A15]">{usd(m.p75)}</b>, y el precio del medio es <b className="font-numeric font-semibold text-[#121A15]">{usd(m.mediana)}</b>.
              </p>
              <p>
                El que busca en {l.nombre} ve {ella ? 'la tuya' : 'el tuyo'} al lado de esas. Si sale muy por encima de lo que vale sin algo que lo explique —más metros, a estrenar, mejor ubicación dentro del barrio—, la mira, la compara y sigue de largo. Por eso arrancamos por la tasación: el tasador de arriba te da la referencia y el corredor la ajusta con lo que el aviso no dice.
              </p>
            </div>
          </section>
        )}

        <section className="border-t border-[#E1E6E1] py-12">
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

        <section className="border-t border-[#E1E6E1] py-12">
          <h2 className="font-raleway text-[20px] font-extrabold text-[#121A15]">En {l.nombre} también</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/tasar/${l.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
              Tasar {t.tu}
            </Link>
            {otrosTipos.map((x) => (
              <Link key={x.slug} href={`/vender/${x.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
                Vender {TEXTO_TIPO[x.tipo].tu}
              </Link>
            ))}
          </div>
          {vecinos.length > 0 && (
            <>
              <h2 className="mt-8 font-raleway text-[20px] font-extrabold text-[#121A15]">
                Vender {t.tu} en otros barrios de {l.zona.ciudad}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {vecinos.map((x) => (
                  <Link key={x.slug} href={`/vender/${x.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
                    {x.nombre}
                  </Link>
                ))}
                <Link href="/vender" className="rounded-full px-4 py-2.5 text-[15px] font-bold text-[#17613C]">
                  Todos los barrios →
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

// Landing de tasación por barrio: /tasar/{tipo}-{barrio}
//   /tasar/casa-kentucky · /tasar/lote-tierra-de-suenos-2 · /tasar/casa-funes
//   /tasar/casa-vida-lagoon-funes (zonas medidas que la lista vieja no tenía)
//
// Para el que busca "tasar mi casa en X": la página que rankea es la que
// convierte. El tasador completo (David, 8-oct-2026) abre con el
// barrio ya elegido; los números los arma Hilo con todos los avisos en venta
// (terreno y construcción por m², ajuste por tamaño y antigüedad, margen real
// del barrio). Debajo del valor, el pedido de la tasación ahí mismo. Si en el
// barrio no se da número (pocos avisos o precios muy dispares), solo el pedido.
// Su gemela para el que busca "vender mi casa en X" es /vender/{mismo slug}.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Tasador from '@/components/tasador/Tasador'
import { EDADES, estimar, porcentaje, resultado, tramoEdad } from '@/lib/tasador/estimar'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { HILO_DE, TEXTO_TIPO, TIPOS_TASAR, esIndexableTasar, landingDeCiudad, landingsDeCiudad, opcionesTasar, resolverTasar, type Landing } from '@/lib/seo/tasar'
import type { ModeloTasador, ParamsTasador } from '@/lib/tasador/tipos'

export const revalidate = 3600
export const dynamicParams = true
// No se arma en el build: la primera visita la arma (con los números de Hilo) y queda una hora.
export const generateStaticParams = () => []

const BASE = 'https://siinmobiliaria.com'
const n = (x: number) => x.toLocaleString('es-AR')
const usd = (x: number) => `USD ${n(x)}`
const Mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Props = { params: { slug: string } }

async function datos(slug: string) {
  const { tasador, indice } = await cargarTasar()
  const r = resolverTasar(slug, indice)
  return r ? { r, tasador, indice } : null
}

const lugar = (l: Landing) => (l.zona.esCiudad ? l.nombre : `${l.nombre}, ${l.zona.ciudad}`)

/** La propiedad típica del barrio (o con otros metros/antigüedad), con la misma cuenta del tasador. */
function cuenta(l: Landing, p: ParamsTasador, modelo: ModeloTasador, cambio: { m2?: number; ant?: number } = {}) {
  return resultado(estimar({ tipo: HILO_DE[l.tipo], m2: cambio.m2 ?? p.m2Tipico, ant: l.tipo === 'lote' ? null : (cambio.ant ?? p.antTipica ?? null) }, p, modelo, l.zona.mixto), p.error)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await datos(params.slug).catch(() => null)
  if (!d || 'redirigir' in d.r) return { title: 'Tasación | SI INMOBILIARIA', robots: { index: false, follow: true } }
  const l = d.r.landing
  const t = TEXTO_TIPO[l.tipo]
  const p = l.zona.params[l.tipo]
  // "Tasar mi casa en …": lo que la gente escribe en Google.
  const title = `Tasar mi ${t.singular} en ${lugar(l)}: cuánto vale hoy`
  const tipica = l.conNumero && p ? cuenta(l, p, d.tasador.modelo) : null
  const m2 = !p
    ? ''
    : l.tipo === 'casa' && l.zona.mixto && p.tierraM2 != null && p.construccionM2 != null
      ? ` El terreno se publica a USD ${n(p.tierraM2)}/m² y la construcción a USD ${n(p.construccionM2)}/m².`
      : ` Se publica a unos USD ${n(p.usdM2)} por m² ${l.tipo === 'lote' ? 'de terreno' : 'cubierto'}.`
  const description = l.conNumero
    ? `Cuánto vale ${t.tu} en ${lugar(l)} hoy.${m2}${tipica && p ? ` ${Mayus(t.una.replace(/^un[a]? /, ''))} típic${t.singular === 'casa' ? 'a' : 'o'} de ${n(p.m2Tipico)} m² ronda los ${usd(tipica.valor)}.` : ''} Tasala online con los metros y la antigüedad, y pedí la tasación de un corredor de SI INMOBILIARIA.`
    : `Tasación de ${t.plural} en ${lugar(l)}: un corredor matriculado de SI INMOBILIARIA la hace con lo que se vendió en el barrio. Te escribimos por WhatsApp en menos de 24 h.`
  const url = `${BASE}/tasar/${l.slug}`
  return {
    title: `${title} | SI INMOBILIARIA`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website', locale: 'es_AR' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
    robots: esIndexableTasar(l) ? { index: true, follow: true } : { index: false, follow: true },
  }
}

export default async function TasarPage({ params }: Props) {
  const d = await datos(params.slug)
  if (!d) notFound()
  // 307 y no 308: a dónde va depende de los datos de hoy (mañana el barrio puede tener los suyos).
  if ('redirigir' in d.r) redirect(d.r.redirigir)
  const { tasador, indice } = d
  const l = d.r.landing
  const t = TEXTO_TIPO[l.tipo]
  const opciones = opcionesTasar(indice)
  const clave = opciones.find((o) => o.slugs[l.tipo] === l.slug)?.clave ?? null
  // Una zona puede no tener avisos suficientes de un tipo: la página queda con el pedido.
  const p = l.zona.params[l.tipo] ?? { n: 0, usdM2: 0, m2Tipico: 0, error: 1, daNumero: false, errorPropio: false }
  const conTerreno = l.tipo === 'casa' && l.zona.mixto && p.tierraM2 != null && p.construccionM2 != null
  const tipica = l.conNumero ? cuenta(l, p, tasador.modelo) : null
  const otrosTipos = TIPOS_TASAR.filter((x) => x !== l.tipo)
    .map((x) => Array.from(indice.landings.values()).find((y) => y.tipo === x && y.zona === l.zona && y.conNumero))
    .filter((x): x is Landing => !!x)
  const vecinos = landingsDeCiudad(indice, l.zona.ciudad, l.tipo).filter((x) => x.slug !== l.slug && x.conNumero && !x.zona.esCiudad).slice(0, 16)
  const ciudadLanding = !l.zona.esCiudad ? landingDeCiudad(indice, l) : null
  const lugarCorto = l.nombre
  const ella = t.singular === 'casa'

  // Ejemplos con la misma cuenta del tasador: el contenido propio de cada barrio.
  const ejemplos: { texto: string; valor: number; desde: number; hasta: number }[] = []
  if (l.conNumero) {
    const vistos = new Set<number>()
    const ej = (texto: string, cambio: { m2?: number; ant?: number }) => {
      const x = cuenta(l, p, tasador.modelo, cambio)
      if (!x || vistos.has(x.valor)) return
      vistos.add(x.valor)
      ejemplos.push({ texto, valor: x.valor, desde: x.desde, hasta: x.hasta })
    }
    const redondo = (x: number) => Math.max(10, Math.round(x / 10) * 10)
    if (l.tipo === 'lote') {
      ej(`Lote de ${n(redondo(p.m2Tipico / 2))} m²`, { m2: redondo(p.m2Tipico / 2) })
      ej(`Lote típico: ${n(p.m2Tipico)} m²`, {})
      ej(`Lote de ${n(redondo(p.m2Tipico * 2))} m²`, { m2: redondo(p.m2Tipico * 2) })
    } else {
      ej(`${Mayus(t.singular)} típic${ella ? 'a' : 'o'}: ${n(p.m2Tipico)} m²${p.antTipica != null ? `, ${EDADES[tramoEdad(p.antTipica)].texto.toLowerCase()}` : ''}`, {})
      ej(`${n(p.m2Tipico)} m², a estrenar`, { ant: 1 })
      ej(`${n(p.m2Tipico)} m², con más de 35 años`, { ant: 45 })
      ej(`Más chic${ella ? 'a' : 'o'}: ${n(redondo(p.m2Tipico * 0.7))} m²`, { m2: redondo(p.m2Tipico * 0.7) })
      ej(`Más grande: ${n(redondo(p.m2Tipico * 1.5))} m²`, { m2: redondo(p.m2Tipico * 1.5) })
    }
  }

  const faq: { q: string; a: string }[] = []
  if (l.conNumero) {
    faq.push({
      q: `¿Cuánto vale el m² en ${lugarCorto}?`,
      a: conTerreno
        ? `Con lo que se publica hoy en ${lugarCorto}: el terreno, unos USD ${n(p.tierraM2!)} por m², y la construcción, unos USD ${n(p.construccionM2!)} por m² cubierto (el precio de cada casa menos su terreno).`
        : `Con lo que se publica hoy en ${lugarCorto}: unos USD ${n(p.usdM2)} por m² ${l.tipo === 'lote' ? 'de terreno' : 'cubierto'}, valor del medio.`,
    })
    if (tipica)
      faq.push({
        q: `¿Cuánto vale ${t.una} en ${lugarCorto}?`,
        a: `${Mayus(t.una.replace(/^un[a]? /, ''))} típic${ella ? 'a' : 'o'} de ${n(p.m2Tipico)} m²${l.tipo === 'casa' && p.loteTipico ? ` en ${n(p.loteTipico)} m² de terreno` : ''} tiene un valor de referencia de ${usd(tipica.valor)} (entre ${usd(tipica.desde)} y ${usd(tipica.hasta)}). Es precio de publicación: para vender, el precio lo fija la tasación.`,
      })
    faq.push({
      q: '¿Qué tan cerca está el valor de referencia?',
      a: p.errorPropio
        ? `Lo medimos contra lo publicado en ${lugarCorto}: calculamos cada ${t.singular} sin mirar su precio y en la mitad de los casos la diferencia fue menor a ${porcentaje(p.error)}. La ubicación exacta, el estado y la documentación los revisa un corredor en la tasación.`
        : `En ${lugarCorto} todavía hay pocos avisos para medirlo aparte; en los barrios de ${l.zona.ciudad}, la mitad de lo publicado está a menos de ${porcentaje(p.error)} de la cuenta.`,
    })
    if (l.tipo !== 'lote') {
      const nueva = cuenta(l, p, tasador.modelo, { ant: 1 })
      const vieja = cuenta(l, p, tasador.modelo, { ant: 45 })
      if (nueva && vieja && nueva.valor !== vieja.valor)
        faq.push({
          q: '¿Cuánto cambia el valor por la antigüedad?',
          a: `En ${lugarCorto}, ${t.una} de ${n(p.m2Tipico)} m² a estrenar ronda los ${usd(nueva.valor)}; con más de 35 años, los ${usd(vieja.valor)}. Sale de comparar, dentro de cada barrio, lo que se pide por las nuevas y por las de más años.`,
        })
    }
  }
  faq.push({ q: '¿El valor de referencia es una tasación?', a: 'No. Es una referencia con precios de publicación. La tasación la firma un corredor inmobiliario matriculado: revisa las ventas del barrio, la documentación y el estado, y recomienda el precio de publicación.' })
  faq.push({ q: '¿Cuánto tarda la tasación?', a: 'Después de tu pedido te escribimos por WhatsApp en menos de 24 h para coordinar la visita. El informe depende del tipo de propiedad y de la documentación.' })

  const migas = [
    { name: 'Inicio', item: `${BASE}/` },
    { name: 'Tasaciones por barrio', item: `${BASE}/tasar` },
    ...(ciudadLanding && ciudadLanding !== l ? [{ name: l.zona.ciudad, item: `${BASE}/tasar/${ciudadLanding.slug}` }] : []),
    { name: `${t.corto} en ${l.nombre}`, item: `${BASE}/tasar/${l.slug}` },
  ]
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Tasación de ${t.plural} en ${lugar(l)}`,
      serviceType: 'Tasación inmobiliaria',
      areaServed: { '@type': 'Place', name: `${lugar(l)}, Santa Fe, Argentina` },
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
    datosBarrio.push({ valor: `${n(p.m2Tipico)} m²`, texto: l.tipo === 'lote' ? 'el lote típico' : `${ella ? 'la casa típica' : 'el depto típico'}${l.tipo === 'casa' && p.loteTipico ? `, en ${n(p.loteTipico)} m² de terreno` : ''}` })
    datosBarrio.push({ valor: `±${porcentaje(p.error)}`, texto: p.errorPropio ? 'lo que erra la cuenta acá (la mitad de las veces)' : `lo que erra en los barrios de ${l.zona.ciudad}` })
    datosBarrio.push({ valor: n(p.n), texto: `${t.plural} ${t.publicadas} hoy en la cuenta` })
  }

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1120px] px-4 sm:px-5">
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

        {/* En el celu: título, tasador y después los números del barrio. En la compu, el tasador a la derecha. */}
        <div className="grid grid-cols-1 items-start gap-8 pb-12 pt-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-12 lg:gap-y-6">
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="inline-block rounded-full bg-[#e7f2eb] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#17613C]">Tasación online · {l.zona.ciudad}</span>
            <h1 className="mt-4 font-raleway text-[clamp(30px,5vw,46px)] font-extrabold leading-[1.08] tracking-tight text-[#121A15]">
              Tasá {t.tu} en {l.nombre}
            </h1>
            {!l.zona.esCiudad && (
              <p className="mt-2 text-[16px] font-semibold text-[#5B6B62]">
                {l.zona.ciudad}, Santa Fe
              </p>
            )}
            {l.conNumero ? (
              <p className="mt-3 text-[17px] font-medium leading-relaxed text-[#3C4A42]">
                ¿Cuánto vale hoy? Con {n(p.n)} {t.plural} {t.publicadas} en {l.nombre} armamos el valor de referencia
                {tipica ? (
                  <>
                    : {ella ? 'una típica' : 'uno típico'} de <span className="font-numeric">{n(p.m2Tipico)}</span> m² ronda los <b className="font-numeric font-semibold text-[#17613C]">{usd(tipica.valor)}</b>
                  </>
                ) : null}
                . Poné los metros y la antigüedad de {ella ? 'la tuya' : 'el tuyo'} y sale al instante.
              </p>
            ) : (
              <p className="mt-3 text-[17px] font-medium leading-relaxed text-[#3C4A42]">
                Un corredor matriculado del equipo te hace la tasación con lo que se vendió en {l.nombre} y te recomienda el precio de publicación.
              </p>
            )}
            <p className="mt-3 text-[14px] text-[#5B6B62]">SI INMOBILIARIA · desde 1983 · Corredor responsable Mat. N° 0621</p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Tasador opciones={opciones} modelo={tasador.modelo} modo="tasar" tipoInicial={l.tipo} inicial={clave} sinDatosDelBarrio />
          </div>
          {datosBarrio.length > 0 && (
            <ul className="grid grid-cols-2 gap-2.5 lg:col-start-1 lg:row-start-2">
              {datosBarrio.map((x) => (
                <li key={x.texto} className="rounded-2xl border border-[#E1E6E1] px-4 py-3.5">
                  <p className="font-numeric text-[19px] font-semibold leading-tight text-[#121A15]">{x.valor}</p>
                  <p className="mt-0.5 text-[14.5px] leading-snug text-[#3C4A42]">{x.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {ejemplos.length > 0 && (
          <section aria-labelledby="ejemplos" className="border-t border-[#E1E6E1] py-12">
            <h2 id="ejemplos" className="font-raleway text-[26px] font-extrabold text-[#121A15]">
              Cuánto vale {t.una} en {lugarCorto}, según {l.tipo === 'lote' ? 'el tamaño' : 'el tamaño y la antigüedad'}
            </h2>
            <p className="mt-2 max-w-[44rem] text-[15.5px] leading-relaxed text-[#3C4A42]">Con la misma cuenta del tasador y los avisos de hoy. Al lado, el rango donde cae la mitad de lo publicado.</p>
            <ul className="mt-6 max-w-[48rem]">
              {ejemplos.map((x) => (
                <li key={x.texto} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#E1E6E1] py-4 first:border-t">
                  <span className="text-[16px] font-semibold text-[#121A15]">{x.texto}</span>
                  <span className="text-right">
                    <span className="font-numeric text-[16.5px] font-semibold text-[#121A15]">{usd(x.valor)}</span>
                    <span className="font-numeric ml-2 text-[14px] text-[#5B6B62]">
                      ({n(x.desde)} a {n(x.hasta)})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="border-t border-[#E1E6E1] py-12">
          <h2 className="font-raleway text-[26px] font-extrabold text-[#121A15]">Cómo hacemos la tasación</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { t: 'Nos contás qué tenés', d: 'El barrio, los metros y cuándo pensás vender. Te escribimos por WhatsApp en menos de 24 h.' },
              { t: 'La vemos con un corredor', d: `Revisamos lo que se vendió y lo que se publica en ${lugarCorto}, la documentación y el estado.` },
              { t: 'Te recomendamos el precio', d: 'Un precio de publicación que venda, con el porqué. La firma un corredor matriculado.' },
            ].map((x, i) => (
              <li key={x.t} className="rounded-2xl border border-[#E1E6E1] p-5">
                <span className="font-numeric flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f2eb] font-semibold text-[#17613C]">{i + 1}</span>
                <b className="mt-3 block text-[16px] text-[#121A15]">{x.t}</b>
                <span className="mt-1 block text-[15px] leading-relaxed text-[#3C4A42]">{x.d}</span>
              </li>
            ))}
          </ol>
          <Link href={`/vender/${l.slug}`} className="mt-6 inline-flex min-h-11 items-center text-[16px] font-bold text-[#17613C] hover:underline">
            Cómo vendemos {t.plural} en {lugarCorto} →
          </Link>
        </section>

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
          <h2 className="font-raleway text-[20px] font-extrabold text-[#121A15]">En {lugarCorto} también</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/vender/${l.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
              Vender {t.tu}
            </Link>
            {otrosTipos.map((x) => (
              <Link key={x.slug} href={`/tasar/${x.slug}`} className="rounded-full bg-[#F3F7F4] px-4 py-2.5 text-[15px] font-semibold text-[#3C4A42] hover:bg-[#e7f2eb] hover:text-[#17613C]">
                Tasar {TEXTO_TIPO[x.tipo].tu}
              </Link>
            ))}
          </div>
          {vecinos.length > 0 && (
            <>
              <h2 className="mt-8 font-raleway text-[20px] font-extrabold text-[#121A15]">
                Tasar {t.tu} en otros barrios de {l.zona.ciudad}
              </h2>
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
      </div>
    </main>
  )
}

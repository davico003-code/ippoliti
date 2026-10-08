// /vender — adonde lleva "Vender" del menú (David, 8-oct-2026: "cuando vos
// ponés vender, quiero el mismo tasador"). Arriba el tasador completo (tipo,
// barrio con buscador, metros, antigüedad → valor al instante) con el pedido
// de tasación ahí mismo; abajo cómo vendemos y los barrios, cada uno con su
// landing /vender/{tipo}-{barrio}. Acepta ?barrio=&tipo= (links de anuncios).
// /tasaciones sigue igual: es el formulario de los anuncios, sin número.

import type { Metadata } from 'next'
import Link from 'next/link'
import BarriosPorCiudad from '@/components/tasador/BarriosPorCiudad'
import Tasador from '@/components/tasador/Tasador'
import { opcionesTasar } from '@/lib/seo/tasar'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { TIPOS_TASAR } from '@/lib/tasador/opciones'

// Se arma al pedirla (los números de Hilo piden la clave, que el build no tiene); la lectura de Hilo queda una hora en cache.
export const dynamic = 'force-dynamic'

const BASE = 'https://siinmobiliaria.com'
const TITULO = 'Vender tu casa en Funes, Roldán o Rosario: cuánto vale y cómo la vendemos'
const DESCRIPCION =
  'Calculá cuánto vale tu casa, lote o departamento en tu barrio de Funes, Roldán o Rosario, con los avisos de hoy, y vendela con SI INMOBILIARIA: tasación de un corredor matriculado, difusión en todos los portales y seguimiento hasta la escritura.'

export const metadata: Metadata = {
  title: `${TITULO} | SI INMOBILIARIA`,
  description: DESCRIPCION,
  alternates: { canonical: `${BASE}/vender` },
  openGraph: { title: TITULO, description: DESCRIPCION, url: `${BASE}/vender`, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website', locale: 'es_AR' },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRIPCION, images: ['/og-image.jpg'] },
  robots: { index: true, follow: true },
}

const n = (x: number) => x.toLocaleString('es-AR')

const PASOS = [
  { t: 'La tasación', d: 'Un corredor matriculado mira lo que se vendió y lo que compite hoy en tu barrio y te recomienda a qué precio salir, con el porqué.' },
  { t: 'La presentación', d: 'Fotos, una ficha propia en siinmobiliaria.com y anuncios para que tu propiedad se vea como tiene que verse.' },
  { t: 'La difusión', d: 'Publicada en Zonaprop, Argenprop y Mercado Libre, en nuestras redes y en la red de inmobiliarias con las que trabajamos.' },
  { t: 'El seguimiento', d: 'Te contamos las consultas y las visitas, y qué dice el mercado, para ajustar a tiempo si hace falta.' },
  { t: 'El cierre', d: 'Te acompañamos en la negociación, la reserva y hasta la escritura.' },
]

const PREGUNTAS = [
  {
    q: '¿Cómo sé cuánto vale mi casa?',
    a: 'Con el tasador de esta página tenés una referencia en segundos: sale de los avisos en venta de tu barrio (lo que vale el terreno y lo construido por m²), ajustada por los metros y la antigüedad. Para vender, el precio lo fija la tasación de un corredor, que suma lo que el aviso no dice: estado, ubicación exacta y documentación.',
  },
  {
    q: '¿El valor del tasador es el precio de venta?',
    a: 'No: es precio de publicación, lo que se pide hoy por propiedades parecidas en tu barrio. Las operaciones suelen cerrar algo por debajo. Por eso te mostramos un rango y no un número exacto.',
  },
  {
    q: '¿Qué papeles necesito para vender?',
    a: 'La escritura, los planos y los libre deuda de impuestos y servicios (y de expensas, si es un barrio cerrado). El escribano pide el resto; te ayudamos a juntarlo antes de publicar para no frenar la venta.',
  },
  {
    q: '¿Cuánto tarda en llegar la tasación?',
    a: 'Después de tu pedido te escribimos por WhatsApp en menos de 24 h para coordinar la visita. Sin compromiso.',
  },
  {
    q: '¿En qué zonas trabajan?',
    a: 'Funes, Roldán y Rosario, con foco en Fisherton y la zona oeste, y en los barrios cerrados de Funes y Roldán. Somos SI INMOBILIARIA, corredores matriculados desde 1983.',
  },
]

export default async function VenderPage() {
  const { tasador, indice } = await cargarTasar()
  const opciones = opcionesTasar(indice)
  const barrios = opciones.filter((o) => !o.esCiudad && TIPOS_TASAR.some((t) => o.params[t]?.daNumero)).length
  const avisos = opciones.reduce((s, o) => s + TIPOS_TASAR.reduce((x, t) => x + (o.params[t]?.n ?? 0), 0), 0)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Venta de propiedades en Funes, Roldán y Rosario',
      serviceType: 'Venta de inmuebles',
      provider: { '@id': `${BASE}/#organization` },
      areaServed: ['Funes', 'Roldán', 'Rosario'].map((name) => ({ '@type': 'City', name })),
      url: `${BASE}/vender`,
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: PREGUNTAS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Vender', item: `${BASE}/vender` },
      ],
    },
  ]

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1120px] px-4 sm:px-5">
        <section className="grid grid-cols-1 items-start gap-8 pb-14 pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-12 lg:pt-12">
          <div className="lg:sticky lg:top-24">
            <span className="inline-block rounded-full bg-[#e7f2eb] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#17613C]">Vender</span>
            <h1 className="mt-4 font-raleway text-[clamp(32px,5.4vw,52px)] font-extrabold leading-[1.06] tracking-tight text-[#121A15]">Vendé tu casa en Funes, Roldán o Rosario</h1>
            <p className="mt-4 text-[18px] font-medium leading-relaxed text-[#3C4A42]">
              Arrancá por lo que vale: elegí tu barrio, poné los metros y la antigüedad, y lo ves al instante. Si te cierra, un corredor del equipo te la tasa y la vendemos juntos.
            </p>
            <ul className="mt-6 space-y-2.5 text-[16px] text-[#3C4A42]">
              <Punto>
                <b className="font-numeric font-semibold text-[#121A15]">{n(barrios)}</b> barrios medidos uno por uno, con <b className="font-numeric font-semibold text-[#121A15]">{n(avisos)}</b> avisos en venta.
              </Punto>
              <Punto>El valor, al instante y sin registrarte.</Punto>
              <Punto>Corredores matriculados desde 1983 · Mat. N° 0621.</Punto>
            </ul>
          </div>
          <Tasador opciones={opciones} modelo={tasador.modelo} modo="vender" leerLink conLinkAlBarrio />
        </section>

        <section aria-labelledby="como" className="border-t border-[#E1E6E1] py-14">
          <h2 id="como" className="font-raleway text-[clamp(26px,3.6vw,36px)] font-extrabold text-[#121A15]">
            Cómo vendemos tu propiedad
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PASOS.map((x, i) => (
              <li key={x.t} className="rounded-2xl border border-[#E1E6E1] p-5">
                <span className="font-numeric flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f2eb] font-semibold text-[#17613C]">{i + 1}</span>
                <b className="mt-3 block text-[16px] text-[#121A15]">{x.t}</b>
                <span className="mt-1 block text-[15px] leading-relaxed text-[#3C4A42]">{x.d}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="barrios" className="border-t border-[#E1E6E1] py-14">
          <h2 id="barrios" className="font-raleway text-[clamp(26px,3.6vw,36px)] font-extrabold text-[#121A15]">
            Vendé en tu barrio
          </h2>
          <p className="mt-2 max-w-[44rem] text-[16px] leading-relaxed text-[#3C4A42]">Cada barrio con su página: cuánto vale, cuántas hay en venta y a qué precios, con el tasador ya cargado.</p>
          <div className="mt-8">
            <BarriosPorCiudad indice={indice} base="/vender" />
          </div>
          <p className="mt-6 text-[15.5px] text-[#3C4A42]">
            ¿Solo querés saber cuánto vale?{' '}
            <Link href="/tasar" className="font-bold text-[#17613C] underline decoration-2 underline-offset-4">
              Tasá tu propiedad barrio por barrio
            </Link>
            .
          </p>
        </section>

        <section className="border-t border-[#E1E6E1] py-14">
          <h2 className="font-raleway text-[clamp(26px,3.6vw,36px)] font-extrabold text-[#121A15]">Preguntas frecuentes</h2>
          <div className="mt-4 max-w-[760px]">
            {PREGUNTAS.map((f) => (
              <details key={f.q} className="border-b border-[#E1E6E1] py-4">
                <summary className="cursor-pointer text-[16px] font-bold text-[#121A15]">{f.q}</summary>
                <p className="mt-2 text-[15.5px] leading-relaxed text-[#3C4A42]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Punto({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#17613C]" aria-hidden="true" />
      <span>{children}</span>
    </li>
  )
}

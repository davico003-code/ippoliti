// /tasar — el tasador completo (David, 8-oct-2026): tipo,
// barrio con buscador, metros y antigüedad → el valor al instante, con el
// pedido de tasación ahí mismo. Abajo, todas las landings por barrio y ciudad:
// la entrada para quien busca "tasar mi casa en Funes" y el mapa para que
// Google llegue a cada barrio. Acepta ?barrio=&tipo= (links de anuncios).

import type { Metadata } from 'next'
import Link from 'next/link'
import BarriosPorCiudad from '@/components/tasador/BarriosPorCiudad'
import Tasador from '@/components/tasador/Tasador'
import { opcionesTasar } from '@/lib/seo/tasar'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { porcentaje } from '@/lib/tasador/estimar'

// Se arma al pedirla (los números de Hilo piden la clave, que el build no tiene); la lectura de Hilo queda una hora en cache.
export const dynamic = 'force-dynamic'

const BASE = 'https://siinmobiliaria.com'
const TITULO = 'Tasar mi casa en Funes, Roldán o Rosario: cuánto vale, barrio por barrio'
const DESCRIPCION =
  'Tasá online tu casa, lote o departamento en Funes, Roldán y Rosario: el valor de referencia de cada barrio con los avisos de hoy (terreno y construcción por m²) y el margen medido ahí. Sin registrarte. Y la tasación de un corredor matriculado de SI INMOBILIARIA.'

export const metadata: Metadata = {
  title: `${TITULO} | SI INMOBILIARIA`,
  description: DESCRIPCION,
  alternates: { canonical: `${BASE}/tasar` },
  openGraph: { title: TITULO, description: DESCRIPCION, url: `${BASE}/tasar`, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website', locale: 'es_AR' },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRIPCION, images: ['/og-image.jpg'] },
  robots: { index: true, follow: true },
}

export default async function TasarIndice() {
  const { tasador, indice, actualizado } = await cargarTasar()
  const opciones = opcionesTasar(indice)
  const err = tasador.modelo.errorCiudad

  const preguntas = [
    {
      q: '¿De dónde sale el valor de mi casa?',
      a: 'De un relevamiento propio de las propiedades que hoy están a la venta en tu mismo barrio. Separamos el precio en dos partes: el terreno, que medimos con los lotes publicados, y la construcción, que es lo que queda de cada casa al descontarle su terreno. Con tus metros y tu antigüedad armamos la cuenta; las casas más grandes se pagan algo menos por m² y las más nuevas, algo más que la típica del barrio.',
    },
    {
      q: '¿Cuánto se equivoca?',
      a: `Lo controlamos casa por casa: calculamos el valor de cada una de las publicadas sin mirar su precio y después lo comparamos. En los barrios de Funes, en la mitad de los casos la diferencia fue menor a ${porcentaje(err.Funes?.casa ?? 0.15)}; en Roldán, menor a ${porcentaje(err['Roldán']?.casa ?? 0.2)}. Cada barrio muestra su propio margen y, donde hay pocos avisos o los precios son muy dispares, preferimos no dar número.`,
    },
    {
      q: '¿Reemplaza a una tasación?',
      a: 'No. Es un valor de referencia armado con precios de publicación, y las ventas suelen cerrar algo por debajo. La tasación para vender la firma un corredor inmobiliario matriculado después de ver la propiedad; la pedís desde el mismo tasador.',
    },
    {
      q: 'Mi barrio no está en la lista, ¿qué hago?',
      a: 'Probá con la ciudad: en Funes y Roldán, "fuera de barrios" es el casco y todo lo que no está dentro de un barrio con nombre; en Rosario, el Centro y las zonas sin barrio con nombre. Si igual no te cierra, pedí la tasación y un corredor la hace con las ventas de tu zona.',
    },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Tasador online de propiedades en Funes, Roldán y Rosario',
      url: `${BASE}/tasar`,
      description: DESCRIPCION,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      inLanguage: 'es-AR',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@id': `${BASE}/#organization` },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: preguntas.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Tasaciones por barrio', item: `${BASE}/tasar` },
      ],
    },
  ]

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1120px] px-4 sm:px-5">
        <section className="grid grid-cols-1 items-start gap-8 pb-14 pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-12 lg:pt-12">
          <div className="lg:sticky lg:top-24">
            <span className="inline-block rounded-full bg-[#e7f2eb] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#17613C]">Tasación online</span>
            <h1 className="mt-4 font-raleway text-[clamp(32px,5.4vw,52px)] font-extrabold leading-[1.06] tracking-tight text-[#121A15]">¿Cuánto vale tu casa en Funes, Roldán o Rosario?</h1>
            <p className="mt-4 text-[18px] font-medium leading-relaxed text-[#3C4A42]">
              Elegí el barrio y poné los metros y la antigüedad: te mostramos el valor de referencia con lo que valen hoy el terreno y lo construido ahí, y cuánto le erra la cuenta en ese barrio.
            </p>
            <ul className="mt-6 space-y-2.5 text-[16px] text-[#3C4A42]">
              <Punto>Relevamiento propio de lo que está publicado a la venta, barrio por barrio.</Punto>
              {actualizado && <Punto>Actualizado el {actualizado}.</Punto>}
              <Punto>Sin registrarte. Y si querés vender, la tasación de un corredor matriculado.</Punto>
            </ul>
          </div>
          <Tasador opciones={opciones} modelo={tasador.modelo} modo="tasar" actualizado={actualizado} leerLink conLinkAlBarrio />
        </section>

        <section aria-labelledby="barrios" className="border-t border-[#E1E6E1] py-14">
          <h2 id="barrios" className="font-raleway text-[clamp(26px,3.6vw,36px)] font-extrabold text-[#121A15]">
            Cuánto vale, barrio por barrio
          </h2>
          <p className="mt-2 max-w-[44rem] text-[16px] leading-relaxed text-[#3C4A42]">Cada barrio con su página: el terreno y lo construido por m², la propiedad típica y ejemplos según el tamaño y la antigüedad.</p>
          <div className="mt-8">
            <BarriosPorCiudad indice={indice} base="/tasar" />
          </div>
          <p className="mt-6 text-[15.5px] text-[#3C4A42]">
            ¿Ya decidiste vender?{' '}
            <Link href="/vender" className="font-bold text-[#17613C] underline decoration-2 underline-offset-4">
              Mirá cómo vendemos tu propiedad
            </Link>
            .
          </p>
        </section>

        <section className="border-t border-[#E1E6E1] py-14">
          <h2 className="font-raleway text-[clamp(26px,3.6vw,36px)] font-extrabold text-[#121A15]">Cómo lo calculamos</h2>
          <div className="mt-4 max-w-[760px]">
            {preguntas.map((f) => (
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

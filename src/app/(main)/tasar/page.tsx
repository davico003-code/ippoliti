// /tasar — todas las landings de tasación por barrio, por ciudad. La entrada
// para quien busca "tasación en Funes" y el mapa para que Google llegue a cada
// barrio. Solo lo que da número (lo decide Hilo); el pedido, siempre.

import type { Metadata } from 'next'
import Link from 'next/link'
import { CIUDADES_TASAR, TEXTO_TIPO, TIPOS_TASAR, landingsDeCiudad } from '@/lib/seo/tasar'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'

// Se arma al pedirla (los números de Hilo piden la clave, que el build no tiene); la lectura de Hilo queda una hora en cache.
export const dynamic = 'force-dynamic'

const BASE = 'https://siinmobiliaria.com'
const TITULO = 'Tasación de propiedades en Funes, Roldán y Rosario, barrio por barrio'
const DESCRIPCION =
  'Valor de referencia de casas, lotes y departamentos en cada barrio de Funes, Roldán y Rosario, con los avisos de hoy. Y la tasación de un corredor matriculado de SI INMOBILIARIA.'

export const metadata: Metadata = {
  title: `${TITULO} | SI INMOBILIARIA`,
  description: DESCRIPCION,
  alternates: { canonical: `${BASE}/tasar` },
  openGraph: { title: TITULO, description: DESCRIPCION, url: `${BASE}/tasar`, siteName: 'SI INMOBILIARIA', images: ['/og-image.jpg'], type: 'website' },
  robots: { index: true, follow: true },
}

export default async function TasarIndice() {
  const { indice } = await cargarTasar()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Tasaciones por barrio', item: `${BASE}/tasar` },
    ],
  }
  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[1080px] px-5 pb-16 pt-10">
        <span className="inline-block rounded-full bg-[#e7f2eb] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#17613C]">Tasaciones</span>
        <h1 className="mt-4 max-w-[46rem] font-raleway text-[clamp(30px,5vw,46px)] font-extrabold leading-[1.08] tracking-tight text-[#121A15]">{TITULO}</h1>
        <p className="mt-3 max-w-[40rem] text-[17px] font-medium leading-relaxed text-[#3C4A42]">
          Elegí tu barrio: vas a ver el valor de referencia con los avisos de hoy y podés pedir la tasación de un corredor matriculado.
        </p>
        <Link href="/tasaciones" className="si-tap mt-6 inline-flex h-12 items-center rounded-full bg-[#17613C] px-6 text-[16px] font-bold text-white">
          Pedir una tasación
        </Link>

        {CIUDADES_TASAR.map((ciudad) => (
          <section key={ciudad} aria-labelledby={`c-${ciudad}`} className="mt-12">
            <h2 id={`c-${ciudad}`} className="border-b-2 border-[#121A15] pb-2 font-raleway text-[28px] font-extrabold text-[#121A15]">
              {ciudad}
            </h2>
            <div className="mt-4 grid gap-8 md:grid-cols-3">
              {TIPOS_TASAR.map((tipo) => {
                const ls = landingsDeCiudad(indice, ciudad, tipo).filter((l) => l.conNumero)
                if (!ls.length) return null
                return (
                  <div key={tipo}>
                    <h3 className="text-[16px] font-extrabold text-[#121A15]">{TEXTO_TIPO[tipo].plural[0].toUpperCase() + TEXTO_TIPO[tipo].plural.slice(1)}</h3>
                    <ul className="mt-2">
                      {ls.map((l) => (
                        <li key={l.slug}>
                          <Link href={`/tasar/${l.slug}`} className="block py-1.5 text-[15px] text-[#3C4A42] hover:text-[#17613C]">
                            {l.zona.esCiudad ? `${ciudad}, fuera de barrios` : l.nombre}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

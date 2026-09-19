import type { Metadata } from 'next'
// InformesDashboard (recharts) se carga vía InformesDashboardLazy ("use client"):
// un import estático acá metía recharts entero en el First Load JS de la ruta.
import InformesDashboardLazy from './InformesDashboardLazy'

export const metadata: Metadata = {
  title: 'Informes de Mercado Inmobiliario | SI INMOBILIARIA',
  description: 'Dólar, inflación IPC e índice de alquileres ICL actualizados cada semana. Datos oficiales para decidir mejor en Funes y Roldán.',
  alternates: { canonical: 'https://siinmobiliaria.com/informes' },
  // Sin este bloque, la página hereda el openGraph del root layout y publica
  // og:url = https://siinmobiliaria.com (el home) en vez de su propia URL.
  openGraph: {
    title: 'Informes de Mercado Inmobiliario | SI INMOBILIARIA',
    description:
      'Dólar, inflación IPC e índice de alquileres ICL actualizados cada semana.',
    url: 'https://siinmobiliaria.com/informes',
  },
}

export default function InformesPage() {
  // El hero va en el server: el dashboard es ssr:false y sin esto la página
  // llegaba sin <h1> al HTML que indexa Google.
  return (
    <>
      <div className="bg-[#0f0f0f] w-full">
        <div className="max-w-5xl mx-auto px-6 pt-16 md:pt-20 text-center">
          <p className="text-[#4ADE80] text-xs font-bold tracking-widest uppercase mb-4">Datos actualizados semanalmente</p>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Mercado inmobiliario
          </h1>
          <p className="text-white/50 text-base mt-3">Indicadores oficiales para Funes y Roldán</p>
        </div>
      </div>
      <InformesDashboardLazy />
    </>
  )
}

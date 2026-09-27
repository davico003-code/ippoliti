export const revalidate = 21600

import HeroVideo from '@/components/HeroVideo'
import EmprendimientosHome from '@/components/EmprendimientosHome'
import HeroMobile from '@/components/home/HeroMobile'
import DestacadasGrandes from '@/components/home/DestacadasGrandes'
import ProyectosCarousel from '@/components/home/ProyectosCarousel'
import GuiaSection from '@/components/home/GuiaSection'
import ConfianzaSection from '@/components/home/ConfianzaSection'
import GuiaDesktop from '@/components/home/GuiaDesktop'
import ConfianzaDesktop from '@/components/home/ConfianzaDesktop'
import TemporariosHome from '@/components/home/TemporariosHome'
import { esTemporadaVerano } from '@/lib/temporarios-data'

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'SI INMOBILIARIA · Propiedades en Funes, Roldán y Rosario',
  description:
    'Inmobiliaria familiar fundada en 1983. Casas, departamentos, terrenos y emprendimientos en Funes, Roldán y Rosario. Tasaciones profesionales con comparables locales.',
  alternates: { canonical: 'https://siinmobiliaria.com' },
  openGraph: {
    title: 'SI INMOBILIARIA · Propiedades en Funes, Roldán y Rosario',
    description:
      'Inmobiliaria familiar desde 1983. Casas, departamentos y terrenos en Funes, Roldán y Rosario.',
    url: 'https://siinmobiliaria.com',
    images: ['/og-image.jpg'],
  },
}

// El JSON-LD de negocio (RealEstateAgent + LocalBusiness de cada sucursal) lo
// emite el layout site-wide con un @id canónico. Antes la home emitía OTRO
// RealEstateAgent (sin @id, con teléfono/nombre distintos) → dos entidades
// contradictorias para Google. Se eliminó; el dato único (founder) se movió al
// del layout.

// ─── Home Page ────────────────────────────────────────────────────────────────

export default async function Home() {
  // Temporarios: de noviembre a febrero la fila va arriba de "Nuestra
  // selección"; el resto del año, debajo. Sin temporarios publicados no se ve.
  const verano = esTemporadaVerano()
  return (
    <>
      <h1 className="sr-only">Propiedades y servicios inmobiliarios en Funes, Roldán y Rosario</h1>
      {/* ═══ MOBILE (<md) — Nuevo diseño Zillow-style ═══ */}
      <div className="md:hidden">
        <HeroMobile />
        {verano && <TemporariosHome />}
        <DestacadasGrandes prioridad />
        {!verano && <TemporariosHome />}
        <ProyectosCarousel />
        <GuiaSection />
        <ConfianzaSection />
        {/* Footer: lo provee FooterWrapper (footer blanco global, responsive). */}
      </div>

      {/* ═══ DESKTOP (md+) — Layout existente ═══ */}
      <div className="hidden md:block">
        <HeroVideo />
        {verano && <TemporariosHome />}
        <DestacadasGrandes />
        {!verano && <TemporariosHome />}
        <EmprendimientosHome />
        <GuiaDesktop />
        <ConfianzaDesktop />
      </div>
    </>
  )
}

export const revalidate = 21600

import type { Metadata } from 'next'
import HeroCine from '@/components/home/cine/HeroCine'
import Manifiesto from '@/components/home/cine/Manifiesto'
import HiloShowcase from '@/components/home/cine/HiloShowcase'
import SeleccionCarousel from '@/components/home/SeleccionCarousel'
import FeaturedPropertiesSection from '@/components/home/FeaturedPropertiesSection'
import EmprendimientosHome from '@/components/EmprendimientosHome'
import ProyectosCarousel from '@/components/home/ProyectosCarousel'
import GuiaSection from '@/components/home/GuiaSection'
import GuiaDesktop from '@/components/home/GuiaDesktop'

// Maqueta de la home nueva para validar antes de reemplazar la actual.
export const metadata: Metadata = {
  title: 'Preview · Home cinematográfica',
  robots: { index: false, follow: false },
}

export default function PreviewHome() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (hover: hover) { .prop-card:hover .prop-card-img { transform: scale(1.03); } }
        .prop-card-img { transition: transform 400ms ease-out; }
        .home-section { padding: 32px 24px; }
      ` }} />
      <HeroCine />
      <div className="md:hidden"><SeleccionCarousel /></div>
      <div className="hidden md:block pt-6"><FeaturedPropertiesSection /></div>
      <Manifiesto />
      <HiloShowcase />
      <div className="md:hidden"><ProyectosCarousel /><GuiaSection /></div>
      <div className="hidden md:block"><EmprendimientosHome /><GuiaDesktop /></div>
    </>
  )
}

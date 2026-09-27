export const revalidate = 21600

import type { Metadata } from 'next'
import NavPastilla from '@/components/home/v2/NavPastilla'
import PortadaV2 from '@/components/home/v2/PortadaV2'
import ZonasV2 from '@/components/home/v2/ZonasV2'
import DestacadasV2 from '@/components/home/v2/DestacadasV2'
import PremiumV2 from '@/components/home/v2/PremiumV2'
import EmprendimientosV2 from '@/components/home/v2/EmprendimientosV2'
import CifrasV2 from '@/components/home/v2/CifrasV2'
import VenderV2 from '@/components/home/v2/VenderV2'
import ContactoV2 from '@/components/home/v2/ContactoV2'

// Propuesta de home con la estructura de serhant.com, adaptada a SI. Página
// de prueba: fuera de Google y del menú. La barra del sitio se oculta acá para
// mostrar la barra flotante nueva.
export const metadata: Metadata = {
  title: 'Propuesta · Home estilo SERHANT',
  robots: { index: false, follow: false },
}

export default function PreviewHomeV2() {
  return (
    <div data-home-v2>
      <style dangerouslySetInnerHTML={{ __html: `body:has([data-home-v2]) nav.sticky { display: none !important; }` }} />
      <NavPastilla />
      <PortadaV2 />
      <ZonasV2 />
      <DestacadasV2 />
      <PremiumV2 />
      <EmprendimientosV2 />
      <CifrasV2 />
      <VenderV2 />
      <ContactoV2 />
    </div>
  )
}

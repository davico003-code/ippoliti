// Link público del plano de Distrito Roldán, pensado para mandar por WhatsApp:
//
//     siinmobiliaria.com/distrito-roldan-precios
//
// Se ve el plano y nada más — sin header, sin footer y sin navegación del
// sitio. Por eso la página cuelga directo de src/app/ y no del grupo (main),
// que es el layout que aporta esa estructura.
//
// El plano es el mismo archivo autocontenido que se embebe en la página del
// emprendimiento (public/planos/distrito-roldan.html): se actualiza desde el
// panel de agentes y las dos vistas quedan siempre iguales, sin duplicar nada.
//
// No se indexa: entra sólo quien recibe el link.

import type { Metadata, Viewport } from 'next'
import PlanoPantallaCompleta from '@/components/distrito-roldan/PlanoPantallaCompleta'

const TITULO = 'Distrito Roldán · Lotes disponibles'
const BAJADA =
  'Disponibilidad lote por lote: medidas, superficie y precio. Ruta 9 y María Auxiliadora, Roldán.'
const OG = '/planos/og-distrito-roldan.jpg'

export const metadata: Metadata = {
  title: TITULO,
  description: BAJADA,
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: 'website',
    title: TITULO,
    description: BAJADA,
    siteName: 'SI INMOBILIARIA',
    locale: 'es_AR',
    images: [{ url: OG, width: 1200, height: 630, alt: 'Plano de lotes de Distrito Roldán' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: BAJADA,
    images: [OG],
  },
}

export const viewport: Viewport = {
  // viewport-fit=cover para que en iPhone el plano llegue hasta el borde,
  // sin la franja blanca de la zona segura.
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EDE7DA',
}

export default function PlanoDistritoRoldanPublicoPage() {
  return <PlanoPantallaCompleta />
}

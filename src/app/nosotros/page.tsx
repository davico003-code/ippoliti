import type { Metadata } from 'next'
import NosotrosClient from './NosotrosClient'

export const metadata: Metadata = {
  title: 'Sobre nosotros — 40 años en Funes, Roldán y Rosario | SI Inmobiliaria',
  description: 'Conocé la historia de SI Inmobiliaria. Más de 40 años acompañando familias en Roldán, Funes y Rosario. Susana Ippoliti, Laura y David.',
  alternates: { canonical: 'https://siinmobiliaria.com/nosotros' },
  openGraph: {
    title: 'Sobre nosotros | SI Inmobiliaria',
    description: 'Tres generaciones acompañando familias en Funes, Roldán y Rosario desde 1983.',
    url: 'https://siinmobiliaria.com/nosotros',
    images: ['/nosotros/LAURASUSANADAVID.jpeg'],
  },
}

export default function NosotrosPage() {
  return <NosotrosClient />
}

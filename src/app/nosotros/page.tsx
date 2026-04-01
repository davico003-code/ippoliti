import type { Metadata } from 'next'
import NosotrosClient from './NosotrosClient'

export const metadata: Metadata = {
  title: 'Nosotros | SI Inmobiliaria',
  description: 'Conocé la historia de SI Inmobiliaria. Más de 40 años acompañando familias en Roldán, Funes y Rosario. Susana Ippoliti, Laura y David.',
}

export default function NosotrosPage() {
  return <NosotrosClient />
}

import type { Metadata } from 'next'
import DetalleAutorizacionClient from './DetalleAutorizacionClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Detalle de autorización · SI INMOBILIARIA',
  description: 'Detalle de autorización de venta.',
  robots: { index: false, follow: false },
}

export default function DetalleAutorizacionPage({ params }: { params: { slug: string } }) {
  return <DetalleAutorizacionClient slug={params.slug} />
}

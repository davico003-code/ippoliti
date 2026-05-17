import type { Metadata } from 'next'
import DetalleVisitaClient from './DetalleVisitaClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Detalle de visita · SI INMOBILIARIA',
  description: 'Detalle del lead de visita.',
  robots: { index: false, follow: false },
}

export default function DetalleVisitaPage({ params }: { params: { id: string } }) {
  return <DetalleVisitaClient id={params.id} />
}

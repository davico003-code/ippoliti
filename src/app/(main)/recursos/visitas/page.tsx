import type { Metadata } from 'next'
import VisitasClient from './VisitasClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Visitas · SI INMOBILIARIA',
  description: 'Panel interno de leads de visita.',
  robots: { index: false, follow: false },
}

export default function VisitasPage() {
  return <VisitasClient />
}

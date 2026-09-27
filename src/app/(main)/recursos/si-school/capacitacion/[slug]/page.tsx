// Página propia (link compartible) de una capacitación. Acceso libre.
// El contenido lo sirve /api/capacitaciones/[id].

import { notFound } from 'next/navigation'
import { CAPACITACIONES, numeroCapacitacion } from '@/components/si-school/capacitaciones'
import CapacitacionVista from './CapacitacionVista'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Capacitación · SI INMOBILIARIA',
  robots: { index: false, follow: false, nocache: true },
}

export default function CapacitacionPage({ params }: { params: { slug: string } }) {
  const cap = CAPACITACIONES.find((c) => c.id === params.slug)
  if (!cap) notFound()

  return <CapacitacionVista id={cap.id} titulo={`${numeroCapacitacion(cap.id)} · ${cap.titulo}`} />
}

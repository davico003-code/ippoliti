import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCapacidad } from '@/lib/si-school/content'
import CapacidadView from './CapacidadView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Capacidad · SI School',
  robots: { index: false, follow: false, nocache: true },
}

export default function CapacidadPage({ params }: { params: { slug: string } }) {
  const cap = getCapacidad(params.slug)
  if (!cap) notFound()
  return <CapacidadView capacidad={cap} />
}

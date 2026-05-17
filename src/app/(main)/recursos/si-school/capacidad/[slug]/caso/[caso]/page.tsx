import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCaso, getCapacidadMeta } from '@/lib/si-school/content'
import CasoView from './CasoView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Caso · SI School',
  robots: { index: false, follow: false, nocache: true },
}

export default function CasoPage({
  params,
}: {
  params: { slug: string; caso: string }
}) {
  const cap = getCapacidadMeta(params.slug)
  const caso = getCaso(params.slug, params.caso)
  if (!cap || !caso) notFound()
  return <CasoView capSlug={cap.slug} capRomano={cap.romano} capTitulo={cap.titulo} caso={caso} />
}

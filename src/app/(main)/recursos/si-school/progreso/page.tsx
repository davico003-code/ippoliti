import type { Metadata } from 'next'

import ProgresoView from './ProgresoView'
import { getCapacidadesMeta } from '@/lib/si-school/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tu progreso · SI School',
  robots: { index: false, follow: false, nocache: true },
}

export default function ProgresoPage() {
  return <ProgresoView capacidades={getCapacidadesMeta()} />
}

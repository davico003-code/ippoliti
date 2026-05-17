import type { Metadata } from 'next'
import SiSchoolOverviewClient from './SiSchoolOverviewClient'
import { getCapacidadesMeta } from '@/lib/si-school/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'SI School · Sistema operativo del agente',
  description: 'Programa de formación interna para agentes SI INMOBILIARIA.',
  robots: { index: false, follow: false, nocache: true },
}

export default function SiSchoolHomePage() {
  const capacidades = getCapacidadesMeta()
  return <SiSchoolOverviewClient capacidades={capacidades} />
}

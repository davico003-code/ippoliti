import type { Metadata } from 'next'
import GeneradorLinks from './GeneradorLinks'

export const metadata: Metadata = {
  title: 'Presentación "Cómo trabajamos" | Agentes SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default function PresentacionAgentesPage() {
  return <GeneradorLinks />
}

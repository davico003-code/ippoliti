import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'SI School · Sistema operativo del agente',
  description: 'Programa de formación interna para agentes SI INMOBILIARIA.',
  robots: { index: false, follow: false, nocache: true },
}

export default function SiSchoolLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

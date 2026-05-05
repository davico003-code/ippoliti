import { Suspense } from 'react'
import type { Metadata } from 'next'
import PlanillaPrintable from './PlanillaPrintable'

export const metadata: Metadata = {
  title: 'Planilla de costos — SI Inmobiliaria',
  robots: { index: false, follow: false },
}

export default function PlanillaPage() {
  return (
    <Suspense fallback={null}>
      <PlanillaPrintable />
    </Suspense>
  )
}

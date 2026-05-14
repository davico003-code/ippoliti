import type { Metadata } from 'next'
import AutorizacionesClient from './AutorizacionesClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Autorizaciones de venta | SI INMOBILIARIA',
  description: 'Generá autorizaciones de venta digitales para firmar online.',
  robots: { index: false, follow: false },
}

export default function AutorizacionesPage() {
  return <AutorizacionesClient />
}

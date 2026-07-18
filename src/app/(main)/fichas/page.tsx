// Panel del equipo SI para gestionar fichas white-label generadas en
// verficha.casa. El gating es por código de equipo en localStorage; el
// FichasClient se ocupa del flujo de login + carga de datos.

import type { Metadata } from 'next'
import FichasClient from './FichasClient'

export const dynamic = 'force-dynamic'

// Panel interno del equipo: no indexar.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function FichasPage() {
  return <FichasClient />
}

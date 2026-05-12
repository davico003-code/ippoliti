// Panel del equipo SI para gestionar fichas white-label generadas en
// verficha.casa. El gating es por código de equipo en localStorage; el
// FichasClient se ocupa del flujo de login + carga de datos.

import FichasClient from './FichasClient'

export const dynamic = 'force-dynamic'

export default function FichasPage() {
  return <FichasClient />
}

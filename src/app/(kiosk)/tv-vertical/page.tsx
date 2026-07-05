// Página /tv-vertical — kiosco "vidriera viva" para un televisor PARADO (portrait).
// Trae la secuencia curada (casas caras de Funes, lotes de barrios privados, las 2
// de Roldán) con ganchos + placas institucionales, y el cliente la cicla rotando
// 90° a pantalla completa.

import { getVitrina } from '../tvVitrina'
import TvVerticalClient from './TvVerticalClient'

export const revalidate = 1800

export default async function TvVerticalPage() {
  const cards = await getVitrina()
  return <TvVerticalClient cards={cards} />
}

// Página /tv-vertical — modo KIOSCO para un televisor PARADO (portrait). Muestra
// varias propiedades apiladas en columna (aprovechando el alto) y cicla el set.
// Misma data que /tv (mix inteligente + QR).

import { getSlides } from '../tvData'
import TvVerticalClient from './TvVerticalClient'

export const revalidate = 1800

export default async function TvVerticalPage() {
  const slides = await getSlides()
  return <TvVerticalClient slides={slides} />
}

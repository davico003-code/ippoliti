// Página /tv-vertical — modo KIOSCO para un televisor PARADO (portrait). Muestra
// UNA propiedad por vez con 3 fotos de esa misma casa apiladas (aprovechando el
// alto) y cicla a la siguiente. Misma data que /tv (mix inteligente + QR).

import { getSlides } from '../tvData'
import TvVerticalClient from './TvVerticalClient'

export const revalidate = 1800

export default async function TvVerticalPage() {
  const slides = await getSlides()
  // Priorizar las propiedades que tienen 3 fotos reales (lucen mejor en vertical).
  const ordered = [...slides].sort((a, b) => (b.photos.length >= 3 ? 1 : 0) - (a.photos.length >= 3 ? 1 : 0))
  return <TvVerticalClient slides={ordered} />
}

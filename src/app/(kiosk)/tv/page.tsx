// Página /tv — modo KIOSCO horizontal para televisor. Trae el mix de slides y
// deja que el cliente los cicle con animaciones en loop infinito.

import { getSlides } from '../tvData'
import TvKioskClient from './TvKioskClient'

// Refresca el stock cada 30 min (el cliente además recarga la página sola).
export const revalidate = 1800

export default async function TvPage() {
  const slides = await getSlides()
  return <TvKioskClient slides={slides} />
}

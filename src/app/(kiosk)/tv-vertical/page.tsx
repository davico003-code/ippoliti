// Página /tv-vertical — la misma pantalla que /tv para un televisor PARADO:
// mismas propiedades y mismo diseño, con la foto arriba y los datos abajo. El
// televisor sigue mandando la imagen acostada, así que la página se gira 90°
// (botón "Girar" si quedó para el otro lado). Solo acá va la placa "¿Cuánto vale
// tu casa?" con el QR a la tasación. Ver TvKioskClient.

import { getSlides } from '../tvData'
import TvKioskClient from '../tv/TvKioskClient'

export const revalidate = 1800

export default async function TvVerticalPage() {
  const slides = await getSlides({ conTasar: true })
  return <TvKioskClient slides={slides} vertical />
}

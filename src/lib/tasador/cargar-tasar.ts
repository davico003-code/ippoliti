import 'server-only'
import { cache } from 'react'
import { indiceTasar } from '@/lib/seo/tasar'
import { traerTasadorHilo } from './hilo-tasador'

/** Los números de Hilo y las landings /tasar, una vez por pedido (la metadata y la página comparten). */
export const cargarTasar = cache(async () => {
  const tasador = await traerTasadorHilo()
  return { tasador, indice: indiceTasar(tasador) }
})

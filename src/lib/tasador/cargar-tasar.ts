import 'server-only'
import { cache } from 'react'
import { indiceTasar } from '@/lib/seo/tasar'
import { traerMercadoHilo } from './hilo-tasador'

/** Los números de Hilo y las landings /tasar y /vender, una vez por pedido (la metadata y la página comparten). */
export const cargarTasar = cache(async () => {
  const { tasador, mercado } = await traerMercadoHilo()
  return { tasador, mercado, indice: indiceTasar(tasador) }
})

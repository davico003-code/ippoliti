import 'server-only'
import { cache } from 'react'
import { indiceTasar } from '@/lib/seo/tasar'
import { traerMercadoHilo } from './hilo-tasador'

const DIA = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })

/**
 * Los números de Hilo y las landings /tasar y /vender, una vez por pedido (la
 * metadata y la página comparten). `actualizado` = el día en que Hilo mandó
 * estos números ("10 de octubre"); null si no se sabe: entonces no se muestra.
 */
export const cargarTasar = cache(async () => {
  const { tasador, mercado, leido } = await traerMercadoHilo()
  return { tasador, mercado, indice: indiceTasar(tasador), actualizado: leido ? DIA.format(leido) : null }
})

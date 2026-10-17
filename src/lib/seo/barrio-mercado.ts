import 'server-only'
import { cargarTasar } from '@/lib/tasador/cargar-tasar'
import { mercadoDe, zonaDeBarrio, zonasTasar, type TipoTasar } from '@/lib/seo/tasar'
import type { ResumenMercado } from '@/lib/tasador/tipos'

// El mercado de hoy de un barrio privado, para su ficha (/barrios-privados/…):
// cuántas casas y lotes hay en venta y entre qué precios pide la mitad. Es el
// mismo relevamiento de Hilo que usan /tasar y /vender (Search Console 17-oct:
// "haras de funes", "funes hills", "la finca 2" aparecían en posición 5-7 con
// ~1 % de clics; el título solo tenía el eslogan del barrio).

export type MercadoTipo = ResumenMercado & { tasar: string | null; vender: string | null }
export type MercadoBarrio = { casas: MercadoTipo | null; lotes: MercadoTipo | null; actualizado: string | null }

const n = (x: number) => x.toLocaleString('es-AR')
/** "USD 860 mil" · "USD 1,4 millones" (como /vender). */
export const usdCorto = (x: number) =>
  x >= 1_000_000 ? `USD ${(Math.round(x / 100_000) / 10).toLocaleString('es-AR')} millones` : `USD ${n(Math.round(x / 1000))} mil`

/** null si Hilo no responde o el barrio no tiene avisos suficientes: la ficha sigue igual. */
export async function mercadoDelBarrio(nombre: string, ciudad: 'Funes' | 'Roldán' | 'Rosario' = 'Funes'): Promise<MercadoBarrio | null> {
  try {
    const { tasador, mercado, indice, actualizado } = await cargarTasar()
    const zonas = zonasTasar(tasador)
    const de = (tipo: TipoTasar): MercadoTipo | null => {
      const zona = zonaDeBarrio({ nombre, ciudad }, tipo, zonas)
      if (!zona) return null
      const m = mercadoDe(mercado, { tipo, zona })
      if (!m) return null
      const landing = Array.from(indice.landings.values()).find((l) => l.tipo === tipo && l.zona === zona)
      return { ...m, tasar: landing?.conNumero ? `/tasar/${landing.slug}` : null, vender: landing ? `/vender/${landing.slug}` : null }
    }
    const casas = de('casa')
    const lotes = de('lote')
    return casas || lotes ? { casas, lotes, actualizado } : null
  } catch (e) {
    console.error('[barrio-mercado]', nombre, e instanceof Error ? e.message : e)
    return null
  }
}

/** "12 casas (la mitad entre USD 350 mil y USD 520 mil) y 8 lotes en venta hoy". */
export function fraseMercado(m: MercadoBarrio): string {
  const partes = [
    m.casas ? `${n(m.casas.n)} ${m.casas.n === 1 ? 'casa' : 'casas'} (la mitad entre ${usdCorto(m.casas.p25)} y ${usdCorto(m.casas.p75)})` : null,
    m.lotes ? `${n(m.lotes.n)} ${m.lotes.n === 1 ? 'lote' : 'lotes'} (la mitad entre ${usdCorto(m.lotes.p25)} y ${usdCorto(m.lotes.p75)})` : null,
  ].filter(Boolean)
  return `${partes.join(' y ')} en venta hoy`
}

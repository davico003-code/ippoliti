// El barrio de la lista de /tasaciones para un nombre del mercado que llega
// desde una landing /tasar (?zona=Kentucky Club de Campo&ciudad=Funes). Hilo
// rechaza un pedido sin barrioId: primero se busca el de la lista (con el
// mismo criterio por palabras de lib/seo/tasar.ts: "Kentucky Club de Campo" =
// "Kentucky"); si no está, un barrio propio con id `zona:` y el nombre tal cual
// (solo si se sabe la ciudad: Hilo también la exige). Sin imports de valores.

import type { BarrioTasacion } from './types'

export const SIN_LISTA = 'zona:'

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const ROMANOS: Record<string, string> = { i: '1', ii: '2', iii: '3', iv: '4', v: '5' }
const RELLENO = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'club', 'campo', 'country', 'barrio', 'privado', 'cerrado'])
const palabras = (s: string) =>
  sinAcentos(s)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && ROMANOS[w] ? ROMANOS[w] : w))
    .filter((w) => !RELLENO.has(w))

const mismaCiudad = (a: string, b?: string) => !b || sinAcentos(a) === sinAcentos(b)

/**
 * El de la lista que es ese barrio: mismo nombre, o uno que lo nombra más
 * completo ("Miraflores" → "Funes Hills Miraflores"), sin empate. Nunca uno
 * MENOS preciso ("Vida Lagoon" no es "Vida"): ahí viaja el nombre del mercado.
 */
export function barrioDeLaLista(barrios: BarrioTasacion[], zona: string, ciudad?: string): BarrioTasacion | null {
  const buscado = palabras(zona)
  if (!buscado.length) return null
  const candidatos = barrios.filter((b) => mismaCiudad(b.ciudad, ciudad))
  const igual = candidatos.find((b) => palabras(b.nombre).join(' ') === buscado.join(' '))
  if (igual) return igual
  const parecidos = candidatos
    .map((b) => {
      const pb = new Set(palabras(b.nombre))
      return { b, comparte: buscado.every((w) => pb.has(w)) && buscado.some((w) => /[a-z]/.test(w)) ? pb.size : 0 }
    })
    .filter((x) => x.comparte > 0)
    // El que menos agrega (el más parecido); con empate, no se adivina.
    .sort((x, y) => x.comparte - y.comparte)
  if (!parecidos.length || (parecidos.length > 1 && parecidos[1].comparte === parecidos[0].comparte)) return null
  return parecidos[0].b
}

/** El barrio para el pedido: el de la lista, o uno propio con el nombre del mercado (solo con ciudad). */
export function barrioParaPedido(barrios: BarrioTasacion[], zona: string, ciudad?: string): BarrioTasacion | null {
  const deLista = barrioDeLaLista(barrios, zona, ciudad)
  if (deLista) return deLista
  const nombre = zona.trim().slice(0, 80)
  const c = ciudad?.trim().slice(0, 40)
  if (!nombre || !c) return null
  const clave = sinAcentos(nombre)
  return {
    id: `${SIN_LISTA}${clave}`.slice(0, 64),
    nombre,
    slug: clave.replace(/[^a-z0-9]+/g, '-'),
    ciudad: c,
    esCerrado: null,
    centroide: null,
    m2Tipico: { lote: null, cubiertos: null },
    tiene: { casas: 0, lotes: 0, deptos: 0 },
  }
}

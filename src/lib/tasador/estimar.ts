// LA CUENTA DEL TASADOR de las landings /tasar (David, 8-oct-2026: "por
// barrio, la tierra y la construcción por m², y con eso inferir bien cuánto
// vale una propiedad"). Los números de cada barrio los arma Hilo con todos los
// avisos en venta (feed-en-red/tasador-zonas.ts allá) y esta es la MISMA cuenta
// que usa Hilo para medir cuánto erra: si cambia una, cambia la otra (los
// casos de estimar.test.mjs son los mismos que los de Hilo).
//
//   Casa  = promedio de dos miradas (donde la tierra explica el precio: Funes y Roldán)
//             m² cubiertos × USD/m² de las casas del barrio
//             lote × USD/m² de la tierra + m² cubiertos × USD/m² de lo construido
//           ajustadas por tamaño (lo grande vale menos por m²) y por antigüedad
//           (contra la típica del barrio).
//   Lote  = m² × USD/m² de la tierra del barrio, ajustado por tamaño.
//   Depto = m² × USD/m² de los deptos del barrio, por tamaño y antigüedad.
//
// Sin imports de servidor: la usa la calculadora en el navegador.

import type { ModeloTasador, ParamsTasador, TipoHiloTasador } from './tipos'

/** Con un error típico mayor no se da número: sería tirar cualquier valor. */
export const ERROR_MAXIMO = 0.3

/** La versión de esta cuenta (Hilo manda la suya en modelo.version: si no coinciden, no se da número). */
export const VERSION_ESTIMAR = 1

/** ¿Se da número? Lo decide Hilo; acá solo se obedece, y sin la misma versión de la cuenta, no. */
export const daNumero = (p: ParamsTasador | null | undefined, modelo: Pick<ModeloTasador, 'version'>) => !!p && p.daNumero && modelo.version === VERSION_ESTIMAR

/** 0-2, 3-10, 11-20, 21-35, 36+ años (los tramos de la curva de HILO). */
export const tramoEdad = (a: number): number => (a <= 2 ? 0 : a <= 10 ? 1 : a <= 20 ? 2 : a <= 35 ? 3 : 4)

/** Lo que se le pregunta a la persona: un tramo, con unos años que caen adentro. */
export const EDADES: { id: number; texto: string; anios: number }[] = [
  { id: 0, texto: 'A estrenar o hasta 2 años', anios: 1 },
  { id: 1, texto: '3 a 10 años', anios: 6 },
  { id: 2, texto: '11 a 20 años', anios: 15 },
  { id: 3, texto: '21 a 35 años', anios: 28 },
  { id: 4, texto: 'Más de 35 años', anios: 45 },
]

export type EntradaEstimar = { tipo: TipoHiloTasador; m2: number; lote?: number | null; ant?: number | null }

const factorEdad = (curva: number[], ant: number | null | undefined, antTipica: number | null | undefined): number =>
  ant == null ? 1 : curva[tramoEdad(ant)] / (antTipica == null ? 1 : curva[tramoEdad(antTipica)])

const factorTamano = (sup: number, tipico: number, beta: number): number => Math.pow(sup / tipico, beta - 1)

/** La cuenta. null = no hay con qué (sin metros). */
export function estimar(e: EntradaEstimar, p: ParamsTasador, modelo: Pick<ModeloTasador, 'curvaEdad' | 'beta'>, mixto: boolean): number | null {
  if (!(e.m2 > 0)) return null
  if (e.tipo === 'lote') return e.m2 * p.usdM2 * factorTamano(e.m2, p.m2Tipico, modelo.beta.lote)
  const curva = modelo.curvaEdad[e.tipo]
  const ajuste = factorTamano(e.m2, p.m2Tipico, modelo.beta[e.tipo]) * factorEdad(curva, e.ant, p.antTipica)
  const porM2 = e.m2 * p.usdM2 * ajuste
  if (e.tipo === 'depto' || !mixto || p.tierraM2 == null || p.construccionM2 == null) return porM2
  const lote = e.lote ?? p.loteTipico
  if (!lote) return porM2
  return (porM2 + (lote * p.tierraM2 + e.m2 * p.construccionM2 * ajuste)) / 2
}

/** Redondeo para leer: a 5 mil hasta 1 millón, a 10 mil arriba. */
export function redondear(usd: number): number {
  const paso = usd >= 1_000_000 ? 10_000 : 5_000
  return Math.round(usd / paso) * paso
}

export type Resultado = { valor: number; desde: number; hasta: number; error: number }

/** El número y su banda: la mitad de las publicadas del barrio cae adentro. null = no damos número. */
export function resultado(valor: number | null, error: number): Resultado | null {
  if (valor == null || !Number.isFinite(valor) || valor <= 0 || error > ERROR_MAXIMO) return null
  return { valor: redondear(valor), desde: redondear(valor * (1 - error)), hasta: redondear(valor * (1 + error)), error }
}

/** 0,183 → "18 %" */
export const porcentaje = (x: number) => `${Math.round(x * 100)} %`

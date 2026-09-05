// Fixtures para desarrollar la página de tasación sin la API de Hilo
// (HILO_TASACION_MOCK=1, o Hilo 404/5xx en desarrollo). NO se usan en producción.
//
// Los barrios y centroides son reales (mismo catálogo que src/lib/tasador/barrios.ts);
// los precios son de ejemplo y reproducen los tres escenarios del mockup:
//   · Miraflores  → nivel 1 (6 casas en el barrio)
//   · Las Tardes  → nivel 2 (8 casas en la zona)
//   · Funes Lakes → nivel 4 (no alcanza para un rango)
//   · Kentucky lote → n = 0: rango por la referencia que relevó SI Inmobiliaria,
//     sin avisos publicados (el caso real de prod que se controló el 5-sep-2026)

import type { BarrioTasacion, ComparablesQuery, ComparablesResponse, TipoTasacion } from './types'

const b = (
  slug: string,
  nombre: string,
  ciudad: BarrioTasacion['ciudad'],
  esCerrado: boolean,
  lat: number,
  lng: number,
  lote: number | null,
  cubiertos: number | null,
  casas: number,
  lotes: number,
  deptos: number,
): BarrioTasacion => ({
  id: `mock-${slug}`,
  slug,
  nombre,
  ciudad,
  esCerrado,
  centroide: { lat, lng },
  m2Tipico: { lote, cubiertos },
  tiene: { casas, lotes, deptos },
})

export const FIXTURE_BARRIOS: BarrioTasacion[] = [
  // Funes
  b('miraflores', 'Miraflores', 'Funes', true, -32.92681, -60.84021, 800, 220, 6, 4, 0),
  b('kentucky', 'Kentucky', 'Funes', true, -32.94339, -60.82799, 900, 240, 5, 3, 0),
  b('san-sebastian', 'San Sebastián', 'Funes', true, -32.93342, -60.8082, 750, 200, 4, 5, 0),
  b('vida', 'Vida', 'Funes', false, -32.93143, -60.79352, 600, 180, 3, 2, 0),
  b('funes-lakes', 'Funes Lakes', 'Funes', true, -32.93669, -60.79824, 800, 210, 2, 7, 0),
  b('funes-centro', 'Funes Centro', 'Funes', false, -32.91876, -60.8109, 350, 150, 4, 2, 3),
  b('aero-funes', 'Aero Funes', 'Funes', false, -32.92334, -60.77602, 600, 150, 3, 6, 0),
  // Roldán
  b('las-tardes', 'Las Tardes', 'Roldán', false, -32.88678, -60.88107, 400, 120, 3, 2, 0),
  b('tierra-de-suenos-2', 'Tierra de Sueños 2', 'Roldán', false, -32.93116, -60.89312, 500, 130, 5, 8, 0),
  b('distrito-roldan', 'Distrito Roldán', 'Roldán', false, -32.91138, -60.88838, 400, 140, 4, 6, 0),
  b('puerto-roldan', 'Puerto Roldán', 'Roldán', true, -32.93353, -60.88506, 700, 200, 3, 2, 0),
  b('acequias-del-aire', 'Acequias del Aire', 'Roldán', false, -32.89737, -60.87255, 450, 120, 3, 2, 0),
  // Rosario
  b('fisherton', 'Fisherton', 'Rosario', false, -32.92, -60.73, 450, 220, 5, 2, 4),
  b('pichincha', 'Pichincha', 'Rosario', false, -32.935, -60.648, null, 70, 0, 0, 6),
  b('centro-rosario', 'Centro', 'Rosario', false, -32.9468, -60.6393, null, 65, 0, 0, 8),
]

const PERIODO = 'agosto 2026'

function barrioRef(barrio: BarrioTasacion): NonNullable<ComparablesResponse['barrio']> {
  return { id: barrio.id, nombre: barrio.nombre, ciudad: barrio.ciudad, esCerrado: barrio.esCerrado }
}

export function fixtureNivel4(barrio: BarrioTasacion | null): ComparablesResponse {
  return {
    nivel: 4,
    ambito: null,
    n: 0,
    rango: null,
    unidad: null,
    descripcion: '',
    periodo: PERIODO,
    muestras: [],
    barrio: barrio ? barrioRef(barrio) : null,
  }
}

const plural: Record<TipoTasacion, string> = { casa: 'casas', lote: 'lotes', depto: 'departamentos' }

export function mockComparables(q: ComparablesQuery): ComparablesResponse {
  const barrio = FIXTURE_BARRIOS.find((x) => x.id === q.barrioId || x.slug === q.barrioId) ?? null
  if (!barrio) return fixtureNivel4(null)

  // Escenario 1 · Miraflores, casa → nivel 1 con 6 casas del barrio.
  if (barrio.slug === 'miraflores' && q.tipo === 'casa') {
    return {
      nivel: 1,
      ambito: 'barrio',
      n: 6,
      rango: { min: 350000, max: 545000 },
      unidad: 'total',
      descripcion: 'según 6 casas de 180 a 260 m² publicadas en Miraflores',
      periodo: PERIODO,
      muestras: [
        { precio: 390000, m2Cubiertos: 203, m2Lote: 800, dormitorios: 2, fuente: 'portal' },
        { precio: 429000, m2Cubiertos: 210, m2Lote: 900, dormitorios: 4, fuente: 'portal' },
        { precio: 545000, m2Cubiertos: 196, m2Lote: 1100, dormitorios: 3, fuente: 'portal' },
      ],
      precios: [350000, 390000, 395000, 429000, 460000, 545000],
      barrio: barrioRef(barrio),
    }
  }

  // Escenario 2 · Las Tardes, casa → nivel 2: pocas en el barrio, ampliamos a la zona.
  if (barrio.slug === 'las-tardes' && q.tipo === 'casa') {
    return {
      nivel: 2,
      ambito: 'zona',
      n: 8,
      rango: { min: 82750, max: 153250 },
      unidad: 'total',
      descripcion: 'según 8 casas de 90 a 160 m² publicadas cerca de Las Tardes',
      periodo: PERIODO,
      muestras: [
        { precio: 95000, m2Cubiertos: 98, m2Lote: 300, dormitorios: 2, fuente: 'portal' },
        { precio: 118000, m2Cubiertos: 120, m2Lote: 360, dormitorios: 3, fuente: 'portal' },
        { precio: 139000, m2Cubiertos: 145, m2Lote: 400, dormitorios: 3, fuente: 'portal' },
      ],
      precios: [82750, 95000, 99000, 118000, 125000, 139000, 148000, 153250],
      barrio: barrioRef(barrio),
    }
  }

  // Escenario 4 · Funes Lakes → sin datos suficientes.
  if (barrio.slug === 'funes-lakes') return fixtureNivel4(barrio)

  // Kentucky, lote → n = 0: sin avisos del barrio, el rango sale del valor de referencia
  // que relevó SI Inmobiliaria (mismo shape que devuelve Hilo en prod). Sin gráfico ni tarjetas.
  if (barrio.slug === 'kentucky' && q.tipo === 'lote') {
    const m2 = q.m2Lote && q.m2Lote > 0 ? q.m2Lote : 900
    const aMiles = (x: number) => Math.max(1000, Math.round(x / 1000) * 1000)
    return {
      nivel: 1,
      ambito: 'barrio',
      n: 0,
      rango: { min: aMiles(170 * m2 * 0.9), max: aMiles(170 * m2 * 1.1) },
      unidad: 'total',
      descripcion: 'según el valor de referencia que relevó SI Inmobiliaria para Kentucky (USD 170 por m² de tierra)',
      periodo: 'referencia de agosto de 2026',
      muestras: [],
      barrio: barrioRef(barrio),
    }
  }

  // Lotes: rango en USD/m² a nivel barrio.
  if (q.tipo === 'lote') {
    const base = barrio.ciudad === 'Rosario' ? 400 : barrio.esCerrado ? 170 : 95
    return {
      nivel: 1,
      ambito: 'barrio',
      n: 5,
      rango: { min: Math.round(base * 0.85), max: Math.round(base * 1.3) },
      unidad: 'usd_m2',
      descripcion: `según 5 lotes de 500 a 1.000 m² publicados en ${barrio.nombre}`,
      periodo: PERIODO,
      muestras: [
        { precio: Math.round(base * 0.9 * 600), m2Cubiertos: null, m2Lote: 600, dormitorios: null, fuente: 'portal' },
        { precio: Math.round(base * 1.05 * 800), m2Cubiertos: null, m2Lote: 800, dormitorios: null, fuente: 'portal' },
        { precio: Math.round(base * 1.25 * 1000), m2Cubiertos: null, m2Lote: 1000, dormitorios: null, fuente: 'portal' },
      ],
      barrio: barrioRef(barrio),
    }
  }

  // Deptos: nivel 1 en Rosario, nivel 3 (ciudad) en Funes/Roldán.
  if (q.tipo === 'depto') {
    const esRosario = barrio.ciudad === 'Rosario'
    return {
      nivel: esRosario ? 1 : 3,
      ambito: esRosario ? 'barrio' : 'ciudad',
      n: esRosario ? 7 : 9,
      rango: esRosario ? { min: 98000, max: 165000 } : { min: 120000, max: 210000 },
      unidad: 'total',
      descripcion: esRosario
        ? `según 7 departamentos de 55 a 85 m² publicados en ${barrio.nombre}`
        : `según 9 departamentos de 60 a 110 m² publicados en ${barrio.ciudad}`,
      periodo: PERIODO,
      muestras: [
        { precio: 105000, m2Cubiertos: 58, m2Lote: null, dormitorios: 1, fuente: 'portal' },
        { precio: 132000, m2Cubiertos: 72, m2Lote: null, dormitorios: 2, fuente: 'portal' },
        { precio: 158000, m2Cubiertos: 84, m2Lote: null, dormitorios: 2, fuente: 'portal' },
      ],
      barrio: barrioRef(barrio),
    }
  }

  // Casas en el resto: nivel 3, barrios cerrados/abiertos de la ciudad.
  const cerrado = !!barrio.esCerrado
  const rango = cerrado ? { min: 350000, max: 700000 } : { min: 120000, max: 260000 }
  return {
    nivel: 3,
    ambito: 'ciudad',
    n: cerrado ? 21 : 17,
    rango,
    unidad: 'total',
    descripcion: `según ${cerrado ? 21 : 17} ${plural.casa} de 160 a 240 m² publicadas en barrios ${cerrado ? 'cerrados' : 'abiertos'} de ${barrio.ciudad}`,
    periodo: PERIODO,
    muestras: [
      { precio: Math.round(rango.min * 1.1), m2Cubiertos: 170, m2Lote: 600, dormitorios: 3, fuente: 'portal' },
      { precio: Math.round((rango.min + rango.max) / 2), m2Cubiertos: 205, m2Lote: 800, dormitorios: 3, fuente: 'portal' },
      { precio: Math.round(rango.max * 0.92), m2Cubiertos: 235, m2Lote: 1000, dormitorios: 4, fuente: 'portal' },
    ],
    barrio: barrioRef(barrio),
  }
}

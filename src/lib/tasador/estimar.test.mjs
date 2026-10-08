// La cuenta del tasador (estimar.ts) es GEMELA de la de Hilo (si-crm:
// src/lib/feed-en-red/tasador-zonas.ts, con la que se mide el error de cada
// barrio). Mismos casos que tasador-zonas.test.ts allá: si una cambia y la otra
// no, esto se rompe.  Correr: node --test src/lib/tasador/estimar.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { daNumero, estimar, resultado, tramoEdad, VERSION_ESTIMAR } from './estimar.ts'

const modelo = {
  curvaEdad: { casa: [1.05, 1.05, 1.05, 0.99, 0.93], depto: [1.06, 1.03, 0.92, 0.72, 0.64] },
  beta: { casa: 0.8, lote: 0.8, depto: 1 },
}
const kentucky = { n: 55, usdM2: 2_860, m2Tipico: 330, loteTipico: 1_130, antTipica: 6, tierraM2: 320, construccionM2: 1_850, error: 0.2, daNumero: true, errorPropio: true }

test('tramos de antigüedad: 0-2, 3-10, 11-20, 21-35, 36+', () => {
  assert.deepEqual([0, 2, 3, 10, 11, 20, 21, 35, 36, 80].map(tramoEdad), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4])
})

test('la casa típica del barrio vale lo típico', () => {
  assert.equal(Math.round(estimar({ tipo: 'casa', m2: 330, lote: 1_130, ant: 6 }, kentucky, modelo, false)), 330 * 2_860)
})

test('mixto: promedio de m² × USD/m² y tierra + construcción', () => {
  assert.equal(Math.round(estimar({ tipo: 'casa', m2: 330, lote: 1_130, ant: 6 }, kentucky, modelo, true)), Math.round((330 * 2_860 + 1_130 * 320 + 330 * 1_850) / 2))
})

test('sin lote usa el típico; más lote suma por la tierra', () => {
  assert.equal(estimar({ tipo: 'casa', m2: 330, ant: 6 }, kentucky, modelo, true), estimar({ tipo: 'casa', m2: 330, lote: 1_130, ant: 6 }, kentucky, modelo, true))
  const chico = estimar({ tipo: 'casa', m2: 330, lote: 800, ant: 6 }, kentucky, modelo, true)
  const grande = estimar({ tipo: 'casa', m2: 330, lote: 2_000, ant: 6 }, kentucky, modelo, true)
  assert.ok(Math.abs(grande - chico - (1_200 * 320) / 2) < 1)
})

test('la antigüedad cuenta contra la típica del barrio (deptos)', () => {
  const p = { n: 100, usdM2: 2_000, m2Tipico: 70, antTipica: 15, error: 0.18 }
  assert.equal(Math.round(estimar({ tipo: 'depto', m2: 70, ant: 0 }, p, modelo, false)), Math.round((70 * 2_000 * 1.06) / 0.92))
  assert.equal(Math.round(estimar({ tipo: 'depto', m2: 70, ant: 40 }, p, modelo, false)), Math.round((70 * 2_000 * 0.64) / 0.92))
})

test('lote y sin metros', () => {
  assert.equal(estimar({ tipo: 'lote', m2: 1_000 }, { n: 40, usdM2: 300, m2Tipico: 1_000, error: 0.15 }, modelo, false), 300_000)
  assert.equal(estimar({ tipo: 'casa', m2: 0 }, kentucky, modelo, true), null)
})

test('con más de 30 % de error no hay número; si no, banda redondeada', () => {
  assert.equal(resultado(300_000, 0.31), null)
  assert.deepEqual(resultado(951_234, 0.2), { valor: 950_000, desde: 760_000, hasta: 1_140_000, error: 0.2 })
})

test('da número solo si Hilo lo dice y con la misma versión de la cuenta', () => {
  assert.equal(daNumero(kentucky, { version: VERSION_ESTIMAR }), true)
  assert.equal(daNumero({ ...kentucky, daNumero: false }, { version: VERSION_ESTIMAR }), false)
  assert.equal(daNumero(kentucky, { version: VERSION_ESTIMAR + 1 }), false)
  assert.equal(daNumero(null, { version: VERSION_ESTIMAR }), false)
})

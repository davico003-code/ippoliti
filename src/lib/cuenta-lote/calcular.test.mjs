// Correr: node --test src/lib/cuenta-lote/calcular.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cuentaDelLote, diaMes, enPiloto, pct, tenenciaDeLote, usd } from './calcular.ts'

const barrio = {
  slug: 'funes-lakes',
  nombre: 'Funes Lakes',
  ciudad: 'Funes',
  expensas: { loteArs: 200_000, casaArs: 250_000, origen: 'tabla', actualizado: '2026-09-28' },
  lote: { n: 118, tipicoUsd: 90_000, m2Tipico: 550 },
  tenencia: null,
  tierra: null,
  construir: null,
}
const cuenta = { barrio, dolar: { valor: 1550, fuente: 'prueba', fecha: '2026-11-08' }, costoObraUsdM2: 1474, aniosTenencia: 5 }

test('tenenciaDeLote: gemela de Hilo (200.000 ARS a 1.550 sobre USD 100.000)', () => {
  assert.deepEqual(tenenciaDeLote({ expensasArs: 200_000, dolar: 1550, precioUsd: 100_000, anios: 5 }), {
    mensualUsd: 129,
    anualPct: 1.5,
    cincoAniosUsd: 7700,
    cincoAniosPct: 7.7,
  })
  assert.equal(tenenciaDeLote({ expensasArs: null, dolar: 1550, precioUsd: 100_000, anios: 5 }), null)
  assert.equal(tenenciaDeLote({ expensasArs: 200_000, dolar: null, precioUsd: 100_000, anios: 5 }), null)
})

test('cuentaDelLote: la expensa del lote manda, si no la del barrio; sin precio público, el lote típico', () => {
  const propia = cuentaDelLote(cuenta, { precioUsd: 125_000, expensasArs: 260_000 })
  assert.equal(propia.expensasOrigen, 'lote')
  assert.equal(propia.base, 'lote')
  assert.equal(propia.tenencia.mensualUsd, 168)
  const delBarrio = cuentaDelLote(cuenta, { precioUsd: 125_000, expensasArs: null })
  assert.equal(delBarrio.expensasOrigen, 'barrio')
  assert.equal(delBarrio.tenencia.cincoAniosPct, 6.2)
  const sinPrecio = cuentaDelLote(cuenta, { precioUsd: null, expensasArs: null })
  assert.equal(sinPrecio.base, 'tipico')
  assert.equal(sinPrecio.tenencia.cincoAniosPct, 8.6)
  const sinNada = cuentaDelLote({ ...cuenta, dolar: null }, { precioUsd: 125_000, expensasArs: null })
  assert.deepEqual(sinNada, { tenencia: null, expensasOrigen: null, base: null })
})

test('formato', () => {
  assert.equal(usd(7700), 'USD 7.700')
  assert.equal(pct(-16.9), '−17 %')
  assert.equal(pct(10.4), '+10 %')
  assert.equal(pct(0.04), '0 %')
  assert.equal(pct(-2.7, 1), '−2,7 %')
  assert.equal(diaMes('2026-09-30'), '30 de septiembre')
  assert.equal(enPiloto('funes-lakes'), true)
  assert.equal(enPiloto('kentucky'), false)
  assert.equal(enPiloto(null), false)
})

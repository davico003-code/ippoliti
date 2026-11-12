import assert from 'node:assert/strict'
import test from 'node:test'
import { esPlanoPdf, planoParado, planoParaCaja } from './planos.ts'

const HILO = 'https://meethilo.com/api/public/plano/8fce26b9-cf4f-4588-ac61-eaee693fba8c?r=1'

test('el plano de Hilo tiene versión parada', () => {
  assert.equal(planoParado(HILO), `${HILO}&vertical=1`)
  assert.equal(planoParado(`${HILO}&vertical=1`), `${HILO}&vertical=1`)
})

test('los planos que no sirve Hilo quedan igual', () => {
  const firmada = 'https://x.supabase.co/storage/v1/object/sign/property-media/a/plano.jpg?token=abc'
  assert.equal(planoParado(firmada), firmada)
  assert.equal(planoParado('https://static.tokkobroker.com/pictures/1.jpg'), 'https://static.tokkobroker.com/pictures/1.jpg')
})

test('la caja decide: parada solo si es más alta que ancha', () => {
  assert.equal(planoParaCaja(HILO, false), HILO)
  assert.equal(planoParaCaja(HILO, true), `${HILO}&vertical=1`)
})

test('detecta el PDF firmado', () => {
  assert.equal(esPlanoPdf('https://x.supabase.co/storage/v1/object/sign/property-media/a/plano.pdf?token=abc'), true)
  assert.equal(esPlanoPdf(HILO), false)
})

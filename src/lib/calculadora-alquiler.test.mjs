import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./calculadora-alquiler.ts', import.meta.url),
  'utf8',
)

test('calcula el sellado comercial al 0,25% del total del contrato', () => {
  const match = source.match(/comercio:\s*([\d.]+),/)
  assert.ok(match, 'debe existir una tasa de sellado para comercio')

  const tasaComercio = Number(match[1])
  assert.equal(tasaComercio, 0.0025)
  assert.equal(500_000 * 36 * tasaComercio, 45_000)
  assert.match(
    source,
    /sellado = totalContratoArs \* SELLADO_PCT\[tipo\]/,
    'el sellado debe aplicar la tasa sobre el total del contrato en pesos',
  )
})

// Correr: npx tsx --test src/lib/distrito-roldan/financiacion.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loteTipico, resumirPlano, cuotaDelFinDeObra } from './financiacion.ts'

const RES = { anticipoPct: 30, cuotas: 24 }

test('el ejemplo es el lote que más se repite, no el más barato', () => {
  const lotes = [
    { precio: 37736, sup: 443.95 },
    { precio: 42175, sup: 443.95 },
    ...Array(9).fill({ precio: 45600, sup: 480 }),
    ...Array(6).fill({ precio: 46444, sup: 546.4 }),
    ...Array(7).fill({ precio: 51908, sup: 546.4 }),
  ]
  assert.deepEqual(loteTipico(lotes, RES), { precio: 45600, sup: 480, entrega: 13680, cuota: 1330 })
})

test('si todos los precios son distintos, el más cercano a la mediana', () => {
  const lotes = [10, 20, 30, 40, 50].map((precio) => ({ precio, sup: null }))
  assert.equal(loteTipico(lotes, RES).precio, 30)
})

test('sin lotes con precio no hay ejemplo', () => {
  assert.equal(loteTipico([], RES), null)
})

test('resumirPlano no expone ningún "desde"', () => {
  const r = resumirPlano({
    lotes: {
      3: { estado: 'v' },
      50: { estado: 'd', precio: 37736, sup: 443.95 },
      51: { estado: 'd', precio: 45600, sup: 480 },
      52: { estado: 'd', precio: 45600, sup: 480 },
      53: { estado: 'v' },
      54: { estado: 'n' },
    },
  })
  assert.equal(r.residencial.tipico.precio, 45600)
  assert.equal('desde' in r.residencial, false)
  assert.equal('cuotaDesde' in r.residencial, false)
  assert.deepEqual(r.vendidosNros, [3, 53])
  assert.equal(r.vendidos, 2)
})

test('agosto 2027 cae en la cuota 10 para quien firma en octubre 2026', () => {
  assert.equal(cuotaDelFinDeObra(new Date(2026, 9, 22), 24), 10)
  assert.equal(cuotaDelFinDeObra(new Date(2027, 0, 5), 24), 7)
  assert.equal(cuotaDelFinDeObra(new Date(2027, 7, 1), 24), null)
})

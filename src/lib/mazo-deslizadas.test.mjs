import assert from 'node:assert/strict'
import test from 'node:test'
import { resumenDeslizadas, usdDe } from './mazo-deslizadas.ts'

const casa = (key, accion, usd, dorm, zona) => ({ key, accion, precio: usd ? `USD ${usd.toLocaleString('es-AR')}` : 'Consultar precio', dorm, zona })

test('lee dólares en los formatos de las tarjetas', () => {
  assert.equal(usdDe('USD 395.000'), 395000)
  assert.equal(usdDe('U$S 1.200.000'), 1200000)
  assert.equal(usdDe('$ 850.000'), null)
  assert.equal(usdDe('Consultar precio'), null)
})

test('con menos de 3 no dice nada', () => {
  assert.equal(resumenDeslizadas([casa('a', 'like', 400000, 3, 'Vida'), casa('b', 'pass', 300000, 2, 'Vida')]), null)
})

test('el caso de David: pasó todas las de menos de 3 dormitorios', () => {
  const ds = [
    casa('a', 'like', 395000, 3, 'Funes Lakes'),
    casa('b', 'like', 450000, 4, 'Vida'),
    casa('c', 'super', 420000, 3, 'Funes Lakes'),
    casa('d', 'pass', 300000, 2, 'Funes'),
    casa('e', 'pass', 280000, 2, 'Funes'),
    casa('f', 'pass', 410000, 1, 'Vida'),
    casa('g', 'pass', 390000, 2, 'Kentucky'),
    casa('h', 'pass', 500000, 4, 'Vida'),
  ]
  assert.equal(
    resumenDeslizadas(ds),
    'Deslizó 8: le gustaron 3 (USD 395–450 mil · 3–4 dorm · Funes Lakes, Vida · pidió visitar 1) y pasó 5 (la mayoría de menos de 3 dorm).',
  )
})

test('pasó las caras', () => {
  const ds = [casa('a', 'like', 200000, null, 'Roldán'), casa('b', 'pass', 350000, null, 'Roldán'), casa('c', 'pass', 400000, null, 'Roldán'), casa('d', 'pass', 380000, null, 'Funes')]
  assert.equal(resumenDeslizadas(ds), 'Deslizó 4: le gustó 1 (USD 200 mil · Roldán) y pasó 3 (la mayoría arriba de USD 200 mil).')
})

test('no marcó ninguna: el rango y las zonas de lo que miró', () => {
  const ds = [casa('a', 'pass', 180000, 2, 'Funes'), casa('b', 'pass', 420000, 3, 'Roldán'), casa('c', 'pass', 250000, 3, 'Funes')]
  assert.equal(resumenDeslizadas(ds), 'Deslizó 3 y no marcó ninguna (USD 180–420 mil · Funes, Roldán).')
})

test('la última decisión de cada casa manda (↺ y decidir de nuevo)', () => {
  const ds = [casa('a', 'pass', 300000, 3, 'Vida'), casa('b', 'like', 310000, 3, 'Vida'), casa('c', 'like', 320000, 3, 'Vida'), casa('a', 'like', 300000, 3, 'Vida')]
  assert.equal(resumenDeslizadas(ds), 'Deslizó 3: le gustaron todas (USD 300–320 mil · 3 dorm · Vida).')
})

test('sin patrón claro no inventa uno', () => {
  const ds = [casa('a', 'like', 300000, 3, 'Vida'), casa('b', 'pass', 310000, 3, 'Vida'), casa('c', 'pass', 290000, 3, 'Vida'), casa('d', 'pass', 305000, 4, 'Vida')]
  assert.equal(resumenDeslizadas(ds), 'Deslizó 4: le gustó 1 (USD 300 mil · 3 dorm · Vida) y pasó 3.')
})

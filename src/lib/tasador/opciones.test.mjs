import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filtrarOpciones, opcionDeLink, sugeridas } from './opciones.ts'

const p = (n, daNumero = true) => ({ n, usdM2: 1000, m2Tipico: 150, error: 0.2, daNumero, errorPropio: true })
const op = (nombre, ciudad, esCiudad, params, slugs = {}) => ({ clave: `${nombre}|${esCiudad ? '' : ciudad}`, nombre, ciudad, esCiudad, etiqueta: esCiudad ? `${nombre}, fuera de barrios` : nombre, mixto: true, params, slugs })

const OPCIONES = [
  op('Funes', 'Funes', true, { casa: p(700) }, { casa: 'casa-funes' }),
  op('Kentucky Club de Campo', 'Funes', false, { casa: p(55), lote: p(40) }, { casa: 'casa-kentucky', lote: 'lote-kentucky' }),
  op('Funes Hills San Marino', 'Funes', false, { casa: p(80) }, { casa: 'casa-funes-hills-san-marino' }),
  op('Alberdi', 'Rosario', false, { casa: p(368, false) }, { casa: 'casa-alberdi' }),
  op('Pichincha', 'Rosario', false, { casa: p(3) }, { casa: 'casa-pichincha' }),
]

test('el buscador encuentra por el comienzo de cualquier palabra, sin acentos', () => {
  assert.deepEqual(filtrarOpciones(OPCIONES, 'casa', 'kent').map((o) => o.nombre), ['Kentucky Club de Campo'])
  assert.deepEqual(filtrarOpciones(OPCIONES, 'casa', 'san mar').map((o) => o.nombre), ['Funes Hills San Marino'])
  assert.deepEqual(filtrarOpciones(OPCIONES, 'casa', 'ALBÉRDI').map((o) => o.nombre), ['Alberdi'])
})

test('el buscador no ofrece barrios con menos de 5 avisos ni tipos sin datos', () => {
  assert.equal(filtrarOpciones(OPCIONES, 'casa', 'pichi').length, 0)
  assert.equal(filtrarOpciones(OPCIONES, 'departamento', 'kent').length, 0)
  assert.equal(filtrarOpciones(OPCIONES, 'casa', '').length, 0)
})

test('sugeridas: barrios que dan número (más avisos primero) y después las ciudades', () => {
  assert.deepEqual(sugeridas(OPCIONES, 'casa').map((o) => o.nombre), ['Funes Hills San Marino', 'Kentucky Club de Campo', 'Funes'])
})

test('?barrio= del link: por slug de landing o por nombre; si no hay datos del tipo, nada', () => {
  assert.equal(opcionDeLink(OPCIONES, 'kentucky', 'lote')?.nombre, 'Kentucky Club de Campo')
  assert.equal(opcionDeLink(OPCIONES, 'Funes Hills San Marino', 'casa')?.nombre, 'Funes Hills San Marino')
  assert.equal(opcionDeLink(OPCIONES, 'pichincha', 'casa'), null)
  assert.equal(opcionDeLink(OPCIONES, '', 'casa'), null)
})

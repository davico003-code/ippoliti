// Correr: npx tsx --test src/lib/tiempos-viaje-destinos.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { destinosPara, proximaHoraPico, minutosDe, normalizarDireccion, direccionParaGoogle } from './tiempos-viaje-destinos.ts'

const claves = (lat, lng) => destinosPara(lat, lng).map((d) => d.clave)

test('Funes Lakes: Rosario, Fisherton, el centro de Funes y el aeropuerto', () => {
  assert.deepEqual(claves(-32.9348, -60.7964), ['rosario', 'fisherton', 'funes', 'aeropuerto'])
})

test('Roldán: el centro local es el de Roldán, no el de Funes', () => {
  assert.deepEqual(claves(-32.8935, -60.8890), ['rosario', 'fisherton', 'roldan', 'aeropuerto'])
})

test('en pleno centro de Funes no se mide al centro de Funes', () => {
  assert.ok(!claves(-32.9205, -60.8110).includes('funes'))
})

test('en el centro de Rosario no se mide al centro de Rosario ni a un centro de pueblo', () => {
  assert.deepEqual(claves(-32.9468, -60.6393), ['fisherton', 'aeropuerto'])
})

test('fuera de la zona (Bariloche) no hay destinos', () => {
  assert.deepEqual(claves(-41.1335, -71.3103), [])
})

test('hora pico: el martes siguiente a las 8 de Argentina (11 UTC), al menos un día adelante', () => {
  // Lunes 19 → martes 20
  assert.equal(proximaHoraPico(new Date('2026-10-19T15:00:00Z')).toISOString(), '2026-10-20T11:00:00.000Z')
  // Martes 20 (aunque sea antes de las 8) → el martes siguiente, 27
  assert.equal(proximaHoraPico(new Date('2026-10-20T09:00:00Z')).toISOString(), '2026-10-27T11:00:00.000Z')
  // Miércoles 21 → martes 27
  assert.equal(proximaHoraPico(new Date('2026-10-21T15:00:00Z')).toISOString(), '2026-10-27T11:00:00.000Z')
  // Lunes 26 → martes 27 (un día adelante)
  assert.equal(proximaHoraPico(new Date('2026-10-26T12:00:00Z')).toISOString(), '2026-10-27T11:00:00.000Z')
})

test('minutos de la duración de Google', () => {
  assert.equal(minutosDe('1689s'), 28)
  assert.equal(minutosDe('20s'), 1)
  assert.equal(minutosDe(undefined), null)
  assert.equal(minutosDe('0s'), null)
})

test('dirección del visitante: normalizada para el caché y acotada a Santa Fe', () => {
  assert.equal(normalizarDireccion('  Bv.  Oroño 1200,  ROSARIO '), 'bv. orono 1200, rosario')
  assert.equal(normalizarDireccion('ab'), null)
  assert.equal(direccionParaGoogle('Oroño 1200, Rosario'), 'Oroño 1200, Rosario, Santa Fe, Argentina')
  assert.equal(direccionParaGoogle('Córdoba 1000, Rosario, Santa Fe'), 'Córdoba 1000, Rosario, Santa Fe')
})

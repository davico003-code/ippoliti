import assert from 'node:assert/strict'
import test from 'node:test'
import { enLaZona, mismoBarrio } from './feed-en-red.ts'

// Funes Lakes y Aguadas: barrios distintos de Funes, a unos 4 km.
const funesLakes = { barrio: 'Funes Lakes', lat: -32.9235, lng: -60.8295, precioUsd: 415000 }

test('el mismo barrio entra aunque falte el pin', () => {
  assert.equal(enLaZona(funesLakes, { barrio: 'Funes Lakes', lat: null, lng: null, precioUsd: 450000 }), true)
})

test('otro barrio lejos NO entra (el caso de David: Aguadas mirando Funes Lakes)', () => {
  assert.equal(enLaZona(funesLakes, { barrio: 'Aguadas', lat: -32.9420, lng: -60.7900, precioUsd: 450000 }), false)
})

test('otro barrio cerrado PEGADO tampoco entra: en un barrio con nombre, solo ese barrio', () => {
  assert.equal(enLaZona(funesLakes, { barrio: 'San Sebastian', lat: -32.9300, lng: -60.8350, precioUsd: 420000 }), false)
})

test('ficha en zona abierta ("Funes"): entran las de a menos de 1,5 km', () => {
  const funes = { barrio: 'Funes', lat: -32.9170, lng: -60.8090, precioUsd: 200000 }
  assert.equal(enLaZona(funes, { barrio: 'Funes', lat: -32.9200, lng: -60.8150, precioUsd: 210000 }), true)
  assert.equal(enLaZona(funes, { barrio: 'Funes', lat: -32.9420, lng: -60.7900, precioUsd: 210000 }), false)
})

test('precio muy distinto no entra aunque sea del barrio', () => {
  assert.equal(enLaZona(funesLakes, { barrio: 'Funes Lakes', lat: null, lng: null, precioUsd: 1200000 }), false)
})

test('nombres de barrio escritos distinto', () => {
  assert.equal(mismoBarrio('Vida Crystal Lagoon', 'Vida Lagoon'), true)
  assert.equal(mismoBarrio('Miraflores (Funes Hills)', 'Funes Hills Miraflores'), true)
  assert.equal(mismoBarrio('Tierra de Sueños 1', 'Tierra de Sueños 3'), false)
  assert.equal(mismoBarrio('Funes', 'Funes'), false)
})

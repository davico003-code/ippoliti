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

test('Conocé tu próximo hogar: barrio con nombre → solo ese barrio', async () => {
  const { enZonaBuscada } = await import('./feed-en-red.ts')
  assert.equal(enZonaBuscada('Funes Lakes', { nombre: 'Funes Lakes', completa: 'Argentina | Santa Fe | Funes | Funes Lakes' }), true)
  assert.equal(enZonaBuscada('Vida Lagoon', { nombre: 'Vida Crystal Lagoon', completa: 'Argentina | Santa Fe | Funes | Countries/B. Cerrado (Funes) | Vida Crystal Lagoon' }), true)
  assert.equal(enZonaBuscada('Funes Lakes', { nombre: 'Funes', completa: 'Argentina | Santa Fe | Funes' }), false)
  assert.equal(enZonaBuscada('Fisherton', { nombre: 'Fisherton - Tierra Nueva', completa: 'Argentina | Santa Fe | Rosario | Fisherton - Tierra Nueva' }), true)
})

test('Conocé tu próximo hogar: ciudad → toda la ciudad (también "San Lorenzo | Roldan")', async () => {
  const { enZonaBuscada } = await import('./feed-en-red.ts')
  assert.equal(enZonaBuscada('Funes', { nombre: 'Funes Lakes', completa: 'Argentina | Santa Fe | Funes | Funes Lakes' }), true)
  assert.equal(enZonaBuscada('Roldán', { nombre: 'Roldan', completa: 'Argentina | Santa Fe | San Lorenzo | Roldan' }), true)
  assert.equal(enZonaBuscada('Funes', { nombre: 'Centro', completa: 'Argentina | Santa Fe | Rosario | Centro' }), false)
})

test('Conocé tu próximo hogar: tope = hasta el tope y desde la mitad', async () => {
  const { entraEnTope } = await import('./feed-en-red.ts')
  assert.equal(entraEnTope(200000, 200000), true)
  assert.equal(entraEnTope(210000, 200000), false)
  assert.equal(entraEnTope(90000, 200000), false)
  assert.equal(entraEnTope(90000, null), true)
  assert.equal(entraEnTope(null, null), false)
})

test('sugerirZonas: "Los tronco" encuentra Los Troncos (el caso de David)', async () => {
  const { sugerirZonas } = await import('./feed-en-red.ts')
  const cat = [
    { nombre: 'Funes', ciudad: 'Funes', esCiudad: true, casas: 2000, lotes: 3000, deptos: 600 },
    { nombre: 'Los Troncos', ciudad: 'Funes', esCiudad: false, casas: 20, lotes: 10, deptos: 0 },
    { nombre: 'Tierra de Sueños III', ciudad: 'Roldán', esCiudad: false, casas: 200, lotes: 200, deptos: 0 },
    { nombre: 'Tierra de Sueños II', ciudad: 'Roldán', esCiudad: false, casas: 100, lotes: 40, deptos: 0 },
  ]
  assert.deepEqual(sugerirZonas(cat, 'Los tronco', 'house').map((z) => z.nombre), ['Los Troncos'])
  assert.deepEqual(sugerirZonas(cat, 'tierra de sueños 3', 'house').map((z) => z.nombre), ['Tierra de Sueños III'])
  assert.deepEqual(sugerirZonas(cat, 'tierra', 'house').map((z) => z.nombre), ['Tierra de Sueños III', 'Tierra de Sueños II'])
  assert.deepEqual(sugerirZonas(cat, 'fun', 'house').map((z) => z.nombre), ['Funes'])
  assert.deepEqual(sugerirZonas(cat, 'x', 'house'), [])
})

test('lineaDireccion: calle | barrio | ciudad sin repetir', async () => {
  const { lineaDireccion } = await import('./feed-en-red.ts')
  assert.equal(lineaDireccion(['Espora al 3700', 'Funes', 'Funes']), 'Espora al 3700 | Funes')
  assert.equal(lineaDireccion(['Av. Arturo Illia 1515', 'San Sebastián', 'Funes']), 'Av. Arturo Illia 1515 | San Sebastián | Funes')
  assert.equal(lineaDireccion([null, 'Kentucky', 'Funes']), 'Kentucky | Funes')
  assert.equal(lineaDireccion([null, null, null]), null)
})

test('textoBusqueda y esEmail', async () => {
  const { textoBusqueda, esEmail, tipoHogarDeTokko } = await import('./feed-en-red.ts')
  assert.equal(textoBusqueda({ zona: 'Funes Lakes', tipo: 'house', topeUsd: 200000, origen: 'conoce_tu_hogar' }), 'casas en Funes Lakes hasta USD 200 mil')
  assert.equal(textoBusqueda({ zona: 'Roldán', tipo: 'lot', topeUsd: null, origen: 'ficha' }), 'lotes en Roldán')
  assert.equal(esEmail('martina@gmail.com'), true)
  assert.equal(esEmail('341 555 1234'), false)
  assert.equal(esEmail('martina@gmail'), false)
  assert.equal(tipoHogarDeTokko(3), 'house')
  assert.equal(tipoHogarDeTokko(12), null)
})

test('dormitorios: N o más; sin dato no entra; en lotes no cuenta', async () => {
  const { entraEnDorm, dormMinValido, textoBusqueda } = await import('./feed-en-red.ts')
  assert.equal(entraEnDorm(3, 3), true)
  assert.equal(entraEnDorm(4, 3), true)
  assert.equal(entraEnDorm(2, 3), false)
  assert.equal(entraEnDorm(null, 3), false)
  assert.equal(entraEnDorm(null, null), true)
  assert.equal(dormMinValido('3'), 3)
  assert.equal(dormMinValido('9'), null)
  assert.equal(dormMinValido(null), null)
  assert.equal(
    textoBusqueda({ zona: 'Funes Lakes', tipo: 'house', topeUsd: 250000, dormMin: 3, origen: 'conoce_tu_hogar' }),
    'casas de 3 dormitorios o más en Funes Lakes hasta USD 250 mil',
  )
  assert.equal(textoBusqueda({ zona: 'Roldán', tipo: 'lot', topeUsd: null, dormMin: 3, origen: 'conoce_tu_hogar' }), 'lotes en Roldán')
})

test('barrio cerrado/abierto: me da igual entra todo; lo que no se sabe cuenta como abierto', async () => {
  const { entraEnBarrio, barrioHogarValido, textoBusqueda } = await import('./feed-en-red.ts')
  assert.equal(entraEnBarrio(true, 'cerrado'), true)
  assert.equal(entraEnBarrio(false, 'cerrado'), false)
  assert.equal(entraEnBarrio(null, 'cerrado'), false)
  assert.equal(entraEnBarrio(null, 'abierto'), true)
  assert.equal(entraEnBarrio(true, 'abierto'), false)
  assert.equal(entraEnBarrio(true, null), true)
  assert.equal(barrioHogarValido('cerrado'), 'cerrado')
  assert.equal(barrioHogarValido('x'), null)
  assert.equal(
    textoBusqueda({ zona: 'Funes', tipo: 'house', topeUsd: 250000, barrio: 'abierto', origen: 'conoce_tu_hogar' }),
    'casas en barrio abierto de Funes hasta USD 250 mil',
  )
})

// ── Renglón corto de la tarjeta del Tinder (David 5-oct)
import { lineaTarjeta, lugarTarjeta } from './feed-en-red.ts'

test('casa con lote: dormitorios, metros y lote', () => {
  assert.equal(lineaTarjeta({ datos: 'x', dorm: 3, m2: 430, lote: 800 }), '3 dorm · 430 m² · lote 800 m²')
})
test('sin lote (o igual a los metros) no repite', () => {
  assert.equal(lineaTarjeta({ datos: 'x', dorm: 2, m2: 90, lote: null }), '2 dorm · 90 m²')
  assert.equal(lineaTarjeta({ datos: 'x', dorm: 2, m2: 300, lote: 300 }), '2 dorm · 300 m²')
})
test('un lote dice Lote y sus metros', () => {
  assert.equal(lineaTarjeta({ datos: 'x', esLote: true, m2: null, lote: 930 }), 'Lote · 930 m²')
})
test('sin datos sueltos queda el renglón de siempre', () => {
  assert.equal(lineaTarjeta({ datos: 'Casa · 3 dorm' }), 'Casa · 3 dorm')
})
test('lugar en una línea con puntos', () => {
  assert.equal(lugarTarjeta({ direccion: 'Lote 058 | Vida | Funes', zona: null }), 'Lote 058 · Vida · Funes')
})

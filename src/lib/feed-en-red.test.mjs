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

test('Conocé tu próximo hogar: su presupuesto busca ±15 % (David 6-oct)', async () => {
  const { entraEnTope, textoPrecio } = await import('./feed-en-red.ts')
  assert.equal(entraEnTope(250000, 250000), true)
  assert.equal(entraEnTope(287000, 250000), true)
  assert.equal(entraEnTope(213000, 250000), true)
  assert.equal(entraEnTope(290000, 250000), false)
  assert.equal(entraEnTope(210000, 250000), false)
  assert.equal(entraEnTope(90000, 100000), true)
  assert.equal(entraEnTope(90000, null), true)
  assert.equal(entraEnTope(null, null), false)
  assert.equal(textoPrecio(500000), 'de alrededor de USD 500 mil')
  assert.equal(textoPrecio(1200000), 'de alrededor de USD 1,2 M')
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
  assert.equal(textoBusqueda({ zona: 'Funes Lakes', tipo: 'house', topeUsd: 200000, origen: 'conoce_tu_hogar' }), 'casas en Funes Lakes de alrededor de USD 200 mil')
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
    'casas de 3 dormitorios o más en Funes Lakes de alrededor de USD 250 mil',
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
    'casas en barrio abierto de Funes de alrededor de USD 250 mil',
  )
})

// ── Renglón corto de la tarjeta del Tinder (David 5-oct)
import { lineaTarjeta, lugarTarjeta, superficiesTarjeta, tipoHogarDeTexto } from './feed-en-red.ts'

test('casa con lote: dormitorios, metros y lote', () => {
  assert.equal(lineaTarjeta({ datos: 'x', dorm: 3, m2: 430, lote: 800 }), '3 dorm · 430 m² · lote 800 m²')
})
test('sin lote: dormitorios y metros', () => {
  assert.equal(lineaTarjeta({ datos: 'x', dorm: 2, m2: 90, lote: null }), '2 dorm · 90 m²')
})
test('metros iguales al lote = son del terreno: dice lote, no metros de casa', () => {
  assert.equal(lineaTarjeta({ datos: 'x', dorm: 3, m2: 800, lote: 800 }), '3 dorm · lote 800 m²')
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

// Superficie protagonista (David 10-sep): la total, salvo que sea el lote → la cubierta. Casos reales del feed.
const linea = (tipo, total, cubierta, lote, dorm) => lineaTarjeta({ datos: 'x', dorm, esLote: tipo === 'lot', ...superficiesTarjeta({ tipo, total, cubierta, lote }) })
test('casa con total = lote y cubierta cargada (Las Tardes): la cubierta y el lote', () => {
  assert.equal(linea('house', 695, 198, 695, 3), '3 dorm · 198 m² · lote 695 m²')
})
test('depto con total = terreno mal cargado (Alippi 9262): los metros, sin lote', () => {
  assert.equal(linea('apartment', 55.59, 40.24, 55.59, 2), '2 dorm · 56 m²')
})
test('casa con solo el lote: dice lote', () => {
  assert.equal(linea('house', 800, null, 800, 3), '3 dorm · lote 800 m²')
})
test('casa normal: total y lote', () => {
  assert.equal(linea('house', 430, 350, 800, 3), '3 dorm · 430 m² · lote 800 m²')
})
test('lote: su terreno', () => {
  assert.equal(linea('lot', 930, null, 930, null), 'Lote · 930 m²')
})
test('tipo de un aviso En red por su texto', () => {
  assert.equal(tipoHogarDeTexto('Departamento'), 'apartment')
  assert.equal(tipoHogarDeTexto('Terreno'), 'lot')
  assert.equal(tipoHogarDeTexto('Casa'), 'house')
})
test('galpón con metros = terreno: sus metros, sin repetir', () => {
  assert.equal(linea(null, 261, 261, 261, null), '261 m²')
})
test('casa sin dormitorios ni metros pero con lote: dice lote (no el renglón viejo)', () => {
  assert.equal(lineaTarjeta({ datos: 'Casa · 800 m²', dorm: null, m2: null, lote: 800 }), 'lote 800 m²')
})

// "Ver la ficha completa" en negro: qué fondos quedan con su color
import { esVerdeDeMarca } from '../components/mazo/ficha-oscura.ts'
test('verdes de marca y de WhatsApp quedan con su color; blancos, grises y transparentes no', () => {
  assert.equal(esVerdeDeMarca('rgb(26, 92, 56)'), true)
  assert.equal(esVerdeDeMarca('rgb(37, 211, 102)'), true)
  assert.equal(esVerdeDeMarca('rgba(26, 92, 56, 0.92)'), true)
  assert.equal(esVerdeDeMarca('rgba(26, 92, 56, 0.1)'), false)
  assert.equal(esVerdeDeMarca('rgb(255, 255, 255)'), false)
  assert.equal(esVerdeDeMarca('rgb(240, 242, 240)'), false)
  assert.equal(esVerdeDeMarca('rgba(0, 0, 0, 0)'), false)
})

// ── "Cerca mío" (David, 5-oct-2026)
import { masCercanas, metrosVisibles, puntoCercaValido } from './feed-en-red.ts'

test('cerca: el punto viaja redondeado a ~100 m; lo que no es un punto, no', () => {
  assert.deepEqual(puntoCercaValido('-32.94057,-60.83271'), { lat: -32.941, lng: -60.833 })
  assert.equal(puntoCercaValido('0,0'), null)
  assert.equal(puntoCercaValido('hola'), null)
  assert.equal(puntoCercaValido(undefined), null)
})

test('cerca: de la más cercana a la más lejana, hasta 15 km y sin las que no tienen pin', () => {
  const items = [6000, 300, null, 16000, 1200, 14900].map((distanciaM, i) => ({ key: String(i), distanciaM, esNuestra: false }))
  assert.deepEqual(masCercanas(items).map((i) => i.distanciaM), [300, 1200, 6000, 14900])
})

test('cerca: a la misma distancia que se ve, primero la nuestra', () => {
  const items = [
    { key: 'colega', distanciaM: 1210, esNuestra: false },
    { key: 'nuestra', distanciaM: 1240, esNuestra: true },
  ]
  assert.deepEqual(masCercanas(items).map((i) => i.key), ['nuestra', 'colega'])
})

test('cerca: como mucho las 40 más cercanas', () => {
  const items = Array.from({ length: 60 }, (_, i) => ({ key: String(i), distanciaM: 100 * (60 - i), esNuestra: false }))
  const out = masCercanas(items)
  assert.equal(out.length, 40)
  assert.equal(out[0].distanciaM, 100)
})

test('cerca: la distancia se muestra de a 100 m', () => {
  assert.equal(metrosVisibles(30), 100)
  assert.equal(metrosVisibles(640), 600)
  assert.equal(metrosVisibles(1240), 1200)
})

// ── El mazo que aprende (David, 5-oct)
import { aplicarOrden, ordenarPorGusto, parecidoCasas } from './feed-en-red.ts'

const casa = (key, zona, precioUsd, dorm, m2, esNuestra = false) => ({ key, zona, precioUsd, dorm, m2, esNuestra })

test('aprende: lo que se parece a lo que le gustó pasa adelante', () => {
  const gusto = casa('a', 'Funes Lakes', 400000, 4, 250)
  const resto = [casa('lejos', 'Centro', 120000, 2, 80), casa('igual', 'Funes Lakes', 410000, 4, 260), casa('media', 'Kentucky', 380000, 3, 220)]
  const decididas = [{ item: gusto, accion: 'like' }, { item: casa('x', 'Centro', 110000, 2, 70), accion: 'pass' }, { item: casa('y', 'Centro', 130000, 2, 90), accion: 'pass' }]
  assert.deepEqual(ordenarPorGusto(resto, decididas).map((c) => c.key), ['igual', 'media', 'lejos'])
})

test('aprende: sin un ♥ o con menos de 3 decisiones, no toca el orden', () => {
  const resto = [casa('1', 'Centro', 120000, 2, 80), casa('2', 'Funes Lakes', 410000, 4, 260)]
  const pases = [1, 2, 3, 4].map((i) => ({ item: casa(`p${i}`, 'Funes Lakes', 400000, 4, 250), accion: 'pass' }))
  assert.deepEqual(ordenarPorGusto(resto, pases).map((c) => c.key), ['1', '2'])
  assert.deepEqual(ordenarPorGusto(resto, [{ item: casa('a', 'Funes Lakes', 400000, 4, 250), accion: 'like' }]).map((c) => c.key), ['1', '2'])
})

test('aprende: barrios escritos distinto cuentan como el mismo', () => {
  assert.ok(parecidoCasas(casa('a', 'Vida Crystal Lagoon', 300000, 3, 200), casa('b', 'Vida Lagoon', 300000, 3, 200)) > 0.95)
})

test('aprende: las que llegan después (parecidos) van donde está parado', () => {
  const todos = ['a', 'b', 'c', 'd', 'n1'].map((key) => ({ key }))
  assert.deepEqual(aplicarOrden(todos, ['a', 'b', 'd', 'c'], 2).map((t) => t.key), ['a', 'b', 'n1', 'd', 'c'])
  assert.deepEqual(aplicarOrden(todos, null, 2).map((t) => t.key), ['a', 'b', 'c', 'd', 'n1'])
})

// ── Tinder del cliente (David, 5-oct)
import { formatearPresupuesto, idEnSeleccion, sugerirPresupuestos } from './feed-en-red.ts'

test('cliente: la key del mazo se traduce al id de su selección', () => {
  assert.equal(idEnSeleccion('n:4512345'), '4512345')
  assert.equal(idEnSeleccion('propia:455077'), 'red:propia:455077')
  assert.equal(idEnSeleccion('meli:MLA1234567'), 'red:meli:MLA1234567')
  assert.equal(idEnSeleccion('otra:1'), null)
  assert.equal(idEnSeleccion('n:abc'), null)
})

test('presupuesto: autocompleta lo que quiso decir mientras escribe', () => {
  assert.deepEqual(sugerirPresupuestos('25', 'house'), [250000, 2500000])
  assert.deepEqual(sugerirPresupuestos('180', 'house'), [180000, 1800000])
  assert.deepEqual(sugerirPresupuestos('250.000', 'house'), [250000, 2500000])
  assert.deepEqual(sugerirPresupuestos('1', 'house'), [100000, 1000000])
  assert.deepEqual(sugerirPresupuestos('8', 'lot'), [80000, 800000])
  assert.deepEqual(sugerirPresupuestos('', 'house'), [150000, 250000, 350000, 500000])
  assert.equal(formatearPresupuesto('250000'), '250.000')
  assert.equal(formatearPresupuesto('USD 0180.5'), '1.805')
  assert.equal(formatearPresupuesto(''), '')
})

test('aprende: tres ✕ a casas caras no hacen subir las baratas si le gustó una cara (caso real 5-oct)', () => {
  const decididas = [
    { item: casa('vida', 'Vida Crystal Lagoon', 455000, 4, 187), accion: 'like' },
    { item: casa('lakes', 'Funes Lakes', 415000, 3, 230), accion: 'pass' },
    { item: casa('funes', 'Funes', 295000, 3, 253), accion: 'pass' },
    { item: casa('cadaques', 'Cadaques', 590000, 3, 300), accion: 'pass' },
  ]
  const resto = [casa('barata', 'Zona 7 - Funes', 180000, 5, 430), casa('centro', 'Centro', 148000, 1, 60), casa('aguadas', 'Aguadas', 450000, 4, 296), casa('miraflores', 'Miraflores (Funes Hills)', 560000, 4, 427)]
  const orden = ordenarPorGusto(resto, decididas).map((c) => c.key)
  assert.deepEqual(orden.slice(0, 2), ['aguadas', 'miraflores'])
})

test('aprende: las sumadas en el medio quedan fijas aunque avance (no se repite una ni se pierde otra)', () => {
  const todos = ['a', 'b', 'c', 'd', 'e', 'x', 'y'].map((key) => ({ key }))
  const orden = ['a', 'b', 'c', 'd', 'e']
  // Se sumaron x, y cuando estaba en la 3ª (índice 2): siguen ahí aunque ya esté en la 4ª o vuelva a la 2ª.
  for (const indice of [1, 2, 3, 4]) assert.deepEqual(aplicarOrden(todos, orden, 2).map((t) => t.key), ['a', 'b', 'x', 'y', 'c', 'd', 'e'], `indice ${indice}`)
})

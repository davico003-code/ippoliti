import assert from 'node:assert/strict'
import test from 'node:test'
import { cierraElMazo, queHacerAlSalir } from './mazo-salida.ts'

/** El mazo a mitad de camino, sin nada abierto encima. */
const base = {
  guia: false,
  visor: false,
  detalle: false,
  match: false,
  hoja: null,
  rescate: null,
  enviada: false,
  terminado: false,
  pendientes: 0,
  guardadas: 0,
  rescateVisto: false,
  finEsRescate: false,
  vistas: 3,
}
const ambas = (e) => [queHacerAlSalir(e, 'x'), queHacerAlSalir(e, 'atras')]

test('con ♥ sin mandar: "¡No pierdas tus elegidas!" (la X y el atrás)', () => {
  assert.deepEqual(ambas({ ...base, pendientes: 2, guardadas: 2 }), ['hoja', 'hoja'])
})

test('sin ♥ después de mirar algunas: el rescate, una vez por visita', () => {
  assert.deepEqual(ambas(base), ['rescate', 'rescate'])
  assert.deepEqual(ambas({ ...base, rescateVisto: true }), ['cerrar', 'cerrar'])
  assert.deepEqual(ambas({ ...base, finEsRescate: true }), ['cerrar', 'cerrar'])
})

test('sin mirar ninguna: sale sin preguntar', () => {
  assert.deepEqual(ambas({ ...base, vistas: 0 }), ['cerrar', 'cerrar'])
})

test('sus ♥ ya las tiene un asesor (match o ★): sale y las limpia', () => {
  assert.deepEqual(ambas({ ...base, guardadas: 2, pendientes: 0 }), ['cerrar-limpiando', 'cerrar-limpiando'])
})

test('ya nos mandó la consulta: sale, aunque queden ♥ o no haya visto el rescate', () => {
  assert.deepEqual(ambas({ ...base, enviada: true, pendientes: 1, guardadas: 1 }), ['cerrar', 'cerrar'])
})

test('final con el formulario de sus elegidas: la X sale, el atrás se queda', () => {
  assert.deepEqual(ambas({ ...base, terminado: true, pendientes: 2, guardadas: 2 }), ['cerrar', 'quedarse'])
})

test('el atrás saca primero la capa de arriba, en este orden', () => {
  const todo = { ...base, guia: true, visor: true, detalle: true, match: true, hoja: 'boton', rescate: 'mazo' }
  assert.equal(queHacerAlSalir(todo, 'atras'), 'sacar-guia')
  assert.equal(queHacerAlSalir({ ...todo, guia: false }, 'atras'), 'sacar-visor')
  assert.equal(queHacerAlSalir({ ...todo, guia: false, visor: false }, 'atras'), 'sacar-detalle')
  assert.equal(queHacerAlSalir({ ...todo, guia: false, visor: false, detalle: false }, 'atras'), 'sacar-match')
  assert.equal(queHacerAlSalir({ ...base, hoja: 'boton', rescate: 'mazo' }, 'atras'), 'sacar-hoja')
  assert.equal(queHacerAlSalir({ ...base, rescate: 'mazo', rescateVisto: true }, 'atras'), 'sacar-rescate')
})

test('atrás otra vez con la pregunta de salida a la vista: insiste, sale', () => {
  assert.equal(queHacerAlSalir({ ...base, pendientes: 1, guardadas: 1, hoja: 'salir' }, 'atras'), 'cerrar')
  assert.equal(queHacerAlSalir({ ...base, rescate: 'salir', rescateVisto: true }, 'atras'), 'cerrar')
})

test('la X no mira las capas: decide como si no estuvieran (la tapan o no la dejan tocar)', () => {
  // Rescate en medio del mazo (la X del encabezado sigue a la vista): sale.
  assert.equal(queHacerAlSalir({ ...base, rescate: 'mazo', rescateVisto: true }, 'x'), 'cerrar')
  // Con la foto en grande (Escape llega a la X): con ♥ sin mandar, igual pregunta.
  assert.equal(queHacerAlSalir({ ...base, visor: true, pendientes: 1, guardadas: 1 }, 'x'), 'hoja')
})

test('cierraElMazo: solo cerrar y cerrar-limpiando sacan del mazo', () => {
  assert.equal(cierraElMazo('cerrar'), true)
  assert.equal(cierraElMazo('cerrar-limpiando'), true)
  for (const q of ['hoja', 'rescate', 'quedarse', 'sacar-guia', 'sacar-visor', 'sacar-detalle', 'sacar-match', 'sacar-hoja', 'sacar-rescate']) {
    assert.equal(cierraElMazo(q), false, q)
  }
})

// Correr: npx tsx --test src/lib/barrios-parecidos.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { barriosParecidos, listaBarrios } from './barrios-parecidos.ts'

test('San Sebastián, Aguadas y Vida se parecen entre sí', () => {
  assert.deepEqual(barriosParecidos('San Sebastián'), ['Aguadas', 'Vida'])
  assert.deepEqual(barriosParecidos('Aguadas'), ['San Sebastián', 'Vida'])
})

test('Vida está en dos grupos: suma los dos, sin repetir', () => {
  assert.deepEqual(barriosParecidos('Vida'), ['San Sebastián', 'Aguadas', 'Vida Club de Campo'])
  assert.deepEqual(barriosParecidos('Vida Club de Campo'), ['Vida'])
})

test('los 3 Funes Hills, Cantegril y Don Mateo', () => {
  assert.deepEqual(barriosParecidos('Funes Hills Miraflores'), ['Funes Hills Cadaqués', 'Funes Hills San Marino'])
  assert.deepEqual(barriosParecidos('Cantegril'), ['Don Mateo'])
  assert.deepEqual(barriosParecidos('Don Mateo'), ['Cantegril'])
})

test('acepta sin tildes, mayúsculas y las otras formas del nombre', () => {
  assert.deepEqual(barriosParecidos('san sebastian'), ['Aguadas', 'Vida'])
  assert.deepEqual(barriosParecidos('Barrio Vida'), ['San Sebastián', 'Aguadas', 'Vida Club de Campo'])
  assert.deepEqual(barriosParecidos('Cantegrill'), ['Don Mateo'])
  assert.deepEqual(barriosParecidos('Miraflores (Funes Hills)'), ['Funes Hills Cadaqués', 'Funes Hills San Marino'])
})

test('un barrio sin grupo (o una ciudad) no pregunta nada', () => {
  assert.deepEqual(barriosParecidos('Funes Lakes'), [])
  assert.deepEqual(barriosParecidos('Funes'), [])
  assert.deepEqual(barriosParecidos(''), [])
  assert.deepEqual(barriosParecidos(null), [])
})

test('lista legible', () => {
  assert.equal(listaBarrios(['Aguadas']), 'Aguadas')
  assert.equal(listaBarrios(['Aguadas', 'Vida']), 'Aguadas y Vida')
  assert.equal(listaBarrios(['San Sebastián', 'Aguadas', 'Vida Club de Campo']), 'San Sebastián, Aguadas y Vida Club de Campo')
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { barrioDeLaLista, barrioParaPedido, SIN_LISTA } from './barrio-de-zona.ts'

const b = (id, nombre, ciudad) => ({ id, nombre, slug: id, ciudad, esCerrado: null, centroide: null, m2Tipico: { lote: null, cubiertos: null }, tiene: { casas: 1, lotes: 1, deptos: 0 } })
const lista = [b('11', 'Kentucky', 'Funes'), b('12', 'Vida', 'Funes'), b('13', 'Vida Lagoon', 'Funes'), b('14', 'Tierra de Sueños 2', 'Roldán'), b('15', 'Funes Hills Miraflores', 'Funes')]

test('el nombre del mercado encuentra el de la lista', () => {
  assert.equal(barrioDeLaLista(lista, 'Kentucky Club de Campo', 'Funes')?.id, '11')
  assert.equal(barrioDeLaLista(lista, 'Tierra de Sueños II', 'Roldán')?.id, '14')
  assert.equal(barrioDeLaLista(lista, 'Vida Lagoon', 'Funes')?.id, '13')
  assert.equal(barrioDeLaLista(lista, 'Miraflores', 'Funes')?.id, '15')
})

test('nunca uno menos preciso, y respeta la ciudad', () => {
  assert.equal(barrioDeLaLista(lista, 'Vida Crystal Lagoon', 'Funes'), null)
  assert.equal(barrioDeLaLista(lista.filter((x) => x.id !== '13'), 'Vida Lagoon', 'Funes'), null)
  assert.equal(barrioDeLaLista(lista, 'Kentucky Club de Campo', 'Roldán'), null)
})

test('si la lista no lo tiene: uno propio con id zona: y la ciudad (Hilo exige los dos)', () => {
  const x = barrioParaPedido(lista, 'Abasto', 'Rosario')
  assert.ok(x && x.id.startsWith(SIN_LISTA) && x.id.length > SIN_LISTA.length)
  assert.equal(x.nombre, 'Abasto')
  assert.equal(x.ciudad, 'Rosario')
  assert.equal(barrioParaPedido(lista, 'Abasto'), null)
})

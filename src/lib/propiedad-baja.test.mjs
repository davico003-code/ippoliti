import assert from 'node:assert/strict'
import test from 'node:test'
import { destinoDeBaja, leerSlug } from './propiedad-baja.ts'

test('con los datos de Hilo: misma operación + tipo + localidad', () => {
  // El slug viejo no decía que era un alquiler: lo sabe Hilo.
  assert.equal(
    destinoDeBaja({ operation_type: 'rent', property_type: 'house', city: 'Roldán' }, '7990850-casa-en-roldan'),
    '/propiedades?operacion=alquiler&tipo=casa&ubicacion=roldan',
  )
  assert.equal(
    destinoDeBaja({ operation_type: 'sale', property_type: 'lot', city: 'Funes ' }, '900000123-lote'),
    '/propiedades?operacion=venta&tipo=terreno&ubicacion=funes',
  )
})

test('una ciudad que el listado no filtra no se inventa', () => {
  assert.equal(
    destinoDeBaja({ operation_type: 'sale', property_type: 'house', city: 'Casilda' }, '123-casa-en-venta-camino-a-roldan'),
    '/propiedades?operacion=venta&tipo=casa',
  )
})

test('sin datos de Hilo, se lee el slug', () => {
  assert.equal(destinoDeBaja(null, '7101689-casa-en-venta-3-dormitorios'), '/propiedades?operacion=venta&tipo=casa')
  assert.equal(destinoDeBaja(null, '7990850-casa-en-roldan'), '/propiedades?tipo=casa&ubicacion=roldan')
  assert.equal(
    destinoDeBaja(null, '6543210-departamento-en-alquiler-temporario-en-fisherton'),
    '/propiedades?operacion=temporario&tipo=departamento&ubicacion=rosario',
  )
})

test('gana el tipo que aparece primero y "club de campo" no es un campo', () => {
  assert.deepEqual(leerSlug('1-lote-en-kentucky-club-de-campo-funes'), { operacion: null, tipo: 'terreno', ubicacion: 'funes' })
  assert.deepEqual(leerSlug('1-venta-de-cocheras-en-rosario'), { operacion: 'venta', tipo: 'cochera', ubicacion: 'rosario' })
})

test('sin tipo ni localidad no hay destino (410)', () => {
  assert.equal(destinoDeBaja(null, '7990850'), null)
  assert.equal(destinoDeBaja(null, '7990850-oportunidad-en-venta'), null)
  assert.equal(destinoDeBaja({ operation_type: 'sale' }, '7990850'), null)
})

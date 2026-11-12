import assert from 'node:assert/strict'
import test from 'node:test'
import { limpiarTextoNeutro } from './texto-neutro.ts'

test('saca las oraciones que invitan a contactar', () => {
  const t = 'Casa en Funes con pileta.\n\nServicios: luz, agua y gas natural. Consultanos para coordinar una visita.\n\nPara más información o coordinar una visita, comunicate con nosotros.'
  assert.equal(limpiarTextoNeutro(t), 'Casa en Funes con pileta.\n\nServicios: luz, agua y gas natural.')
})

test('saca marca y matrícula aunque la oración tenga "mat. 0559"', () => {
  const t = 'Listo para escriturar.\n\nGestiones a cargo de CI Susana Ippoliti mat. 0559 y CI David Flores mat. 0621\n\nMás datos del barrio.'
  assert.equal(limpiarTextoNeutro(t), 'Listo para escriturar.\n\nMás datos del barrio.')
})

test('saca teléfonos y "Contacto:" de colegas', () => {
  assert.equal(limpiarTextoNeutro('Lote de 900 m². Para visitas llamar al +54 9 3412 10-3769.'), 'Lote de 900 m².')
  assert.equal(limpiarTextoNeutro('Casa a estrenar. Tel 0341 155 123456.'), 'Casa a estrenar.')
  assert.equal(limpiarTextoNeutro('Matrícula N° 1588 - Contacto: Verónica'), '')
  assert.equal(limpiarTextoNeutro('📞 Consultame para recibir más información.\nCocina integrada.'), 'Cocina integrada.')
})

test('no toca lo que no es contacto', () => {
  const t = 'Una casa pensada para quienes buscan contacto con la naturaleza.\nPrecio $ 1.500.000.000 (ARS). Lote aprox. 300 m², 2 dorm.\nLotes de 120 150 200 300 m².\nFormas de pago: contado, consultar posibilidad de financiación.'
  assert.equal(limpiarTextoNeutro(t), t)
})

test('saca el paréntesis o la cola "consultar" y deja el dato', () => {
  assert.equal(limpiarTextoNeutro('Posibilidad de cochera en el edificio (consultar disponibilidad).'), 'Posibilidad de cochera en el edificio.')
  assert.equal(limpiarTextoNeutro('Financiación privada disponible, consultar'), 'Financiación privada disponible')
})

test('vacío o nulo', () => {
  assert.equal(limpiarTextoNeutro(''), '')
  assert.equal(limpiarTextoNeutro(null), '')
})

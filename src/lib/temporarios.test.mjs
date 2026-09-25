import assert from 'node:assert/strict'
import test from 'node:test'
import { leerCondicionesTemporario, formatearMonto, tieneCondiciones, leerAlquiladas, comodidadesTemporario } from './temporarios.ts'

const DESCRIPCION = `Hermosa casa con pileta en Funes, ideal para el verano.

Quincena: $ 900.000
• Mes: $1.500.000
Depósito: $ 300.000
Seña para reservar: 30%
Forma de pago: efectivo o transferencia
Estadía mínima: 1 quincena
Check-in: 14 h
Salida – 10 h
Disponible: enero y febrero
Incluye: luz, gas, wifi, ropa blanca y limpieza de salida
Alquilado: dic 2da, enero completo
No incluye: blanquería, limpieza diaria
No se permite: música a alto volumen, eventos masivos y mascotas
Capacidad: 6 personas
Comodidades: pileta climatizada, parrilla, wifi

Ubicación: a 3 cuadras de la plaza.`

test('lee precios por quincena y por mes, en ese orden', () => {
  const c = leerCondicionesTemporario(DESCRIPCION)
  assert.deepEqual(c.precios, [
    { periodo: 'quincena', texto: 'ARS 900.000' },
    { periodo: 'mes', texto: 'ARS 1.500.000' },
  ])
})

test('lee las condiciones y la lista de lo que incluye', () => {
  const c = leerCondicionesTemporario(DESCRIPCION)
  assert.equal(c.deposito, 'ARS 300.000')
  assert.equal(c.sena, '30%')
  assert.equal(c.formaPago, 'efectivo o transferencia')
  assert.equal(c.estadiaMinima, '1 quincena')
  assert.equal(c.entrada, '14 h')
  assert.equal(c.salida, '10 h')
  assert.equal(c.disponible, 'enero y febrero')
  assert.deepEqual(c.incluye, ['Luz', 'Gas', 'Wifi', 'Ropa blanca', 'Limpieza de salida'])
  assert.ok(tieneCondiciones(c))
})

test('saca de la descripción solo los renglones de condiciones', () => {
  const c = leerCondicionesTemporario(DESCRIPCION)
  assert.match(c.descripcion, /Hermosa casa con pileta/)
  assert.match(c.descripcion, /Ubicación: a 3 cuadras/) // etiqueta que no es condición
  assert.doesNotMatch(c.descripcion, /Quincena|Depósito|Incluye/)
})

test('sin renglones de precio usa el precio del feed como mensual', () => {
  const c = leerCondicionesTemporario('Depto con balcón.', 'ARS 1.200.000')
  assert.deepEqual(c.precios, [{ periodo: 'mes', texto: 'ARS 1.200.000' }])
  assert.equal(tieneCondiciones(c), false)
})

test('formatea montos y respeta texto que no es monto', () => {
  assert.equal(formatearMonto('USD 900'), 'USD 900')
  assert.equal(formatearMonto('U$S 1.200'), 'USD 1.200')
  assert.equal(formatearMonto('1500000'), 'ARS 1.500.000')
  assert.equal(formatearMonto('a convenir'), 'a convenir')
  assert.equal(formatearMonto('un mes de alquiler'), 'un mes de alquiler')
})

test('lee las quincenas alquiladas de la temporada', () => {
  assert.deepEqual(leerCondicionesTemporario(DESCRIPCION).alquiladas, ['dic-2', 'ene-1', 'ene-2'])
  assert.deepEqual(leerAlquiladas('febrero 1ra quincena'), ['feb-1'])
  assert.deepEqual(leerAlquiladas('Dic. segunda; feb'), ['dic-2', 'feb-1', 'feb-2'])
  assert.deepEqual(leerAlquiladas('primera de enero y 2° de diciembre'), ['dic-2', 'ene-1'])
  assert.deepEqual(leerAlquiladas('marzo'), [])
  assert.doesNotMatch(leerCondicionesTemporario(DESCRIPCION).descripcion, /Alquilado/)
})

test('capacidad y comodidades (escritas primero, después las cargadas, sin repetir)', () => {
  const c = leerCondicionesTemporario(DESCRIPCION)
  assert.equal(c.personas, '6')
  assert.deepEqual(c.comodidades, ['Pileta climatizada', 'Parrilla', 'Wifi'])
  const tags = [{ name: 'Barbecue' }, { name: 'Air Conditioning' }, { name: 'Water' }, { name: 'WiFi' }]
  assert.deepEqual(comodidadesTemporario(c, tags, 1), ['Pileta climatizada', 'Parrilla', 'Wifi', 'Aire acondicionado', 'Cochera'])
  assert.deepEqual(comodidadesTemporario({ comodidades: [] }, [{ name: 'Pool' }]), ['Pileta'])
})

test('lo que no incluye y lo que no se permite', () => {
  const c = leerCondicionesTemporario(DESCRIPCION)
  assert.deepEqual(c.noIncluye, ['Blanquería', 'Limpieza diaria'])
  assert.deepEqual(c.noPermitido, ['Música a alto volumen', 'Eventos masivos', 'Mascotas'])
  assert.deepEqual(c.incluye, ['Luz', 'Gas', 'Wifi', 'Ropa blanca', 'Limpieza de salida']) // "No incluye" no se mezcla
  assert.deepEqual(leerCondicionesTemporario('Prohibido: fiestas').noPermitido, ['Fiestas'])
})

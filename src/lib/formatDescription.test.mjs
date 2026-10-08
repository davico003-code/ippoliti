import assert from 'node:assert/strict'
import test from 'node:test'
import { formatDescription, quitarTitularInicial } from './formatDescription.ts'

// Casos sacados de descripciones reales de HILO (auditoría 07-oct).

test('"• ✓ Piscina" no muestra el check doble', () => {
  const b = formatDescription('Amenities\n\n• ✓ Piscina\n• ✓Gimnasio\n• ✓ Solarium')
  assert.deepEqual(b.at(-1), { type: 'list', items: ['Piscina', 'Gimnasio', 'Solarium'] })
})

test('viñetas pegadas al texto o con punto van como lista', () => {
  const b = formatDescription(
    'Distribución:\n-Baño/Toilette y kitchenette.\n-Oficina en planta alta.\n. Baulera en subsuelo\n. Tendedero privado',
  )
  assert.deepEqual(b.at(-1), {
    type: 'list',
    items: ['Baño/Toilette y kitchenette.', 'Oficina en planta alta.', 'Baulera en subsuelo', 'Tendedero privado'],
  })
})

test('"Av.", "Sup." o "Casa 1." no se toman como subtítulo', () => {
  const texto = [
    'Cocheras disponibles en alquiler sobre una avenida céntrica de la ciudad, a metros de todo.',
    'Av. Pellegrini al 2700, entre Callao y Ovidio Lagos, dentro de barrio Lourdes.',
    'Sup. uso exc. cochera doble: 23,30 m2 con acceso por portón automático y vigilancia.',
    'Casa 1. Lote 3 con frente al parque central del barrio y salida al canal.',
  ].join('\n')
  for (const b of formatDescription(texto)) assert.equal(b.subtitle, undefined)
})

test('un subtítulo real se mantiene', () => {
  const [b] = formatDescription(
    'Ingreso con llave. Iluminación en todo el sector, piso mejorado y portón automático con control remoto para cada cochera.',
  )
  assert.equal(b.subtitle, 'Ingreso con llave')
})

test('las líneas separadoras "_____" desaparecen', () => {
  const b = formatDescription(
    'Galpón en el sur de Rosario con muy buena circulación interna.\n________________________________________\nSuperficie total: 7.013 m²',
  )
  assert.ok(b.every((x) => !JSON.stringify(x).includes('___')))
})

test('el "?" degradado entre números vuelve a ser un guion', () => {
  const [b] = formatDescription('Total predio: 7.013,07 m²? USD 5.030.000')
  assert.equal(b.content[0].value, '7.013,07 m² – USD 5.030.000')
})

test('una pregunta de verdad no se toca', () => {
  const [b] = formatDescription('¿Buscás 3 dormitorios? Llamanos y coordinamos una visita esta misma semana.')
  assert.equal(b.content, '¿Buscás 3 dormitorios? Llamanos y coordinamos una visita esta misma semana.')
})

test('un párrafo-muro se parte en oraciones sin cortar en "Av."', () => {
  const oracion =
    'La unidad está sobre Av. Pellegrini y tiene un estar comedor luminoso con salida a balcón al frente y vista abierta.'
  const texto = Array(7).fill(oracion).join(' ')
  const b = formatDescription(`${texto}\nUbicación: Rosario\nSuperficie: 64 m²`)
  const parrafos = b.filter((x) => x.type === 'paragraph')
  assert.ok(parrafos.length >= 2, 'se partió')
  assert.equal(parrafos.map((p) => p.content).join(' '), texto, 'el texto no cambia')
  for (const p of parrafos) assert.ok(!p.content.endsWith('Av.'))
})

test('líneas cortas seguidas van compactas, la última con aire', () => {
  const b = formatDescription(
    'Cocheras disponibles en alquiler\nAv. San Martín 1248.\nContrato x 1 año.\nLa propiedad se entrega pintada y con la instalación eléctrica revisada a nuevo, lista para usar desde el primer día.',
  )
  assert.deepEqual(
    b.map((x) => !!x.compact),
    [true, true, false, false],
  )
})

test('el titular SEO en mayúsculas al inicio sale; el eslogan se queda', () => {
  const cuerpo =
    'Excelente casa sobre lote de 600 m² con pileta, galería y parrillero. Rodeada de verde y a metros del ingreso.'
  const conTitular = quitarTitularInicial(formatDescription(`LOTE EN VENTA BARRIO LA CASONA ROLDÁN\n${cuerpo}`))
  assert.equal(conTitular[0].content, cuerpo)
  const conEslogan = quitarTitularInicial(formatDescription(`OPORTUNIDAD ÚNICA EN FUNES LAKES\n${cuerpo}`))
  assert.equal(conEslogan[0].type, 'title')
})

test('un "Descripción" suelto arriba no se repite', () => {
  const b = quitarTitularInicial(
    formatDescription('Descripción\nEdificio de planta baja y 10 pisos con unidades de 2 y 3 dormitorios y amenities completos.'),
  )
  assert.equal(b[0].content.startsWith('Edificio'), true)
})

test('negritas: metros, frente y pileta, una vez por descripción y hasta 3 por párrafo', async () => {
  const { resaltarDatos } = await import('./formatDescription.ts')
  const vistos = new Set()
  const neg = (t) => resaltarDatos(t, vistos).filter((s) => s.negrita).map((s) => s.texto)
  assert.deepEqual(
    neg('El lote tiene 606,06 m² con 15,40 m de frente. La casa cuenta con pileta propia y quincho.'),
    ['606,06 m²', '15,40 m de frente', 'pileta'],
  )
  assert.deepEqual(neg('La piscina es climatizada y el dormitorio en suite tiene vestidor.'), ['en suite'])
  assert.deepEqual(neg('Uno de los dos dormitorios tiene 3 habitaciones de huéspedes.'), [])
  const todo = resaltarDatos('Apto crédito, a estrenar, con financiación y permuta.', new Set())
  assert.equal(todo.filter((s) => s.negrita).length, 3)
  assert.equal(todo.map((s) => s.texto).join(''), 'Apto crédito, a estrenar, con financiación y permuta.')
})

test('negritas: tope de 6 por descripción', async () => {
  const { resaltarDatos } = await import('./formatDescription.ts')
  const vistos = new Set()
  const lotes = Array.from({ length: 5 }, (_, i) => `Lote ${i + 1} de ${300 + i} m².`).join(' ')
  const total = [lotes, lotes.replace(/30/g, '40')]
    .flatMap((t) => resaltarDatos(t, vistos))
    .filter((s) => s.negrita).length
  assert.equal(total, 6)
})

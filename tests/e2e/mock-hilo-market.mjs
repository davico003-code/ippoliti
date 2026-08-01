import { createServer } from 'node:http'

const id = 8_772_345_678_901
const property = {
  id,
  publication_title: 'Casa en Vida · oportunidad del mercado',
  address: 'Vida',
  fake_address: 'Vida',
  real_address: '',
  reference_code: 'OP-TEST1234',
  description: 'Oportunidad del mercado verificada por SI INMOBILIARIA.',
  description_only: 'Oportunidad del mercado verificada por SI INMOBILIARIA.',
  rich_description: '',
  age: 0,
  roofed_surface: '210',
  surface: '800',
  total_surface: '800',
  semiroofed_surface: '0',
  unroofed_surface: '0',
  lot_number: '',
  room_amount: 3,
  bathroom_amount: 0,
  toilet_amount: 0,
  parking_lot_amount: 0,
  covered_parking_lot: 0,
  suite_amount: 3,
  floors_amount: 0,
  floor: '',
  photos: [],
  operations: [{ operation_id: 1, operation_type: 'Sale', prices: [{ currency: 'USD', is_promotional: false, period: null, price: 250000 }] }],
  type: { code: 'HOUSE', id: 3, name: 'Casa' },
  location: { id, name: 'Vida', full_location: 'Argentina | Santa Fe | Funes | Vida', short_location: 'Funes | Vida', divisions: [{ id, name: 'Vida' }] },
  geo_lat: '-32.9',
  geo_long: '-60.8',
  web_price: true,
  is_starred_on_web: false,
  status: 2,
  deleted_at: null,
  tags: [],
  videos: [],
  property_condition: null,
  orientation: null,
  disposition: null,
  situation: null,
  files: [],
  public_url: '/buscar/mercado-test',
  development: null,
  producer: null,
  catalog_source: 'mercado',
  market_id: 'b3b27d42-3fd2-4bc0-b17d-fd2e1212792a',
  market_verified_at: '2026-08-01T12:00:00.000Z',
  market_discount_pct: 31,
  market_photo_rights: 'sin_confirmar',
}

const port = Number(process.env.MOCK_PORT || 3121)

createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json')
  if (request.url?.startsWith(`/api/public/propiedades/${id}`)) {
    response.end(JSON.stringify(property))
    return
  }
  if (request.url?.startsWith('/api/public/propiedades')) {
    response.end(JSON.stringify({
      meta: { limit: 1000, offset: 0, total_count: 1, next: null, previous: null },
      objects: [property],
    }))
    return
  }
  response.statusCode = 404
  response.end(JSON.stringify({ error: 'not_found' }))
}).listen(port, '127.0.0.1', () => {
  console.log(`mock-hilo-market:${port}`)
})

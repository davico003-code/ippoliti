import assert from 'node:assert/strict'
import test from 'node:test'
import { archivoDeFotoFirmada, conFotosFijas, fotoAbsoluta, fotoFija, fotosFijasDe, urlFotoFija } from './fotos-fijas.ts'

const BASE = 'https://zshnczoaqvrvmhphcehb.supabase.co/storage/v1/object/sign/property-media/org/properties'
const firmada = (prop, archivo, token = 'eyJ.a.b') => `${BASE}/${prop}/${archivo}?token=${token}`
const PLANO = 'https://meethilo.com/api/public/plano/8fce26b9-cf4f-4588-ac61-eaee693fba8c?r=1'

const foto = (image, extra = {}) => ({ image, thumb: image, original: image, is_blueprint: false, ...extra })

test('saca el archivo de una URL firmada de property-media', () => {
  assert.equal(archivoDeFotoFirmada(firmada('p1', '1788832477482-0894f769.jpg')), '1788832477482-0894f769.jpg')
  assert.equal(archivoDeFotoFirmada(firmada('p1', '7510528-2-foto.JPEG')), '7510528-2-foto.JPEG')
})

test('cualquier otra URL no tiene archivo', () => {
  assert.equal(archivoDeFotoFirmada(PLANO), null)
  assert.equal(archivoDeFotoFirmada('https://static.tokkobroker.com/pictures/1.jpg'), null)
  assert.equal(archivoDeFotoFirmada('https://x.supabase.co/storage/v1/object/public/property-media/a/b.jpg'), null)
  assert.equal(archivoDeFotoFirmada('https://x.supabase.co/storage/v1/object/sign/otro-bucket/a/b.jpg?token=t'), null)
  assert.equal(archivoDeFotoFirmada(firmada('p1', 'plano.pdf')), null)
  assert.equal(archivoDeFotoFirmada(''), null)
  assert.equal(archivoDeFotoFirmada(null), null)
  assert.equal(archivoDeFotoFirmada('no es url'), null)
})

test('la URL fija no depende del token: dos firmas de la misma foto dan la misma', () => {
  const a = { id: 8153191, photos: [foto(firmada('p1', 'a.jpg', 'tok1'))] }
  const b = { id: 8153191, photos: [foto(firmada('p1', 'a.jpg', 'tok2'))] }
  assert.equal(fotoFija(a, a.photos[0].image, true), 'https://siinmobiliaria.com/fotos/8153191/a.jpg')
  assert.equal(fotoFija(a, a.photos[0].image, true), fotoFija(b, b.photos[0].image, true))
  assert.equal(urlFotoFija(8153191, 'a.jpg'), '/fotos/8153191/a.jpg')
})

test('los planos y las URLs ajenas quedan como están', () => {
  const p = { id: 1, photos: [foto(PLANO, { is_blueprint: true }), foto(firmada('p1', 'plano.jpg'), { is_blueprint: true })] }
  assert.equal(fotosFijasDe(p).size, 0)
  assert.equal(fotoFija(p, PLANO), PLANO)
  assert.equal(conFotosFijas(p), p)
})

test('un nombre repetido con dos rutas distintas no tiene URL fija', () => {
  const p = {
    id: 9,
    photos: [foto(firmada('p1', 'x.jpg')), foto(firmada('p2', 'x.jpg')), foto(firmada('p1', 'y.jpg'))],
  }
  const fijas = fotosFijasDe(p)
  assert.equal(fijas.has('x.jpg'), false)
  assert.equal(fijas.has('y.jpg'), true)
  assert.equal(fotoFija(p, p.photos[0].image), p.photos[0].image)
  // Tercera aparición de un nombre ya ambiguo: sigue afuera.
  p.photos.push(foto(firmada('p1', 'x.jpg')))
  assert.equal(fotosFijasDe(p).has('x.jpg'), false)
})

test('la misma ruta cargada dos veces sí tiene URL fija', () => {
  const p = { id: 9, photos: [foto(firmada('p1', 'x.jpg', 't1')), foto(firmada('p1', 'x.jpg', 't2'))] }
  assert.equal(fotosFijasDe(p).get('x.jpg'), p.photos[0].image)
})

test('conFotosFijas pasa image, thumb y original a la URL fija; los planos no se tocan', () => {
  const orig = firmada('p1', 'a.jpg')
  const p = { id: 7, photos: [foto(orig), foto(PLANO, { is_blueprint: true })] }
  const fija = conFotosFijas(p)
  assert.deepEqual(fija.photos[0], { ...p.photos[0], image: '/fotos/7/a.jpg', thumb: '/fotos/7/a.jpg', original: '/fotos/7/a.jpg' })
  assert.equal(fija.photos[1], p.photos[1])
  assert.equal(p.photos[0].image, orig, 'no muta la propiedad de entrada')
})

test('fotoAbsoluta solo completa las relativas de /fotos', () => {
  assert.equal(fotoAbsoluta('/fotos/7/a.jpg'), 'https://siinmobiliaria.com/fotos/7/a.jpg')
  assert.equal(fotoAbsoluta(PLANO), PLANO)
  assert.equal(fotoAbsoluta(null), null)
})

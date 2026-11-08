import assert from 'node:assert/strict'
import test from 'node:test'
import { anchoR2, archivoDeFotoFirmada, conFotosFijas, esFotoR2, fotoAbsoluta, fotoFija, fotoJpgDeLaWeb, fotoPrincipalParaBuscadores, fotosFijasDe, loaderFotoR2, urlFotoFija } from './fotos-fijas.ts'

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

test('la lista liviana (solo image) no gana thumb ni original', () => {
  const p = { id: 7, photos: [{ image: firmada('p1', 'a.jpg'), is_blueprint: false }] }
  assert.deepEqual(conFotosFijas(p).photos[0], { image: '/fotos/7/a.jpg', is_blueprint: false })
})

// --- Fotos ya achicadas en R2 (22-oct-2026) ---
const R2 = 'https://fotos.verficha.casa/w1/org/properties/p1/1788832477482-0894f769.jpg/1920.webp'

test('reconoce solo las fotos de R2 con un ancho guardado', () => {
  assert.equal(esFotoR2(R2), true)
  assert.equal(esFotoR2(R2.replace('1920.webp', '828.webp')), true)
  assert.equal(esFotoR2(R2.replace('1920.webp', '700.webp')), false)
  assert.equal(esFotoR2('https://fotos.verficha.casa/ext/abc.jpg'), false)
  assert.equal(esFotoR2('http://fotos.verficha.casa/w1/a/b.jpg/1920.webp'), false)
  assert.equal(esFotoR2(firmada('p1', 'a.jpg')), false)
  assert.equal(esFotoR2(undefined), false)
  assert.equal(esFotoR2({ src: R2 }), false)
})

test('el loader pide el ancho guardado más chico que alcanza', () => {
  assert.equal(anchoR2(96), 480)
  assert.equal(anchoR2(480), 480)
  assert.equal(anchoR2(640), 828)
  assert.equal(anchoR2(1080), 1080)
  assert.equal(anchoR2(1920), 1920)
  assert.equal(anchoR2(3840), 1920)
  assert.equal(loaderFotoR2({ src: R2, width: 640, quality: 75 }), R2.replace('1920.webp', '828.webp'))
})

test('con anchos en R2 la foto se muestra desde R2 y original queda en la URL fija', () => {
  const img = firmada('p1', '1788832477482-0894f769.jpg')
  const p = conFotosFijas({ id: 9001, photos: [foto(img, { r2: R2, is_front_cover: true })] })
  assert.equal(p.photos[0].image, R2)
  assert.equal(p.photos[0].thumb, R2)
  assert.equal(p.photos[0].original, '/fotos/9001/1788832477482-0894f769.jpg')
  // El JSON-LD sigue con la fija (absoluta), no con R2.
  assert.equal(fotoPrincipalParaBuscadores(p), 'https://siinmobiliaria.com/fotos/9001/1788832477482-0894f769.jpg')
})

test('la lista liviana (solo image) también pasa a R2, sin sumar thumb ni original', () => {
  const p = conFotosFijas({ id: 9002, photos: [{ image: firmada('p1', 'a.jpg'), is_blueprint: false, r2: R2 }] })
  assert.deepEqual(Object.keys(p.photos[0]).sort(), ['image', 'is_blueprint', 'r2'])
  assert.equal(p.photos[0].image, R2)
})

test('sin r2 (o con uno que no es de R2) todo queda como antes; los planos no se tocan', () => {
  const img = firmada('p1', 'b.jpg')
  assert.equal(conFotosFijas({ id: 9003, photos: [foto(img)] }).photos[0].image, '/fotos/9003/b.jpg')
  assert.equal(conFotosFijas({ id: 9003, photos: [foto(img, { r2: 'https://otro.host/x/1920.webp' })] }).photos[0].image, '/fotos/9003/b.jpg')
  const plano = foto(PLANO, { is_blueprint: true, r2: R2 })
  assert.equal(conFotosFijas({ id: 9003, photos: [plano] }).photos[0].image, PLANO)
  // Foto de Tokko (sin URL fija) pero con R2: se muestra desde R2.
  const tokko = 'https://static.tokkobroker.com/pictures/1.jpg'
  const t = conFotosFijas({ id: 9004, photos: [foto(tokko, { r2: R2 })] })
  assert.equal(t.photos[0].image, R2)
  assert.equal(t.photos[0].original, tokko)
})

test('el kiosco de TV pide la foto de R2 en JPG desde /fotos; lo demás queda igual', () => {
  assert.equal(fotoJpgDeLaWeb(9001, R2), '/fotos/9001/1788832477482-0894f769.jpg')
  assert.equal(fotoJpgDeLaWeb(9001, R2.replace('1920.webp', '480.webp')), '/fotos/9001/1788832477482-0894f769.jpg')
  assert.equal(fotoJpgDeLaWeb(9001, '/fotos/9001/a.jpg'), '/fotos/9001/a.jpg')
  const tokko = 'https://static.tokkobroker.com/pictures/1.jpg'
  assert.equal(fotoJpgDeLaWeb(9001, tokko), tokko)
})

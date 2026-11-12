import { test } from 'node:test'
import assert from 'node:assert/strict'
import { anchoR2, loaderFotoR2 } from './fotos-fijas.ts'

// La tolerancia de anchoR2 (hasta 20% de estiramiento) existe para que el
// candidato 1280 de next/image (iPhone a 3x) baje la foto de 1080 y no la de
// 1920, que pesa ~3 veces más. Estos casos fijan ese borde.
const R2 = 'https://fotos.verficha.casa/w1/org/properties/p1/1788832477482-0894f769.jpg/1920.webp'

test('un iPhone a 3x (1100-1290 px) recibe la de 1080, no la de 1920', () => {
  assert.equal(anchoR2(1083), 1080)
  assert.equal(anchoR2(1280), 1080)
  assert.equal(anchoR2(1296), 1080)
  assert.equal(anchoR2(1297), 1920)
  assert.equal(loaderFotoR2({ src: R2, width: 1280, quality: 75 }), R2.replace('1920.webp', '1080.webp'))
})

test('los anchos que ya pide next/image no cambian de foto', () => {
  // imageSizes por defecto + deviceSizes de next.config.mjs.
  const esperado = { 16: 480, 96: 480, 256: 480, 384: 480, 360: 480, 640: 828, 828: 828, 1080: 1080, 1920: 1920, 3840: 1920 }
  for (const [pedido, ancho] of Object.entries(esperado)) {
    assert.equal(anchoR2(Number(pedido)), ancho, `pedido ${pedido}`)
  }
})

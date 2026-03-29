import { createCanvas, loadImage } from 'canvas'
import { writeFileSync } from 'fs'

const W = 1080, H = 1920

async function generate() {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Load photo
  const img = await loadImage('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080&q=80')

  // Draw photo full bleed
  const scale = Math.max(W / img.width, H / img.height)
  const sw = img.width * scale, sh = img.height * scale
  ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)

  // Dark gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.35, 'rgba(0,0,0,0)')
  grad.addColorStop(0.6, 'rgba(0,0,0,0.6)')
  grad.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Top bar
  ctx.font = '400 42px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText('David Flores', 64, 88)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText('MAT. N° 0621', W - 64, 88)
  ctx.textAlign = 'left'

  // Operation pill
  ctx.fillStyle = '#1A5C38'
  roundRect(ctx, 64, 1220, 160, 56, 28)
  ctx.fill()
  ctx.font = 'bold 24px Arial'
  ctx.fillStyle = '#fff'
  ctx.fillText('VENTA', 96, 1257)

  // Title
  ctx.font = '300 68px Arial'
  ctx.fillStyle = '#fff'
  const title = 'Casa 3 dormitorios con pileta en Barrio San Sebastián'
  const lines = wrapText(ctx, title, 940)
  let y = 1370
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line, 64, y)
    y += 82
  }

  // Price
  ctx.font = '600 108px Arial'
  ctx.fillStyle = '#fff'
  ctx.fillText('USD 185.000', 64, y + 130)

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(64, y + 164)
  ctx.lineTo(W - 64, y + 164)
  ctx.stroke()

  // Chips
  const chips = ['220 m²', '3 dorm.', '2 baños']
  let cx = 64
  ctx.font = '500 30px Arial'
  for (const chip of chips) {
    const cw = ctx.measureText(chip).width + 40
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    roundRect(ctx, cx, y + 190, cw, 52, 26)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    roundRect(ctx, cx, y + 190, cw, 52, 26)
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.fillText(chip, cx + 20, y + 225)
    cx += cw + 14
  }

  // Footer
  ctx.font = '400 28px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('@inmobiliaria.si', 64, H - 64)

  // SI logo square
  ctx.fillStyle = '#1A5C38'
  roundRect(ctx, W - 128, H - 104, 64, 64, 12)
  ctx.fill()
  ctx.font = 'bold 28px Arial'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.fillText('SI', W - 96, H - 64)

  // Save
  const buf = canvas.toBuffer('image/png')
  writeFileSync('/Users/siinmobiliaria/Desktop/placa-test.png', buf)
  console.log('Placa guardada en ~/Desktop/placa-test.png')
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

generate().catch(console.error)

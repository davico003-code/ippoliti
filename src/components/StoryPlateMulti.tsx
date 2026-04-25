'use client'

import { useRef, useState, useCallback } from 'react'
import { Instagram } from 'lucide-react'

export interface StoryPlateMultiProps {
  photos: string[]
  title: string
  price: string
  operation: string
  propertyType: string
  area: number | null
  rooms: number
  bathrooms: number
  lotSurface?: number | null
  parking?: number
  slug: string
  city?: string
  neighborhood?: string
  btnStyle?: React.CSSProperties
  buttonLabel?: string
  disabled?: boolean
}

const W = 1080
const H = 1920
const PAD = 75
const LOGO_URL = '/logo-si-white.png'

type PillVariant = 'solid-green' | 'ghost-light' | 'ghost-dark'

interface Spec { num: string; unit: string }

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image load failed: ${src}`))
    img.src = src
  })
}

async function tryLoadImage(src: string): Promise<HTMLImageElement | null> {
  try { return await loadImage(src) } catch { return null }
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sc = Math.max(w / img.width, h / img.height)
  const iw = img.width * sc
  const ih = img.height * sc
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih)
  ctx.restore()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = t
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { variant: PillVariant; fontSize: number; textColor: string; pillH: number; padX: number }
): number {
  ctx.font = `700 ${opts.fontSize}px Raleway, system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  setLetterSpacing(ctx, 1.5)
  const tw = measureLetterSpaced(ctx, text, opts.fontSize, 1.5)
  const pw = tw + opts.padX * 2
  ctx.beginPath()
  ctx.roundRect(x, y, pw, opts.pillH, 999)
  if (opts.variant === 'solid-green') {
    ctx.fillStyle = '#1A5C38'
    ctx.fill()
  } else if (opts.variant === 'ghost-light') {
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 2
    ctx.stroke()
  } else {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  ctx.fillStyle = opts.textColor
  ctx.fillText(text, x + opts.padX, y + opts.pillH / 2)
  setLetterSpacing(ctx, 0)
  ctx.textBaseline = 'alphabetic'
  return pw
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  // ctx.letterSpacing is supported in modern browsers (Chrome 99+, Safari 16+)
  // TypeScript DOM types may not include it yet
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px` } catch { /* unsupported */ }
}

function measureLetterSpaced(ctx: CanvasRenderingContext2D, text: string, _fontSize: number, spacing: number): number {
  // Best-effort: most modern browsers reflect letterSpacing in measureText.
  const base = ctx.measureText(text).width
  // If letterSpacing isn't applied in measureText, add manual estimate.
  return base + Math.max(0, spacing) * Math.max(0, text.length - 1) * 0.2
}

function buildSpecs(props: { area: number | null; rooms: number; bathrooms: number; lotSurface?: number | null; parking?: number; propertyType: string }): Spec[] {
  const isLand = /land|terreno|lote/i.test(props.propertyType || '')
  const sp: Spec[] = []
  if (props.area && props.area > 0) sp.push({ num: String(props.area), unit: 'm²' })
  if (!isLand && props.lotSurface && props.lotSurface > 0 && props.lotSurface !== props.area) {
    sp.push({ num: String(props.lotSurface), unit: 'm² lote' })
  }
  if (!isLand && props.rooms > 0) sp.push({ num: String(props.rooms), unit: 'dorm' })
  if (props.bathrooms > 0) sp.push({ num: String(props.bathrooms), unit: `baño${props.bathrooms > 1 ? 's' : ''}` })
  if (!isLand && props.parking && props.parking > 0) sp.push({ num: String(props.parking), unit: 'coch.' })
  return sp
}

function measureFeaturesLineWidth(
  ctx: CanvasRenderingContext2D,
  specs: Spec[],
  numSize: number,
  unitSize: number,
  gap: number,
): number {
  let w = 0
  specs.forEach((s, i) => {
    if (i > 0) {
      ctx.font = `300 ${numSize}px Poppins, system-ui, sans-serif`
      w += gap
      w += ctx.measureText('·').width
      w += gap
    }
    ctx.font = `700 ${numSize}px Poppins, system-ui, sans-serif`
    w += ctx.measureText(s.num).width + 10
    ctx.font = `400 ${unitSize}px Poppins, system-ui, sans-serif`
    w += ctx.measureText(s.unit).width
  })
  return w
}

function drawFeaturesLine(
  ctx: CanvasRenderingContext2D,
  specs: Spec[],
  x: number, y: number,
  opts: { color: string; sepColor: string; numSize: number; unitSize: number; gap: number }
) {
  let cx = x
  ctx.textBaseline = 'alphabetic'
  const baseline = y
  specs.forEach((s, i) => {
    if (i > 0) {
      ctx.fillStyle = opts.sepColor
      ctx.font = `300 ${opts.numSize}px Poppins, system-ui, sans-serif`
      const sep = '·'
      ctx.fillText(sep, cx, baseline)
      cx += ctx.measureText(sep).width + opts.gap
    }
    ctx.fillStyle = opts.color
    ctx.font = `700 ${opts.numSize}px Poppins, system-ui, sans-serif`
    ctx.fillText(s.num, cx, baseline)
    cx += ctx.measureText(s.num).width + 10
    ctx.font = `400 ${opts.unitSize}px Poppins, system-ui, sans-serif`
    ctx.fillText(s.unit, cx, baseline)
    cx += ctx.measureText(s.unit).width + opts.gap
  })
}

function drawFooterRow(ctx: CanvasRenderingContext2D, y: number, primaryColor: string, secondaryColor: string) {
  ctx.fillStyle = primaryColor
  ctx.font = '700 40px Raleway, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('David Flores', PAD, y + 40)
  ctx.fillStyle = secondaryColor
  ctx.font = '400 34px Poppins, system-ui, sans-serif'
  ctx.fillText('Mat. N° 0621', PAD, y + 40 + 4 + 34)

  ctx.fillStyle = primaryColor
  ctx.font = '700 40px Raleway, system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('@inmobiliaria.si', W - PAD, y + 40)
  ctx.fillStyle = secondaryColor
  ctx.font = '400 34px Poppins, system-ui, sans-serif'
  ctx.fillText('Consultá por DM', W - PAD, y + 40 + 4 + 34)
  ctx.textAlign = 'left'
}

async function ensureFonts() {
  try { await document.fonts.ready } catch { /* ignore */ }
  const loads = [
    '400 34px Poppins', '400 52px Poppins', '600 32px Poppins',
    '700 48px Poppins', '700 52px Poppins', '700 120px Poppins', '700 140px Poppins',
    '300 52px Poppins',
    '400 40px Raleway', '700 24px Raleway', '700 40px Raleway',
    '700 100px Raleway', '800 115px Raleway', '800 95px Raleway', '800 80px Raleway',
  ]
  await Promise.all(loads.map(f => document.fonts.load(f).catch(() => null)))
}

function buildPillTexts(props: StoryPlateMultiProps): string[] {
  const ol = (props.operation || '').toLowerCase()
  const isRent = ol.includes('alquiler') || ol === 'rent'
  const isTemp = ol.includes('temporar') || ol.includes('temporary')
  const opLabel = isTemp ? 'TEMPORARIO' : isRent ? 'ALQUILER' : 'VENTA'
  const typeLabel = (props.propertyType || '').toUpperCase()
  const placeLabel = (props.neighborhood || props.city || '').toUpperCase()
  return [opLabel, typeLabel, placeLabel].filter(t => t && t.trim().length > 0)
}

async function drawEditorialCover(
  ctx: CanvasRenderingContext2D,
  props: StoryPlateMultiProps,
  photo: HTMLImageElement | null,
  logo: HTMLImageElement | null,
) {
  ctx.fillStyle = '#0d1a12'
  ctx.fillRect(0, 0, W, H)
  if (photo) drawCover(ctx, photo, 0, 0, W, H)

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0.00, 'rgba(0,0,0,0.30)')
  grad.addColorStop(0.18, 'rgba(0,0,0,0)')
  grad.addColorStop(0.38, 'rgba(0,0,0,0)')
  grad.addColorStop(0.65, 'rgba(0,0,0,0.55)')
  grad.addColorStop(1.00, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  if (logo) {
    const lh = 75
    const lw = (logo.width / logo.height) * lh
    ctx.drawImage(logo, PAD, PAD, lw, lh)
  }

  const cw = W - PAD * 2
  const pillH = 58
  const pillPadX = 28
  const pillFontSize = 24
  const pillGap = 14
  const gapItems = 50

  const pills = buildPillTexts(props)

  ctx.font = '800 115px Raleway, system-ui, sans-serif'
  let tSize = 115
  let tLines = wrapText(ctx, props.title, cw)
  if (tLines.length > 3) {
    ctx.font = '800 95px Raleway, system-ui, sans-serif'
    tSize = 95
    tLines = wrapText(ctx, props.title, cw)
  }
  if (tLines.length > 3) {
    ctx.font = '800 80px Raleway, system-ui, sans-serif'
    tSize = 80
    tLines = wrapText(ctx, props.title, cw).slice(0, 3)
  }

  const specs = buildSpecs(props)
  const specNumSize = 52
  const featuresH = specs.length > 0 ? specNumSize : 0

  const priceLabelSize = 32
  const priceValueSize = 140

  const titleH = tLines.length * tSize
  const pillsRowH = pillH
  const div1MarginTop = 10
  const div1MarginBottom = 10
  const div1H = 1
  const priceBlockH = priceLabelSize + 8 + priceValueSize
  const div2H = 1
  const footerH = 40 + 4 + 34

  const totalBlockH = pillsRowH
    + gapItems + titleH
    + (featuresH > 0 ? gapItems + featuresH : 0)
    + div1MarginTop + div1H + div1MarginBottom
    + priceBlockH
    + gapItems + div2H
    + gapItems + footerH

  let cy = H - PAD - totalBlockH

  let px = PAD
  pills.forEach((t, i) => {
    const variant: PillVariant = i === 0 ? 'solid-green' : 'ghost-light'
    const pw = drawPill(ctx, t, px, cy, { variant, fontSize: pillFontSize, textColor: '#fff', pillH, padX: pillPadX })
    px += pw + pillGap
  })
  cy += pillsRowH + gapItems

  ctx.fillStyle = '#fff'
  ctx.font = `800 ${tSize}px Raleway, system-ui, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 4
  setLetterSpacing(ctx, -4)
  for (const line of tLines) {
    ctx.fillText(line, PAD, cy + tSize)
    cy += tSize
  }
  setLetterSpacing(ctx, 0)
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  if (featuresH > 0) {
    cy += gapItems
    drawFeaturesLine(ctx, specs, PAD, cy + specNumSize, {
      color: '#fff',
      sepColor: 'rgba(255,255,255,0.35)',
      numSize: specNumSize,
      unitSize: 52,
      gap: 20,
    })
    cy += featuresH
  }

  cy += div1MarginTop
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillRect(PAD, cy, cw, div1H)
  cy += div1H + div1MarginBottom

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '600 32px Poppins, system-ui, sans-serif'
  setLetterSpacing(ctx, 6)
  ctx.fillText('PRECIO', PAD, cy + priceLabelSize)
  setLetterSpacing(ctx, 0)
  cy += priceLabelSize + 8

  ctx.fillStyle = '#fff'
  ctx.font = `700 ${priceValueSize}px Poppins, system-ui, sans-serif`
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 4
  setLetterSpacing(ctx, -4.5)
  ctx.fillText(props.price, PAD, cy + priceValueSize)
  setLetterSpacing(ctx, 0)
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  cy += priceValueSize + gapItems

  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(PAD, cy, cw, div2H)
  cy += div2H + gapItems

  drawFooterRow(ctx, cy, '#fff', 'rgba(255,255,255,0.7)')
}

async function drawSplitCard(
  ctx: CanvasRenderingContext2D,
  props: StoryPlateMultiProps,
  photo1: HTMLImageElement | null,
  photo2: HTMLImageElement | null,
  logo: HTMLImageElement | null,
) {
  ctx.fillStyle = '#0d1a12'
  ctx.fillRect(0, 0, W, H)

  const BAND_PAD_TOP = 28
  const BAND_PAD_SIDES = 72
  const BAND_PAD_BOTTOM = 33

  const cw = W - PAD * 2
  const bandCw = W - BAND_PAD_SIDES * 2
  const pillH = 54
  const pillPadX = 22
  const pillFontSize = 24
  const pillGap = 12
  const bandGap = 21

  const pills = buildPillTexts(props)

  ctx.font = '700 100px Raleway, system-ui, sans-serif'
  let tSize = 100
  let tLines = wrapText(ctx, props.title, bandCw)
  if (tLines.length > 3) {
    ctx.font = '700 85px Raleway, system-ui, sans-serif'
    tSize = 85
    tLines = wrapText(ctx, props.title, bandCw)
  }
  if (tLines.length > 3) {
    ctx.font = '700 72px Raleway, system-ui, sans-serif'
    tSize = 72
    tLines = wrapText(ctx, props.title, bandCw).slice(0, 3)
  }
  const lineH = Math.round(tSize * 1.05)
  const titleH = tLines.length * lineH

  const specs = buildSpecs(props)
  const SPEC_GAP = 20
  const SPEC_MAX = 48
  const SPEC_MIN = 36
  const SPEC_STEP = 4
  const SPEC_LINE_GAP = 12
  let specSize = SPEC_MAX
  let specLines: Spec[][] = specs.length > 0 ? [specs] : []
  if (specs.length > 0) {
    while (specSize > SPEC_MIN && measureFeaturesLineWidth(ctx, specs, specSize, specSize, SPEC_GAP) > bandCw) {
      specSize -= SPEC_STEP
    }
    if (measureFeaturesLineWidth(ctx, specs, specSize, specSize, SPEC_GAP) > bandCw) {
      const half = Math.ceil(specs.length / 2)
      specLines = [specs.slice(0, half), specs.slice(half)]
    }
  }
  const specLineCount = specLines.length
  const featuresH = specLineCount === 0
    ? 0
    : specSize * specLineCount + SPEC_LINE_GAP * (specLineCount - 1)

  const bandContentH = pillH + bandGap + titleH + (featuresH > 0 ? bandGap + featuresH : 0)
  const bandH = BAND_PAD_TOP + bandContentH + BAND_PAD_BOTTOM

  // Center band vertically so photo 1 and photo 2 end up the same height.
  const BAND_TOP = Math.round(H / 2 - bandH / 2)
  const TOP_H = BAND_TOP
  const BOT_START = BAND_TOP + bandH
  const BOT_H = H - BOT_START

  if (photo1) drawCover(ctx, photo1, 0, 0, W, TOP_H)
  else { ctx.fillStyle = '#1a3028'; ctx.fillRect(0, 0, W, TOP_H) }

  if (photo2) drawCover(ctx, photo2, 0, BOT_START, W, BOT_H)
  else { ctx.fillStyle = '#1a3028'; ctx.fillRect(0, BOT_START, W, BOT_H) }

  const topShade = ctx.createLinearGradient(0, 0, 0, TOP_H * 0.18)
  topShade.addColorStop(0, 'rgba(0,0,0,0.5)')
  topShade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topShade
  ctx.fillRect(0, 0, W, TOP_H * 0.18 + 40)

  // Stronger gradient at the bottom to protect the footer text against bright photos.
  const botShade = ctx.createLinearGradient(0, BOT_START + BOT_H * 0.1, 0, H)
  botShade.addColorStop(0, 'rgba(0,0,0,0)')
  botShade.addColorStop(0.7, 'rgba(0,0,0,0.78)')
  botShade.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = botShade
  ctx.fillRect(0, BOT_START, W, BOT_H)

  if (logo) {
    const lh = 62
    const lw = (logo.width / logo.height) * lh
    const lx = Math.round((W - lw) / 2)
    ctx.drawImage(logo, lx, 65, lw, lh)
  }

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, BAND_TOP, W, bandH)
  ctx.restore()

  let cy = BAND_TOP + BAND_PAD_TOP
  let px = BAND_PAD_SIDES
  pills.forEach((t, i) => {
    const variant: PillVariant = i === 0 ? 'solid-green' : 'ghost-dark'
    const textColor = i === 0 ? '#fff' : '#1a1a1a'
    const pw = drawPill(ctx, t, px, cy, { variant, fontSize: pillFontSize, textColor, pillH, padX: pillPadX })
    px += pw + pillGap
  })
  cy += pillH + bandGap

  ctx.fillStyle = '#1a1a1a'
  ctx.font = `700 ${tSize}px Raleway, system-ui, sans-serif`
  ctx.textBaseline = 'alphabetic'
  setLetterSpacing(ctx, -3)
  for (const line of tLines) {
    ctx.fillText(line, BAND_PAD_SIDES, cy + tSize)
    cy += lineH
  }
  setLetterSpacing(ctx, 0)

  if (featuresH > 0) {
    cy += bandGap
    let lineY = cy
    for (const lineSpecs of specLines) {
      drawFeaturesLine(ctx, lineSpecs, BAND_PAD_SIDES, lineY + specSize, {
        color: '#1a1a1a',
        sepColor: 'rgba(0,0,0,0.35)',
        numSize: specSize,
        unitSize: specSize,
        gap: SPEC_GAP,
      })
      lineY += specSize + SPEC_LINE_GAP
    }
  }

  // Bottom block — anchor footer last baseline at H - PADDING_BOTTOM (≥60 px from edge).
  const PADDING_BOTTOM = 60
  const priceLabelSize = 32
  const priceValueSize = 120
  const footerH = 40 + 4 + 34
  const divH = 1
  const divMarginTop = 35
  const divMarginBottom = 44 // ≥40 px between divider and first footer line

  const footerY = H - PADDING_BOTTOM - footerH
  const dividerY = footerY - divMarginBottom - divH
  const priceValueBaseline = dividerY - divMarginTop
  const priceLabelBaseline = priceValueBaseline - priceValueSize - 8

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '600 32px Poppins, system-ui, sans-serif'
  setLetterSpacing(ctx, 6)
  ctx.fillText('PRECIO', PAD, priceLabelBaseline)
  setLetterSpacing(ctx, 0)

  ctx.fillStyle = '#fff'
  ctx.font = `700 ${priceValueSize}px Poppins, system-ui, sans-serif`
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 4
  setLetterSpacing(ctx, -3.5)
  ctx.fillText(props.price, PAD, priceValueBaseline)
  setLetterSpacing(ctx, 0)
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(PAD, dividerY, cw, divH)

  drawFooterRow(ctx, footerY, '#fff', 'rgba(255,255,255,0.7)')
}

export default function StoryPlateMulti(props: StoryPlateMultiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = W
    canvas.height = H

    await ensureFonts()

    const [photos, logo] = await Promise.all([
      Promise.all((props.photos || []).slice(0, 2).map(url => tryLoadImage(url))),
      tryLoadImage(LOGO_URL),
    ])

    const validPhotos = photos.filter((p): p is HTMLImageElement => p !== null)

    if (validPhotos.length >= 2) {
      await drawSplitCard(ctx, props, validPhotos[0], validPhotos[1], logo)
    } else {
      const single = validPhotos[0] || null
      await drawEditorialCover(ctx, props, single, logo)
    }

    return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'))
  }, [props])

  const handleDownload = useCallback(async () => {
    if (generating || props.disabled) return
    setGenerating(true)
    try {
      const blob = await generate()
      if (!blob) return
      const file = new File([blob], `placa-${props.slug}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean }
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: 'Placa Instagram' })
          return
        } catch { /* user cancelled or permission denied; fall through */ }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `placa-${props.slug}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }, [generate, generating, props.disabled, props.slug])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={handleDownload}
        disabled={generating || props.disabled}
        style={{
          ...(props.btnStyle ?? {}),
          background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
          color: '#fff',
          opacity: generating || props.disabled ? 0.6 : 1,
          cursor: generating || props.disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {generating ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Instagram size={16} />
        )}
        {props.buttonLabel ?? 'Descargar placa'}
      </button>
    </>
  )
}

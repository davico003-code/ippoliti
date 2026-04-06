'use client'

import { useRef, useState, useCallback } from 'react'
import { Instagram } from 'lucide-react'

interface Props {
  title: string
  price: string
  photo: string | null
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
}

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function buildEditorialTitle(type: string, rooms: number, neighborhood: string | null, city: string): string {
  const loc = neighborhood ? toTitleCase(neighborhood) : toTitleCase(city || 'Funes')
  const t = (type || '').toLowerCase()
  const d = rooms > 0 ? ` ${rooms} dormitorios` : ''
  if (t.includes('house') || t.includes('casa')) return `Casa${d} en ${loc}`
  if (t.includes('apartment') || t.includes('departamento')) return `Departamento${d} en ${loc}`
  if (t.includes('ph')) return `PH${d} en ${loc}`
  if (t.includes('land') || t.includes('terreno') || t.includes('lote')) return `Lote en ${loc}`
  if (t.includes('office') || t.includes('oficina')) return `Oficina en ${loc}`
  if (t.includes('local') || t.includes('bussiness') || t.includes('business')) return `Local comercial en ${loc}`
  if (t.includes('galpon') || t.includes('galpón')) return `Galpón en ${loc}`
  if (t.includes('campo')) return `Campo en ${toTitleCase(city || 'Rosario')}`
  if (t.includes('fondo')) return `Fondo de comercio en ${loc}`
  if (t.includes('garage') || t.includes('cochera')) return `Cochera en ${loc}`
  return `Propiedad en ${loc}`
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w } else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

export default function StoryPlate({ title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface, parking, slug, city, neighborhood, btnStyle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    await document.fonts.ready

    const W = 1080, H = 1920, px = 64, cw = W - px * 2
    canvas.width = W; canvas.height = H
    ctx.fillStyle = '#0d1a12'; ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'

    // ── Photo ──
    if (photo) {
      try {
        const img = new Image(); img.crossOrigin = 'anonymous'
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = photo })
        const sc = Math.max(W / img.width, H / img.height)
        ctx.drawImage(img, (W - img.width * sc) / 2, (H - img.height * sc) / 2, img.width * sc, img.height * sc)
      } catch { ctx.fillStyle = '#1a3028'; ctx.fillRect(0, 0, W, H) }
    }

    // ── Gradients (top + bottom) ──
    const topGrad = ctx.createLinearGradient(0, 0, 0, 240)
    topGrad.addColorStop(0, 'rgba(0,0,0,0.38)'); topGrad.addColorStop(0.75, 'rgba(0,0,0,0.08)'); topGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, 240)

    const botGrad = ctx.createLinearGradient(0, 800, 0, H)
    botGrad.addColorStop(0, 'rgba(0,0,0,0.25)'); botGrad.addColorStop(0.15, 'rgba(0,0,0,0)')
    botGrad.addColorStop(0.35, 'rgba(0,0,0,0)'); botGrad.addColorStop(0.55, 'rgba(0,0,0,0.4)')
    botGrad.addColorStop(0.78, 'rgba(0,0,0,0.78)'); botGrad.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = botGrad; ctx.fillRect(0, 800, W, H - 800)

    // ── HEADER SI (top band, y < 285) ──
    const hx = 64, hy = 60
    ctx.beginPath(); ctx.roundRect(hx, hy, 84, 84, 16); ctx.fillStyle = '#1A5C38'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 36px Poppins, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('SI', hx + 42, hy + 24); ctx.textAlign = 'left'
    const ltx = hx + 84 + 26
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font = '500 32px Poppins, system-ui, sans-serif'
    ctx.fillText('INMOBILIARIA', ltx, hy + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '500 24px Poppins, system-ui, sans-serif'
    ctx.fillText('DESDE 1983', ltx, hy + 52)

    // ── Operation detection ──
    const opLower = (operation || '').toLowerCase()
    const isRent = opLower.includes('alquiler') || opLower === 'rent'
    const isTemp = opLower.includes('temporar') || opLower.includes('temporary')
    const pillOp = isTemp ? 'TEMPORARIO' : isRent ? 'ALQUILER' : 'VENTA'
    const priceLabel = isTemp ? 'ALQUILER TEMPORARIO' : isRent ? 'ALQUILER MENSUAL' : 'PRECIO'
    const priceSuffix = isTemp ? '/ noche' : isRent ? '/ mes' : ''

    // ── Title sizing ──
    const editTitle = buildEditorialTitle(propertyType || title, rooms, neighborhood || null, city || '')

    ctx.font = '500 82px Raleway, system-ui, sans-serif'
    const singleW = ctx.measureText(editTitle).width
    let titleSize: number, priceSize: number, suffixSize: number, titleMB: number, titleLines: string[]

    if (singleW <= cw) {
      titleSize = 82; priceSize = 96; suffixSize = 38; titleMB = 44; titleLines = [editTitle]
    } else {
      ctx.font = '500 68px Raleway, system-ui, sans-serif'
      const wrapped = wrapText(ctx, editTitle, cw)
      if (wrapped.length <= 2) {
        titleSize = 68; priceSize = 78; suffixSize = 32; titleMB = 34; titleLines = wrapped.slice(0, 2)
      } else {
        ctx.font = '500 58px Raleway, system-ui, sans-serif'
        titleSize = 58; priceSize = 68; suffixSize = 28; titleMB = 30
        titleLines = wrapText(ctx, editTitle, cw).slice(0, 2)
      }
    }

    // ── Calculate block height bottom-up from y=1590 ──
    const pillH = 54, pillMB = 46
    const titleH = titleLines.length * Math.round(titleSize * 1.1)
    const isLand = /land|terreno|lote/i.test(propertyType || '')
    const specParts: string[] = []
    if (area && area > 0) specParts.push(`${area} m²`)
    if (!isLand && lotSurface && lotSurface > 0 && lotSurface !== area) specParts.push(`${lotSurface} m² lote`)
    if (!isLand && rooms > 0) specParts.push(`${rooms} dorm`)
    if (bathrooms > 0) specParts.push(`${bathrooms} baño${bathrooms > 1 ? 's' : ''}`)
    if (!isLand && parking && parking > 0) specParts.push(`${parking} cochera${parking > 1 ? 's' : ''}`)
    const hasSpecs = specParts.length > 0
    const specH = hasSpecs ? 34 + 48 : 20
    const div1H = 2 + 38
    const labelH = 24 + 10
    const priceH = priceSize
    const priceMB = 38
    const div2H = 2

    const blockH = pillH + pillMB + titleH + titleMB + specH + div1H + labelH + priceH + priceMB + div2H
    let cy = 1590 - blockH

    // ── RENDER BLOCK ──

    // Pills
    const pill = (text: string, x: number, y: number, solid: boolean): number => {
      ctx.font = '500 30px Poppins, system-ui, sans-serif'
      const tw = ctx.measureText(text).width, pw = tw + 80
      ctx.beginPath(); ctx.roundRect(x, y, pw, pillH, 999)
      if (solid) { ctx.fillStyle = '#1A5C38'; ctx.fill() }
      else { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.stroke() }
      ctx.fillStyle = '#fff'; ctx.fillText(text, x + 40, y + 12); return pw
    }
    let bx = px
    bx += pill(pillOp, bx, cy, true) + 20
    bx += pill(propertyType.toUpperCase(), bx, cy, false) + 20
    if (city) pill(city.toUpperCase(), bx, cy, false)
    cy += pillH + pillMB

    // Title
    ctx.fillStyle = '#fff'; ctx.font = `500 ${titleSize}px Raleway, system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    for (const ln of titleLines) { ctx.fillText(ln, px, cy); cy += Math.round(titleSize * 1.1) }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    cy += titleMB

    // Specs line
    if (hasSpecs) {
      ctx.font = '400 34px Poppins, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.78)'
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 4
      ctx.fillText(specParts.join(' · '), px, cy)
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      cy += 34 + 48
    } else {
      cy += 20
    }

    // Divider 1
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(px, cy, cw, 2); cy += 2 + 38

    // Price label
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '500 24px Poppins, system-ui, sans-serif'
    ctx.fillText(priceLabel, px, cy); cy += 24 + 10

    // Price value
    const cleanPrice = price.replace(/\s*\/\s*(mes|noche|semana|día)$/i, '').trim()
    ctx.fillStyle = '#fff'; ctx.font = `600 ${priceSize}px Poppins, system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    ctx.fillText(cleanPrice, px, cy)
    const priceW = ctx.measureText(cleanPrice).width
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

    // Price suffix
    if (priceSuffix) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `400 ${suffixSize}px Poppins, system-ui, sans-serif`
      const offsetY = priceSize - suffixSize - 6
      ctx.fillText(priceSuffix, px + priceW + 12, cy + offsetY)
    }
    cy += priceSize + priceMB

    // Divider 2
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(px, cy, cw, 2)

    // ── FOOTER (bottom band, y > 1635) ──
    const fy = 1770, avSz = 82
    ctx.beginPath(); ctx.arc(px + avSz / 2, fy + avSz / 2, avSz / 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 28px Poppins, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('DF', px + avSz / 2, fy + 26); ctx.textAlign = 'left'
    const agX = px + avSz + 24
    ctx.fillStyle = '#fff'; ctx.font = '500 32px Poppins, system-ui, sans-serif'
    ctx.fillText('David Flores', agX, fy + 14)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 26px Poppins, system-ui, sans-serif'
    ctx.fillText('Mat. N° 0621', agX, fy + 52)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'; ctx.font = '500 32px Poppins, system-ui, sans-serif'
    ctx.fillText('@inmobiliaria.si', W - px, fy + 14)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 26px Poppins, system-ui, sans-serif'
    ctx.fillText('Consultá por DM', W - px, fy + 52)
    ctx.textAlign = 'left'

    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'))
  }, [title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface, parking, city, neighborhood])

  const handleDownload = useCallback(async () => {
    setGenerating(true)
    try {
      const blob = await generate()
      if (!blob) return
      const file = new File([blob], `placa-${slug}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Placa Instagram' }); return } catch {}
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `placa-${slug}.png`; a.click()
      URL.revokeObjectURL(url)
    } finally { setGenerating(false) }
  }, [generate, slug])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={handleDownload} disabled={generating}
        style={{ ...(btnStyle ?? {}), background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', opacity: generating ? 0.6 : 1 }}>
        {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Instagram size={16} />}
        Placa
      </button>
    </>
  )
}

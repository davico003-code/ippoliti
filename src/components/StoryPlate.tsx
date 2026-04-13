'use client'

import { useRef, useState, useCallback } from 'react'
import { Instagram } from 'lucide-react'

interface Props {
  title: string; price: string; photo: string | null; operation: string; propertyType: string
  area: number | null; rooms: number; bathrooms: number; lotSurface?: number | null
  parking?: number; slug: string; city?: string; neighborhood?: string; btnStyle?: React.CSSProperties
}

function toTitleCase(s: string): string { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) }

function buildEditorialTitle(type: string, rooms: number, nb: string | null, city: string): string {
  const loc = nb ? toTitleCase(nb) : toTitleCase(city || 'Funes')
  const t = (type || '').toLowerCase(), d = rooms > 0 ? ` ${rooms} dormitorios` : ''
  if (t.includes('house') || t.includes('casa')) return `Casa${d} en ${loc}`
  if (t.includes('apartment') || t.includes('departamento')) return `Departamento${d} en ${loc}`
  if (t.includes('ph')) return `PH${d} en ${loc}`
  if (t.includes('land') || t.includes('terreno') || t.includes('lote')) return `Lote en ${loc}`
  if (t.includes('office') || t.includes('oficina')) return `Oficina en ${loc}`
  if (t.includes('local') || t.includes('bussiness') || t.includes('business')) return `Local comercial en ${loc}`
  if (t.includes('galpon') || t.includes('galpón')) return `Galpón en ${loc}`
  if (t.includes('campo')) return `Campo en ${toTitleCase(city || 'Rosario')}`
  if (t.includes('fondo')) return `Fondo de comercio en ${loc}`
  return `Propiedad en ${loc}`
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' '), lines: string[] = []; let cur = ''
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur); return lines
}

export default function StoryPlate({ title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface, parking, slug, city, neighborhood, btnStyle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current; if (!canvas) return null
    const ctx = canvas.getContext('2d'); if (!ctx) return null
    await document.fonts.ready

    const W = 1080, H = 1920, px = 64, cw = W - px * 2
    canvas.width = W; canvas.height = H
    ctx.fillStyle = '#0d1a12'; ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'

    // Photo
    if (photo) {
      try {
        const img = new Image(); img.crossOrigin = 'anonymous'
        await new Promise<void>((r, j) => { img.onload = () => r(); img.onerror = () => j(); img.src = photo })
        const sc = Math.max(W / img.width, H / img.height)
        ctx.drawImage(img, (W - img.width * sc) / 2, (H - img.height * sc) / 2, img.width * sc, img.height * sc)
      } catch { ctx.fillStyle = '#1a3028'; ctx.fillRect(0, 0, W, H) }
    }

    // Single gradient
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(0.18, 'rgba(0,0,0,0)')
    g.addColorStop(0.38, 'rgba(0,0,0,0)'); g.addColorStop(0.52, 'rgba(0,0,0,0.35)')
    g.addColorStop(0.72, 'rgba(0,0,0,0.72)'); g.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    // ── HEADER (y < 285) ──
    const hx = 64, hy = 68
    ctx.beginPath(); ctx.roundRect(hx, hy, 84, 84, 16); ctx.fillStyle = '#1A5C38'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 36px Poppins, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('SI', hx + 42, hy + 24); ctx.textAlign = 'left'
    const lx = hx + 110
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font = '500 32px Poppins, system-ui, sans-serif'; ctx.fillText('INMOBILIARIA', lx, hy + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '500 24px Poppins, system-ui, sans-serif'; ctx.fillText('DESDE 1983', lx, hy + 54)

    // ── Operation ──
    const ol = (operation || '').toLowerCase()
    const isRent = ol.includes('alquiler') || ol === 'rent', isTemp = ol.includes('temporar') || ol.includes('temporary')
    const pillOp = isTemp ? 'TEMPORARIO' : isRent ? 'ALQUILER' : 'VENTA'
    const pLabel = isTemp ? 'ALQUILER TEMPORARIO' : isRent ? 'ALQUILER MENSUAL' : 'PRECIO'
    const pSuffix = isTemp ? '/ noche' : isRent ? '/ mes' : ''

    // ── Title sizing ──
    const et = buildEditorialTitle(propertyType || title, rooms, neighborhood || null, city || '')
    ctx.font = '700 82px Raleway, system-ui, sans-serif'
    let tSz: number, pSz: number, sSz: number, tMB: number, tLines: string[]
    if (ctx.measureText(et).width <= cw) { tSz = 82; pSz = 96; sSz = 38; tMB = 42; tLines = [et] }
    else { ctx.font = '700 68px Raleway, system-ui, sans-serif'; const w2 = wrap(ctx, et, cw)
      if (w2.length <= 2) { tSz = 68; pSz = 78; sSz = 32; tMB = 32; tLines = w2.slice(0, 2) }
      else { ctx.font = '700 58px Raleway, system-ui, sans-serif'; tSz = 58; pSz = 68; sSz = 28; tMB = 28; tLines = wrap(ctx, et, cw).slice(0, 2) }
    }

    // ── Specs ──
    const isLand = /land|terreno|lote/i.test(propertyType || '')
    const sp: string[] = []
    if (area && area > 0) sp.push(`${area} m²`)
    if (!isLand && lotSurface && lotSurface > 0 && lotSurface !== area) sp.push(`${lotSurface} m² lote`)
    if (!isLand && rooms > 0) sp.push(`${rooms} dorm`)
    if (bathrooms > 0) sp.push(`${bathrooms} baño${bathrooms > 1 ? 's' : ''}`)
    if (!isLand && parking && parking > 0) sp.push(`${parking} cochera${parking > 1 ? 's' : ''}`)
    const hasSpecs = sp.length > 0

    // ── Block height (bottom-up from y=1600) ──
    const pillH = 54, pillMB = 44
    const titleH = tLines.length * Math.round(tSz * 1.1)
    const specH = hasSpecs ? 34 + 42 : 16
    const div1H = 2 + 34, labelH = 24 + 10, priceH = pSz, priceMB = 34, div2H = 2
    const blockH = pillH + pillMB + titleH + tMB + specH + div1H + labelH + priceH + priceMB + div2H
    let cy = 1600 - blockH

    // ── RENDER ──

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
    bx += pill(pillOp, bx, cy, true) + 20; bx += pill(propertyType.toUpperCase(), bx, cy, false) + 20
    if (city) pill(city.toUpperCase(), bx, cy, false)
    cy += pillH + pillMB

    // Title
    ctx.fillStyle = '#fff'; ctx.font = `700 ${tSz}px Raleway, system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    for (const ln of tLines) { ctx.fillText(ln, px, cy); cy += Math.round(tSz * 1.1) }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; cy += tMB

    // Specs
    if (hasSpecs) {
      ctx.font = '400 34px Poppins, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.78)'
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 4
      ctx.fillText(sp.join(' · '), px, cy); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; cy += 34 + 42
    } else cy += 16

    // Divider 1
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(px, cy, cw, 2); cy += 2 + 34

    // Price label
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '500 24px Poppins, system-ui, sans-serif'; ctx.fillText(pLabel, px, cy); cy += 34

    // Price value
    const cp = price.replace(/\s*\/\s*(mes|noche|semana|día)$/i, '').trim()
    ctx.fillStyle = '#fff'; ctx.font = `600 ${pSz}px Poppins, system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    ctx.fillText(cp, px, cy); const pw = ctx.measureText(cp).width
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    if (pSuffix) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `400 ${sSz}px Poppins, system-ui, sans-serif`; ctx.fillText(pSuffix, px + pw + 12, cy + pSz - sSz - 6) }
    cy += pSz + priceMB

    // Divider 2
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(px, cy, cw, 2)

    // ── FOOTER (y > 1635) ──
    const fy = 1770, av = 82
    ctx.beginPath(); ctx.arc(px + av / 2, fy + av / 2, av / 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 28px Poppins, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('DF', px + av / 2, fy + 26); ctx.textAlign = 'left'
    const ax = px + av + 24
    ctx.fillStyle = '#fff'; ctx.font = '500 32px Poppins, system-ui, sans-serif'; ctx.fillText('David Flores', ax, fy + 14)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 26px Poppins, system-ui, sans-serif'; ctx.fillText('Mat. N° 0621', ax, fy + 52)
    ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = '500 32px Poppins, system-ui, sans-serif'; ctx.fillText('@inmobiliaria.si', W - px, fy + 14)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 26px Poppins, system-ui, sans-serif'; ctx.fillText('Consultá por DM', W - px, fy + 52); ctx.textAlign = 'left'

    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'))
  }, [title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface, parking, city, neighborhood])

  const handleDownload = useCallback(async () => {
    setGenerating(true)
    try {
      const blob = await generate(); if (!blob) return
      const file = new File([blob], `placa-${slug}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Placa Instagram' }); return } catch {} }
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `placa-${slug}.png`; a.click(); URL.revokeObjectURL(url)
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

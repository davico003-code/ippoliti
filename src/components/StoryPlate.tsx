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

function adaptiveWrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, sizes: number[]): { lines: string[]; size: number } {
  for (const sz of sizes) {
    ctx.font = `500 ${sz}px Raleway, system-ui, sans-serif`
    const words = text.split(' ')
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w } else cur = test
    }
    if (cur) lines.push(cur)
    if (lines.length <= 2) return { lines: lines.slice(0, 2), size: sz }
  }
  return { lines: [text.slice(0, 38) + '…'], size: sizes[sizes.length - 1] }
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

    const W = 1080, H = 1920, px = 64
    canvas.width = W; canvas.height = H
    ctx.fillStyle = '#0d1a12'; ctx.fillRect(0, 0, W, H)

    // ── Photo ──
    if (photo) {
      try {
        const img = new Image(); img.crossOrigin = 'anonymous'
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = photo })
        const sc = Math.max(W / img.width, H / img.height)
        ctx.drawImage(img, (W - img.width * sc) / 2, (H - img.height * sc) / 2, img.width * sc, img.height * sc)
      } catch { ctx.fillStyle = '#1a3028'; ctx.fillRect(0, 0, W, H) }
    }

    // ── Gradient ──
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0.28)')
    grad.addColorStop(0.18, 'rgba(0,0,0,0)')
    grad.addColorStop(0.38, 'rgba(0,0,0,0)')
    grad.addColorStop(0.52, 'rgba(0,0,0,0.35)')
    grad.addColorStop(0.72, 'rgba(0,0,0,0.75)')
    grad.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'

    // ── HEADER: SI monogram ──
    const hx = 60, hy = 54
    ctx.beginPath(); ctx.roundRect(hx, hy, 78, 78, 15); ctx.fillStyle = '#1A5C38'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 33px Poppins, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('SI', hx + 39, hy + 22); ctx.textAlign = 'left'
    const tx = hx + 78 + 24
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font = '500 28px Poppins, system-ui, sans-serif'
    ctx.fillText('INMOBILIARIA', tx, hy + 8)
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '500 22px Poppins, system-ui, sans-serif'
    ctx.fillText('DESDE 1983', tx, hy + 44)

    // ── CONTENT BLOCK ──
    const cw = W - px * 2
    let cy = 1220

    // Pills
    const pill = (text: string, x: number, y: number, solid: boolean): number => {
      ctx.font = '500 30px Poppins, system-ui, sans-serif'
      const tw = ctx.measureText(text).width, pw = tw + 80, ph = 54
      ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 999)
      if (solid) { ctx.fillStyle = '#1A5C38'; ctx.fill() }
      else { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.stroke() }
      ctx.fillStyle = '#fff'; ctx.fillText(text, x + 40, y + 12)
      return pw
    }
    // Determine operation type
    const opLower = (operation || '').toLowerCase()
    const isRent = opLower.includes('alquiler') || opLower === 'rent'
    const isTemp = opLower.includes('temporar') || opLower.includes('temporary')
    const pillOp = isTemp ? 'TEMPORARIO' : isRent ? 'ALQUILER' : 'VENTA'

    let bx = px
    bx += pill(pillOp, bx, cy, true) + 20
    bx += pill(propertyType.toUpperCase(), bx, cy, false) + 20
    if (city) pill(city.toUpperCase(), bx, cy, false)
    cy += 54 + 52

    // Title
    const editTitle = buildEditorialTitle(propertyType || title, rooms, neighborhood || null, city || '')
    const { lines, size } = adaptiveWrap(ctx, editTitle, cw, [82, 72, 64])
    ctx.fillStyle = '#fff'; ctx.font = `500 ${size}px Raleway, system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    for (const ln of lines) { ctx.fillText(ln, px, cy); cy += Math.round(size * 1.1) }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    cy += 28

    // Specs line (text with · separators, NOT pills)
    const isLand = /land|terreno|lote/i.test(propertyType || '')
    const specParts: string[] = []
    if (area && area > 0) specParts.push(`${area} m²`)
    if (!isLand && lotSurface && lotSurface > 0 && lotSurface !== area) specParts.push(`${lotSurface} m² lote`)
    if (!isLand && rooms > 0) specParts.push(`${rooms} dorm`)
    if (bathrooms > 0) specParts.push(`${bathrooms} baño${bathrooms > 1 ? 's' : ''}`)
    if (!isLand && parking && parking > 0) specParts.push(`${parking} cochera${parking > 1 ? 's' : ''}`)

    if (specParts.length > 0) {
      const specLine = specParts.join(' · ')
      ctx.font = '400 34px Poppins, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 4
      ctx.fillText(specLine, px, cy)
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      cy += 34 + 60
    } else {
      cy += 20
    }

    // Divider
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(px, cy, cw, 2); cy += 2 + 44

    // Price label — adapts to operation type
    const priceLabel = isTemp ? 'ALQUILER TEMPORARIO' : isRent ? 'ALQUILER MENSUAL' : 'PRECIO'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '500 24px Poppins, system-ui, sans-serif'
    ctx.fillText(priceLabel, px, cy); cy += 34

    // Price value — strip /mes or /noche suffix if present in pre-formatted price
    const cleanPrice = price.replace(/\s*\/\s*(mes|noche|semana|día)$/i, '').trim()
    ctx.fillStyle = '#fff'; ctx.font = '600 78px Poppins, system-ui, sans-serif'
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    ctx.fillText(cleanPrice, px, cy)
    const priceW = ctx.measureText(cleanPrice).width
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

    // Price suffix for rent
    if (isRent || isTemp) {
      const suffix = isTemp ? '/ noche' : '/ mes'
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '400 28px Poppins, system-ui, sans-serif'
      ctx.fillText(suffix, px + priceW + 10, cy + 44)
    }
    cy += 78 + 52

    // Footer divider
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(px, cy, cw, 2); cy += 2 + 36

    // Footer left — agent
    const avSz = 80
    ctx.beginPath(); ctx.arc(px + avSz / 2, cy + avSz / 2, avSz / 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 28px Poppins, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('DF', px + avSz / 2, cy + 25); ctx.textAlign = 'left'
    const agX = px + avSz + 26
    ctx.fillStyle = '#fff'; ctx.font = '500 32px Poppins, system-ui, sans-serif'
    ctx.fillText('David Flores', agX, cy + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 26px Poppins, system-ui, sans-serif'
    ctx.fillText('Mat. N° 0621', agX, cy + 50)

    // Footer right — brand
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'; ctx.font = '500 32px Poppins, system-ui, sans-serif'
    ctx.fillText('@inmobiliaria.si', W - px, cy + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 26px Poppins, system-ui, sans-serif'
    ctx.fillText('Consultá por DM', W - px, cy + 50)
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

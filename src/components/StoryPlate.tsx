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
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function buildEditorialTitle(type: string, rooms: number, neighborhood: string | null, city: string): string {
  const loc = neighborhood ? toTitleCase(neighborhood) : toTitleCase(city)
  const t = type.toLowerCase()
  const dorms = rooms > 0 ? ` ${rooms} dormitorios` : ''
  if (t.includes('house') || t.includes('casa')) return `Casa${dorms} en ${loc}`
  if (t.includes('apartment') || t.includes('departamento')) return `Departamento${dorms} en ${loc}`
  if (t.includes('ph')) return `PH${dorms} en ${loc}`
  if (t.includes('land') || t.includes('terreno') || t.includes('lote')) return `Lote en ${loc}`
  if (t.includes('office') || t.includes('oficina')) return `Oficina en ${loc}`
  if (t.includes('local') || t.includes('bussiness') || t.includes('business')) return `Local comercial en ${loc}`
  if (t.includes('galpon') || t.includes('galpón')) return `Galpón en ${loc}`
  if (t.includes('campo')) return `Campo en ${toTitleCase(city)}`
  if (t.includes('fondo')) return `Fondo de comercio en ${loc}`
  if (t.includes('garage') || t.includes('cochera')) return `Cochera en ${loc}`
  return `Propiedad en ${loc}`
}

function wrapTextAdaptive(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, sizes: number[]): { lines: string[]; fontSize: number } {
  for (const size of sizes) {
    ctx.font = `500 ${size}px Raleway, system-ui, sans-serif`
    const words = text.split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word } else { current = test }
    }
    if (current) lines.push(current)
    if (lines.length <= 2) return { lines: lines.slice(0, 2), fontSize: size }
  }
  return { lines: [text.slice(0, 40) + '…'], fontSize: sizes[sizes.length - 1] }
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

    const W = 1080, H = 1920, px = 66
    canvas.width = W; canvas.height = H
    ctx.fillStyle = '#0d1a12'; ctx.fillRect(0, 0, W, H)

    // Photo
    if (photo) {
      try {
        const img = new Image(); img.crossOrigin = 'anonymous'
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = photo })
        const scale = Math.max(W / img.width, H / img.height)
        ctx.drawImage(img, (W - img.width * scale) / 2, (H - img.height * scale) / 2, img.width * scale, img.height * scale)
      } catch { ctx.fillStyle = '#1a3028'; ctx.fillRect(0, 0, W, H) }
    }

    // Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0.28)'); grad.addColorStop(0.18, 'rgba(0,0,0,0)')
    grad.addColorStop(0.38, 'rgba(0,0,0,0)'); grad.addColorStop(0.52, 'rgba(0,0,0,0.35)')
    grad.addColorStop(0.72, 'rgba(0,0,0,0.72)'); grad.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'

    // ── HEADER ──
    const hx = 60, hy = 54
    ctx.beginPath(); ctx.roundRect(hx, hy, 78, 78, 15); ctx.fillStyle = '#1A5C38'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 33px Poppins, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('SI', hx + 39, hy + 22); ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font = '500 28px Poppins, system-ui, sans-serif'
    ctx.fillText('INMOBILIARIA', hx + 102, hy + 10)
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '500 22px Poppins, system-ui, sans-serif'
    ctx.fillText('DESDE 1983', hx + 102, hy + 44)

    // ── CONTENT ──
    let cy = 1180
    const contentW = W - px * 2

    // Pills
    const drawPill = (text: string, x: number, y: number, filled: boolean): number => {
      ctx.font = '500 27px Poppins, system-ui, sans-serif'
      const tw = ctx.measureText(text).width, pw = tw + 78, ph = 52
      ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 999)
      if (filled) { ctx.fillStyle = '#1A5C38'; ctx.fill() }
      else { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.stroke() }
      ctx.fillStyle = '#fff'; ctx.fillText(text, x + 39, y + 12)
      return pw
    }
    let pillX = px
    pillX += drawPill(operation.toUpperCase(), pillX, cy, true) + 18
    pillX += drawPill(propertyType.toUpperCase(), pillX, cy, false) + 18
    if (city) drawPill(city.toUpperCase(), pillX, cy, false)
    cy += 100

    // Title
    const editTitle = buildEditorialTitle(propertyType || title, rooms, neighborhood || null, city || '')
    const { lines, fontSize } = wrapTextAdaptive(ctx, editTitle, contentW, [72, 64, 58])
    ctx.fillStyle = '#fff'; ctx.font = `500 ${fontSize}px Raleway, system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    for (const line of lines) { ctx.fillText(line, px, cy); cy += Math.round(fontSize * 1.12) }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; cy += 48

    // Specs
    const isLand = /land|terreno|lote/i.test(propertyType)
    const specs: string[] = []
    if (area && area > 0) specs.push(`${area} m²`)
    if (!isLand && lotSurface && lotSurface > 0 && lotSurface !== area) specs.push(`${lotSurface} m² lote`)
    if (!isLand && rooms > 0) specs.push(`${rooms} dorm`)
    if (bathrooms > 0) specs.push(`${bathrooms} baño${bathrooms > 1 ? 's' : ''}`)
    if (!isLand && parking && parking > 0) specs.push(`${parking} cochera${parking > 1 ? 's' : ''}`)

    if (specs.length > 0) {
      let sx = px
      for (const spec of specs.slice(0, 4)) {
        ctx.font = '400 30px Poppins, system-ui, sans-serif'
        const tw = ctx.measureText(spec).width, sw = tw + 84
        ctx.beginPath(); ctx.roundRect(sx, cy, sw, 52, 999)
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillText(spec, sx + 42, cy + 11)
        sx += sw + 18
      }
      cy += 106
    }

    // Divider
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(px, cy, contentW, 2); cy += 44

    // Price
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 25px Poppins, system-ui, sans-serif'; ctx.fillText('PRECIO', px, cy); cy += 37
    ctx.fillStyle = '#fff'; ctx.font = '600 96px Poppins, system-ui, sans-serif'
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 6
    ctx.fillText(price, px, cy); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; cy += 164

    // Footer divider
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(px, cy, contentW, 2); cy += 38

    // Footer left — agent
    ctx.beginPath(); ctx.arc(px + 42, cy + 42, 42, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 27px Poppins, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('DF', px + 42, cy + 27); ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'; ctx.font = '500 31px Poppins, system-ui, sans-serif'; ctx.fillText('David Flores', px + 111, cy + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 25px Poppins, system-ui, sans-serif'; ctx.fillText('Mat. N° 0621', px + 111, cy + 50)

    // Footer right — brand
    ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = '500 31px Poppins, system-ui, sans-serif'; ctx.fillText('@inmobiliaria.si', W - px, cy + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '400 25px Poppins, system-ui, sans-serif'; ctx.fillText('Consultá por DM', W - px, cy + 50)
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

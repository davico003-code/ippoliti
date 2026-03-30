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
  slug: string
}

export default function StoryPlate({ title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface, slug }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const W = 1080, H = 1920
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#0d1a12'
    ctx.fillRect(0, 0, W, H)

    if (photo) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject()
          img.src = photo
        })
        const scale = Math.max(W / img.width, H / img.height)
        const sw = img.width * scale, sh = img.height * scale
        ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)
      } catch {
        ctx.fillStyle = '#1a3028'
        ctx.fillRect(0, 0, W, H)
      }
    }

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0.30)')
    grad.addColorStop(0.20, 'rgba(0,0,0,0.0)')
    grad.addColorStop(0.40, 'rgba(0,0,0,0.0)')
    grad.addColorStop(0.65, 'rgba(0,0,0,0.75)')
    grad.addColorStop(1, 'rgba(0,0,0,0.93)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    const px = 80

    ctx.textBaseline = 'top'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '400 38px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('David Flores', px, 72)
    ctx.textAlign = 'right'
    ctx.fillText('MAT. N° 0621', W - px, 72)
    ctx.textAlign = 'left'

    let cy = H * 0.62

    const drawPill = (text: string, x: number, y: number, filled: boolean): number => {
      ctx.font = '700 30px system-ui, sans-serif'
      const tw = ctx.measureText(text).width
      const pw = tw + 80, ph = 56
      ctx.beginPath()
      ctx.roundRect(x, y, pw, ph, 28)
      if (filled) {
        ctx.fillStyle = '#1A5C38'
        ctx.fill()
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.fillStyle = '#fff'
      ctx.fillText(text, x + 40, y + 13)
      return pw
    }

    const op = operation.toUpperCase()
    const tp = propertyType.toUpperCase()
    const pw1 = drawPill(op, px, cy, true)
    drawPill(tp, px + pw1 + 24, cy, false)
    cy += 56 + 36

    ctx.fillStyle = '#fff'
    ctx.font = '500 68px system-ui, sans-serif'
    const lines = wrapText(ctx, title, W - px * 2, 68)
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, px, cy)
      cy += 88
    }
    cy += 8

    ctx.fillStyle = '#fff'
    ctx.font = '800 90px system-ui, sans-serif'
    ctx.fillText(price, px, cy)
    cy += 110

    const specs: string[] = []
    if (area && area > 0) specs.push(`${area} m²`)
    if (rooms > 0) specs.push(`${rooms} dorm.`)
    if (bathrooms > 0) specs.push(`${bathrooms} baños`)
    if (lotSurface && lotSurface > 0) specs.push(`${lotSurface} m² lote`)

    if (specs.length > 0) {
      let sx = px
      ctx.font = '400 32px system-ui, sans-serif'
      for (const spec of specs) {
        const tw = ctx.measureText(spec).width
        const sw = tw + 72
        ctx.beginPath()
        ctx.roundRect(sx, cy, sw, 56, 28)
        ctx.fillStyle = 'rgba(0,0,0,0)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.fillText(spec, sx + 36, cy + 12)
        sx += sw + 20
      }
      cy += 56 + 52
    }

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(px, cy, W - px * 2, 1)
    cy += 40

    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '400 30px system-ui, sans-serif'
    ctx.fillText('@inmobiliaria.si', px, cy)
    cy += 46

    ctx.fillStyle = '#fff'
    ctx.font = '700 36px system-ui, sans-serif'
    ctx.fillText('Escribinos por DM', px, cy)

    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'))
  }, [title, price, photo, operation, propertyType, area, rooms, bathrooms, lotSurface])

  const handleDownload = useCallback(async () => {
    setGenerating(true)
    try {
      const blob = await generate()
      if (!blob) return
      const file = new File([blob], `placa-${slug}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Placa Instagram' })
          return
        } catch {}
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `placa-${slug}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }, [generate, slug])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={handleDownload}
        disabled={generating}
        className="w-full h-full flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', borderRadius: '999px' }}
      >
        {generating ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Instagram size={14} />
        )}
        Placa
      </button>
    </>
  )
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  ctx.font = `500 ${fontSize}px system-ui, sans-serif`
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

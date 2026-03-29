'use client'

import { useRef, useState, useCallback } from 'react'
import { Instagram } from 'lucide-react'

interface Props {
  title: string
  price: string
  photo: string | null
  operation: string
  area: number | null
  rooms: number
  bathrooms: number
  slug: string
}

export default function StoryPlate({ title, price, photo, operation, area, rooms, bathrooms, slug }: Props) {
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

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Load photo
    if (photo) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject()
          img.src = photo
        })
        // Draw photo top 55%
        const ph = H * 0.55
        const scale = Math.max(W / img.width, ph / img.height)
        const sw = img.width * scale, sh = img.height * scale
        ctx.drawImage(img, (W - sw) / 2, (ph - sh) / 2, sw, sh)
        // Vignette on photo
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, 0, W, ph)
      } catch {
        ctx.fillStyle = '#1A5C38'
        ctx.fillRect(0, 0, W, H * 0.55)
      }
    } else {
      ctx.fillStyle = '#1A5C38'
      ctx.fillRect(0, 0, W, H * 0.55)
    }

    // Separator line
    const sepY = H * 0.55
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(0, sepY, W, 1)

    // Bottom gradient
    const grad = ctx.createLinearGradient(0, sepY, 0, H)
    grad.addColorStop(0, '#0f0f0f')
    grad.addColorStop(1, '#1a1a1a')
    ctx.fillRect(0, sepY + 1, W, H - sepY - 1)

    // Top bar
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '500 26px system-ui, sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText('David Flores', 32, 24)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '500 22px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('MAT. N° 0621', W - 32, 28)
    ctx.textAlign = 'left'

    // Bottom content area
    const bx = 36, by = sepY + 36

    // Operation badge
    if (operation) {
      const badgeText = operation.toUpperCase()
      ctx.font = '700 24px system-ui, sans-serif'
      const bw = ctx.measureText(badgeText).width + 40
      ctx.fillStyle = '#1A5C38'
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, 40, 20)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '700 22px system-ui, sans-serif'
      ctx.fillText(badgeText, bx + 20, by + 10)
    }

    // Green accent line
    ctx.fillStyle = '#3DD68C'
    ctx.fillRect(bx, by + 56, 48, 3)

    // Title
    ctx.fillStyle = '#fff'
    ctx.font = '700 44px system-ui, sans-serif'
    const displayTitle = title.length > 60 ? title.slice(0, 60) + '…' : title
    const titleLines = wrapText(ctx, displayTitle, W - 72, 44)
    let ty = by + 80
    for (const line of titleLines.slice(0, 3)) {
      ctx.fillText(line, bx, ty)
      ty += 54
    }

    // Price
    ctx.fillStyle = '#3DD68C'
    ctx.font = '800 60px system-ui, sans-serif'
    ctx.fillText(price, bx, ty + 16)
    ty += 80

    // Stats pills
    const stats: string[] = []
    if (area && area > 0) stats.push(`${area} m²`)
    if (rooms > 0) stats.push(`${rooms} dorm.`)
    if (bathrooms > 0) stats.push(`${bathrooms} baño${bathrooms > 1 ? 's' : ''}`)

    if (stats.length > 0) {
      let sx = bx
      ctx.font = '600 26px system-ui, sans-serif'
      for (const stat of stats) {
        const sw = ctx.measureText(stat).width + 32
        ctx.fillStyle = 'rgba(255,255,255,0.10)'
        ctx.beginPath()
        ctx.roundRect(sx, ty + 16, sw, 42, 21)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(sx, ty + 16, sw, 42, 21)
        ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.fillText(stat, sx + 16, ty + 27)
        sx += sw + 10
      }
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '500 24px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('@inmobiliaria.si', W / 2, H - 48)
    ctx.textAlign = 'left'

    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'))
  }, [title, price, photo, operation, area, rooms, bathrooms])

  const handleDownload = useCallback(async () => {
    setGenerating(true)
    try {
      const blob = await generate()
      if (!blob) return

      const file = new File([blob], `placa-${slug}.png`, { type: 'image/png' })

      // Try native share (iOS/Android)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Placa Instagram' })
          return
        } catch {}
      }

      // Fallback: download
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
        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold font-poppins transition-opacity hover:opacity-90 text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
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
  ctx.font = `700 ${fontSize}px system-ui, sans-serif`
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

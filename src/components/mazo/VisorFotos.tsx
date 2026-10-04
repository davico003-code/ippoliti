'use client'

// FOTO EN GRANDE del Tinder (David, 4-oct-2026). Pantalla completa sobre el
// mazo: deslizar a los costados pasa de foto; pellizcar o doble toque hace
// zoom (hasta 4×) y, con zoom, el dedo mueve la foto. En la compu: flechas,
// rueda/doble clic para el zoom y Escape. La ✕ (o el atrás del celu, que lo
// maneja el mazo) vuelve a la tarjeta.

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { estiloSinLogo } from '@/lib/feed-en-red'

type Punto = { x: number; y: number }

const ZOOM_MAX = 4
const ZOOM_DOBLE = 2.5

export default function VisorFotos({
  fotos,
  inicio = 0,
  titulo,
  logo,
  onCerrar,
}: {
  fotos: string[]
  inicio?: number
  titulo: string
  /** Rincón del logo del colega (se deja afuera, como en la tarjeta). */
  logo?: Parameters<typeof estiloSinLogo>[0]
  onCerrar: () => void
}) {
  const [i, setI] = useState(Math.min(Math.max(0, inicio), fotos.length - 1))
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Punto>({ x: 0, y: 0 })
  const [arrastreX, setArrastreX] = useState(0)
  const punteros = useRef(new Map<number, Punto>())
  const gesto = useRef<{ tipo: 'nada' | 'pasar' | 'mover' | 'pellizco'; desde: Punto; pan0: Punto; zoom0: number; dist0: number }>({
    tipo: 'nada',
    desde: { x: 0, y: 0 },
    pan0: { x: 0, y: 0 },
    zoom0: 1,
    dist0: 1,
  })
  const ultimoToque = useRef(0)
  const n = fotos.length
  // La caja de la foto (encajada en la pantalla, con su proporción): así el
  // recorte del logo del colega (estiloSinLogo) sigue funcionando con el zoom.
  const area = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState<number | null>(null)
  const [caja, setCaja] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    const medir = () => {
      const el = area.current
      if (!el || !ratio) return setCaja(null)
      const W = el.clientWidth
      const H = el.clientHeight
      const w = Math.min(W, H * ratio)
      setCaja({ w, h: w / ratio })
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [ratio])

  const ir = (d: number) => {
    setI((x) => Math.min(Math.max(0, x + d), n - 1))
    setRatio(null)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  const zoomEn = (z: number) => {
    const nz = Math.min(ZOOM_MAX, Math.max(1, z))
    setZoom(nz)
    if (nz === 1) setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrar()
      } else if (e.key === 'ArrowRight') ir(1)
      else if (e.key === 'ArrowLeft') ir(-1)
    }
    // En captura: que no le lleguen al mazo (Escape lo cerraría; flechas = ♥ / paso).
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCerrar, n])

  const dist = () => {
    const [a, b] = Array.from(punteros.current.values())
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 1
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (punteros.current.size === 2) {
      gesto.current = { tipo: 'pellizco', desde: { x: e.clientX, y: e.clientY }, pan0: pan, zoom0: zoom, dist0: dist() }
      setArrastreX(0)
      return
    }
    gesto.current = { tipo: zoom > 1 ? 'mover' : 'pasar', desde: { x: e.clientX, y: e.clientY }, pan0: pan, zoom0: zoom, dist0: 1 }
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!punteros.current.has(e.pointerId)) return
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesto.current
    if (g.tipo === 'pellizco' && punteros.current.size >= 2) zoomEn(g.zoom0 * (dist() / g.dist0))
    else if (g.tipo === 'mover') setPan({ x: g.pan0.x + (e.clientX - g.desde.x), y: g.pan0.y + (e.clientY - g.desde.y) })
    else if (g.tipo === 'pasar') setArrastreX(e.clientX - g.desde.x)
  }
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesto.current
    punteros.current.delete(e.pointerId)
    if (g.tipo === 'pellizco') {
      if (punteros.current.size === 0) gesto.current = { ...g, tipo: 'nada' }
      return
    }
    const dx = e.clientX - g.desde.x
    const dy = e.clientY - g.desde.y
    if (g.tipo === 'pasar') {
      setArrastreX(0)
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) return ir(dx < 0 ? 1 : -1)
    }
    // Doble toque: zoom donde tocó (o vuelve a 1).
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const ahora = Date.now()
      if (ahora - ultimoToque.current < 300) {
        ultimoToque.current = 0
        if (zoom > 1) zoomEn(1)
        else {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom(ZOOM_DOBLE)
          setPan({ x: (r.width / 2 - (e.clientX - r.left)) * (ZOOM_DOBLE - 1), y: (r.height / 2 - (e.clientY - r.top)) * (ZOOM_DOBLE - 1) })
        }
      } else ultimoToque.current = ahora
    }
    gesto.current = { ...g, tipo: 'nada' }
  }

  return (
    <div className="fixed inset-0 z-[10500] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={`Fotos: ${titulo}`}>
      <div className="flex items-center justify-between px-3 pb-2 text-white" style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
        <p className="text-[15px] font-semibold tabular-nums">
          {i + 1} / {n}
        </p>
        <button type="button" onClick={onCerrar} aria-label="Cerrar las fotos" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 hover:bg-white/25">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        ref={area}
        className="relative min-h-0 flex-1 overflow-hidden select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(e) => zoomEn(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15))}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 overflow-hidden"
          style={{
            width: caja ? caja.w : '100%',
            height: caja ? caja.h : '100%',
            transform: `translate(-50%, -50%) translate(${pan.x + arrastreX}px, ${pan.y}px) scale(${zoom})`,
            transition: gesto.current.tipo === 'nada' ? 'transform 180ms ease-out' : 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- visor a pantalla completa: la foto tal cual, sin el optimizador */}
          <img
            key={fotos[i]}
            src={fotos[i]}
            alt={`${titulo} — foto ${i + 1} de ${n}`}
            draggable={false}
            onLoad={(e) => {
              const im = e.currentTarget
              if (im.naturalWidth && im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight)
            }}
            className={`h-full w-full ${caja ? 'object-cover' : 'object-contain'}`}
            style={caja ? estiloSinLogo(logo) : undefined}
          />
        </div>
        {n > 1 && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => ir(-1)}
              disabled={i === 0}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 disabled:opacity-30 md:grid"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => ir(1)}
              disabled={i === n - 1}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 disabled:opacity-30 md:grid"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <p className="px-4 pt-2 text-center text-[14px] text-white/70" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
        {zoom > 1 ? 'Doble toque para alejar' : 'Deslizá para ver más · pellizcá o doble toque para acercar'}
      </p>
    </div>
  )
}

'use client'

// Galería principal de la ficha.
//   - Celular/tablet (<1024): foto protagonista (~46% de la pantalla) que se
//     pasa con el dedo (scroll-snap nativo, contador "1 / N"), con operación,
//     precio y zona fijos encima, y una tira de 3 miniaturas debajo ("+N" en
//     la última). Solo se cargan la foto a la vista y la siguiente.
//   - Compu (≥1024): mosaico 1 grande + 4 chicas y botón "Ver las N fotos".
// Cualquier foto abre el lightbox vertical con todas, parado en esa foto.
// Esc cierra. Body con overflow:hidden mientras está abierto.

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Images, X } from 'lucide-react'
import { displayImageUrl } from '@/lib/external-images'
import { TINTA, volanta } from './estilos'

// Fotos de avisos externos (Zonaprop/Navent/Argenprop) se sirven directo de su CDN: las
// renderizamos sin el optimizador de Vercel para que se vean siempre, sin
// depender de que el optimizador pueda fetchear ese host.
const isExternalCdn = (src: string): boolean => /zonapropcdn|naventcdn|argenprop\.com\/static-content/.test(src)

export interface HeroOverlay {
  volanta: string
  precio: string
  zona: string
}

export default function HeroGallery({ photos, overlay }: { photos: string[]; overlay?: HeroOverlay }) {
  const [abiertaEn, setAbiertaEn] = useState<number | null>(null)
  const showAll = abiertaEn !== null
  const fotosRef = useRef<HTMLDivElement>(null)
  const [actual, setActual] = useState(0)
  // Fotos del carrusel ya pedidas: la visible + la siguiente (precarga).
  const [cargadas, setCargadas] = useState<Set<number>>(() => new Set([0, 1]))

  useEffect(() => {
    const el = fotosRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1))
        setActual(i)
        setCargadas(prev => {
          if (prev.has(i) && prev.has(i + 1)) return prev
          const next = new Set(prev)
          next.add(i)
          next.add(i + 1)
          return next
        })
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Bloquear scroll body mientras lightbox abierto
  useEffect(() => {
    if (!showAll) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showAll])

  // Esc cierra
  useEffect(() => {
    if (!showAll) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbiertaEn(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showAll])

  // El lightbox arranca en la foto tocada.
  useEffect(() => {
    if (!abiertaEn) return
    document.getElementById(`vf-foto-${abiertaEn}`)?.scrollIntoView({ block: 'start' })
  }, [abiertaEn])

  // Sin fotos: en el celu igual va el bloque con operación, precio y zona
  // (en la compu ya están en la tarjeta de la derecha).
  if (!photos || photos.length === 0) {
    if (!overlay) return null
    return (
      <div className="lg:hidden" style={{ background: TINTA, color: '#fff', padding: '56px 20px 22px' }}>
        {overlay.volanta && <div style={{ ...volanta, opacity: 0.88 }}>{overlay.volanta}</div>}
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4 }}>{overlay.precio}</div>
        {overlay.zona && <div style={{ fontSize: 15, opacity: 0.92, marginTop: 3 }}>{overlay.zona}</div>}
      </div>
    )
  }

  const cover = photos[0]
  const tira = photos.slice(1, 4)
  const restantes = photos.length - 1 - tira.length

  return (
    <>
      {/* ── CELULAR / TABLET: foto protagonista deslizable + tira ──────── */}
      <div className="lg:hidden">
        <div className="vf-hero" style={{ position: 'relative', width: '100%', background: '#E9E9E7' }}>
          <div
            ref={fotosRef}
            className="vf-hero-fotos"
            role="group"
            aria-label={`Fotos de la propiedad: ${photos.length}. Deslizá para ver más.`}
            style={{
              display: 'flex',
              height: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              overscrollBehaviorX: 'contain',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {photos.map((p, i) => (
              <div
                key={`${i}-${p}`}
                onClick={() => setAbiertaEn(i)}
                style={{ position: 'relative', flex: '0 0 100%', height: '100%', scrollSnapAlign: 'start', scrollSnapStop: 'always', cursor: 'pointer' }}
              >
                {cargadas.has(i) && (
                  <Image
                    src={displayImageUrl(p)}
                    alt={`Foto ${i + 1}`}
                    fill
                    sizes="100vw"
                    priority={i === 0}
                    unoptimized={isExternalCdn(p)}
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
            ))}
          </div>
          {overlay && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 42%, rgba(0,0,0,0.74) 100%)',
              }}
            />
          )}
          {photos.length > 1 && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: 14,
                top: 14,
                pointerEvents: 'none',
                background: 'rgba(255,255,255,0.94)',
                color: TINTA,
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 999,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {actual + 1} / {photos.length}
            </span>
          )}
          {overlay && (
            <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20, color: '#fff', pointerEvents: 'none' }}>
              {overlay.volanta && <div style={{ ...volanta, opacity: 0.88 }}>{overlay.volanta}</div>}
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4 }}>
                {overlay.precio}
              </div>
              {overlay.zona && <div style={{ fontSize: 15, opacity: 0.92, marginTop: 3 }}>{overlay.zona}</div>}
            </div>
          )}
        </div>

        {tira.length > 0 && (
          <div style={{ display: 'flex', gap: 6, padding: '6px 6px 0' }}>
            {tira.map((p, i) => {
              const esUltima = i === tira.length - 1 && restantes > 0
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAbiertaEn(i + 1)}
                  aria-label={esUltima ? `Ver las ${photos.length} fotos` : `Ver foto ${i + 2}`}
                  style={{
                    position: 'relative',
                    flex: 1,
                    height: 84,
                    border: 'none',
                    padding: 0,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#F3F3F3',
                    cursor: 'pointer',
                  }}
                >
                  <Image
                    src={displayImageUrl(p)}
                    alt=""
                    fill
                    sizes="34vw"
                    unoptimized={isExternalCdn(p)}
                    style={{ objectFit: 'cover' }}
                  />
                  {esUltima && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +{restantes}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── COMPU: mosaico 1 grande + 4 chicas ─────────────────────────── */}
      <div className="hidden lg:block" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: photos.length === 1 ? '1fr' : '2fr 1fr 1fr',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: 8,
            height: 460,
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          <div
            className="hero-tile"
            style={{ gridRow: 'span 2', position: 'relative', cursor: 'pointer', overflow: 'hidden', background: '#F3F4F6' }}
            onClick={() => setAbiertaEn(0)}
          >
            <Image
              src={displayImageUrl(cover)}
              alt=""
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              unoptimized={isExternalCdn(cover)}
              style={{ objectFit: 'cover', transition: 'transform 300ms' }}
            />
          </div>

          {photos.length > 1 &&
            Array.from({ length: 4 }).map((_, i) => {
              const photo = photos[i + 1]
              if (!photo) return <div key={i} style={{ background: '#F3F4F6' }} />
              return (
                <div
                  key={i}
                  className="hero-tile"
                  style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', background: '#F3F4F6' }}
                  onClick={() => setAbiertaEn(i + 1)}
                >
                  <Image
                    src={displayImageUrl(photo)}
                    alt=""
                    fill
                    sizes="22vw"
                    unoptimized={isExternalCdn(photo)}
                    style={{ objectFit: 'cover', transition: 'transform 300ms' }}
                  />
                </div>
              )
            })}
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setAbiertaEn(0)}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              background: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: TINTA,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            }}
          >
            <Images size={16} aria-hidden /> Ver las {photos.length} fotos
          </button>
        )}
      </div>

      {/* ── Lightbox vertical (replica patrón SI) ───────────────────────── */}
      {showAll && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: '#0A0A0A',
          }}
        >
          <button
            type="button"
            onClick={() => setAbiertaEn(null)}
            aria-label="Cerrar galería"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 110,
              width: 42,
              height: 42,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: '70px 16px 32px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              style={{
                maxWidth: 1000,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {photos.map((p, i) => (
                <Image
                  key={i}
                  id={`vf-foto-${i}`}
                  src={displayImageUrl(p)}
                  alt={`Foto ${i + 1}`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 1000px) 100vw, 1000px"
                  loading={Math.abs(i - (abiertaEn ?? 0)) < 2 ? 'eager' : 'lazy'}
                  unoptimized={isExternalCdn(p)}
                  style={{ width: '100%', height: 'auto', borderRadius: 8, scrollMarginTop: 70 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .vf-hero { height: 46vh; height: min(46svh, 440px); min-height: 300px; }
        .vf-hero-fotos::-webkit-scrollbar { display: none; }
        .hero-tile:hover img { transform: scale(1.02); }
      ` }} />
    </>
  )
}

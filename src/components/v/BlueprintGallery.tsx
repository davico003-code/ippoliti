'use client'

// Galería chica para planos, del mismo alto que el mapa (clase vf-media). Tap →
// Lightbox con zoom/scroll para leer cotas. Un plano en PDF no es imagen (se
// veía roto): va como tarjeta "Ver plano en PDF" que lo abre aparte.
// Los planos de Hilo llegan sin márgenes; a pantalla completa con el celular
// derecho va la versión PARADA, que llena la pantalla (lib/planos.ts).

import { useEffect, useRef, useState } from 'react'
import { FileText, Maximize2 } from 'lucide-react'
import Lightbox from './Lightbox'
import { planoParaCaja } from '@/lib/planos'
import { usePantallaVertical } from '@/hooks/usePantallaVertical'
import { APAGADO, LINEA, TINTA } from './estilos'

const esPdf = (u: string) => /\.pdf($|[?#])/i.test(u)

export default function BlueprintGallery({ blueprints }: { blueprints: string[] }) {
  const [active, setActive] = useState(0)
  const [lightboxAt, setLightboxAt] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const parada = usePantallaVertical()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActive(Math.min(Math.max(idx, 0), blueprints.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [blueprints.length])

  if (!blueprints || blueprints.length === 0) return null
  const imagenes = blueprints.filter(u => !esPdf(u))

  return (
    <div className="vf-media" style={{ position: 'relative', borderRadius: 16, border: `1px solid ${LINEA}`, background: '#fff', overflow: 'hidden' }}>
      <div
        ref={containerRef}
        className="blueprint-scroll"
        style={{
          display: 'flex',
          height: '100%',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {blueprints.map((url, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'center',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 14,
              boxSizing: 'border-box',
            }}
            onClick={() => !esPdf(url) && setLightboxAt(imagenes.indexOf(url))}
          >
            {esPdf(url) ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: TINTA, textDecoration: 'none' }}
              >
                <FileText size={34} strokeWidth={1.5} aria-hidden />
                <span style={{ fontSize: 15, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Ver plano en PDF</span>
                <span style={{ fontSize: 12, color: APAGADO }}>Se abre en otra pestaña</span>
              </a>
            ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={url}
              alt={`Plano ${i + 1}`}
              loading="lazy"
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                cursor: 'zoom-in',
                userSelect: 'none',
              }}
            />
            )}
          </div>
        ))}
      </div>

      {!esPdf(blueprints[active] ?? '') && <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.94)',
          border: `1px solid ${LINEA}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Maximize2 size={15} color={TINTA} />
      </span>}

      {blueprints.length > 1 && (
        <div
          style={{ position: 'absolute', left: 0, right: 0, bottom: 12, display: 'flex', gap: 6, justifyContent: 'center', pointerEvents: 'none' }}
        >
          {blueprints.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === active ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? '#1A1A1A' : '#D4D4D4',
                transition: 'width 180ms ease, background 180ms ease',
              }}
            />
          ))}
        </div>
      )}

      {lightboxAt !== null && (
        <Lightbox
          images={imagenes.map(u => planoParaCaja(u, parada))}
          startIndex={lightboxAt}
          zoomable
          onClose={() => setLightboxAt(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .blueprint-scroll::-webkit-scrollbar { display: none; }
      ` }} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

const RALEWAY = 'Raleway, sans-serif'

// ── Visor modal: 360 (iframe kuula), plano/fotos (imágenes), video (CF Stream) ──

export type Viewer =
  | { kind: 'tour'; title: string; urls: string[] }
  | { kind: 'images'; title: string; urls: string[] }
  | { kind: 'video'; title: string; url: string }

export default function ViewerModal({ viewer, onClose }: { viewer: Viewer; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const urls = viewer.kind === 'video' ? [viewer.url] : viewer.urls
  const url = urls[Math.min(index, urls.length - 1)]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, urls.length - 1))
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    // Bloquear el scroll del body mientras el visor está abierto.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, urls.length])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={viewer.title}>
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-semibold truncate pr-4" style={{ fontFamily: RALEWAY }}>
          {viewer.title}
          {urls.length > 1 && (
            <span className="ml-2 text-white/50 font-numeric">{index + 1}/{urls.length}</span>
          )}
        </p>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Contenido */}
      <div className="relative flex-1 min-h-0 px-2 pb-2 sm:px-6 sm:pb-6">
        {viewer.kind === 'images' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={viewer.title} className="h-full w-full object-contain" />
        ) : (
          <iframe
            src={url}
            title={viewer.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            allowFullScreen
            className="h-full w-full rounded-lg border-0 bg-black"
          />
        )}

        {/* Flechas */}
        {urls.length > 1 && (
          <>
            <button
              onClick={() => setIndex(i => Math.max(i - 1, 0))}
              disabled={index === 0}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors disabled:opacity-30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => setIndex(i => Math.min(i + 1, urls.length - 1))}
              disabled={index === urls.length - 1}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors disabled:opacity-30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

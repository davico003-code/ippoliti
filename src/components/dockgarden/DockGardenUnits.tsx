'use client'

import { useEffect, useMemo, useState } from 'react'
import { unitLabel, type BrickfyUnit } from '@/lib/brickfy'

const WA_PHONE = '5493412101694'
const RALEWAY = 'Raleway, sans-serif'
const POPPINS = 'Poppins, sans-serif'

// ── Visor modal: 360 (iframe kuula), plano/fotos (imágenes), video (CF Stream) ──

type Viewer =
  | { kind: 'tour'; title: string; urls: string[] }
  | { kind: 'images'; title: string; urls: string[] }
  | { kind: 'video'; title: string; url: string }

function ViewerModal({ viewer, onClose }: { viewer: Viewer; onClose: () => void }) {
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

// ── Grid de unidades con filtro por dormitorios ──

export default function DockGardenUnits({ units }: { units: BrickfyUnit[] }) {
  const [dormFilter, setDormFilter] = useState<number | null>(null)
  const [viewer, setViewer] = useState<Viewer | null>(null)

  const dorms = useMemo(
    () => Array.from(new Set(units.map(u => u.bedrooms))).sort((a, b) => a - b),
    [units],
  )

  const filtered = useMemo(() => {
    const list = dormFilter === null ? units : units.filter(u => u.bedrooms === dormFilter)
    // Disponibles primero, después por precio ascendente.
    return [...list].sort((a, b) => {
      if ((a.status === 'available') !== (b.status === 'available')) {
        return a.status === 'available' ? -1 : 1
      }
      return a.price - b.price
    })
  }, [units, dormFilter])

  return (
    <div>
      {/* Filtros por dormitorios */}
      {dorms.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setDormFilter(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              dormFilter === null ? 'bg-[#1A5C38] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todas ({units.length})
          </button>
          {dorms.map(d => (
            <button
              key={d}
              onClick={() => setDormFilter(d)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                dormFilter === d ? 'bg-[#1A5C38] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {d} dormitorio{d > 1 ? 's' : ''} ({units.filter(u => u.bedrooms === d).length})
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(u => {
          const label = unitLabel(u)
          const reserved = u.status !== 'available'
          const waText = encodeURIComponent(
            `Hola! Quiero información sobre Dock Garden — ${label} (${u.typology}, USD ${u.price.toLocaleString('es-AR')})`,
          )
          const specs = [
            { v: `${u.coveredSurfaceM2} m²`, ok: u.coveredSurfaceM2 > 0 },
            { v: `${u.bedrooms} dorm.`, ok: u.bedrooms > 0 },
            { v: `${u.fullBathrooms} baño${u.fullBathrooms > 1 ? 's' : ''}`, ok: u.fullBathrooms > 0 },
            { v: `${u.toilets} toil.`, ok: u.toilets > 0 },
            { v: `${u.parkingSpots} coch.`, ok: u.parkingSpots > 0 },
          ].filter(s => s.ok)

          return (
            <div
              key={u.id}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${reserved ? 'opacity-80' : ''}`}
            >
              {/* Foto */}
              <button
                onClick={() => u.galleryImageUrls.length > 0 && setViewer({ kind: 'images', title: `${label} — Fotos`, urls: u.galleryImageUrls })}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-gray-100 text-left"
                aria-label={`Ver fotos de ${label}`}
              >
                {u.galleryImageUrls[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.galleryImageUrls[0]}
                    alt={label}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* Badge estado */}
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    reserved ? 'bg-amber-100 text-amber-800' : 'bg-[#e8f5ee] text-[#1A5C38]'
                  }`}
                  style={{ fontFamily: RALEWAY }}
                >
                  {reserved ? 'Reservada' : 'Disponible'}
                </span>
                {/* Contador de fotos */}
                {u.galleryImageUrls.length > 0 && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="font-numeric">{u.galleryImageUrls.length}</span>
                  </span>
                )}
              </button>

              {/* Cuerpo */}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400" style={{ fontFamily: RALEWAY }}>
                  {label}
                </p>
                <p className="mt-0.5 text-[15px] font-bold text-gray-900" style={{ fontFamily: RALEWAY }}>
                  {u.typology}
                </p>
                <p className="mt-1.5 font-numeric text-[26px] font-semibold leading-none text-[#0F3F26]" style={{ fontFamily: POPPINS, letterSpacing: '-0.01em' }}>
                  USD {u.price.toLocaleString('es-AR')}
                </p>

                {/* Specs */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  {specs.map(s => (
                    <span key={s.v} className="font-numeric">{s.v}</span>
                  ))}
                </div>

                {/* Acciones */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {u.virtualTours360.length > 0 && (
                    <button
                      onClick={() => setViewer({ kind: 'tour', title: `${label} — Vista 360°`, urls: u.virtualTours360 })}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1A5C38] px-3 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#0F3F26]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="9" ry="4"/></svg>
                      Vista 360° ({u.virtualTours360.length})
                    </button>
                  )}
                  {u.blueprintImageUrls.length > 0 && (
                    <button
                      onClick={() => setViewer({ kind: 'images', title: `${label} — Plano`, urls: u.blueprintImageUrls })}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg>
                      Plano
                    </button>
                  )}
                  <a
                    href={`https://wa.me/${WA_PHONE}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#1ea952]"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                    </svg>
                    Consultar por esta unidad
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </div>
  )
}

// ── Miniatura clickeable reutilizable (planos del proyecto / videos) ──

export function MediaThumb({
  src,
  label,
  onClickViewer,
  aspect = 'aspect-[4/3]',
}: {
  src: string
  label: string
  onClickViewer: () => void
  aspect?: string
}) {
  return (
    <button
      onClick={onClickViewer}
      className="group relative shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 text-left shadow-sm transition-all hover:shadow-md"
      aria-label={label}
    >
      <div className={`relative w-56 ${aspect}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">{label}</span>
    </button>
  )
}

// ── Sección planos + videos del proyecto (comparten el visor) ──

export function DockGardenMedia({
  blueprints,
  videos,
}: {
  blueprints: string[]
  videos: { nombre: string; iframeUrl: string; thumbnailUrl: string }[]
}) {
  const [viewer, setViewer] = useState<Viewer | null>(null)

  return (
    <div className="space-y-10">
      {blueprints.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-gray-900" style={{ fontFamily: RALEWAY }}>
            Masterplan y plantas
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {blueprints.map((b, i) => (
              <MediaThumb
                key={b}
                src={b}
                label={`Plano ${i + 1}`}
                onClickViewer={() => setViewer({ kind: 'images', title: 'Dock Garden — Masterplan y plantas', urls: blueprints })}
              />
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-gray-900" style={{ fontFamily: RALEWAY }}>
            Videos del proyecto
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {videos.map(v => (
              <button
                key={v.iframeUrl}
                onClick={() => setViewer({ kind: 'video', title: `Dock Garden — ${v.nombre}`, url: v.iframeUrl })}
                className="group relative shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-black text-left shadow-sm transition-all hover:shadow-md"
                aria-label={`Ver video ${v.nombre}`}
              >
                <div className="relative aspect-video w-64">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnailUrl} alt={v.nombre} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#1A5C38] shadow-md">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </span>
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">{v.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </div>
  )
}

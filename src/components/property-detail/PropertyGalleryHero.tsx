'use client'

// Zillow-style gallery for desktop (1 big + 4 thumbs 2×2 in a 5-col grid at
// 440px tall) and a COMPACT hero for mobile (single main photo ~280px tall
// with a "Ver las N fotos" badge overlay that opens the shared lightbox).
//
// We keep two simple blocks guarded by md:hidden / hidden md:block because
// the two layouts are structurally different enough (mobile: single item,
// desktop: 5-col grid with row-span) that unifying forced a tall 2×2 thumb
// strip on mobile that filled the viewport.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Camera, Images, X } from 'lucide-react'
import type { TokkoProperty } from '@/lib/tokko'
import { getAllPhotos, getOperationType, operationBadgeColor, translatePropertyType } from '@/lib/tokko'
import LikeHeart from '@/components/feedback/LikeHeart'

const GREEN = '#1A5C38'

export default function PropertyGalleryHero({ property }: { property: TokkoProperty }) {
  const photos = getAllPhotos(property)
  const [showAll, setShowAll] = useState(false)
  const operation = getOperationType(property)
  const propType = translatePropertyType(property.type?.name)
  const address = property.fake_address || property.address
  const propertyTitle = property.publication_title || address || 'Propiedad'
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Bloqueo de scroll del body mientras el lightbox está abierto. Sin esto, al
  // llegar al final de las fotos el scroll se "cae" a la página de atrás
  // (scroll chaining) y el usuario vuelve a la ficha. Usamos position:fixed
  // (lock real, necesario en iOS Safari donde overscroll-behavior solo no
  // alcanza) + compensación del ancho de la scrollbar para evitar layout shift,
  // y restauramos la posición previa al cerrar/desmontar.
  useEffect(() => {
    if (!showAll) return
    const scrollY = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      body.style.paddingRight = prev.paddingRight
      window.scrollTo(0, scrollY)
    }
  }, [showAll])

  // ESC cierra el lightbox (antes no había handler; la ✕ ya cerraba).
  useEffect(() => {
    if (!showAll) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAll(false)
      if (e.key === 'Tab') {
        e.preventDefault()
        closeButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
    }
  }, [showAll])

  // El visor se cuelga del <body>, no de acá.
  //
  // Cuando la ficha se abre como panel desde /propiedades, PropertyPanel la
  // envuelve en un contenedor con `md:-translate-x-1/2`. Un `transform` en un
  // ancestro hace que `position: fixed` se mida contra ESE contenedor y no
  // contra la pantalla: por eso la foto quedaba encajonada entre el listado y
  // el mapa, y la ✕ terminaba debajo del menú. Sacándolo al body, el visor
  // vuelve a ocupar la pantalla completa en los dos casos (panel y ficha).
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  if (photos.length === 0) return null

  const thumbs = photos.slice(1, 5)
  const hasOverlaySlot = photos.length > 5

  return (
    <>
      {/* ── MOBILE: single compact hero photo (~280px) with "Ver las N fotos" badge ── */}
      <div className="md:hidden">
        <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-gray-100">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="group absolute inset-0 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
          >
            <Image
              src={photos[0]}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="100vw"
              priority
            />
            <span className="sr-only">Abrir galería: {propertyTitle}. </span>
            <span className="pointer-events-none absolute left-3 top-3 flex max-w-[calc(100%_-_4.5rem)] flex-wrap gap-2">
              {operation && (
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold uppercase text-white"
                  style={{ background: operationBadgeColor(operation) }}
                >
                  {operation}
                </span>
              )}
              {propType && (
                <span
                  className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase"
                  style={{ color: GREEN }}
                >
                  {propType}
                </span>
              )}
            </span>
            {photos.length > 1 && (
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-[12px] font-semibold text-gray-800 shadow-md backdrop-blur">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Ver las {photos.length} fotos
              </span>
            )}
          </button>
          {/* Like discreto sobre la portada (esquina top-right libre) */}
          <LikeHeart propertyId={property.id} size={34} className="absolute right-3 top-3 z-20" />
        </div>
      </div>

      {/* ── DESKTOP: Zillow 5-col grid (1 big + 4 thumbs 2×2) h-[440px] ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 grid-rows-2 gap-2 h-[440px] rounded-2xl overflow-hidden">
          <div className="relative col-span-3 row-span-2 overflow-hidden bg-gray-100">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="group absolute inset-0 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
            >
              <Image
                src={photos[0]}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />
              <span className="sr-only">Abrir galería: {propertyTitle}. </span>
              <span className="pointer-events-none absolute left-3 top-3 flex max-w-[calc(100%_-_4.5rem)] flex-wrap gap-2">
                {operation && (
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase text-white"
                    style={{ background: operationBadgeColor(operation) }}
                  >
                    {operation}
                  </span>
                )}
                {propType && (
                  <span
                    className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase"
                    style={{ color: GREEN }}
                  >
                    {propType}
                  </span>
                )}
              </span>
            </button>
            {/* Like discreto sobre la portada (esquina top-right libre) */}
            <LikeHeart propertyId={property.id} size={34} className="absolute right-3 top-3 z-20" />
          </div>

          {Array.from({ length: 4 }).map((_, i) => {
            const photo = thumbs[i]
            const isLastSlot = i === 3
            if (!photo) return <div key={i} className="col-span-1 bg-gray-100" />
            return (
              <button
                key={i}
                type="button"
                className="group relative col-span-1 overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
                onClick={() => setShowAll(true)}
              >
                <span className="sr-only">Abrir galería. </span>
                <Image
                  src={photo}
                  alt={`${propertyTitle} — foto ${i + 2}`}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="20vw"
                />
                {isLastSlot && hasOverlaySlot && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-1.5">
                    <Images className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">Ver las {photos.length} fotos</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Fallback button en desktop si no hay overlay slot (≤ 5 fotos) */}
        {photos.length > 1 && !hasOverlaySlot && (
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A5C38]"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
            >
              <Images className="w-3.5 h-3.5" /> Ver las {photos.length} fotos
            </button>
          </div>
        )}
      </div>

      {/* Lightbox fullscreen — compartido entre mobile y desktop.
          Va por portal al <body> para escapar del transform del panel. */}
      {showAll &&
        montado &&
        createPortal(
          <div
            className="fixed inset-0 z-[10500] bg-black"
            role="dialog"
            aria-modal="true"
            aria-label={`Galería de ${propertyTitle}`}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setShowAll(false)}
              aria-label="Cerrar galería"
              className="fixed right-4 top-4 z-[10510] flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="h-full overflow-y-auto overscroll-y-contain p-4 pt-16">
              <div className="mx-auto max-w-4xl space-y-2">
                {photos.map((p, i) => (
                  <Image
                    key={i}
                    src={p}
                    alt={`${propertyTitle} — foto ${i + 1} de ${photos.length}`}
                    width={1200}
                    height={800}
                    className="h-auto w-full rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

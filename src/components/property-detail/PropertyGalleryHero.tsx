'use client'

// Zillow-style gallery for desktop (1 big + 4 thumbs 2×2 in a 5-col grid at
// 440px tall) and a COMPACT hero for mobile (~280px tall).
//
// We keep two simple blocks guarded by md:hidden / hidden md:block because
// the two layouts are structurally different enough (mobile: single item,
// desktop: 5-col grid with row-span) that unifying forced a tall 2×2 thumb
// strip on mobile that filled the viewport.
//
// Celu (25-oct-2026): la portada ahora se desliza con el dedo, como en
// cualquier portal (antes era una foto fija y para ver la segunda había que
// abrir otra capa). Carril con scroll-snap nativo, contador "3 / 22" y tocar
// una foto abre el visor EN esa foto. Compu: misma grilla, pero cada foto es un
// botón que abre en ella (antes todas abrían arriba de todo).
import { useCallback, useEffect, useState } from 'react'
import Image from '@/components/Imagen'
import { Camera, Images } from 'lucide-react'
import type { TokkoProperty } from '@/lib/tokko'
import { usePropiedadConFoco } from '@/lib/usePropiedadConFoco'
import { getAllPhotos, getOperationType, operationBadgeColor, preciosPorOperacion, tituloVisible, translatePropertyType } from '@/lib/tokko'
import GaleriaDeslizable, { useFotoALaVista } from './GaleriaDeslizable'


export default function PropertyGalleryHero({ property: propertyOriginal }: { property: TokkoProperty }) {
  // Mismo orden de carteles que el cuerpo de la ficha (la operación buscada primero).
  const property = usePropiedadConFoco(propertyOriginal)
  const photos = getAllPhotos(property)
  // Foto en la que está abierto el visor (null = cerrado).
  const [visor, setVisor] = useState<number | null>(null)
  const operation = getOperationType(property)
  // Venta Y alquiler a la vez → un cartel por operación (igual que el cuerpo de la ficha).
  const precios = preciosPorOperacion(property)
  const operaciones = precios.length > 1 ? precios.map(p => p.operacion) : operation ? [operation] : []
  const propType = translatePropertyType(property.type?.name)
  const address = property.fake_address || property.address

  // El visor se cuelga del <body>, no de acá.
  //
  // Cuando la ficha se abre como panel desde /propiedades, PropertyPanel la
  // envuelve en un contenedor con `md:-translate-x-1/2`. Un `transform` en un
  // ancestro hace que `position: fixed` se mida contra ESE contenedor y no
  // contra la pantalla: por eso la foto quedaba encajonada entre el listado y
  // el mapa, y la ✕ terminaba debajo del menú. Sacándolo al body, el visor
  // vuelve a ocupar la pantalla completa en los dos casos (panel y ficha).
  //
  // El bloqueo del scroll de la página, Escape y el Atrás del celu viven en el
  // visor (GaleriaDeslizable): se montan y desmontan con él.
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const n = photos.length
  const titulo = tituloVisible(property) || address
  const altFoto = (k: number) => `Foto ${k + 1} de ${n} de ${titulo}`

  // Portada deslizable del celu.
  const { ref: carrusel, indice, onScroll } = useFotoALaVista(n)
  // Hasta qué foto del carril hay <img> montada. El HTML trae solo la primera
  // (priority: es el LCP de la ficha y no se demora). La segunda se pide recién
  // cuando la primera terminó de cargar o el dedo toca el carril, y al deslizar
  // se van montando dos más adelante: el que desliza no ve un hueco gris.
  const [alcance, setAlcance] = useState(0)
  const verHasta = useCallback((k: number) => setAlcance(a => (k > a ? Math.min(k, n - 1) : a)), [n])
  useEffect(() => { if (indice > 0) verHasta(indice + 2) }, [indice, verHasta])

  // Al cerrar el visor, la portada queda en la foto que se estaba mirando
  // (continuidad: cerrás en la 8 y la ficha te muestra la 8, no la 1).
  const cerrarVisor = useCallback((ultima: number) => {
    setVisor(null)
    const c = carrusel.current
    if (!c || !c.clientWidth) return
    verHasta(ultima + 1)
    c.scrollLeft = ultima * c.clientWidth
  }, [carrusel, verHasta])

  if (n === 0) return null

  const thumbs = photos.slice(1, 5)
  const hasOverlaySlot = photos.length > 5

  // Carteles sobre la foto principal (mobile y desktop comparten el bloque).
  const badges = (
    // pointer-events-none: son carteles, no botones; así el dedo que arranca
    // encima de "VENTA" igual desliza la portada (y en la compu abre la foto).
    <div className="pointer-events-none absolute top-3 left-3 flex gap-1.5">
      {operaciones.map(op => (
        <span
          key={op}
          className="px-3 py-1 rounded-full text-[11px] font-bold uppercase text-white"
          style={{ background: operationBadgeColor(op) }}
        >
          {op}
        </span>
      ))}
      {propType && (
        <span
          className="px-3 py-1 bg-white/90 rounded-full text-[11px] font-bold uppercase"
          style={{ color: 'var(--theme-accent, #1A5C38)' }}
        >
          {propType}
        </span>
      )}
    </div>
  )

  return (
    <>
      {/* ── MOBILE: portada deslizable (~280px), contador y "Ver las N fotos" ── */}
      <div className="md:hidden">
        <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-gray-100">
          <div
            ref={carrusel}
            onScroll={onScroll}
            onPointerDown={() => verHasta(indice + 1)}
            role="region"
            aria-roledescription="carrusel"
            aria-label={`Fotos de ${titulo}`}
            className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none"
          >
            {photos.map((src, k) => (
              <button
                key={`${k}-${src}`}
                type="button"
                onClick={() => setVisor(k)}
                aria-label={altFoto(k)}
                // Solo la foto a la vista entra en el orden del Tab (no 22 paradas).
                tabIndex={k === indice ? 0 : -1}
                className="relative block h-full w-full shrink-0 snap-center snap-always focus-visible:outline-offset-[-3px]"
              >
                {k <= alcance && (
                  <Image
                    src={src}
                    alt={altFoto(k)}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    {...(k === 0
                      ? { priority: true, onLoad: () => verHasta(1) }
                      : { loading: 'eager' as const })}
                  />
                )}
              </button>
            ))}
          </div>
          {badges}
          {n > 1 && (
            <>
              <span
                aria-hidden="true"
                className="font-numeric pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm"
              >
                {indice + 1} / {n}
              </span>
              {/* El área de toque llega a 44px con el padding transparente. */}
              <button
                type="button"
                onClick={() => setVisor(indice)}
                className="absolute bottom-1.5 right-1.5 p-1.5"
              >
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-[12px] font-semibold text-gray-800 shadow-md backdrop-blur transition-transform duration-150 active:scale-[0.97]">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Ver las <span className="font-numeric">{n}</span> fotos
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── DESKTOP: Zillow 5-col grid (1 big + 4 thumbs 2×2) h-[440px] ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 grid-rows-2 gap-2 h-[440px] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setVisor(0)}
            className="relative col-span-3 row-span-2 block h-full w-full cursor-pointer group overflow-hidden focus-visible:outline-offset-[-3px]"
          >
            <Image
              src={photos[0]}
              alt={altFoto(0)}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
            {badges}
          </button>

          {Array.from({ length: 4 }).map((_, i) => {
            const photo = thumbs[i]
            const isLastSlot = i === 3
            if (!photo) return <div key={i} className="col-span-1 bg-gray-100" />
            // Abre en ESA foto: índice real en photos (el slot i es la foto i+1).
            const k = i + 1
            const conCartel = isLastSlot && hasOverlaySlot
            return (
              <button
                key={i}
                type="button"
                onClick={() => setVisor(k)}
                aria-label={conCartel ? `Ver las ${n} fotos de ${titulo}` : undefined}
                className="relative col-span-1 block h-full w-full cursor-pointer group overflow-hidden focus-visible:outline-offset-[-3px]"
              >
                <Image
                  src={photo}
                  alt={altFoto(k)}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="20vw"
                />
                {conCartel && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-1.5">
                    <Images className="w-4 h-4 text-white" aria-hidden="true" />
                    <span className="text-white text-sm font-semibold">Ver las <span className="font-numeric">{n}</span> fotos</span>
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
              onClick={() => setVisor(0)}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg text-xs font-semibold text-gray-800 shadow-sm"
              style={{ fontFamily: "var(--font-raleway, 'Raleway'), system-ui, sans-serif" }}
            >
              <Images className="w-3.5 h-3.5" aria-hidden="true" /> Ver las <span className="font-numeric">{n}</span> fotos
            </button>
          </div>
        )}
      </div>

      {/* Visor a pantalla completa — compartido entre mobile y desktop. Se
          cuelga del <body> por portal (adentro de GaleriaDeslizable). */}
      {visor !== null && montado && (
        <GaleriaDeslizable fotos={photos} inicio={visor} titulo={titulo} onCerrar={cerrarVisor} />
      )}
    </>
  )
}

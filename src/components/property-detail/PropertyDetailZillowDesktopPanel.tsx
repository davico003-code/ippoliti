'use client'

// Panel zillow-style (mapa + listado) que se monta encima de la ficha
// solo en desktop. Antes recibía allProperties como prop (las 237 viajaban
// en el RSC payload de la ficha mobile aunque nunca se renderizaran).
// Ahora hace fetch a /api/propiedades/list-cards solo cuando el viewport
// es >= md, evitando que mobile descargue/serialice nada del listado.
//
// La ficha compartida abierta en la compu arrancaba EN BLANCO: hasta hidratar
// esto devolvía null (useMediaQuery da false en el SSR), después venía el
// esqueleto de un listado que nadie pidió, después el listado y recién al
// final el panel de la ficha deslizándose. Ahora el primer pintado ya es la
// ficha: una VISTA PREVIA del panel con lo que el server ya tenía (fotos,
// título, dirección, precio), con la misma forma que PropertyPanel. El listado
// se arma detrás y, cuando el panel real ya está dibujado debajo, la vista
// previa se desvanece (200 ms) y se desmonta.
//
// Estados:
//  - SSR + primer render del cliente: la vista previa, dentro de
//    `hidden md:block` (en el celu no se ve y después de montar se saca).
//  - Celu ya montado: null (no monta, no fetch).
//  - Compu: fetch del listado con la vista previa encima; esqueleto del
//    listado detrás (no se ve, pero sostiene el alto de la página).
//  - Success: PropiedadesView abre PropertyPanel (initialPropertyId) y la
//    vista previa se retira cuando aparece `.si-property-panel` (la clase del
//    panel ya cargado), con un tope por si nunca aparece.
//  - Error del listado: fallback con reintentar (sin vista previa).
//
// PropertyPanel (de otro paquete) todavía vuelve a pedir la propiedad a
// /api/propiedades/[id]: con un `initialProperty` podría arrancar con estos
// datos y la vista previa no haría falta.

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Image from '@/components/Imagen'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { TokkoProperty } from '@/lib/tokko'
import type { PropertyCardProjection } from '@/lib/projections'

const PropiedadesView = dynamic(
  () => import('@/components/PropiedadesView'),
  { ssr: false }
)

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const P = "var(--font-poppins, 'Poppins'), system-ui, sans-serif"
const TARJETA = 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100'

// Lo que dura la entrada del panel real (ppSlideIn de PropertyPanel, 250 ms):
// la vista previa se va recién cuando el panel de abajo ya quedó quieto.
const ESPERA_ENTRADA_PANEL_MS = 260
// Si el panel real nunca aparece (falló su fetch), la vista previa se va igual.
const TOPE_VISTA_PREVIA_MS = 5000
const SALIDA_MS = 200

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: PropertyCardProjection[] }

/** Lo que la ficha ya tiene del server para el primer pintado en la compu. */
export interface PreviaFicha {
  titulo: string
  precio: string
  /** Dirección + zona, como el renglón con el pin del panel. */
  direccion: string
  /** Hasta 5 fotos, en el orden de la galería (1 grande + 4). */
  fotos: string[]
}

interface Props {
  initialPropertyId: number
  previa?: PreviaFicha
}

type Fase = 'visible' | 'saliendo' | 'fuera'

/**
 * La forma del panel de la ficha en la compu (PropertyPanel: header de 56,
 * galería de 440, barra de secciones de 52, resumen + columna de contacto),
 * por encima de todo. Con `previa` muestra los datos reales; sin ella es el
 * esqueleto (lo usa también propiedades/[slug]/loading.tsx). Es solo para
 * mirar: no tiene nada enfocable y se desmonta apenas está el panel real.
 */
export function PanelFichaPrevia({ previa, saliendo = false }: { previa?: PreviaFicha; saliendo?: boolean }) {
  const fotos = previa?.fotos ?? []
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9996] transition-opacity duration-200 ease-out motion-reduce:transition-none"
      style={{ opacity: saliendo ? 0 : 1 }}
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-full max-w-[1250px] bg-[#fafafa] overflow-hidden shadow-2xl">
        {/* Header: "Volver a la búsqueda" · logo · compartir */}
        <div className="bg-white border-b border-gray-200 grid grid-cols-3 items-center px-5" style={{ height: 56 }}>
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700" style={{ fontFamily: R }}>
            <ArrowLeft className="w-4 h-4" />
            Volver a la búsqueda
          </span>
          <div className="flex items-center justify-center">
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt=""
              width={140}
              height={28}
              className="object-contain si-theme-logo"
              style={{ height: 28, width: 'auto' }}
            />
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-24 rounded-full bg-gray-100" />
          </div>
        </div>

        {/* Galería: 1 grande + 4 en 2×2, como PropertyGalleryHero. Mismos
            `sizes`: la foto que baja acá es la misma que usa el panel real. */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-5 grid-rows-2 gap-2 h-[440px] rounded-2xl overflow-hidden">
            <div className={`relative col-span-3 row-span-2 bg-gray-200 ${fotos[0] ? '' : 'motion-safe:animate-pulse'}`}>
              {fotos[0] && (
                <Image src={fotos[0]} alt="" fill className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" />
              )}
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`relative col-span-1 bg-gray-100 ${previa ? '' : 'motion-safe:animate-pulse'}`}>
                {fotos[i] && <Image src={fotos[i]} alt="" fill className="object-cover" sizes="20vw" />}
              </div>
            ))}
          </div>
        </div>

        {/* Barra de secciones */}
        <div className="bg-white flex items-center justify-center gap-2" style={{ height: 52 }}>
          {[96, 132, 112, 104, 96].map((w, i) => (
            <div key={i} className="h-9 rounded-full bg-gray-100" style={{ width: w }} />
          ))}
        </div>

        {/* Resumen + columna de contacto */}
        <div className="flex gap-6 p-6">
          <div className={`flex-1 min-w-0 ${TARJETA}`}>
            {previa ? (
              <>
                <p
                  className="text-[24px] lg:text-[30px]"
                  style={{ fontFamily: R, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.18, letterSpacing: '-0.01em', marginBottom: 8 }}
                >
                  {previa.titulo}
                </p>
                {previa.direccion && (
                  <p className="mb-4" style={{ fontFamily: R, fontSize: 15, color: 'var(--tinta-soft)' }}>
                    {previa.direccion}
                  </p>
                )}
                <p
                  className="font-numeric text-[28px] lg:text-[32px]"
                  style={{ fontFamily: P, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--foreground)', lineHeight: 1 }}
                >
                  {previa.precio}
                </p>
              </>
            ) : (
              <div className="space-y-3 motion-safe:animate-pulse">
                <div className="h-8 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-100" />
                <div className="h-9 w-1/3 rounded bg-gray-200" />
              </div>
            )}
          </div>
          <div className={`w-[360px] shrink-0 space-y-4 ${TARJETA}`}>
            <div className="flex items-center gap-3 motion-safe:animate-pulse">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-12 rounded-full bg-gray-200 motion-safe:animate-pulse" />
            <div className="h-12 rounded-full bg-gray-100 motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertyDetailZillowDesktopPanel({
  initialPropertyId,
  previa,
}: Props) {
  const isDesktopViewport = useMediaQuery('(min-width: 768px)')
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [retryToken, setRetryToken] = useState(0)
  const [fase, setFase] = useState<Fase>('visible')

  useEffect(() => {
    if (!isDesktopViewport) return
    let cancelled = false
    setState({ kind: 'loading' })
    fetch('/api/propiedades/list-cards')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (cancelled) return
        const objs: PropertyCardProjection[] = d.objects ?? []
        setState({ kind: 'success', data: objs })
      })
      .catch(err => {
        if (cancelled) return
        setState({ kind: 'error', message: err instanceof Error ? err.message : 'unknown' })
      })
    return () => { cancelled = true }
  }, [isDesktopViewport, retryToken])

  // Con el listado montado, esperar a que PropertyPanel (portal en <body>)
  // dibuje la ficha cargada y recién ahí retirar la vista previa.
  useEffect(() => {
    if (state.kind !== 'success' || fase !== 'visible') return
    let listo = false
    let espera: number | undefined
    const retirar = () => {
      if (listo) return
      listo = true
      observador.disconnect()
      espera = window.setTimeout(() => setFase('saliendo'), ESPERA_ENTRADA_PANEL_MS)
    }
    const observador = new MutationObserver(() => {
      if (document.querySelector('.si-property-panel')) retirar()
    })
    observador.observe(document.body, { childList: true, subtree: true })
    if (document.querySelector('.si-property-panel')) retirar()
    const tope = window.setTimeout(retirar, TOPE_VISTA_PREVIA_MS)
    return () => {
      observador.disconnect()
      window.clearTimeout(espera)
      window.clearTimeout(tope)
    }
  }, [state.kind, fase])

  useEffect(() => {
    if (fase !== 'saliendo') return
    const t = window.setTimeout(() => setFase('fuera'), SALIDA_MS)
    return () => window.clearTimeout(t)
  }, [fase])

  // Desmontada (no solo transparente): una capa fija invisible encima taparía
  // los toques al panel real.
  const capaPrevia = fase !== 'fuera' && state.kind !== 'error'
    ? <PanelFichaPrevia previa={previa} saliendo={fase === 'saliendo'} />
    : null

  // SSR y primer render del cliente: todavía no se sabe si es compu. La capa
  // va siempre en el segundo lugar (acá con un hueco adelante): así React la
  // conserva entre estados y las fotos no se vuelven a montar.
  if (!montado) return <div className="hidden md:block">{null}{capaPrevia}</div>

  if (!isDesktopViewport) return null

  if (state.kind === 'loading' || state.kind === 'idle') {
    return (
      <div className="hidden md:block">
        <div className="h-[100dvh] md:h-[calc(100dvh-61px)] lg:h-[calc(100dvh-var(--header-height))] flex items-stretch border-t border-gray-200">
          {/* Skeleton lateral (listado) */}
          <div className="w-full md:w-[48%] border-r border-gray-200 p-4 overflow-hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[14px] border border-gray-200 overflow-hidden bg-white animate-pulse">
                  <div className="aspect-[2/1] bg-gray-200" />
                  <div className="px-3 py-2 space-y-2">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Skeleton del mapa */}
          <div className="hidden md:block flex-1 bg-gray-100 animate-pulse" />
        </div>
        {capaPrevia}
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="hidden md:block py-10 px-6">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">No pudimos cargar el listado de propiedades.</p>
          <button
            onClick={() => { setFase('visible'); setRetryToken(t => t + 1) }}
            className="text-sm font-semibold text-[#1A5C38] hover:text-[#0F3A23]"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden md:block">
      <PropiedadesView
        properties={state.data as unknown as TokkoProperty[]}
        initialPropertyId={initialPropertyId}
      />
      {capaPrevia}
    </div>
  )
}

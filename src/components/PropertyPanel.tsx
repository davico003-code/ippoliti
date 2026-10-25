'use client'

// Zillow-style property panel: always sits on top of the listing/map view.
// Anchored to the top of the viewport below the site header, extends to the
// bottom (including the global footer inside its own scroll). Mobile is not
// touched — mobile users navigate to /propiedades/[slug] directly.
//
// Content (body, sidebar, gallery, sticky nav) is shared with the full page.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Image from '@/components/Imagen'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  type TokkoProperty,
  generatePropertySlug,
  buildPropertyWhatsappUrl,
  getDescription,
  getBlueprintPhotos,
  tituloVisible,
  formatPrice,
} from '@/lib/tokko'
import PropertyGalleryHero from './property-detail/PropertyGalleryHero'
import PropertyStickyNav, { ALTURA_NAV_FICHA } from './property-detail/PropertyStickyNav'
import PropertyDetailBody from './property-detail/PropertyDetailBody'
import PropertyDetailSidebar from './property-detail/PropertyDetailSidebar'
import PropertyDetailSimilars from './property-detail/PropertyDetailSimilars'
import Footer from './Footer'
import ShareMenu from './ShareMenu'
import { atrasEsDelMazo } from '@/lib/mazo-atras'
import { formatUbicacion } from '@/lib/ubicacion'
import { videosPropios } from '@/lib/video-oficina'
import PropertyViewTracker from './PropertyViewTracker'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
// Height of the sticky header INSIDE the panel (not the site header).
const PANEL_HEADER_H = 56

// Misma lista que la ficha (/propiedades/[slug]): cada pestaña solo si abajo
// existe su sección; si no, quedaba un botón que no llevaba a ningún lado.
function seccionesDe(property: TokkoProperty) {
  return [
    { id: 'overview', label: 'Resumen' },
    { id: 'caracteristicas', label: 'Características' },
    ...(videosPropios(property.videos).length > 0 ? [{ id: 'video', label: 'Video' }] : []),
    ...(getDescription(property) ? [{ id: 'descripcion', label: 'Descripción' }] : []),
    ...(getBlueprintPhotos(property).length > 0 ? [{ id: 'planos', label: 'Planos' }] : []),
    { id: 'ubicacion', label: 'Ubicación' },
    { id: 'similares', label: 'Similares' },
  ]
}

interface Props {
  propertyId: number
  onClose: () => void
  allProperties?: TokkoProperty[]
}

export default function PropertyPanel({ propertyId, onClose, allProperties = [] }: Props) {
  // Se monta en <body> vía portal: dentro del árbol de /propiedades quedaba
  // atrapado en un stacking context más bajo que el Navbar (z-50), y en
  // ventanas >= lg la barra del sitio tapaba el header "Volver" y la barra de
  // secciones de la ficha.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const portal = (node: ReactNode) => (mounted ? createPortal(node, document.body) : null)

  const [property, setProperty] = useState<TokkoProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // "Reintentar" del estado de error: vuelve a pedir la misma propiedad.
  const [intento, setIntento] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Guard de cancelación: en modo overlay se puede clickear otra card antes de
    // que resuelva el fetch anterior. Sin esto, respuestas fuera de orden dejan
    // pintada la propiedad equivocada (y hay setState tras unmount).
    let active = true
    setLoading(true)
    setError(false)
    fetch(`/api/propiedades/${propertyId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: TokkoProperty) => { if (active) { setProperty(data); setLoading(false) } })
      .catch(() => { if (active) { setError(true); setLoading(false) } })
    return () => { active = false }
  }, [propertyId, intento])

  // Expose scroll container to the sticky nav once mounted
  useEffect(() => {
    if (scrollRef.current) setScrollRoot(scrollRef.current)
  }, [property])

  // Lock body scroll preserving position
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // URL shareable — update the URL to /propiedades/[slug] while the panel is
  // open. Al cerrar restauramos el path que existía antes de abrir el panel:
  // — si se abrió como overlay desde /propiedades, volvemos a /propiedades;
  // — si se auto-abrió porque la ruta REAL es /propiedades/[slug] (mount via
  //   PropertyDetailZillowDesktopPanel), dejamos la URL en /[slug] para que
  //   coincida con el árbol React montado. Antes empujábamos /propiedades
  //   siempre y el bloque mobile SSR del slug page quedaba con URL inconsistente,
  //   filtrándose sobre el listado al cambiar a breakpoint mobile.
  //
  // Al cerrar se DESHACE la entrada propia con history.back() (antes se
  // empujaba otra vez el listado: quedaba listado → ficha → listado y el
  // botón Atrás del navegador mostraba el listado con la URL de la ficha).
  // Si se cerró con Atrás, el navegador ya la sacó y no se hace nada.
  const backPendienteRef = useRef(false)
  useEffect(() => {
    if (!property) return
    const slug = generatePropertySlug(property)
    const search = window.location.search
    const targetUrl = `/propiedades/${slug}${search}`
    const originalUrl = window.location.pathname + window.location.search
    if (originalUrl === targetUrl) return
    if (backPendienteRef.current) {
      // Cambió la propiedad con el panel abierto: se reemplaza la entrada.
      backPendienteRef.current = false
      window.history.replaceState(null, '', targetUrl)
    } else {
      window.history.pushState(null, '', targetUrl)
    }
    return () => {
      if (window.location.pathname + window.location.search !== targetUrl) return
      backPendienteRef.current = true
      setTimeout(() => {
        if (!backPendienteRef.current) return
        backPendienteRef.current = false
        window.history.back()
      }, 0)
    }
  }, [property])

  // Listener ESTABLE (onClose por ref): onClose llega como arrow inline y
  // cambia en cada render. Con [onClose] de dependencia, el popstate del botón
  // Atrás hacía que Next re-renderizara sincrónicamente, React sacaba este
  // listener y ponía otro durante el mismo evento, y el navegador no ejecutaba
  // ninguno: Atrás cambiaba la URL pero el panel quedaba abierto.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    // Con el Tinder abierto adentro de la ficha, el atrás es del Tinder (pregunta antes de salir).
    const h = () => {
      if (atrasEsDelMazo()) return
      onCloseRef.current()
    }
    window.addEventListener('popstate', h); return () => window.removeEventListener('popstate', h)
  }, [])

  // UN SOLO armazón para cargando, error y ficha (25-oct-2026). Antes cada
  // estado devolvía su propio árbol: React reutilizaba el div del velo y, al
  // llegar la propiedad, recibía `animation: ppFadeIn` recién ahí, así que el
  // velo al 65 % caía a 0 y volvía a aparecer (un parpadeo justo cuando se
  // pinta la ficha). Ahora el velo y el panel se montan una vez con su
  // animación de entrada y adentro solo cambia el contenido. El header (volver,
  // logo, compartir) ya está desde el primer frame, así el esqueleto tiene la
  // misma forma que la ficha y nada salta al cargar.
  const lista = !loading && !error && property ? property : null
  const slug = lista ? generatePropertySlug(lista) : null
  // wa.me al productor asignado en Tokko; fallback al número general si no hay producer.
  const whatsappUrl = lista && slug ? buildPropertyWhatsappUrl(lista, slug) : ''

  return portal(
    <div className="fixed inset-0 z-[9995]">
      {/* Backdrop — cubre TODO el viewport incluyendo el header del sitio */}
      <div
        className="si-pp-anim absolute inset-0 bg-black/65"
        onClick={onClose}
        style={{ animation: 'ppFadeIn 200ms ease-out' }}
      />

      <div
        ref={scrollRef}
        className="si-property-panel si-pp-anim absolute inset-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-[1250px] bg-[#fafafa] overflow-y-auto overflow-x-hidden shadow-2xl"
        style={{ animation: 'ppSlideIn 250ms ease-out' }}
        aria-busy={loading}
      >
        {/* Panel header sticky — volver a la izquierda, logo SI centrado, compartir a la derecha */}
        <div
          className="sticky top-0 z-40 bg-white border-b border-gray-200 grid grid-cols-3 items-center px-5"
          style={{ height: PANEL_HEADER_H }}
        >
          <div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
              style={{ fontFamily: R }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a la búsqueda</span>
              <span className="sm:hidden">Volver</span>
            </button>
          </div>
          <Link href="/" className="flex items-center justify-center" aria-label="Ir a la página principal">
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI INMOBILIARIA"
              width={140}
              height={28}
              className="object-contain si-theme-logo"
              style={{ height: 28, width: 'auto' }}
              priority
            />
          </Link>
          <div className="flex justify-end">
            {lista && slug ? (
              <ShareMenu
                variant="header"
                propertyId={lista.id}
                slug={slug}
                title={tituloVisible(lista) || lista.fake_address || lista.address}
                placaHref={`/propiedades/${slug}/placa`}
                // Precio y zona van en el texto que se comparte (WhatsApp, hoja nativa).
                precio={formatPrice(lista)}
                ubicacion={formatUbicacion(lista, tituloVisible(lista)) || undefined}
              />
            ) : (
              // Lugar reservado del botón Compartir mientras carga: el header no se corre.
              <div className="h-9 w-[104px] rounded-full bg-gray-100 animate-pulse" aria-hidden="true" />
            )}
          </div>
        </div>

        {loading ? (
          <PanelEsqueleto />
        ) : !lista || !slug ? (
          <div className="flex items-center justify-center px-6 py-24">
            <div className="text-center max-w-sm" style={{ fontFamily: R }}>
              <p className="text-xl font-bold text-gray-900 mb-2">No pudimos abrir esta propiedad</p>
              <p className="text-sm text-gray-600 mb-6">Puede ser la conexión. Probá de nuevo en un momento.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIntento(i => i + 1)}
                  className="min-h-[44px] px-5 rounded-xl bg-[#1A5C38] hover:bg-[#145030] text-white text-sm font-semibold transition-colors"
                >
                  Reintentar
                </button>
                <button onClick={onClose} className="min-h-[44px] px-4 text-sm font-semibold text-[#1A5C38]">
                  Volver a la búsqueda
                </button>
              </div>
            </div>
          </div>
        ) : (
        <>
        {/* La ficha abierta en el panel también es una visita (como la página de
            la ficha): sin esto el embudo de la compu contaba los toques al
            WhatsApp pero no las visitas, y el dueño veía menos visitas web. */}
        <PropertyViewTracker propertyId={lista.id} title={tituloVisible(lista) || lista.address} price={formatPrice(lista)} />

        {/* Galería Zillow — constrained a padding del panel para no desbordar */}
        <div className="px-4 md:px-6 pt-4 pb-2">
          <PropertyGalleryHero property={lista} />
        </div>

        {/* Sticky nav (desktop only) — ancla al top del modal (debajo del panel header).
            "Video" se inserta tras "Características" solo si la propiedad tiene recorrido. */}
        <PropertyStickyNav
          sections={seccionesDe(lista)}
          scrollRoot={scrollRoot}
          stickyTop={PANEL_HEADER_H}
        />

        {/* Contenido (2 cols en desktop: body + sidebar) */}
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6">
          <div className="flex-1 min-w-0">
            <PropertyDetailBody
              property={lista}
              allProperties={allProperties}
              whatsappUrl={whatsappUrl}
              showMobileContact
            />
          </div>
          {/* Se pega DEBAJO de la barra de secciones (no por debajo de ella). */}
          <PropertyDetailSidebar property={lista} whatsappUrl={whatsappUrl} topOffset={PANEL_HEADER_H + ALTURA_NAV_FICHA + 16} />
        </div>

        {/* Full-width: "Otras opciones para vos" ocupa todo el ancho del panel */}
        <div className="px-4 md:px-6 pb-6">
          <PropertyDetailSimilars property={lista} allProperties={allProperties} />
        </div>

        {/* Link "Volver al catálogo" — cierra la ficha igual que el header */}
        <div className="px-4 md:px-6 pb-8 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-[#1A5C38] hover:text-[#0F3A23] font-bold transition-colors text-lg"
            style={{ fontFamily: R }}
          >
            ← Volver al catálogo
          </button>
        </div>

        {/* Footer global dentro del panel (al final del scroll interno) */}
        <Footer />
        </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ppFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ppSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) { .si-pp-anim { animation: none !important; } }
      ` }} />
    </div>
  )
}

// Esqueleto con la forma de la ficha: galería de 5 columnas (1 grande + 4) de
// 440 px, barra de secciones y cuerpo + columna de contacto de 360 px. Así,
// cuando llega la propiedad, cada cosa aparece donde ya estaba su lugar.
function PanelEsqueleto() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="px-4 md:px-6 pt-4 pb-2">
        <div className="md:hidden aspect-[4/3] rounded-2xl bg-gray-200" />
        <div className="hidden md:grid grid-cols-5 grid-rows-2 gap-2 h-[440px] rounded-2xl overflow-hidden">
          <div className="col-span-3 row-span-2 bg-gray-200" />
          {[0, 1, 2, 3].map(i => <div key={i} className="col-span-1 bg-gray-200" />)}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6 px-6 border-b border-gray-200" style={{ height: ALTURA_NAV_FICHA }}>
        {[72, 104, 88, 80, 72].map((w, i) => <div key={i} className="h-3.5 rounded bg-gray-200" style={{ width: w }} />)}
      </div>
      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-9 w-48 rounded bg-gray-200" />
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-100" />
          <div className="h-28 w-full rounded-2xl bg-gray-100 !mt-6" />
          <div className="h-28 w-full rounded-2xl bg-gray-100" />
        </div>
        <div className="w-full md:w-[360px] md:shrink-0 h-[320px] rounded-2xl bg-gray-200" />
      </div>
    </div>
  )
}

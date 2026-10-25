'use client'

import { useState, useRef, useEffect, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import Link from 'next/link'
import { Calendar, MessageCircle, Share2, Link2, Check, Instagram, Sparkles } from 'lucide-react'
import VisitWidget from './VisitWidget'
import WhatsappConDatos from './property-detail/WhatsappConDatos'
import { showToast } from './Toast'
import { generarYCopiarFichaLink } from '@/lib/share-ficha'
import {
  compartirNativo,
  copiarLinkPropiedad,
  lineaDatos,
  linkPropiedad,
  puedeCompartirNativo,
  registrarCompartir,
  urlCompartible,
  whatsappPropiedad,
  type PropiedadCompartible,
} from '@/lib/compartir'
import { haptico } from '@/lib/haptico'
import { useEsAgente } from '@/lib/use-es-agente'

interface Props {
  whatsappUrl: string
  slug: string
  title: string
  propertyId: number
  propertyTitle: string
  /** Precio como se muestra en la ficha (para el mensaje de la consulta en Hilo). */
  propertyPrice?: string
  /** "Cotos de la Alameda, Roldán" (formatUbicacion): va en el texto de compartir. */
  propertyUbicacion?: string
  /** WhatsApp del pedido de visita (alquileres de Roldán → Leticia); sin esto, el general. */
  visitWhatsappNumber?: string
  /** Operación de la propiedad, para etiquetar el pedido de visita. */
  visitTipo?: 'venta' | 'alquiler'
}

const FUENTE = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
// El mismo verde de WhatsApp que el cuerpo de la ficha: antes la barra usaba
// otro (#22c55e) y el mismo botón se veía de dos colores en la misma pantalla.
const VERDE_WHATSAPP = '#25D366'

const ITEM: CSSProperties = {
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--theme-ink, #1a1a1a)',
  fontFamily: FUENTE,
  textDecoration: 'none',
}
const CIRCULO: CSSProperties = { width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }

// Hoja de visita: entra en 220ms (ease-out, en el CSS de abajo) y sale en 180ms
// (ease-in). Al soltar el arrastre sin cerrar, vuelve con el mismo resorte.
const SALIDA_MS = 180
const EASE_IN = 'cubic-bezier(.4,0,1,1)'
const RESORTE = 'cubic-bezier(.22,1,.36,1)'
const UMBRAL_ARRASTRE = 80 // px hacia abajo para cerrar al soltar
const UMBRAL_VELOCIDAD = 0.5 // px/ms: un tirón rápido cierra aunque sea corto

function sinMovimiento(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export default function MobileStickyBar({
  whatsappUrl, slug, title, propertyId, propertyTitle, propertyPrice, propertyUbicacion, visitWhatsappNumber, visitTipo,
}: Props) {
  const esAgente = useEsAgente()
  const [shareOpen, setShareOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [generandoFicha, setGenerandoFicha] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)
  const visitaBtnRef = useRef<HTMLButtonElement>(null)
  const hojaRef = useRef<HTMLDivElement>(null)
  const veloRef = useRef<HTMLDivElement>(null)
  const cierreRef = useRef<number | undefined>(undefined)
  const cerrandoRef = useRef(false)
  const arrastreRef = useRef<{ y0: number; dy: number; yPrev: number; tPrev: number; v: number } | null>(null)

  // Cerrar popup compartir al tocar fuera
  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    const touchHandler = (e: TouchEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', touchHandler, { passive: true })
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', touchHandler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [shareOpen])

  const propertyUrl = `https://siinmobiliaria.com/propiedades/${slug}`
  // (también lo pasamos al VisitWidget para enriquecer el mensaje WhatsApp)
  const propiedad: PropiedadCompartible = {
    id: propertyId,
    slug,
    titulo: title,
    precio: propertyPrice,
    ubicacion: propertyUbicacion,
  }

  // ── Compartir ──────────────────────────────────────────────────────────────
  // Hoja nativa del celu (WhatsApp, Instagram, Mensajes, AirDrop en un toque).
  // Se llama SINCRÓNICA dentro del toque (regla iOS). Si el navegador tiene
  // navigator.share pero falla (algunos navegadores embebidos), se abre el menú
  // de siempre en vez de dejar el toque sin respuesta; cancelar no es error.
  const abrirHojaNativa = (): boolean => {
    if (!puedeCompartirNativo()) return false
    haptico()
    const url = urlCompartible(`/propiedades/${slug}`, 'nativo', 'ficha')
    void compartirNativo({ title, text: [title, lineaDatos(propiedad)].filter(Boolean).join('\n'), url }).then(r => {
      if (r === 'ok') registrarCompartir('nativo', 'ficha', propertyId)
      else if (r === 'error') setShareOpen(true)
    })
    return true
  }

  // Política de compartir del sitio: el visitante en el celu va DIRECTO a la
  // hoja nativa (un toque, sin menú propio). El asesor con sesión y la compu
  // ven el menú (el asesor, con "Compartir…" primero y sus herramientas).
  const handleCompartir = () => {
    if (shareOpen) {
      setShareOpen(false)
      return
    }
    if (!esAgente && abrirHojaNativa()) return
    setShareOpen(true)
  }

  const handleCopyLink = () => {
    // copiarLinkPropiedad arranca el portapapeles en el acto (con el respaldo
    // execCommand para los navegadores de Instagram/Facebook) y vibra al copiar.
    // Una sola señal: el check del ítem; el toast queda solo para el error, con
    // el link para copiarlo a mano.
    void copiarLinkPropiedad(propiedad, 'ficha').then(ok => {
      if (ok) {
        setLinkCopied(true)
        window.setTimeout(() => { setLinkCopied(false); setShareOpen(false) }, 900)
      } else {
        setShareOpen(false)
        showToast(`Copialo a mano: ${linkPropiedad(propiedad, 'copiar', 'ficha')}`, { variant: 'error', duration: 8000 })
      }
    })
  }

  const handleShareWhatsApp = () => {
    // Título, precio · zona y el link con utm (antes solo título + link).
    // Sin toast: la persona ya está en WhatsApp, nadie lo veía.
    whatsappPropiedad(propiedad, 'ficha')
    setShareOpen(false)
  }

  const handleColega = () => {
    if (generandoFicha) return
    setShareOpen(false)
    setGenerandoFicha(true)
    // El toast (éxito o error) lo muestra la lib — no duplicar acá: mostraba
    // "Link para colega copiado" aunque fallara. Se llama sin await previo: el
    // portapapeles se reserva dentro del toque (ClipboardItem con Promise).
    void generarYCopiarFichaLink(propertyId)
      .then(ok => {
        if (ok) {
          haptico()
          registrarCompartir('colega', 'ficha', propertyId)
        }
      })
      .finally(() => setGenerandoFicha(false))
  }

  // ── Hoja "Pedir visita" ────────────────────────────────────────────────────
  const handleVisita = () => {
    haptico()
    setShareOpen(false)
    window.clearTimeout(cierreRef.current)
    cerrandoRef.current = false
    setVisitOpen(true)
  }

  // Cierra deslizando hacia abajo desde donde esté (también desde la mitad de
  // un arrastre). Con "reducir movimiento", cierra en el acto.
  const cerrarVisita = useCallback(() => {
    const hoja = hojaRef.current
    if (!hoja || sinMovimiento()) {
      setVisitOpen(false)
      return
    }
    if (cerrandoRef.current) return
    cerrandoRef.current = true
    hoja.style.animation = 'none'
    hoja.style.transition = `transform ${SALIDA_MS}ms ${EASE_IN}`
    hoja.style.transform = 'translateY(100%)'
    const velo = veloRef.current
    if (velo) {
      velo.style.animation = 'none'
      velo.style.transition = `opacity ${SALIDA_MS}ms ${EASE_IN}`
      velo.style.opacity = '0'
    }
    cierreRef.current = window.setTimeout(() => {
      cerrandoRef.current = false
      setVisitOpen(false)
    }, SALIDA_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(cierreRef.current), [])

  // Mientras la hoja está abierta: la ficha de atrás no scrollea (position:fixed,
  // el único bloqueo real en iOS; mismo patrón que la galería), Escape cierra, el
  // foco entra a la hoja y, al cerrar, vuelve al botón con la ficha donde estaba.
  useEffect(() => {
    if (!visitOpen) return
    const hoja = hojaRef.current
    const boton = visitaBtnRef.current
    const scrollY = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    hoja?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarVisita()
    }
    document.addEventListener('keydown', onKey)

    // Teclado del celu: iOS no achica el viewport (ni el dvh) al abrirlo, así
    // que la hoja quedaba detrás y tapaba el botón de enviar. Con visualViewport
    // se apoya la hoja justo arriba del teclado y se limita a lo que queda visible.
    const vv = window.visualViewport
    const ajustarAlTeclado = () => {
      if (!vv || !hoja) return
      const tapado = window.innerHeight - vv.height - vv.offsetTop
      if (tapado > 40) {
        hoja.style.bottom = `${tapado}px`
        hoja.style.maxHeight = `${Math.round(vv.height - 8)}px`
      } else {
        hoja.style.bottom = ''
        hoja.style.maxHeight = ''
      }
    }
    vv?.addEventListener('resize', ajustarAlTeclado)
    vv?.addEventListener('scroll', ajustarAlTeclado)

    return () => {
      document.removeEventListener('keydown', onKey)
      vv?.removeEventListener('resize', ajustarAlTeclado)
      vv?.removeEventListener('scroll', ajustarAlTeclado)
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      // El html tiene scroll-behavior:smooth: sin apagarlo un instante, la ficha
      // "viaja" desde arriba hasta donde estaba. (behavior:'instant' tira error
      // en Safari viejos; esto anda en todos.)
      const html = document.documentElement
      const comportamiento = html.style.scrollBehavior
      html.style.scrollBehavior = 'auto'
      window.scrollTo(0, scrollY)
      html.style.scrollBehavior = comportamiento
      boton?.focus({ preventScroll: true })
    }
  }, [visitOpen, cerrarVisita])

  // Arrastre del grabber (sin librerías): la hoja sigue al dedo, el velo se
  // aclara, y al soltar cierra si bajó más de 80px o si fue un tirón rápido; si
  // no, vuelve a su lugar. Solo en el grabber, para no pelear con el scroll.
  const alApoyar = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const hoja = hojaRef.current
    if (!hoja || cerrandoRef.current) return
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* sin captura */ }
    hoja.style.animation = 'none'
    hoja.style.transition = 'none'
    const velo = veloRef.current
    if (velo) {
      velo.style.animation = 'none'
      velo.style.transition = 'none'
    }
    arrastreRef.current = { y0: e.clientY, dy: 0, yPrev: e.clientY, tPrev: e.timeStamp, v: 0 }
  }

  const alMover = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = arrastreRef.current
    const hoja = hojaRef.current
    if (!a || !hoja) return
    const dt = e.timeStamp - a.tPrev
    if (dt > 0) a.v = (e.clientY - a.yPrev) / dt
    a.yPrev = e.clientY
    a.tPrev = e.timeStamp
    a.dy = Math.max(0, e.clientY - a.y0)
    hoja.style.transform = `translateY(${a.dy}px)`
    const velo = veloRef.current
    if (velo) velo.style.opacity = String(Math.max(0, 1 - a.dy / (hoja.offsetHeight || 1)))
  }

  const alSoltar = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = arrastreRef.current
    arrastreRef.current = null
    const hoja = hojaRef.current
    if (!a || !hoja) return
    // Si el dedo se quedó quieto antes de soltar, no cuenta como tirón.
    const v = e.timeStamp - a.tPrev > 100 ? 0 : a.v
    if (a.dy > UMBRAL_ARRASTRE || (v > UMBRAL_VELOCIDAD && a.dy > 10)) {
      cerrarVisita()
      return
    }
    hoja.style.transition = `transform 240ms ${RESORTE}`
    hoja.style.transform = ''
    const velo = veloRef.current
    if (velo) {
      velo.style.transition = `opacity 240ms ${RESORTE}`
      velo.style.opacity = ''
    }
  }

  // El menú propio solo lo ve quien no tiene hoja nativa (compu) o el asesor.
  // Se evalúa al abrirlo (siempre en el navegador, nunca en el render del server).
  const hayNativo = shareOpen && puedeCompartirNativo()

  return (
    <>
      {/* Contenedor de la barra centrado con left/right + max-width, sin
          pointer-events:none (bug recurrente: dejaba la hoja de visita
          intocable). Solo ocupa lo que mide la barra. */}
      <div
        className="fixed z-50 md:hidden"
        style={{
          left: 10,
          right: 10,
          bottom: 'max(8px, env(safe-area-inset-bottom))',
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{
            border: '1px solid var(--theme-border, rgba(26,92,56,.12))',
            boxShadow: '0 12px 34px rgba(9,30,20,.16)',
            borderRadius: 20,
            background: 'var(--theme-overlay, rgba(255,255,255,.96))',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            padding: '7px',
          }}
        >
          {/* 1. Pedí una visita — CTA principal */}
          <button
            ref={visitaBtnRef}
            type="button"
            onClick={handleVisita}
            aria-haspopup="dialog"
            aria-expanded={visitOpen}
            className="si-barra-btn"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minWidth: 0,
              height: 48,
              background: '#1A5C38',
              color: '#fff',
              fontFamily: FUENTE,
              fontSize: 14,
              fontWeight: 800,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(26,92,56,.22)',
            }}
          >
            <Calendar className="w-[18px] h-[18px]" aria-hidden />
            <span className="truncate">Pedir visita</span>
          </button>

          {/* 2. WhatsApp */}
          <WhatsappConDatos
            href={whatsappUrl}
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            propertyPrice={propertyPrice}
            aria-label="Contactar por WhatsApp"
            className="si-barra-btn flex items-center justify-center"
            style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: VERDE_WHATSAPP,
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <MessageCircle className="w-[21px] h-[21px] text-white" />
          </WhatsappConDatos>

          {/* 3. Compartir */}
          <div className="relative" ref={shareRef} style={{ flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleCompartir}
              aria-label="Compartir"
              aria-haspopup="menu"
              aria-expanded={shareOpen}
              className="si-barra-btn flex items-center justify-center"
              style={{
                width: 48, height: 48,
                borderRadius: 14,
                background: 'var(--theme-surface, #fff)',
                border: '1.5px solid var(--theme-border, #cfd7dc)',
                cursor: 'pointer',
              }}
            >
              <Share2 className="w-[20px] h-[20px]" style={{ color: 'var(--theme-ink, #3a4a54)' }} />
            </button>

            {/* Popup de compartir (compu, sin hoja nativa, o asesor con sesión) */}
            {shareOpen && (
              <div
                role="menu"
                aria-label="Compartir propiedad"
                className="si-compartir-menu"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  right: -8,
                  width: 228,
                  background: 'var(--theme-surface, #fff)',
                  border: '1px solid var(--theme-border, rgba(0,0,0,.06))',
                  borderRadius: 14,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                  padding: '8px 0',
                  zIndex: 100,
                }}
              >
                {/* Flecha apuntando hacia abajo: del color del menú (en oscuro
                    quedaba un triángulo blanco flotando). */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    bottom: -7,
                    right: 20,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid var(--theme-surface, #fff)',
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.06))',
                  }}
                />

                {/* Asesor en el celu: la hoja nativa primero, sus herramientas después. */}
                {esAgente && hayNativo && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { abrirHojaNativa(); setShareOpen(false) }}
                    className="w-full flex items-center gap-3 text-left"
                    style={ITEM}
                  >
                    <div className="flex items-center justify-center" style={{ ...CIRCULO, background: 'var(--theme-surface-soft, #eef1f2)' }}>
                      <Share2 className="w-4 h-4" style={{ color: 'var(--theme-ink, #3a4a54)' }} />
                    </div>
                    Compartir…
                  </button>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center gap-3 text-left"
                  style={ITEM}
                >
                  <div className="flex items-center justify-center" style={{ ...CIRCULO, background: VERDE_WHATSAPP }}>
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  Enviar por WhatsApp
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 text-left"
                  style={ITEM}
                >
                  <div className="flex items-center justify-center" style={{ ...CIRCULO, background: 'var(--theme-surface-soft, #eef1f2)' }}>
                    {linkCopied
                      ? <Check className="w-4 h-4" style={{ color: 'var(--theme-accent, #1A5C38)' }} />
                      : <Link2 className="w-4 h-4" style={{ color: 'var(--theme-ink, #4b5563)' }} />}
                  </div>
                  <span aria-live="polite">{linkCopied ? '¡Copiado!' : 'Copiar link'}</span>
                </button>

                {/* Herramienta de asesor: el comprador no la necesita. */}
                {esAgente && (
                  <Link
                    href={`/propiedades/${slug}/placa`}
                    role="menuitem"
                    onClick={() => { registrarCompartir('placa', 'ficha', propertyId); setShareOpen(false) }}
                    className="w-full flex items-center gap-3 text-left"
                    style={ITEM}
                  >
                    <div className="flex items-center justify-center" style={{ ...CIRCULO, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                      <Instagram className="w-4 h-4 text-white" />
                    </div>
                    Crear placa
                  </Link>
                )}

                {/* "Link para colega" queda para TODOS, al final y separado: lo
                    usan colegas de otras inmobiliarias (link sin marca). */}
                <div aria-hidden style={{ height: 1, background: 'var(--theme-border, #eef1f3)', margin: '4px 12px' }} />

                <button
                  type="button"
                  role="menuitem"
                  disabled={generandoFicha}
                  onClick={handleColega}
                  className="w-full flex items-center gap-3 text-left"
                  style={{
                    ...ITEM,
                    fontWeight: 600,
                    color: 'var(--theme-accent, #1A5C38)',
                    cursor: generandoFicha ? 'wait' : 'pointer',
                    opacity: generandoFicha ? 0.7 : 1,
                  }}
                >
                  <div className="flex items-center justify-center" style={{ ...CIRCULO, background: 'var(--theme-tint, #e7f2eb)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-accent, #1A5C38)' }} />
                  </div>
                  {generandoFicha ? 'Generando…' : 'Link para colega'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hoja "Pedir visita": fuera del contenedor de la barra, con su propio
          fixed. Una sola X (la del widget), tocar el velo cierra, el grabber
          cierra al arrastrar, y el fondo es el de la superficie (claro u oscuro),
          sin el verde sólido de antes. */}
      {visitOpen && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label="Pedir visita"
        >
          {/* Velo: tocarlo cierra. Antes el onClick estaba en el contenedor y
              este div, que lo tapa entero, se comía el toque: nunca cerraba. */}
          <div
            ref={veloRef}
            aria-hidden="true"
            className="si-visita-velo absolute inset-0 bg-black/40"
            onClick={cerrarVisita}
          />
          <div
            ref={hojaRef}
            tabIndex={-1}
            className="si-visita-hoja absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[28px] outline-none"
            style={{ background: 'var(--theme-surface, #fff)', boxShadow: '0 -12px 40px rgba(0,0,0,.18)' }}
          >
            <div
              aria-hidden="true"
              className="flex h-8 shrink-0 cursor-grab items-center justify-center"
              style={{ touchAction: 'none' }}
              onPointerDown={alApoyar}
              onPointerMove={alMover}
              onPointerUp={alSoltar}
              onPointerCancel={alSoltar}
            >
              <span className="block h-[5px] w-10 rounded-full" style={{ background: 'var(--foreground, #1a1a1a)', opacity: 0.22 }} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <VisitWidget
                propertyId={propertyId}
                propertyTitle={propertyTitle}
                propertyUrl={propertyUrl}
                propertyPrice={propertyPrice}
                propertyUbicacion={propertyUbicacion}
                source="mobile-sticky"
                variante="hoja"
                onClose={cerrarVisita}
                whatsappNumber={visitWhatsappNumber}
                tipo={visitTipo}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback al tocar (120ms) y motion de la hoja/menú. Con "reducir
          movimiento": sin animaciones y el toque se marca con opacidad. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.si-barra-btn{transition:transform 120ms ease-out;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.si-barra-btn:active{transform:scale(.97)}
@keyframes si-velo-entra{from{opacity:0}to{opacity:1}}
@keyframes si-hoja-entra{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes si-menu-entra{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:none}}
.si-visita-velo{animation:si-velo-entra 220ms ease-out}
.si-visita-hoja{max-height:92vh;max-height:92dvh;animation:si-hoja-entra 220ms ${RESORTE}}
.si-compartir-menu{animation:si-menu-entra 160ms ease-out;transform-origin:bottom right}
@media (prefers-reduced-motion: reduce){
  .si-barra-btn{transition:none}
  .si-barra-btn:active{transform:none;opacity:.85}
  .si-visita-velo,.si-visita-hoja,.si-compartir-menu{animation:none}
}`,
        }}
      />
    </>
  )
}

'use client'

// Popup de "Oportunidades" — diseño propio de SI (ni lista ni card gigante):
// UNA propiedad por vez que rota suave entre las cargadas, con su gancho
// comercial (vendedor motivado / permuta / negociable / bajó el precio).
//
// Desktop: card compacta abajo a la derecha, arriba de la burbuja de WhatsApp.
// Mobile: "smart peek" lateral que no pisa mapa, compartir ni acciones fijas.
// Cerrable → no reaparece por 3 días (localStorage).

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

const GREEN = '#1A5C38'
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

const DISMISS_KEY = 'si_oportunidades_dismiss'
const DISMISS_DAYS = 3
const SHOW_DELAY_MS = 5000
const ROTATE_MS = 11000
// Si la persona se va (cierra, cambia de pestaña o de app) y vuelve después de
// este tiempo, el popup reaparece aunque lo haya cerrado antes.
const LASTSEEN_KEY = 'si_oportunidades_lastseen'
const AWAY_RESET_MS = 10 * 60 * 1000

// Rutas internas/flujos donde el popup no corresponde.
// /dockgarden: landing de venta compartida por WhatsApp — sin distracciones.
const HIDE_PREFIXES = ['/agentes', '/admin', '/school', '/seleccion', '/autorizacion', '/v/', '/guia/leer', '/propiedades/', '/dockgarden']

const HOOK_META: Record<string, { badge: string; cta: string; color: string; bg: string }> = {
  motivado: { badge: 'Vendedor motivado', cta: 'Pasá a conocerla', color: '#B5562F', bg: '#FCEBE3' },
  permuta: { badge: 'Acepta permuta', cta: 'Pasá a conocerla', color: '#2B5C9B', bg: '#E7F0FB' },
  negociable: { badge: 'Margen para negociar', cta: 'Hacé tu oferta', color: '#1A5C38', bg: '#E8F4EC' },
  'bajo-precio': { badge: 'Bajó el precio', cta: 'Miralá ahora', color: '#A83C66', bg: '#FBE9F0' },
}

interface Item {
  propertyId: number
  hook: string
  titulo: string
  foto: string | null
  precio: string
  precioAnterior?: string
  pctBaja?: number
  href: string
}

export default function OportunidadesPopup() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [visible, setVisible] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [idx, setIdx] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Refs espejo para leer el estado actual dentro de listeners (visibility/focus).
  const itemsRef = useRef<Item[]>([])
  const visibleRef = useRef(false)
  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => { visibleRef.current = visible }, [visible])

  const enRutaOculta = useCallback(
    () => HIDE_PREFIXES.some((p) => pathname?.startsWith(p)),
    [pathname],
  )

  const marcarVisto = useCallback(() => {
    try { window.localStorage.setItem(LASTSEEN_KEY, String(Date.now())) } catch {}
  }, [])

  const dismissActivo = useCallback(() => {
    try {
      const dismissed = Number(window.localStorage.getItem(DISMISS_KEY) || 0)
      return Date.now() - dismissed < DISMISS_DAYS * 24 * 60 * 60 * 1000
    } catch { return false }
  }, [])

  const cargarItems = useCallback(async (): Promise<Item[]> => {
    try {
      const r = await fetch('/api/oportunidades')
      if (!r.ok) return []
      const d = await r.json()
      return (d?.items?.slice(0, 4) as Item[]) ?? []
    } catch { return [] }
  }, [])

  // Montaje: si vuelve tras estar +10 min afuera (cerró la pestaña y reabrió),
  // se limpia el "cerrado por 3 días" para que reaparezca. Luego, flujo normal.
  useEffect(() => {
    if (enRutaOculta()) return
    try {
      const lastSeen = Number(window.localStorage.getItem(LASTSEEN_KEY) || 0)
      if (lastSeen && Date.now() - lastSeen > AWAY_RESET_MS) {
        window.localStorage.removeItem(DISMISS_KEY)
      }
    } catch {}
    marcarVisto()

    if (dismissActivo()) return

    let alive = true
    let removeMobileScroll: (() => void) | null = null
    cargarItems().then((list) => {
      if (!alive || !list.length) return
      setItems(list)
      window.setTimeout(() => {
        if (!alive) return
        const isMobile = window.matchMedia('(max-width: 640px)').matches
        const isPropiedades = pathname === '/propiedades'
        if (!isMobile || isPropiedades || window.scrollY > 260) {
          setVisible(true)
          return
        }

        const revealOnScroll = () => {
          if (!alive || window.scrollY <= 260) return
          window.removeEventListener('scroll', revealOnScroll)
          removeMobileScroll = null
          setVisible(true)
        }
        window.addEventListener('scroll', revealOnScroll, { passive: true })
        removeMobileScroll = () => window.removeEventListener('scroll', revealOnScroll)
      }, SHOW_DELAY_MS)
    })
    return () => {
      alive = false
      removeMobileScroll?.()
    }
    // Solo al montar; si navega con el popup visible, persiste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reaparición al volver: marcamos cuándo se fue (hidden/blur/pagehide) y, al
  // volver a la pestaña (visible/focus), si pasó +10 min, mostramos de nuevo
  // aunque lo hubiera cerrado.
  useEffect(() => {
    const alSalir = () => marcarVisto()

    const alVolver = async () => {
      if (document.visibilityState !== 'visible') return
      if (enRutaOculta() || visibleRef.current) { marcarVisto(); return }
      let lastSeen = 0
      try { lastSeen = Number(window.localStorage.getItem(LASTSEEN_KEY) || 0) } catch {}
      const afuera = Date.now() - lastSeen
      marcarVisto()
      if (!lastSeen || afuera <= AWAY_RESET_MS) return
      try { window.localStorage.removeItem(DISMISS_KEY) } catch {}
      let list = itemsRef.current
      if (!list.length) {
        list = await cargarItems()
        if (list.length) setItems(list)
      }
      if (list.length) { setIdx(0); setVisible(true) }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') alSalir()
      else alVolver()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', alSalir)
    window.addEventListener('blur', alSalir)
    window.addEventListener('focus', alVolver)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', alSalir)
      window.removeEventListener('blur', alSalir)
      window.removeEventListener('focus', alVolver)
    }
  }, [enRutaOculta, marcarVisto, cargarItems])

  // Rotación automática entre oportunidades.
  useEffect(() => {
    if (!visible || items.length <= 1) return
    timerRef.current = window.setInterval(() => setIdx((i) => (i + 1) % items.length), ROTATE_MS)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [visible, items.length])

  if (!visible || items.length === 0) return null
  if (HIDE_PREFIXES.some((p) => pathname?.startsWith(p))) return null

  const it = items[idx % items.length]
  const meta = HOOK_META[it.hook] ?? HOOK_META.negociable
  const esBaja = it.hook === 'bajo-precio' && it.precioAnterior
  const compactMobile = pathname === '/propiedades'

  const dismiss = () => {
    setVisible(false)
    setMobileExpanded(false)
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
  }

  const goTo = (i: number) => {
    setIdx(i)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => setIdx((x) => (x + 1) % items.length), ROTATE_MS)
  }

  const precioNode = esBaja ? (
    <span style={{ fontFamily: POPPINS, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <s style={{ color: '#A1A1AA', fontSize: 11.5 }}>{it.precioAnterior}</s>
      <b style={{ color: '#111' }}>{it.precio}</b>
      {typeof it.pctBaja === 'number' && (
        <span style={{ background: '#FBE9F0', color: '#A83C66', fontWeight: 700, fontSize: 10.5, borderRadius: 5, padding: '1px 6px' }}>
          −{String(it.pctBaja).replace('.', ',')}%
        </span>
      )}
    </span>
  ) : (
    <span style={{ fontFamily: POPPINS, fontSize: 12.5, color: '#111', fontWeight: 600 }}>{it.precio}</span>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes si-oport-in { from { opacity: 0; transform: translateY(18px) scale(.97) } to { opacity: 1; transform: none } }
        @keyframes si-oport-swap { from { opacity: 0; transform: translateX(10px) } to { opacity: 1; transform: none } }
        @keyframes si-oport-peek { 0% { transform: translateX(-12px); opacity: 0 } 100% { transform: translateX(0); opacity: 1 } }
        @keyframes si-oport-sheet { from { opacity: 0; transform: translateY(12px) scale(.98) } to { opacity: 1; transform: none } }
        .si-oport-desktop { display: block; }
        .si-oport-peek, .si-oport-sheet { display: none; }
        @media (max-width: 640px) {
          .si-oport-desktop { display: none; }
          .si-oport-peek { display: inline-flex; }
          .si-oport-sheet { display: block; }
        }
      ` }} />

      {/* ── Desktop: card compacta rotativa ── */}
      <aside
        className="si-oport-desktop"
        aria-label="Oportunidades"
        style={{
          position: 'fixed', right: 0, bottom: 176, zIndex: 45, width: 316,
          background: '#fff', borderRadius: 18, border: '1px solid #ECECEE',
          boxShadow: '0 18px 50px rgba(9, 30, 20, 0.16)', overflow: 'hidden',
          animation: 'si-oport-in .45s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <button
          type="button" onClick={dismiss} aria-label="Cerrar"
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.92)', border: '1px solid #ECECEE', cursor: 'pointer', color: '#71717A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={13} strokeWidth={2.2} />
        </button>

        <Link key={it.propertyId} href={it.href} onClick={dismiss} style={{ display: 'block', textDecoration: 'none', animation: 'si-oport-swap .35s ease' }}>
          {it.foto && (
            <div style={{ position: 'relative', height: 118, background: '#f2f2f2' }}>
              <Image src={it.foto} alt="" fill sizes="316px" style={{ objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', left: 10, bottom: 10, fontFamily: POPPINS, fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: meta.color, background: 'rgba(255,255,255,.95)', borderRadius: 999, padding: '4px 10px', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
                {meta.badge}
              </span>
            </div>
          )}
          <div style={{ padding: '11px 14px 12px' }}>
            <div style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 13.5, color: '#1c1c1e', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {it.titulo}
            </div>
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {precioNode}
              <span style={{ fontFamily: POPPINS, fontSize: 11.5, fontWeight: 600, color: GREEN, whiteSpace: 'nowrap' }}>{meta.cta} →</span>
            </div>
          </div>
        </Link>

        {items.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 10 }}>
            {items.map((x, i) => (
              <button
                key={x.propertyId} type="button" onClick={() => goTo(i)} aria-label={`Oportunidad ${i + 1}`}
                style={{ width: i === idx % items.length ? 16 : 6, height: 6, borderRadius: 999, border: 'none', cursor: 'pointer', background: i === idx % items.length ? GREEN : '#DEDEE2', transition: 'width .25s, background .25s', padding: 0 }}
              />
            ))}
          </div>
        )}
      </aside>

      {/* ── Mobile: acceso lateral + ficha bajo demanda, sin tapar mapa/share ── */}
      {!mobileExpanded && (
        <button
          type="button"
          className="si-oport-peek"
          aria-label="Ver oportunidad destacada"
          onClick={() => setMobileExpanded(true)}
          style={{
            position: 'fixed',
            left: 10,
            top: compactMobile ? '44%' : '52%',
            zIndex: 44,
            width: compactMobile ? 46 : 134,
            height: 46,
            borderRadius: 999,
            border: '1px solid rgba(26,92,56,.16)',
            background: '#FFFFFF',
            color: GREEN,
            boxShadow: '0 12px 30px rgba(9, 30, 20, 0.16)',
            padding: compactMobile ? 0 : '5px 10px 5px 5px',
            cursor: 'pointer',
            animation: 'si-oport-peek .42s cubic-bezier(.22,1,.36,1)',
            alignItems: 'center',
            justifyContent: compactMobile ? 'center' : 'flex-start',
            gap: 8,
            touchAction: 'manipulation',
          }}
        >
          {it.foto ? (
            <span style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#EEF2F0' }}>
              <Image src={it.foto} alt="" fill sizes="34px" style={{ objectFit: 'cover' }} />
            </span>
          ) : (
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEF2F0', flexShrink: 0 }} />
          )}
          {!compactMobile && (
            <span style={{ display: 'flex', minWidth: 0, flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05 }}>
              <span style={{ fontFamily: POPPINS, fontSize: 9.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: meta.color, whiteSpace: 'nowrap' }}>
                Oportunidad
              </span>
              <span style={{ fontFamily: RALEWAY, fontSize: 12.5, fontWeight: 800, color: '#1C1C1E', whiteSpace: 'nowrap' }}>
                Ver ahora
              </span>
            </span>
          )}
        </button>
      )}

      {mobileExpanded && (
        <aside
          className="si-oport-sheet"
          aria-label="Oportunidad destacada"
          style={{
            position: 'fixed',
            left: 10,
            right: 10,
            zIndex: 46,
            bottom: compactMobile
              ? 'calc(env(safe-area-inset-bottom, 0px) + 86px)'
              : 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            background: '#fff',
            borderRadius: 18,
            border: '1px solid rgba(26,92,56,.12)',
            boxShadow: '0 18px 44px rgba(9, 30, 20, 0.18)',
            overflow: 'hidden',
            animation: 'si-oport-sheet .3s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileExpanded(false)}
            aria-label="Minimizar oportunidad"
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.94)', border: '1px solid #ECECEE', cursor: 'pointer', color: '#71717A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} strokeWidth={2.2} />
          </button>

          <Link key={it.propertyId} href={it.href} onClick={dismiss} style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr)', gap: 12, padding: 10, minHeight: 98, textDecoration: 'none', animation: 'si-oport-swap .28s ease' }}>
            {it.foto ? (
              <span style={{ position: 'relative', width: 96, height: 82, borderRadius: 12, overflow: 'hidden', background: '#EEF2F0' }}>
                <Image src={it.foto} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
              </span>
            ) : (
              <span style={{ width: 96, height: 82, borderRadius: 12, background: '#EEF2F0' }} />
            )}
            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, paddingRight: 30 }}>
              <span style={{ alignSelf: 'flex-start', fontFamily: POPPINS, fontSize: 10, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: meta.color, background: meta.bg, borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                {meta.badge}{esBaja && typeof it.pctBaja === 'number' ? ` · -${String(it.pctBaja).replace('.', ',')}%` : ''}
              </span>
              <span style={{ fontFamily: RALEWAY, fontSize: 13.5, fontWeight: 800, color: '#1C1C1E', lineHeight: 1.18, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {it.titulo}
              </span>
              <span style={{ fontFamily: POPPINS, fontSize: 12, color: '#3A3A3A', display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.precio}</span>
                <b style={{ color: GREEN, whiteSpace: 'nowrap' }}>{meta.cta}</b>
              </span>
            </span>
          </Link>

          {items.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 10px 10px' }}>
              {items.map((x, i) => (
                <button
                  key={x.propertyId}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Oportunidad ${i + 1}`}
                  style={{ width: i === idx % items.length ? 18 : 7, height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', background: i === idx % items.length ? GREEN : '#DEDEE2', transition: 'width .25s, background .25s', padding: 0 }}
                />
              ))}
            </div>
          )}
        </aside>
      )}
    </>
  )
}

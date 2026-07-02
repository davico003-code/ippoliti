'use client'

// Popup de "Oportunidades" — diseño propio de SI (ni lista ni card gigante):
// UNA propiedad por vez que rota suave entre las cargadas, con su gancho
// comercial (vendedor motivado / permuta / negociable / bajó el precio).
//
// Desktop: card compacta abajo a la derecha, arriba de la burbuja de WhatsApp.
// Mobile: mini-barra discreta abajo, una línea, fácil de cerrar.
// Cerrable → no reaparece por 3 días (localStorage).

import { useEffect, useRef, useState } from 'react'
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

// Rutas internas/flujos donde el popup no corresponde.
const HIDE_PREFIXES = ['/agentes', '/admin', '/school', '/seleccion', '/autorizacion', '/v/', '/guia/leer']

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
  const [idx, setIdx] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (HIDE_PREFIXES.some((p) => pathname?.startsWith(p))) return
    try {
      const dismissed = Number(window.localStorage.getItem(DISMISS_KEY) || 0)
      if (Date.now() - dismissed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
    } catch {}

    let alive = true
    fetch('/api/oportunidades')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.items?.length) return
        setItems(d.items.slice(0, 4))
        window.setTimeout(() => { if (alive) setVisible(true) }, SHOW_DELAY_MS)
      })
      .catch(() => {})
    return () => { alive = false }
    // Solo al montar; si navega con el popup visible, persiste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const dismiss = () => {
    setVisible(false)
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
        .si-oport-desktop { display: block; }
        .si-oport-mobile { display: none; }
        @media (max-width: 640px) {
          .si-oport-desktop { display: none; }
          .si-oport-mobile { display: block; }
        }
      ` }} />

      {/* ── Desktop: card compacta rotativa ── */}
      <aside
        className="si-oport-desktop"
        aria-label="Oportunidades"
        style={{
          position: 'fixed', right: 20, bottom: 100, zIndex: 45, width: 316,
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
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

      {/* ── Mobile: mini-barra discreta ── */}
      <aside
        className="si-oport-mobile"
        aria-label="Oportunidades"
        style={{
          position: 'fixed', left: 12, right: 12, bottom: 14, zIndex: 45,
          background: '#fff', borderRadius: 14, border: '1px solid #ECECEE',
          boxShadow: '0 10px 30px rgba(9, 30, 20, 0.15)',
          animation: 'si-oport-in .45s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div key={it.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', animation: 'si-oport-swap .35s ease' }}>
          <Link href={it.href} onClick={dismiss} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none' }}>
            {it.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.foto} alt="" width={40} height={40} loading="lazy" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 9, flexShrink: 0, background: '#f2f2f2' }} />
            ) : (
              <span style={{ width: 40, height: 40, borderRadius: 9, background: '#EEF2F0', flexShrink: 0 }} />
            )}
            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontFamily: POPPINS, fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: meta.color, whiteSpace: 'nowrap' }}>
                {meta.badge}{esBaja && typeof it.pctBaja === 'number' ? ` · −${String(it.pctBaja).replace('.', ',')}%` : ''}
              </span>
              <span style={{ fontFamily: POPPINS, fontSize: 12, color: '#3a3a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {it.precio} · <span style={{ color: GREEN, fontWeight: 600 }}>{meta.cta} →</span>
              </span>
            </span>
          </Link>
          <button
            type="button" onClick={dismiss} aria-label="Cerrar"
            style={{ width: 34, height: 34, borderRadius: '50%', background: '#F6F6F7', border: 'none', cursor: 'pointer', color: '#71717A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <X size={15} strokeWidth={2.2} />
          </button>
        </div>
      </aside>
    </>
  )
}

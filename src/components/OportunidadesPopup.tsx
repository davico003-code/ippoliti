'use client'

// Popup esquinero de "Oportunidades": propiedades curadas por admin con un
// gancho comercial (vendedor motivado / permuta / negociable). Aparece a los
// ~4s en el sitio público, arriba de la burbuja de WhatsApp; se puede cerrar
// y no vuelve a aparecer por unos días (localStorage).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

const GREEN = '#1A5C38'
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

const DISMISS_KEY = 'si_oportunidades_dismiss'
const DISMISS_DAYS = 3
const SHOW_DELAY_MS = 4000

// Rutas internas/flujos donde el popup no corresponde.
const HIDE_PREFIXES = ['/agentes', '/admin', '/school', '/seleccion', '/autorizacion', '/v/', '/guia/leer']

const HOOK_META: Record<string, { badge: string; cta: string; color: string; bg: string }> = {
  motivado: { badge: 'Vendedor motivado', cta: 'Pasá a conocerla', color: '#B5562F', bg: '#FCEBE3' },
  permuta: { badge: 'Acepta permuta', cta: 'Pasá a conocerla', color: '#2B5C9B', bg: '#E7F0FB' },
  negociable: { badge: 'Margen para negociar', cta: 'Hacé tu oferta', color: '#1A5C38', bg: '#E8F4EC' },
}

interface Item {
  propertyId: number
  hook: string
  titulo: string
  foto: string | null
  precio: string
  href: string
}

export default function OportunidadesPopup() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [visible, setVisible] = useState(false)

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
    // Solo al montar: si el usuario navega, el popup ya visible persiste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible || items.length === 0) return null
  if (HIDE_PREFIXES.some((p) => pathname?.startsWith(p))) return null

  const dismiss = () => {
    setVisible(false)
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
  }

  return (
    <div
      role="complementary"
      aria-label="Oportunidades"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 96,
        zIndex: 45,
        width: 'min(330px, calc(100vw - 32px))',
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E4E4E7',
        boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
        overflow: 'hidden',
        animation: 'si-oport-in .35s ease',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `@keyframes si-oport-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }` }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid #F0F0F2' }}>
        <span style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 14.5, color: '#111' }}>Oportunidades</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA', padding: 4, display: 'inline-flex' }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it) => {
          const meta = HOOK_META[it.hook] ?? HOOK_META.negociable
          return (
            <Link
              key={it.propertyId}
              href={it.href}
              onClick={dismiss}
              style={{ display: 'flex', gap: 11, padding: '11px 14px', textDecoration: 'none', borderBottom: '1px solid #F6F6F7', alignItems: 'center' }}
            >
              {it.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.foto} alt="" width={62} height={48} loading="lazy" style={{ width: 62, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#f2f2f2' }} />
              ) : (
                <span style={{ width: 62, height: 48, borderRadius: 8, background: '#EEF2F0', flexShrink: 0 }} />
              )}
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: POPPINS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: meta.color, background: meta.bg, borderRadius: 5, padding: '1.5px 6px', alignSelf: 'flex-start' }}>
                  {meta.badge}
                </span>
                <span style={{ fontFamily: RALEWAY, fontSize: 12.5, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                  {it.titulo}
                </span>
                <span style={{ fontFamily: POPPINS, fontSize: 11.5, color: '#52525B' }}>
                  {it.precio} · <span style={{ color: GREEN, fontWeight: 600 }}>{meta.cta} →</span>
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

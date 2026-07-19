'use client'

// Popup de "Oportunidades con IA" — modal centrado con la placa de SI arriba y
// una captura de lead simple debajo (Nombre y apellido + Email). El contacto se
// guarda en /api/leads (misma vía que usaba el newsletter). Cerrable → no
// reaparece por 3 días (localStorage).

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CheckCircle2, X } from 'lucide-react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const GREEN = '#1A5C38'
const DISMISS_KEY = 'si_oportunidades_dismiss'
const DISMISS_DAYS = 3
const SHOW_DELAY_MS = 7000
const DESKTOP_SCROLL_Y = 420
const MOBILE_SCROLL_Y = 280

// Rutas internas/flujos donde el popup no corresponde.
const HIDE_PREFIXES = ['/agentes', '/admin', '/school', '/seleccion', '/autorizacion', '/v/', '/guia/leer', '/propiedades/']

export default function OportunidadesPopup() {
  const pathname = usePathname()
  const [form, setForm] = useState({ nombre: '', email: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [visible, setVisible] = useState(false)
  const delayReady = useRef(false)

  const enRutaOculta = useCallback(
    () => HIDE_PREFIXES.some((prefix) => pathname?.startsWith(prefix)),
    [pathname],
  )

  const dismissActivo = useCallback(() => {
    try {
      const dismissed = Number(window.localStorage.getItem(DISMISS_KEY) || 0)
      return Date.now() - dismissed < DISMISS_DAYS * 24 * 60 * 60 * 1000
    } catch {
      return false
    }
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
  }, [])

  // Aparición: tras un delay y con algo de scroll (señal de interés). En
  // /propiedades alcanza con el delay porque ya está buscando.
  useEffect(() => {
    if (enRutaOculta() || dismissActivo()) return

    delayReady.current = false
    let alive = true
    const showIfReady = () => {
      if (!alive || visible || !delayReady.current) return
      if (pathname === '/propiedades') { setVisible(true); return }
      const minScroll = window.innerWidth < 768 ? MOBILE_SCROLL_Y : DESKTOP_SCROLL_Y
      if (window.scrollY >= minScroll) setVisible(true)
    }

    const timer = window.setTimeout(() => {
      delayReady.current = true
      showIfReady()
    }, SHOW_DELAY_MS)

    window.addEventListener('scroll', showIfReady, { passive: true })
    return () => {
      alive = false
      window.clearTimeout(timer)
      window.removeEventListener('scroll', showIfReady)
    }
  }, [dismissActivo, enRutaOculta, pathname, visible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          origen: 'oportunidades_popup',
          marketingConsent: true,
          consentVersion: 'oportunidades-popup-v1',
          eventType: 'newsletter.subscribed',
        }),
      })
      if (!res.ok) throw new Error('bad status')
      setStatus('sent')
      try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
      trackEvent('generate_lead', { origen: 'oportunidades_popup' })
      trackFbEvent('Lead', { content_name: 'Oportunidades con IA popup' })
    } catch {
      setStatus('error')
    }
  }

  if (!visible || enRutaOculta()) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes si-oport-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 18px)) scale(.97); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes si-oport-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .si-oport-backdrop {
          position: fixed;
          inset: 0;
          z-index: 54;
          border: 0;
          background: rgba(7, 17, 13, 0.24);
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
          animation: si-oport-backdrop-in .3s ease-out;
        }
        .si-oport-modal {
          position: fixed;
          left: 50%;
          top: 50%;
          z-index: 55;
          display: flex;
          flex-direction: column;
          width: min(400px, calc(100vw - 40px));
          max-height: min(90dvh, 820px);
          overflow: hidden;
          border-radius: 22px;
          background: #fff;
          border: 1px solid rgba(229, 231, 235, 0.95);
          box-shadow: 0 30px 96px rgba(2, 8, 5, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.62);
          transform: translate(-50%, -50%);
          animation: si-oport-in .45s cubic-bezier(.22,1,.36,1);
        }
        .si-oport-art {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          height: min(56dvh, 600px);
          background: #fff;
        }
        .si-oport-body {
          flex: 0 0 auto;
          padding: 4px 16px 16px;
        }
        @media (max-width: 640px) {
          .si-oport-modal {
            width: min(340px, calc(100vw - 42px));
            max-height: min(90dvh, 720px);
            border-radius: 20px;
          }
          .si-oport-art {
            height: min(46dvh, 440px);
          }
          .si-oport-body {
            padding: 4px 13px 13px;
          }
          .si-oport-body input,
          .si-oport-body button {
            height: 40px;
          }
        }
      ` }} />

      <button
        type="button"
        className="si-oport-backdrop"
        aria-label="Cerrar"
        onClick={dismiss}
      />

      <aside className="si-oport-modal" aria-label="Oportunidades con IA">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/95 text-gray-500 shadow-sm transition hover:text-gray-900"
        >
          <X size={16} strokeWidth={2.3} />
        </button>

        <div className="si-oport-art">
          <Image
            src="/oportunidades-ia.webp"
            alt="Oportunidades con IA — propiedades analizadas 24/7 por SI INMOBILIARIA"
            fill
            sizes="(max-width: 640px) 340px, 400px"
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>

        <div className="si-oport-body">
          {status === 'sent' ? (
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3 font-poppins text-[13px] font-semibold"
              style={{ borderColor: 'rgba(26,92,56,0.28)', background: 'rgba(26,92,56,0.06)', color: GREEN }}
              role="status"
            >
              <CheckCircle2 size={21} style={{ color: GREEN }} className="shrink-0" />
              Listo. Te vamos a mandar las mejores oportunidades.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre y apellido"
                autoComplete="name"
                required
                minLength={3}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 font-poppins text-[13px] text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                autoComplete="email"
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 font-poppins text-[13px] text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-11 w-full rounded-xl font-poppins text-[13px] font-bold text-white transition disabled:opacity-70"
                style={{ background: GREEN }}
              >
                {status === 'sending' ? 'Enviando...' : 'Quiero recibir oportunidades'}
              </button>
              {status === 'error' && (
                <p className="font-poppins text-xs text-red-600">
                  No pudimos anotarte. Probá de nuevo en un momento.
                </p>
              )}
            </form>
          )}
        </div>
      </aside>
    </>
  )
}

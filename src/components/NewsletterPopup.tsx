'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, X } from 'lucide-react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const GREEN = '#1A5C38'
const DISMISS_KEY = 'si_newsletter_popup_dismiss'
const DISMISS_DAYS = 3
const SHOW_DELAY_MS = 4500
const DESKTOP_SCROLL_Y = 520
const MOBILE_SCROLL_Y = 340
const HIDE_PREFIXES = ['/agentes', '/admin', '/school', '/seleccion', '/autorizacion', '/v/', '/guia/leer']

export default function NewsletterPopup() {
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

  useEffect(() => {
    if (enRutaOculta() || dismissActivo()) return

    delayReady.current = false
    let alive = true
    const showIfReady = () => {
      if (!alive || visible || !delayReady.current) return
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
  }, [dismissActivo, enRutaOculta, visible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, email: form.email, origen: 'newsletter_popup' }),
      })
      if (!res.ok) throw new Error('bad status')
      setStatus('sent')
      try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
      trackEvent('generate_lead', { origen: 'newsletter_popup' })
      trackFbEvent('Lead', { content_name: 'Newsletter oportunidades popup' })
    } catch {
      setStatus('error')
    }
  }

  if (!visible || enRutaOculta()) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes si-newsletter-in {
          from { opacity: 0; transform: translateY(18px) scale(.97); }
          to { opacity: 1; transform: none; }
        }
        .si-newsletter-popup {
          position: fixed;
          right: 20px;
          bottom: 104px;
          z-index: 55;
          width: min(292px, calc(100vw - 32px));
          max-height: min(760px, calc(100dvh - 128px));
          overflow: hidden;
          border-radius: 22px;
          background: #fff;
          border: 1px solid rgba(229, 231, 235, 0.95);
          box-shadow: 0 22px 70px rgba(9, 30, 20, 0.22);
          animation: si-newsletter-in .45s cubic-bezier(.22,1,.36,1);
        }
        .si-newsletter-art {
          height: min(356px, calc(100dvh - 270px));
          min-height: 270px;
        }
        @media (max-width: 640px) {
          .si-newsletter-popup {
            left: 22px;
            right: 22px;
            bottom: max(12px, env(safe-area-inset-bottom));
            width: auto;
            max-height: min(78dvh, 610px);
            border-radius: 20px;
          }
          .si-newsletter-art {
            height: min(39dvh, 330px);
            min-height: 238px;
          }
        }
      ` }} />

      <aside className="si-newsletter-popup" aria-label="Recibir oportunidades seleccionadas">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/95 text-gray-500 shadow-sm transition hover:text-gray-900"
        >
          <X size={16} strokeWidth={2.3} />
        </button>

        <div className="si-newsletter-art relative bg-[#07110d]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/newsletter-placa.jpg"
            alt="Recibí oportunidades reales - propiedades seleccionadas por IA y revisión humana de SI INMOBILIARIA"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </div>

        <div className="bg-white p-3.5">
          {status === 'sent' ? (
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3 font-poppins text-[13px] font-semibold"
              style={{ borderColor: 'rgba(26,92,56,0.28)', background: 'rgba(26,92,56,0.06)', color: GREEN }}
              role="status"
            >
              <CheckCircle2 size={21} style={{ color: GREEN }} className="shrink-0" />
              Listo. Te vamos a mandar oportunidades seleccionadas.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Tu nombre"
                autoComplete="name"
                required
                minLength={3}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 font-poppins text-[13px] text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Tu email"
                autoComplete="email"
                required
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 font-poppins text-[13px] text-[#1C1C1E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-10 w-full rounded-xl font-poppins text-[13px] font-bold text-white transition disabled:opacity-70"
                style={{ background: GREEN }}
              >
                {status === 'sending' ? 'Enviando...' : 'Quiero recibirlas'}
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

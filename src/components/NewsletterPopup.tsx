'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BarChart3, CheckCircle2, Cpu, MapPin, UserRound, X } from 'lucide-react'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const GREEN = '#1A5C38'
const DISMISS_KEY = 'si_newsletter_popup_dismiss'
const DISMISS_DAYS = 3
const SHOW_DELAY_MS = 90_000
const DESKTOP_SCROLL_Y = 520
const MOBILE_SCROLL_Y = 340
const HIDE_PREFIXES = ['/agentes', '/admin', '/school', '/seleccion', '/autorizacion', '/v/', '/guia/leer']

const selectionSteps = [
  {
    title: 'IA detectó',
    body: 'Propiedades con señales de buen precio o potencial.',
    Icon: Cpu,
  },
  {
    title: 'Comparamos',
    body: 'Analizamos precio/m² y referencias en la zona.',
    Icon: BarChart3,
  },
  {
    title: 'Cruzamos datos',
    body: 'Ubicación, metros, tipología y contexto de mercado.',
    Icon: MapPin,
  },
  {
    title: 'Revisión humana',
    body: 'El equipo verifica y aprueba lo que realmente vale.',
    Icon: UserRound,
  },
]

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
          from { opacity: 0; transform: translate(-50%, calc(-50% + 18px)) scale(.97); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes si-newsletter-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .si-newsletter-backdrop {
          position: fixed;
          inset: 0;
          z-index: 54;
          border: 0;
          background: rgba(7, 17, 13, 0.22);
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
          animation: si-newsletter-backdrop-in .3s ease-out;
        }
        .si-newsletter-popup {
          position: fixed;
          left: 50%;
          top: 50%;
          z-index: 55;
          width: min(430px, calc(100vw - 40px));
          max-height: min(82dvh, 760px);
          overflow: hidden;
          border-radius: 22px;
          background: #fff;
          border: 1px solid rgba(229, 231, 235, 0.95);
          box-shadow: 0 30px 96px rgba(2, 8, 5, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.62);
          transform: translate(-50%, -50%);
          animation: si-newsletter-in .45s cubic-bezier(.22,1,.36,1);
        }
        .si-newsletter-art {
          height: min(352px, calc(82dvh - 272px));
          min-height: 286px;
        }
        .si-newsletter-body {
          padding: 14px;
        }
        .si-newsletter-steps {
          border: 1px solid #DCEBE2;
          border-radius: 15px;
          background: #FBFEFC;
          padding: 10px 10px 9px;
        }
        .si-newsletter-steps-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
        }
        .si-newsletter-steps-head::before,
        .si-newsletter-steps-head::after {
          content: '';
          height: 1px;
          flex: 1;
          background: #2C8C45;
          opacity: .75;
        }
        .si-newsletter-steps-title {
          margin: 0;
          flex-shrink: 0;
          color: #111;
          font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.15;
        }
        .si-newsletter-steps-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 9px;
          row-gap: 8px;
        }
        .si-newsletter-step {
          display: grid;
          grid-template-columns: 26px 1fr;
          gap: 7px;
          align-items: start;
          min-width: 0;
        }
        .si-newsletter-step-icon {
          display: inline-flex;
          width: 26px;
          height: 26px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid #D7E6D9;
          background: #F2F8EE;
          color: #2E9B22;
          box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.74);
        }
        .si-newsletter-step-title {
          display: block;
          margin: 0;
          color: #151515;
          font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          line-height: 1.12;
        }
        .si-newsletter-step-body {
          display: block;
          margin: 2px 0 0;
          color: #4B5563;
          font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          line-height: 1.18;
        }
        @media (max-width: 640px) {
          .si-newsletter-popup {
            left: 50%;
            top: 50%;
            width: min(340px, calc(100vw - 42px));
            max-height: min(82dvh, 650px);
            border-radius: 20px;
            transform: translate(-50%, -50%);
            animation: si-newsletter-in .42s cubic-bezier(.22,1,.36,1);
          }
          .si-newsletter-art {
            height: min(28dvh, 238px);
            min-height: 196px;
          }
          .si-newsletter-body {
            padding: 12px;
          }
          .si-newsletter-steps {
            padding: 9px 9px 8px;
          }
          .si-newsletter-steps-head {
            gap: 7px;
            margin-bottom: 8px;
          }
          .si-newsletter-steps-title {
            font-size: 10.5px;
          }
          .si-newsletter-steps-grid {
            column-gap: 7px;
            row-gap: 7px;
          }
          .si-newsletter-step {
            grid-template-columns: 24px 1fr;
            gap: 6px;
          }
          .si-newsletter-step-icon {
            width: 24px;
            height: 24px;
          }
          .si-newsletter-step-title {
            font-size: 9.6px;
          }
          .si-newsletter-step-body {
            font-size: 8.8px;
          }
          .si-newsletter-body form {
            gap: 8px;
          }
          .si-newsletter-body input,
          .si-newsletter-body button {
            height: 36px;
          }
        }
      ` }} />

      <button
        type="button"
        className="si-newsletter-backdrop"
        aria-label="Cerrar newsletter"
        onClick={dismiss}
      />

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
          <Image
            src="/newsletter-placa.jpg"
            alt="Recibí oportunidades reales - propiedades seleccionadas por IA y revisión humana de SI INMOBILIARIA"
            fill
            sizes="(max-width: 640px) 340px, 430px"
            className="h-full w-full object-cover object-top"
          />
        </div>

        <div className="si-newsletter-body bg-white">
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
              <div className="si-newsletter-steps" aria-label="Así seleccionamos cada oportunidad">
                <div className="si-newsletter-steps-head">
                  <h3 className="si-newsletter-steps-title">Así seleccionamos cada oportunidad</h3>
                </div>
                <div className="si-newsletter-steps-grid">
                  {selectionSteps.map(({ title, body, Icon }) => (
                    <div key={title} className="si-newsletter-step">
                      <span className="si-newsletter-step-icon" aria-hidden="true">
                        <Icon size={15} strokeWidth={2.35} />
                      </span>
                      <span>
                        <strong className="si-newsletter-step-title">{title}</strong>
                        <span className="si-newsletter-step-body">{body}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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

'use client'

// Fila de compartir al pie de una página (hoy: la landing de cada
// emprendimiento, EmprendimientoFunnel).
//
// 25-oct-2026: antes armaba siempre `/propiedades/${slug}` y el funnel le
// pasaba `emprendimientos/<slug>`: WhatsApp y Copiar mandaban
// /propiedades/emprendimientos/<slug>, que da 404, justo en las landings con
// pauta. Ahora recibe la ruta real (`ruta`). Además:
//   · Celu: un solo botón "Compartir" que abre la hoja nativa en un toque
//     (WhatsApp, Instagram, Mensajes, AirDrop…).
//   · Compu, o celu sin hoja nativa: WhatsApp + Copiar link, como siempre.
//   · El texto lleva nombre + precio + zona; el link sale con utm y se mide.
//   · "¡Copiado!" solo si copió de verdad (antes lo decía aunque el
//     portapapeles se negara, típico del navegador de Instagram/Facebook).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Instagram, Link2, MessageCircle, Share } from 'lucide-react'

import {
  copiarLink,
  compartirPagina,
  lineaDatos,
  registrarCompartir,
  urlCompartible,
  type ContextoCompartir,
} from '@/lib/compartir'
import { haptico } from '@/lib/haptico'
import { showToast } from './Toast'

interface Props {
  /** Ruta real de la página que se comparte ('/emprendimientos/<slug>'). */
  ruta?: string
  /** Compatibilidad: sin `ruta`, comparte /propiedades/<slug>. */
  slug?: string
  title: string
  /** "Desde USD 65.000": va en el texto (sin "Consultar"). */
  precio?: string | null
  /** "Aldea Fisherton, Rosario". */
  ubicacion?: string | null
  /** Default: 'emprendimiento' para /emprendimientos/…, si no 'ficha'. */
  contexto?: ContextoCompartir
  /** Título chico de la fila. */
  etiqueta?: string
  /** Primera línea del mensaje de WhatsApp. */
  intro?: string
  /**
   * URL absoluta o relativa de la página de creación de placa.
   * Si no se pasa, no se renderiza el botón Placa (caso típico:
   * emprendimientos, donde la placa todavía no está implementada).
   */
  placaHref?: string
}

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

export default function ShareButtons({
  ruta,
  slug,
  title,
  precio,
  ubicacion,
  contexto,
  etiqueta = 'Compartir propiedad',
  intro = 'Mirá esta propiedad:',
  placaHref,
}: Props) {
  const [copied, setCopied] = useState(false)
  // Celu sin hoja nativa (WebView de Android: el navegador de Instagram o
  // Facebook no la tiene): vuelve la fila WhatsApp + Copiar.
  const [sinHoja, setSinHoja] = useState(false)
  useEffect(() => {
    if (typeof navigator.share !== 'function') setSinHoja(true)
  }, [])
  const path = ruta ?? `/propiedades/${slug ?? ''}`
  const ctx: ContextoCompartir = contexto ?? (path.startsWith('/emprendimientos') ? 'emprendimiento' : 'ficha')
  const linea = lineaDatos({ precio, ubicacion })

  // Se arma en el render (sin window): el href de WhatsApp sale igual en el
  // servidor y en el cliente.
  const urlWhatsApp = urlCompartible(path, 'whatsapp', ctx)
  const textoWhatsApp = [intro, title, linea, urlWhatsApp].filter(Boolean).join('\n')

  const marcarCopiado = () => {
    setCopied(true)
    showToast('Link copiado')
    window.setTimeout(() => setCopied(false), 2000)
  }

  const avisarFallo = (url: string) =>
    showToast(`No se pudo copiar. Copialo a mano: ${url}`, { variant: 'error', duration: 8000 })

  const copyLink = () => {
    const url = urlCompartible(path, 'copiar', ctx)
    void copiarLink(url).then(ok => {
      if (!ok) return avisarFallo(url)
      haptico()
      registrarCompartir('copiar', ctx)
      marcarCopiado()
    })
  }

  // Celu: hoja nativa en un toque. compartirPagina llama a navigator.share en
  // el acto (regla iOS) y, si no hay hoja, copia el link.
  const compartir = () => {
    void compartirPagina({ titulo: title, texto: [title, linea].filter(Boolean).join('\n'), ruta: path }, ctx).then(r => {
      if (r === 'copiado') marcarCopiado()
      else if (r === 'error') avisarFallo(urlCompartible(path, 'copiar', ctx))
    })
  }

  const btnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minHeight: 56,
    padding: '10px 8px',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: R,
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none',
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
        {etiqueta}
      </p>

      {/* Celu (puntero grueso): una sola acción, la hoja nativa. Se decide por
          CSS y no por JS para que no haya un salto al hidratar. */}
      <button
        type="button"
        onClick={compartir}
        className={sinHoja ? 'hidden' : 'si-tap hidden [@media(pointer:coarse)]:flex'}
        style={{
          ...btnStyle,
          // Sin display inline: lo maneja la clase (hidden / flex en el celu).
          display: undefined,
          width: '100%',
          flexDirection: 'row',
          gap: 8,
          minHeight: 48,
          fontSize: 15,
          background: copied ? 'var(--theme-accent, #1A5C38)' : 'var(--theme-surface-soft, #F3F4F6)',
          color: copied ? 'var(--theme-surface, #fff)' : 'var(--theme-ink, #1f2937)',
        }}
      >
        {copied ? <Check size={18} aria-hidden /> : <Share size={18} aria-hidden />}
        <span aria-live="polite">{copied ? '¡Link copiado!' : 'Compartir'}</span>
      </button>

      <div className={sinHoja ? 'flex gap-2' : 'flex gap-2 [@media(pointer:coarse)]:hidden'}>
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(textoWhatsApp)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            haptico()
            registrarCompartir('whatsapp', ctx)
          }}
          className="si-tap"
          style={{ ...btnStyle, background: '#25D366', color: '#fff' }}
        >
          <MessageCircle size={16} aria-hidden />
          WhatsApp
        </a>

        {/* Copiar link */}
        <button
          type="button"
          onClick={copyLink}
          className="si-tap"
          style={{
            ...btnStyle,
            background: copied ? 'var(--theme-accent, #1A5C38)' : 'var(--theme-surface-soft, #F3F4F6)',
            color: copied ? 'var(--theme-surface, #fff)' : 'var(--theme-ink, #374151)',
          }}
        >
          {copied ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
          <span aria-live="polite">{copied ? '¡Copiado!' : 'Copiar link'}</span>
        </button>

        {/* Placa Instagram — solo si el caller proveyó la URL */}
        {placaHref && (
          <Link
            href={placaHref}
            className="si-tap"
            style={{
              ...btnStyle,
              background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              color: '#fff',
            }}
          >
            <Instagram size={16} aria-hidden />
            Placa
          </Link>
        )}
      </div>
    </div>
  )
}

'use client'

// Botón "Compartir" (negro) con menú WhatsApp / Copiar link. Comparte la URL
// ACTUAL: el colega que recibió el link puede reenviarlo a sus clientes y
// todas las visitas suman a las stats del mismo slug.
//   variante 'barra'   → barra fija del celu, el menú abre hacia ARRIBA.
//   variante 'tarjeta' → tarjeta fija de la compu, el menú abre hacia abajo.
//
// 25-oct-2026: en el celu el toque abre la hoja nativa DIRECTO (Mensajes,
// Instagram, WhatsApp, AirDrop en un toque); el menú queda para la compu o si
// no hay hoja. El reenvío decía solo "Te paso esta propiedad: <url>": ahora
// lleva título, precio y zona. Si la página no los pasa, salen del og:title
// (que ya es "titular · precio", limpio de marca). Ojo: el link NO lleva utm:
// es el dominio neutro (verficha.casa), sin la analítica de SI, y el reenvío
// ya se cuenta con contarCompartida. Por lo mismo no usa lib/compartir (trae
// el dominio y las rutas de SI al JS de la ficha neutra): la hoja nativa se
// llama acá mismo.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { haptico } from '@/lib/haptico'
import { contarCompartida } from './contar-compartida'
import { LINEA, TINTA } from './estilos'

// ¿Hay hoja nativa y pantalla táctil? En la compu sigue el menú.
function hayHojaNativa(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false
  try {
    return window.matchMedia('(pointer: coarse)').matches
  } catch {
    return false
  }
}

// "USD 178.000 · Cotos de la Alameda, Roldán" (sin "Consultar": no informa).
function lineaDatos(precio?: string, zona?: string): string {
  return [precio && /\d/.test(precio) ? precio : '', zona ?? ''].filter(Boolean).join(' · ')
}

// Título y datos para el texto: los que pasa la página o, si no, el og:title.
function datosDeLaFicha(titulo?: string, precio?: string, zona?: string): { titulo: string; linea: string } {
  if (titulo) return { titulo, linea: lineaDatos(precio, zona) }
  let og = ''
  try {
    og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim() || document.title.trim()
  } catch {
    /* sin DOM */
  }
  return { titulo: og, linea: zona ?? '' }
}

export default function CompartirMenu({
  url,
  slug,
  variante,
  titulo,
  precio,
  zona,
}: {
  url: string
  slug?: string
  variante: 'barra' | 'tarjeta'
  /** Titular de la ficha (sin marca). */
  titulo?: string
  /** "USD 178.000" (sin "Consultar"). */
  precio?: string
  /** "Cotos de la Alameda, Roldán". */
  zona?: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const copy = async () => {
    contarCompartida(slug)
    let ok = false
    try {
      await navigator.clipboard.writeText(url)
      ok = true
    } catch {
      // Navegadores internos (WhatsApp, Instagram) y Safari viejo no dejan usar
      // el portapapeles moderno: antes el toque no hacía nada y no avisaba.
      ok = copiarALaVieja(url)
    }
    if (ok) {
      haptico()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      window.prompt('Copiá el link:', url)
    }
  }

  const onWhatsApp = () => {
    contarCompartida(slug)
    setOpen(false)
  }

  const onBoton = () => {
    if (open) {
      setOpen(false)
      return
    }
    // Celu: hoja nativa en un toque. navigator.share corre en el acto (regla
    // iOS: nada de await antes); si falla, el menú de siempre.
    if (hayHojaNativa()) {
      const datos = datosDeLaFicha(titulo, precio, zona)
      haptico()
      try {
        navigator
          .share({ title: datos.titulo || 'Propiedad', text: [datos.titulo, datos.linea].filter(Boolean).join('\n'), url })
          .then(
            () => contarCompartida(slug),
            (e: unknown) => {
              // Cerrar la hoja (AbortError) no es un error: no se muestra nada.
              if ((e as { name?: string })?.name !== 'AbortError') setOpen(true)
            },
          )
        return
      } catch {
        /* sin hoja: el menú de siempre */
      }
    }
    setOpen(true)
  }

  // WhatsApp: título en negrita, precio · zona y el link. El menú solo se
  // dibuja abierto (en el cliente), así que leer el og:title acá no toca el
  // render del servidor.
  const d = open ? datosDeLaFicha(titulo, precio, zona) : null
  const waText = encodeURIComponent(
    ['Te paso esta propiedad:', d?.titulo ? `*${d.titulo}*` : '', d?.linea ?? '', url].filter(Boolean).join('\n'),
  )
  const arriba = variante === 'barra'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            ...(arriba ? { bottom: 'calc(100% + 10px)', minWidth: 250 } : { top: 'calc(100% + 8px)', left: 0 }),
            background: '#fff',
            border: `1px solid ${LINEA}`,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            zIndex: 20,
          }}
        >
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            style={{ ...menuItem, borderTop: 'none' }}
            onClick={onWhatsApp}
          >
            <MessageCircle size={16} color="#25D366" aria-hidden />
            Compartir por WhatsApp
          </a>
          <button type="button" role="menuitem" onClick={copy} style={menuItem}>
            {copied ? <Check size={16} color="#16A34A" aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onBoton}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          width: '100%',
          height: variante === 'barra' ? 48 : 50,
          border: 'none',
          borderRadius: 14,
          background: TINTA,
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          cursor: 'pointer',
        }}
      >
        <Share2 size={18} aria-hidden />
        Compartir
      </button>
    </div>
  )
}

function copiarALaVieja(texto: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = texto
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, texto.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

const menuItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '14px 16px',
  background: '#fff',
  border: 'none',
  borderTop: `1px solid ${LINEA}`,
  color: TINTA,
  fontSize: 15,
  textAlign: 'left',
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: 'inherit',
}

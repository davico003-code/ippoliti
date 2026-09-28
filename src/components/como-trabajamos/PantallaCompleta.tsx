'use client'

// Botón para ver la presentación a pantalla completa (TV de la oficina,
// notebook o tablet): oculta la barra del navegador y, mientras dura, también
// el menú del sitio, el footer y el WhatsApp flotante, para que quede solo la
// presentación. Tecla F para entrar y salir; Esc sale (lo maneja el navegador).
// En el iPhone Safari no deja poner una página a pantalla completa: ahí el
// botón no aparece.

import { useEffect, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

type DocFs = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void>; webkitFullscreenEnabled?: boolean }
type ElFs = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }

const enPantallaCompleta = () => Boolean(document.fullscreenElement || (document as DocFs).webkitFullscreenElement)

async function alternar() {
  const d = document as DocFs
  try {
    if (enPantallaCompleta()) await (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.())
    else {
      const el = document.documentElement as ElFs
      await (el.requestFullscreen?.({ navigationUI: 'hide' }) ?? el.webkitRequestFullscreen?.())
    }
  } catch {
    // El navegador lo rechazó (permisos, iframe): la página sigue igual.
  }
}

export default function PantallaCompleta() {
  const [disponible, setDisponible] = useState(false)
  const [activa, setActiva] = useState(false)

  useEffect(() => {
    const d = document as DocFs
    setDisponible(Boolean(d.fullscreenEnabled || d.webkitFullscreenEnabled))
    const alCambiar = () => {
      const on = enPantallaCompleta()
      setActiva(on)
      document.documentElement.classList.toggle('ct-pc', on)
    }
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'f' && e.key !== 'F') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      alternar()
    }
    document.addEventListener('fullscreenchange', alCambiar)
    document.addEventListener('webkitfullscreenchange', alCambiar)
    window.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('fullscreenchange', alCambiar)
      document.removeEventListener('webkitfullscreenchange', alCambiar)
      window.removeEventListener('keydown', alTeclear)
      document.documentElement.classList.remove('ct-pc')
    }
  }, [])

  if (!disponible) return null

  return (
    <>
      {/* Mientras está a pantalla completa queda solo la presentación. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
html.ct-pc nav.sticky, html.ct-pc footer, html.ct-pc a[aria-label="Contactar por WhatsApp"], html.ct-pc iframe[title*="chat" i] { display: none !important; }
html.ct-pc .ct-pc-boton { opacity: .35; }
html.ct-pc .ct-pc-boton:hover, html.ct-pc .ct-pc-boton:focus-visible { opacity: 1; }
`,
        }}
      />
      <button
        type="button"
        onClick={alternar}
        aria-pressed={activa}
        title={activa ? 'Salir de pantalla completa (F o Esc)' : 'Ver a pantalla completa (F)'}
        className="ct-pc-boton fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg backdrop-blur transition-opacity duration-300 md:bottom-6 md:left-6"
        style={{ background: 'rgba(8,23,15,.82)' }}
      >
        {activa ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
        {activa ? 'Salir' : 'Pantalla completa'}
      </button>
    </>
  )
}

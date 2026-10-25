'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { aplicarColorBarra } from '@/lib/color-barra-navegador'
import { haptico } from '@/lib/haptico'

const STORAGE_KEY = 'si-color-theme'
const CLASE_CAMBIANDO = 'si-tema-cambiando'

type DocumentoConTransicion = Document & {
  startViewTransition?: (actualizar: () => void) => { finished: Promise<unknown> }
}

function fijarTema(oscuro: boolean) {
  const html = document.documentElement
  html.dataset.theme = oscuro ? 'dark' : 'light'
  html.style.colorScheme = oscuro ? 'dark' : 'light'
  aplicarColorBarra(oscuro)
}

// Cambio de tema parejo: antes cada elemento repintaba a su propia velocidad
// (el nav en 300 ms, los botones en 150 ms, el fondo al instante) y se veía a
// destiempo. Ahora, mientras dura el cambio, la clase si-tema-cambiando apaga
// todas las transiciones (globals.css) y, donde hay View Transitions, la página
// entera hace un solo fundido corto. Con movimiento reducido: cambio seco.
function cambiarTema(oscuro: boolean) {
  const html = document.documentElement
  let quitada = false
  const quitarClase = () => {
    if (quitada) return
    quitada = true
    html.classList.remove(CLASE_CAMBIANDO)
  }
  // La clase se pone DENTRO de la actualización: así la foto "vieja" del
  // fundido sale tal cual y el ícono nuevo entra con su giro.
  const aplicar = () => {
    html.classList.add(CLASE_CAMBIANDO)
    fijarTema(oscuro)
  }
  const doc = document as DocumentoConTransicion
  const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!reducir && typeof doc.startViewTransition === 'function') {
    try {
      doc.startViewTransition(aplicar).finished.then(quitarClase, quitarClase)
      // Red de seguridad por si el fundido nunca termina (pestaña oculta).
      window.setTimeout(quitarClase, 1000)
      return
    } catch {
      /* sin View Transitions: cambio directo */
    }
  }
  aplicar()
  window.setTimeout(quitarClase, 220)
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // null hasta montar: el server no sabe el tema. El ícono correcto lo pinta
  // el CSS desde <html data-theme> (lo fija el script del <head> antes de
  // pintar), así no hay luna que salta a sol al hidratar ni mismatch.
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === 'dark')
    sync()
    aplicarColorBarra(document.documentElement.dataset.theme === 'dark')
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const next = event.newValue === 'dark' || (!event.newValue && matchMedia('(prefers-color-scheme: dark)').matches)
      fijarTema(next)
    }
    window.addEventListener('storage', onStorage)
    return () => { observer.disconnect(); window.removeEventListener('storage', onStorage) }
  }, [])

  function toggle() {
    const next = document.documentElement.dataset.theme !== 'dark'
    haptico()
    cambiarTema(next)
    try { localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light') } catch { /* Preferencia de esta sesión. */ }
    setDark(next)
  }

  const etiqueta = dark === null ? 'Cambiar entre vista clara y oscura' : dark ? 'Activar vista clara' : 'Activar vista oscura'

  return (
    <button
      type="button"
      onClick={toggle}
      className={`si-theme-toggle ${className}`}
      aria-label={etiqueta}
      title={dark === null ? 'Vista clara u oscura' : dark ? 'Vista clara' : 'Vista oscura'}
      aria-pressed={dark ?? undefined}
    >
      {/* Los dos íconos van siempre; globals.css muestra el que toca según
          html[data-theme]. */}
      <Sun size={19} strokeWidth={1.9} aria-hidden="true" className="si-tema-icono si-tema-icono--sol" />
      <Moon size={19} strokeWidth={1.9} aria-hidden="true" className="si-tema-icono si-tema-icono--luna" />
    </button>
  )
}

'use client'

// Toast imperativo mínimo. Llamar showToast('mensaje') desde cualquier client
// component. Es el feedback de todo compartir y copiar, así que tiene que
// sentirse nativo:
// - Abajo y centrado (en el celu, arriba de la barra fija y de la zona segura;
//   en la compu, centrado para no taparle el botón de WhatsApp de la derecha).
// - Entra en 220 ms con ease-out y sale más rápido (160 ms, ease-in).
// - Colores desde tokens (--toast-*, globals.css): en oscuro la caja se
//   despega del fondo en vez de fundirse con él.
// - El mismo mensaje no se apila: si ya está a la vista, se reinicia su tiempo.
// - Un solo live region (role="status") que existe ANTES del mensaje, para que
//   los lectores de pantalla lo anuncien.

type ToastVariant = 'success' | 'error'

interface ToastOptions {
  duration?: number
  variant?: ToastVariant
}

const CONTAINER_ID = '__si_toast_container'
const ENTRADA = 'opacity 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
const SALIDA = 'opacity 160ms cubic-bezier(0.4, 0, 1, 1), transform 160ms cubic-bezier(0.4, 0, 1, 1)'

// Íconos fijos (sin datos del usuario): check para éxito, alerta para error.
const ICONO: Record<ToastVariant, string> = {
  success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5"/><path d="M12 16.5h.01"/></svg>',
}

interface ToastVivo {
  el: HTMLDivElement
  timer: number
}

// Mensajes a la vista, por variante + texto (para no apilar duplicados).
const vivos = new Map<string, ToastVivo>()

function ensureContainer(): { container: HTMLDivElement; nuevo: boolean } {
  let container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null
  const mobileBottom = window.matchMedia?.('(max-width: 768px)').matches
    ? 'calc(env(safe-area-inset-bottom, 0px) + 88px)'
    : 'calc(env(safe-area-inset-bottom, 0px) + 24px)'
  if (container) {
    container.style.bottom = mobileBottom
    return { container, nuevo: false }
  }
  container = document.createElement('div')
  container.id = CONTAINER_ID
  container.setAttribute('role', 'status')
  container.setAttribute('aria-live', 'polite')
  Object.assign(container.style, {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: mobileBottom,
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    // El contenedor no bloquea toques; cada toast sí (para poder seleccionar
    // el link de los avisos "No se pudo copiar").
    pointerEvents: 'none',
    width: 'max-content',
    maxWidth: 'calc(100vw - 32px)',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.appendChild(container)
  return { container, nuevo: true }
}

function sacar(clave: string, toast: HTMLDivElement) {
  if (vivos.get(clave)?.el === toast) vivos.delete(clave)
  toast.style.transition = SALIDA
  toast.style.opacity = '0'
  toast.style.transform = 'translateY(4px) scale(0.98)'
  window.setTimeout(() => toast.remove(), 180)
}

export function showToast(message: string, options: ToastOptions = {}): void {
  if (typeof window === 'undefined') return
  const { duration = 3000, variant = 'success' } = options
  const clave = `${variant}:${message}`

  // Mismo mensaje todavía a la vista (tocar "Copiar" dos veces): no se apila,
  // se reinicia su tiempo.
  const existente = vivos.get(clave)
  if (existente) {
    // timer 0 = está por entrar (primer toast, live region recién creado):
    // ya va a contar su tiempo al aparecer.
    if (existente.timer) {
      window.clearTimeout(existente.timer)
      existente.timer = window.setTimeout(() => sacar(clave, existente.el), duration)
    }
    return
  }

  const { container, nuevo } = ensureContainer()

  const toast = document.createElement('div')
  toast.innerHTML = ICONO[variant]
  const texto = document.createElement('span')
  texto.textContent = message
  toast.appendChild(texto)
  Object.assign(toast.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: variant === 'error' ? 'var(--toast-error-bg, #7F1D1D)' : 'var(--toast-bg, #111827)',
    color: 'var(--toast-ink, #fff)',
    border: '1px solid var(--toast-border, transparent)',
    padding: '12px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '1.35',
    fontFamily: "var(--font-raleway, 'Raleway'), system-ui, sans-serif",
    boxShadow: 'var(--toast-shadow, 0 8px 24px rgba(0,0,0,0.18))',
    opacity: '0',
    transform: 'translateY(8px)',
    transition: ENTRADA,
    pointerEvents: 'auto',
    maxWidth: 'min(360px, calc(100vw - 32px))',
    wordBreak: 'break-word',
  } satisfies Partial<CSSStyleDeclaration>)
  const icono = toast.firstElementChild as SVGElement | null
  if (icono) icono.style.flex = 'none'

  const vivo: ToastVivo = { el: toast, timer: 0 }
  vivos.set(clave, vivo)

  const mostrar = () => {
    container.appendChild(toast)
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateY(0)'
    })
    vivo.timer = window.setTimeout(() => sacar(clave, toast), duration)
  }
  // Recién creado, el live region necesita existir vacío un instante para que
  // el lector de pantalla anuncie lo que entra después. 50 ms no se notan.
  if (nuevo) window.setTimeout(mostrar, 50)
  else mostrar()
}

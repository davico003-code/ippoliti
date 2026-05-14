'use client'

// Toast imperativo mínimo. Llamar showToast('mensaje') desde cualquier client
// component. Se monta un div fijo abajo-derecha con fade in/out 300ms y se
// auto-destruye a los 3s. Si se llama múltiples veces, se apilan verticalmente.

type ToastVariant = 'success' | 'error'

interface ToastOptions {
  duration?: number
  variant?: ToastVariant
}

const CONTAINER_ID = '__si_toast_container'

function ensureContainer(): HTMLDivElement {
  let container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null
  if (container) return container
  container = document.createElement('div')
  container.id = CONTAINER_ID
  Object.assign(container.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
    maxWidth: 'calc(100vw - 32px)',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.appendChild(container)
  return container
}

export function showToast(message: string, options: ToastOptions = {}): void {
  if (typeof window === 'undefined') return
  const { duration = 3000, variant = 'success' } = options
  const container = ensureContainer()

  const bg = variant === 'error' ? '#7F1D1D' : '#111827'
  const toast = document.createElement('div')
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')
  toast.textContent = message
  Object.assign(toast.style, {
    background: bg,
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Raleway', system-ui, sans-serif",
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    opacity: '0',
    transform: 'translateY(8px)',
    transition: 'opacity 300ms ease, transform 300ms ease',
    pointerEvents: 'auto',
    maxWidth: '360px',
    wordBreak: 'break-word',
  } satisfies Partial<CSSStyleDeclaration>)
  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  })

  window.setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(8px)'
    window.setTimeout(() => {
      toast.remove()
      if (container && container.childElementCount === 0) container.remove()
    }, 320)
  }, duration)
}

// Genera una ficha-link para colega vía POST /api/ficha/crear, copia la URL al
// portapapeles y dispara un toast con el resultado.
// Usado desde ShareMenu (desktop sidebar) y MobileStickyBar (popup mobile).

import { showToast } from '@/components/Toast'

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {}
  // Fallback: textarea + execCommand
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export async function generarYCopiarFichaLink(propertyId: number): Promise<void> {
  try {
    const res = await fetch('/api/ficha/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.url) {
      showToast('No se pudo generar el link, probá de nuevo', { variant: 'error' })
      return
    }
    const url: string = data.url
    const copied = await copyToClipboard(url)
    if (copied) {
      showToast('Link copiado · Vence en 60 días')
    } else {
      showToast(`No se pudo copiar. Link: ${url}`, { variant: 'error', duration: 8000 })
    }
  } catch {
    showToast('No se pudo generar el link, probá de nuevo', { variant: 'error' })
  }
}

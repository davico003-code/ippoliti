// Genera una ficha-link para colega vía POST /api/ficha/crear, copia la URL al
// portapapeles y dispara un toast con el resultado.
// Usado desde MenuCompartirPropiedad (el menú de ShareMenu en el panel de la
// compu y de PropertyShareButton en tarjetas y mapa) y MobileStickyBar.
//
// Safari iOS rechaza navigator.clipboard.writeText cuando entre el tap y la
// llamada hay un `await fetch(...)`: pierde el contexto de user gesture y
// considera la escritura no autorizada. Pasa en algunos iPhones (depende de
// versión iOS / permisos previos), no en todos — por eso reportado como bug
// inconsistente.
//
// Fix: usar navigator.clipboard.write([ new ClipboardItem({...: Promise }) ]).
// La "reserva" del clipboard ocurre AHORA, dentro del tap; la escritura
// efectiva se difiere a cuando la promise resuelve. Safari lo acepta.
// Docs: https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem/ClipboardItem

import { showToast } from '@/components/Toast'
import { registrarCompartir, type ContextoCompartir } from '@/lib/compartir'

async function fetchFichaBlob(propertyId: number): Promise<{ url: string; blob: Blob }> {
  const res = await fetch('/api/ficha/crear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId }),
  })
  if (!res.ok) throw new Error('fetch_failed')
  const data = await res.json().catch(() => ({}))
  if (!data?.url) throw new Error('no_url')
  const url: string = data.url
  return { url, blob: new Blob([url], { type: 'text/plain' }) }
}

// Copia texto plano: writeText y, si el navegador lo rechaza (permiso denegado,
// webviews), textarea + execCommand. Llamar DENTRO del user gesture.
export async function copiarTexto(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    // iOS no selecciona un textarea readonly con select() solo: sin el rango,
    // execCommand devolvía true y el portapapeles quedaba vacío.
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

// Devuelve true si terminó con link copiado, false si falló (el toast de
// error ya se mostró acá — el caller NO debe mostrar otro toast propio).
// `contexto` (desde qué pantalla) va al evento de GA4: antes el link para
// colega era la única forma de compartir que no se medía.
export async function generarYCopiarFichaLink(
  propertyId: number,
  contexto: ContextoCompartir = 'ficha',
): Promise<boolean> {
  const ok = await generarYCopiar(propertyId)
  if (ok) registrarCompartir('colega', contexto, propertyId)
  return ok
}

// generarYCopiar arranca en el mismo tick que el toque (el primer await es el
// navigator.clipboard.write con la ClipboardItem): envolverla en
// generarYCopiarFichaLink no mete ningún await antes del portapapeles.
async function generarYCopiar(propertyId: number): Promise<boolean> {
  // Path A — Safari iOS y todos los navegadores modernos: ClipboardItem con
  // Promise. La reserva del clipboard se hace dentro del user gesture; el
  // contenido se escribe cuando la promise (fetch + parse) resuelve.
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    // El fetch se dispara UNA vez; si la escritura al clipboard se rechaza al
    // instante (permiso denegado), igual se espera su resultado: antes el toast
    // decía "No se pudo generar" con la ficha ya creada (201).
    const fichaPromise = fetchFichaBlob(propertyId)
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/plain': fichaPromise.then(f => f.blob) }),
      ])
      showToast('Link copiado · Vence en 60 días')
      return true
    } catch (err) {
      console.warn('[share-ficha] ClipboardItem.write falló:', err)
      let url = ''
      try { url = (await fichaPromise).url } catch {}
      if (!url) {
        showToast('No se pudo generar el link, probá de nuevo', { variant: 'error' })
        return false
      }
      if (await copiarTexto(url)) {
        showToast('Link copiado · Vence en 60 días')
        return true
      }
      // Último recurso: mostrar el link para que lo copien a mano.
      showToast(`No se pudo copiar. Link: ${url}`, { variant: 'error', duration: 8000 })
      return false
    }
  }

  // Path B — browsers sin ClipboardItem (raros hoy). Mismo flujo que el
  // original: fetch → writeText o textarea/execCommand.
  try {
    const { url } = await fetchFichaBlob(propertyId)
    const copied = await copiarTexto(url)
    if (copied) {
      showToast('Link copiado · Vence en 60 días')
      return true
    }
    showToast(`No se pudo copiar. Link: ${url}`, { variant: 'error', duration: 8000 })
    return false
  } catch {
    showToast('No se pudo generar el link, probá de nuevo', { variant: 'error' })
    return false
  }
}

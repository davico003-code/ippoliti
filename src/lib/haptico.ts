// VIBRACIÓN CORTITA del Tinder (David, 4-oct-2026: "copiar más cómo es Tinder"):
// Tinder da un golpecito al cruzar el punto en que la tarjeta se va y al decidir.
// Android: navigator.vibrate. iPhone: Safari no tiene vibrate, pero desde iOS 18
// el interruptor nativo (<input type="checkbox" switch>) vibra al cambiar; se
// usa uno escondido. Nunca rompe nada: si no hay cómo, no pasa nada.

let interruptor: HTMLLabelElement | null = null

export function haptico(fuerte = false): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(fuerte ? 14 : 8)
      return
    }
    if (typeof document === 'undefined') return
    if (!interruptor || !interruptor.isConnected) {
      interruptor = document.createElement('label')
      interruptor.setAttribute('aria-hidden', 'true')
      interruptor.style.cssText = 'position:fixed;left:-200px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.setAttribute('switch', '')
      input.tabIndex = -1
      interruptor.appendChild(input)
      document.body.appendChild(interruptor)
    }
    interruptor.click()
  } catch {
    /* sin vibración */
  }
}

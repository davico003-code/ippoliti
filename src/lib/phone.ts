// Normalización de teléfonos argentinos para WhatsApp / CRM.
//
// Los inputs de formulario llegan en mil formatos: "+54 9 341 555-1234",
// "0341 15-5551234", "341 155551234", "3415551234". Para wa.me y para el CRM el
// formato correcto de un celular AR es 549 + código de área + número, SIN el 0
// de larga distancia y SIN el 15. Esta función deja solo dígitos y arma ese
// prefijo sin duplicar el código de país.

/** Devuelve los dígitos listos para wa.me (549XXXXXXXXXX), o '' si no hay número. */
export function normalizeArWhatsapp(raw: string | null | undefined): string {
  let d = (raw || '').replace(/\D/g, '')
  if (!d) return ''
  // Sacar prefijo internacional 54 / 549 si el usuario ya lo puso.
  if (d.startsWith('549')) d = d.slice(3)
  else if (d.startsWith('54')) d = d.slice(2)
  // Sacar el 0 de larga distancia (0341 → 341).
  if (d.startsWith('0')) d = d.slice(1)
  // Sacar un 15 de celular pegado justo después del código de área (2-4 díg):
  // "341 15 5551234" → "3415551234". Heurística acotada para no romper números
  // que legítimamente empiezan con 15 en otra posición.
  const m = d.match(/^(\d{2,4})15(\d{6,})$/)
  if (m) d = m[1] + m[2]
  if (!d) return ''
  return `549${d}`
}

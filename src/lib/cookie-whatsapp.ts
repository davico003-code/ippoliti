// Una persona = un agente también en los links de WhatsApp (David, 27-sep y
// 21-oct-2026). El celular que la persona YA dejó en la web (lo guarda
// escribirContacto en el navegador) viaja en una cookie que solo se manda a
// /w/… (los links de WhatsApp de las fichas y de los anuncios). Esas rutas se
// lo pasan a Hilo servidor a servidor: si ya habla con un agente, el toque va a
// ese agente. Nunca va en la URL ni se guarda con el toque.

export const COOKIE_WHATSAPP = 'si_wa'
const DIAS = 30 // los mismos días que la "relación activa" de Hilo

/** Navegador: deja (o renueva) la cookie con el celular guardado. Nunca rompe nada. */
export function guardarCookieWhatsapp(celular: string | null | undefined): void {
  try {
    const d = (celular ?? '').replace(/\D/g, '')
    if (d.length < 10 || d.length > 15) return
    const seguro = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_WHATSAPP}=${d}; Path=/w/; Max-Age=${DIAS * 86_400}; SameSite=Lax${seguro}`
  } catch {
    /* sin cookies: el link reparte como siempre */
  }
}

/** Servidor (rutas /w/…): el celular de la cookie, o null. */
export function celularDeCookie(cookieHeader: string | null): string | null {
  const m = (cookieHeader ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE_WHATSAPP}=(\\d{10,15})(?:;|$)`))
  return m ? m[1] : null
}

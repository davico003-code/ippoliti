// Compartir, en un solo lugar (25-oct-2026).
//
// Antes cada botón de compartir (barra de la ficha, tarjetas, mapa, header del
// panel, landings) armaba su propio texto, su propia URL y su propio menú.
// Resultado: en el celu nunca se abría la hoja nativa (WhatsApp, Instagram,
// Mensajes, AirDrop en un toque), el texto no decía precio ni zona, y nada se
// medía (el evento share_property existía pero nadie lo disparaba).
//
// Reglas que cuida este módulo:
//  1. iOS: navigator.share y el portapapeles tienen que llamarse DENTRO del
//     toque, sin ningún await antes. Por eso compartirNativo() no es async por
//     fuera: dispara navigator.share en el acto y devuelve la promesa.
//  2. Todo link compartido lleva utm (utm_source = canal, utm_medium =
//     compartir, utm_campaign = desde dónde): GA4 deja de verlo como "directo".
//  3. Se comparte siempre el dominio de producción, aunque el toque venga de un
//     preview de Vercel o de localhost (si no, el amigo recibe un link muerto).

import { trackEvent } from '@/lib/analytics'
import { haptico } from '@/lib/haptico'
import { copiarTexto } from '@/lib/share-ficha'

export const SITIO = 'https://siinmobiliaria.com'

/** Por dónde salió: la hoja nativa, WhatsApp directo, link copiado, o las herramientas de asesor. */
export type CanalCompartir = 'nativo' | 'whatsapp' | 'copiar' | 'colega' | 'placa'

/** Desde qué pantalla (va a utm_campaign y al evento de GA4). */
export type ContextoCompartir =
  | 'ficha'
  | 'tarjeta'
  | 'mapa'
  | 'panel'
  | 'busqueda'
  | 'emprendimiento'
  | 'blog'
  | 'barrio'
  | 'seleccion'
  | 'tasador'
  | 'pagina'

const FUENTE_UTM: Record<CanalCompartir, string> = {
  nativo: 'compartir',
  whatsapp: 'whatsapp',
  copiar: 'link',
  colega: 'colega',
  placa: 'instagram',
}

/**
 * URL absoluta y con atribución. Acepta una ruta del sitio ('/propiedades/…')
 * o una URL completa. Las del propio sitio (o de un preview/localhost) salen
 * siempre con el dominio de producción; las de otros dominios (verficha.casa)
 * conservan el suyo.
 */
export function urlCompartible(rutaOUrl: string, canal: CanalCompartir, contexto: ContextoCompartir): string {
  let u: URL
  try {
    u = new URL(rutaOUrl, SITIO)
  } catch {
    return rutaOUrl
  }
  const h = u.hostname
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.vercel.app') || h === 'www.siinmobiliaria.com') {
    u.protocol = 'https:'
    u.host = 'siinmobiliaria.com'
  }
  u.searchParams.set('utm_source', FUENTE_UTM[canal])
  u.searchParams.set('utm_medium', 'compartir')
  u.searchParams.set('utm_campaign', contexto)
  return u.toString()
}

/** GA4 (evento recomendado `share`). Nunca rompe nada si no hay gtag. */
export function registrarCompartir(canal: CanalCompartir, contexto: ContextoCompartir, id?: number | string): void {
  try {
    trackEvent('share', {
      method: canal,
      content_type: contexto,
      item_id: id != null ? String(id) : contexto,
    })
  } catch {
    /* sin analytics */
  }
}

/** ¿Hay hoja nativa y estamos en una pantalla táctil? En la compu se sigue usando el menú. */
export function puedeCompartirNativo(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  if (typeof navigator.share !== 'function') return false
  try {
    return window.matchMedia('(pointer: coarse)').matches
  } catch {
    return false
  }
}

export type ResultadoNativo = 'ok' | 'cancelado' | 'error'

/**
 * Abre la hoja nativa. LLAMAR SINCRÓNICAMENTE dentro del handler del toque:
 * navigator.share se invoca en el acto; lo que devuelve es solo el desenlace.
 * 'cancelado' = la persona cerró la hoja (no es un error, no mostrar nada).
 */
export function compartirNativo(datos: { title: string; text?: string; url: string }): Promise<ResultadoNativo> {
  try {
    return navigator.share(datos).then(
      () => 'ok' as const,
      (e: unknown) => ((e as { name?: string })?.name === 'AbortError' ? 'cancelado' : 'error'),
    )
  } catch {
    return Promise.resolve('error')
  }
}

/**
 * Abre WhatsApp con el texto. Sincrónico (window.open dentro del toque). Si el
 * navegador bloquea la pestaña nueva (navegadores de Instagram/Facebook), va en
 * la misma.
 */
export function abrirWhatsApp(texto: string, numero = ''): void {
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
  // Sin 'noopener' en features: con noopener window.open devuelve null SIEMPRE
  // y no se puede saber si se bloqueó. Se corta el opener a mano.
  const w = window.open(url, '_blank')
  if (w) w.opener = null
  else window.location.href = url
}

/** Copia un link (con el respaldo execCommand de copiarTexto). Llamar dentro del toque. */
export function copiarLink(url: string): Promise<boolean> {
  return copiarTexto(url)
}

// ─── Propiedades ──────────────────────────────────────────────────────────────

export interface PropiedadCompartible {
  id: number
  /** Slug canónico (generatePropertySlug). */
  slug: string
  titulo: string
  /** Como se muestra en la ficha: "USD 178.000", "Consultar precio"… */
  precio?: string | null
  /** "Cotos de la Alameda, Roldán" (formatUbicacion). */
  ubicacion?: string | null
}

/** "USD 178.000 · Cotos de la Alameda, Roldán" (sin "Consultar precio": eso no informa). */
export function lineaDatos(p: Pick<PropiedadCompartible, 'precio' | 'ubicacion'>): string {
  const precio = p.precio && /\d/.test(p.precio) ? p.precio : ''
  return [precio, p.ubicacion ?? ''].filter(Boolean).join(' · ')
}

/** Texto para WhatsApp: título, precio y zona, y el link. Corto y sin adornos. */
export function textoPropiedad(p: PropiedadCompartible, url: string): string {
  return ['Mirá esta propiedad:', p.titulo, lineaDatos(p), url].filter(Boolean).join('\n')
}

/**
 * El toque en "Compartir" de una propiedad, en el celu: hoja nativa en UN
 * toque. Devuelve false si no hay hoja nativa (compu, navegador viejo): el que
 * llama muestra su menú de siempre.
 */
export function compartirPropiedadNativo(p: PropiedadCompartible, contexto: ContextoCompartir): boolean {
  if (!puedeCompartirNativo()) return false
  const url = urlCompartible(`/propiedades/${p.slug}`, 'nativo', contexto)
  haptico()
  void compartirNativo({ title: p.titulo, text: [p.titulo, lineaDatos(p)].filter(Boolean).join('\n'), url }).then(r => {
    if (r === 'ok') registrarCompartir('nativo', contexto, p.id)
  })
  return true
}

/** WhatsApp con título + precio + zona + link (sincrónico, dentro del toque). */
export function whatsappPropiedad(p: PropiedadCompartible, contexto: ContextoCompartir): void {
  const url = urlCompartible(`/propiedades/${p.slug}`, 'whatsapp', contexto)
  abrirWhatsApp(textoPropiedad(p, url))
  registrarCompartir('whatsapp', contexto, p.id)
}

/** Copia el link público de la propiedad. Devuelve si copió (el que llama muestra el toast). */
export async function copiarLinkPropiedad(p: PropiedadCompartible, contexto: ContextoCompartir): Promise<boolean> {
  const url = urlCompartible(`/propiedades/${p.slug}`, 'copiar', contexto)
  const ok = await copiarLink(url)
  if (ok) {
    haptico()
    registrarCompartir('copiar', contexto, p.id)
  }
  return ok
}

/** Link público con atribución, para mostrarlo si el portapapeles falla. */
export function linkPropiedad(p: Pick<PropiedadCompartible, 'slug'>, canal: CanalCompartir, contexto: ContextoCompartir): string {
  return urlCompartible(`/propiedades/${p.slug}`, canal, contexto)
}

// ─── Páginas (búsquedas, emprendimientos, notas, barrios) ────────────────────

/**
 * Compartir cualquier página del sitio: hoja nativa en el celu; en la compu,
 * copia el link. Devuelve qué pasó para que el botón dé su feedback.
 * Sincrónico hasta navigator.share / el portapapeles (regla iOS).
 */
export function compartirPagina(
  datos: { titulo: string; texto?: string; ruta: string },
  contexto: ContextoCompartir,
): Promise<'nativo' | 'copiado' | 'cancelado' | 'error'> {
  if (puedeCompartirNativo()) {
    const url = urlCompartible(datos.ruta, 'nativo', contexto)
    haptico()
    return compartirNativo({ title: datos.titulo, text: datos.texto ?? datos.titulo, url }).then(r => {
      if (r === 'ok') registrarCompartir('nativo', contexto)
      return r === 'ok' ? 'nativo' : r
    })
  }
  const url = urlCompartible(datos.ruta, 'copiar', contexto)
  return copiarLink(url).then(ok => {
    if (ok) {
      haptico()
      registrarCompartir('copiar', contexto)
    }
    return ok ? 'copiado' : 'error'
  })
}

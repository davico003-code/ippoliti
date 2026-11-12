/**
 * Planos de las fichas (3-oct-2026, pedido de David: "hay planos horizontales
 * que se tienen que ver verticales y con los márgenes recortados, así se ve
 * prácticamente la pantalla completa").
 *
 * Hilo (meethilo.com) sirve cada plano ya SIN MÁRGENES en
 * `/api/public/plano/<id>?r=<n>` (es lo que trae el feed en `image`). Con
 * `&vertical=1` devuelve el mismo plano PARADO si es apaisado (si no, igual).
 * CONTRATO con Hilo: src/lib/planos/url-plano.ts del repo si-crm.
 *
 * Regla de uso: la versión parada va cuando la caja donde se muestra es más
 * alta que ancha (celular derecho, en la ficha o a pantalla completa). En la
 * compu, o con el celular acostado, va la horizontal.
 */

const RE_PLANO_HILO = /\/api\/public\/plano\/[0-9a-f-]{36}\?/i

export function esPlanoPdf(url: string): boolean {
  return /\.pdf($|[?#])/i.test(url)
}

export function esPlanoDeHilo(url: string): boolean {
  return RE_PLANO_HILO.test(url)
}

/** Versión parada del plano; los que no sirve Hilo (Tokko viejo, PDF) quedan igual. */
export function planoParado(url: string): string {
  if (!esPlanoDeHilo(url) || /[?&]vertical=1(&|$)/.test(url)) return url
  return `${url}&vertical=1`
}

export function planoParaCaja(url: string, cajaVertical: boolean): string {
  return cajaVertical ? planoParado(url) : url
}

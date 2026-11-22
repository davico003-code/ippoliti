// Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton, Funes.
// Comercializa SI INMOBILIARIA. Las unidades están cargadas en HILO como
// borrador (GAL-*), así que todavía no salen en el feed: la landing es
// estática. Acá van las constantes (fechas, avance, teléfono); la lista de
// unidades y locales es UNA sola: src/components/galinda/experiencia/datos.ts.
//
// SIN PRECIO (decisión de David, 17-nov-2026): ni lista ni contado en la web.
// El que quiera el precio lo pide por WhatsApp. No volver a agregar montos acá
// sin su OK.

export const GAL_BASE = '/emprendimientos/galinda'
export const GAL_URL = 'https://siinmobiliaria.com/emprendimientos/galinda'
// Emprendimiento sin captador → línea de venta (regla contactoDelAviso de HILO).
export const GAL_WA_PHONE = '5493413340916'
// Entregas que pasó Fundar (17-nov-2026): las oficinas antes que las viviendas.
export const GAL_ENTREGA_OFICINAS = 'enero de 2027'
export const GAL_ENTREGA_VIVIENDAS = 'marzo-abril de 2027'
// Forma de pago que pasó Fundar (17-nov-2026). Sin montos: la web no muestra precio.
export const GAL_FORMA_PAGO = {
  anticipo: '30 % de anticipo',
  cuotas: 'el resto en 12 o 24 cuotas',
  moneda: 'Las cuotas pueden ser en pesos, ajustadas por CAC.',
}
/** Avance de obra que publica Fundar en su ficha (fundar.com.ar, 17-nov-2026). */
export const GAL_AVANCE = 91
/** Fecha de las fotos y videos propios del showroom y la obra. */
export const GAL_FECHA_FOTOS = '17 de noviembre de 2026'

export function galWhatsappUrl(text: string) {
  return `https://wa.me/${GAL_WA_PHONE}?text=${encodeURIComponent(text)}`
}

// Fisherton Work — parque logístico y comercial en Fisherton, Rosario.
// Desarrollan NM Capital y Provectta; comercializa SI INMOBILIARIA.
// No está en el feed de HILO, así que la landing es estática y estos datos son
// la fuente: lotes calcados del plano oficial del desarrollador
// (public/emprendimientos/fisherton-work/masterplan-oficial.jpg), en el mismo
// sistema de coordenadas de esa imagen (1179x715) para poder re-calcar.

export const FW_BASE = '/emprendimientos/fisherton-work'
export const FW_URL = 'https://siinmobiliaria.com/emprendimientos/fisherton-work'
export const FW_WA_PHONE = '5493413340916'
export const FW_ADDRESS = 'Av. Hernán Pujato 7880, Fisherton, Rosario'
// Pin de Google Maps para Pujato 7880 (sobre Pujato, al oeste de Carrefour).
export const FW_GEO = { lat: -32.9058, lng: -60.7295 }

export function fwWhatsappUrl(text: string) {
  return `https://wa.me/${FW_WA_PHONE}?text=${encodeURIComponent(text)}`
}

// Módulo construido de cada unidad (croquis oficial): 100 m² de planta baja
// + 100 m² de entrepiso, 5 cocheras propias.
export const FW_MODULO = { pb: 100, entrepiso: 100, cocheras: 5 }
export const FW_FOS = 0.6

export type Frente = 'pujato' | 'pasaje' | 'santa-coloma' | 'sanchez-de-loria' | 'diagonal'

export const FRENTE_LABEL: Record<Frente, string> = {
  pujato: 'Frente a Av. Hernán Pujato',
  pasaje: 'Sobre el pasaje interno',
  'santa-coloma': 'Frente a calle Santa Coloma',
  'sanchez-de-loria': 'Frente a calle Sánchez de Loria',
  diagonal: 'Sobre la diagonal',
}

export interface Lote {
  n: number
  m2: number
  frente: Frente
  /** Lotes 35 a 38: sector del Paseo Fisherton Work (marcado en el plano oficial). */
  paseo?: boolean
  points: string
  /** Posición del número dentro del polígono. */
  cx: number
  cy: number
}

export const LOTES: Lote[] = [
  { n: 1, m2: 418, frente: 'santa-coloma', points: '147.3,238.3 199.3,238.3 199.3,299 147.3,299', cx: 173.3, cy: 268.7 },
  { n: 2, m2: 418, frente: 'santa-coloma', points: '199.3,238.3 252.3,238.3 252.3,299 199.3,299', cx: 225.8, cy: 268.7 },
  { n: 3, m2: 418, frente: 'santa-coloma', points: '252.3,238.3 304,238.3 304,299 252.3,299', cx: 278.2, cy: 268.7 },
  { n: 4, m2: 585.53, frente: 'diagonal', points: '225.7,299 304,299 304,330 350,347.7 225.7,347.7', cx: 270, cy: 323.3 },
  { n: 5, m2: 665.34, frente: 'diagonal', points: '301.7,347.7 350,347.7 455,396.7 301.7,396.7', cx: 345, cy: 377 },
  { n: 6, m2: 417.02, frente: 'diagonal', points: '455.7,396.7 566.7,455 563.3,458.3 455.7,458.3', cx: 487, cy: 443 },
  { n: 7, m2: 414.08, frente: 'pasaje', points: '404,396.7 455.7,396.7 455.7,458.3 404,458.3', cx: 429.8, cy: 427.5 },
  { n: 8, m2: 407, frente: 'pasaje', points: '352.7,396.7 404,396.7 404,458.3 352.7,458.3', cx: 378.3, cy: 427.5 },
  { n: 9, m2: 407, frente: 'pasaje', points: '301.7,396.7 352.7,396.7 352.7,458.3 301.7,458.3', cx: 327.2, cy: 427.5 },
  { n: 10, m2: 735.38, frente: 'pasaje', points: '250,347.7 301.7,347.7 301.7,458.3 250,458.3', cx: 275.8, cy: 403 },
  { n: 11, m2: 407, frente: 'pasaje', points: '199.3,396.7 250,396.7 250,458.3 199.3,458.3', cx: 224.7, cy: 427.5 },
  { n: 12, m2: 418, frente: 'pasaje', points: '147.3,396.7 199.3,396.7 199.3,458.3 147.3,458.3', cx: 173.3, cy: 427.5 },
  { n: 13, m2: 665.63, frente: 'sanchez-de-loria', points: '147.3,347.7 250,347.7 250,396.7 147.3,396.7', cx: 198.7, cy: 372.2 },
  { n: 14, m2: 505.88, frente: 'sanchez-de-loria', points: '147.3,299 225.7,299 225.7,347.7 147.3,347.7', cx: 186.5, cy: 323.3 },
  { n: 15, m2: 412.15, frente: 'pasaje', points: '147.5,496.5 192.5,496.5 192.5,565 147.5,565', cx: 170, cy: 530.8 },
  { n: 16, m2: 400, frente: 'pasaje', points: '192.5,496.5 236.5,496.5 236.5,565 192.5,565', cx: 214.5, cy: 530.8 },
  { n: 17, m2: 400, frente: 'pasaje', points: '236.5,496.5 281,496.5 281,565 236.5,565', cx: 258.8, cy: 530.8 },
  { n: 18, m2: 400, frente: 'pasaje', points: '281,496.5 325,496.5 325,565 281,565', cx: 303, cy: 530.8 },
  { n: 19, m2: 400, frente: 'pasaje', points: '325,496.5 369.5,496.5 369.5,565 325,565', cx: 347.2, cy: 530.8 },
  { n: 20, m2: 400, frente: 'pasaje', points: '369.5,496.5 413.5,496.5 413.5,565 369.5,565', cx: 391.5, cy: 530.8 },
  { n: 21, m2: 400, frente: 'pasaje', points: '413.5,496.5 457.5,496.5 457.5,565 413.5,565', cx: 435.5, cy: 530.8 },
  { n: 22, m2: 400, frente: 'pasaje', points: '457.5,496.5 501.5,496.5 501.5,565 457.5,565', cx: 479.5, cy: 530.8 },
  { n: 23, m2: 400, frente: 'pasaje', points: '501.5,496.5 546,496.5 546,565 501.5,565', cx: 523.8, cy: 530.8 },
  { n: 24, m2: 400, frente: 'pasaje', points: '546,496.5 590,496.5 590,565 546,565', cx: 568, cy: 530.8 },
  { n: 25, m2: 400, frente: 'pasaje', points: '590,496.5 634.5,496.5 634.5,565 590,565', cx: 612.2, cy: 530.8 },
  { n: 26, m2: 433.41, frente: 'pasaje', points: '634.5,496.5 662.5,496.5 683.5,507.5 683.5,565 634.5,565', cx: 659, cy: 530.8 },
  { n: 27, m2: 412.02, frente: 'pasaje', points: '683.5,507.5 766.5,552 766.5,565 683.5,565', cx: 708, cy: 548 },
  { n: 28, m2: 469, frente: 'pujato', points: '815,578 900,623.5 895,634 815,634', cx: 840, cy: 616 },
  { n: 29, m2: 476, frente: 'pujato', points: '766.5,552 815,578 815,634 766.5,634', cx: 790.8, cy: 603 },
  { n: 30, m2: 400, frente: 'pujato', points: '722.5,565 766.5,565 766.5,634 722.5,634', cx: 744.5, cy: 599.5 },
  { n: 31, m2: 400, frente: 'pujato', points: '678.5,565 722.5,565 722.5,634 678.5,634', cx: 700.5, cy: 599.5 },
  { n: 32, m2: 400, frente: 'pujato', points: '634.5,565 678.5,565 678.5,634 634.5,634', cx: 656.5, cy: 599.5 },
  { n: 33, m2: 400, frente: 'pujato', points: '590,565 634.5,565 634.5,634 590,634', cx: 612.2, cy: 599.5 },
  { n: 34, m2: 400, frente: 'pujato', points: '546,565 590,565 590,634 546,634', cx: 568, cy: 599.5 },
  { n: 35, m2: 400, frente: 'pujato', paseo: true, points: '501.5,565 546,565 546,634 501.5,634', cx: 523.8, cy: 599.5 },
  { n: 36, m2: 400, frente: 'pujato', paseo: true, points: '457.5,565 501.5,565 501.5,634 457.5,634', cx: 479.5, cy: 599.5 },
  { n: 37, m2: 400, frente: 'pujato', paseo: true, points: '413.5,565 457.5,565 457.5,634 413.5,634', cx: 435.5, cy: 599.5 },
  { n: 38, m2: 400, frente: 'pujato', paseo: true, points: '369.5,565 413.5,565 413.5,634 369.5,634', cx: 391.5, cy: 599.5 },
  { n: 39, m2: 400, frente: 'pujato', points: '325,565 369.5,565 369.5,634 325,634', cx: 347.2, cy: 599.5 },
  { n: 40, m2: 400, frente: 'pujato', points: '281,565 325,565 325,634 281,634', cx: 303, cy: 599.5 },
  { n: 41, m2: 400, frente: 'pujato', points: '236.5,565 281,565 281,634 236.5,634', cx: 258.8, cy: 599.5 },
  { n: 42, m2: 400, frente: 'pujato', points: '192.5,565 236.5,565 236.5,634 192.5,634', cx: 214.5, cy: 599.5 },
  { n: 43, m2: 412.15, frente: 'pujato', points: '147.5,565 192.5,565 192.5,634 147.5,634', cx: 170, cy: 599.5 },
]

// Contorno de cada manzana (cordón de la calle interna) para dibujar debajo.
export const MANZANAS = [
  '147.3,238.3 304,238.3 304,330 566.7,455 563.3,458.3 147.3,458.3',
  '147.5,496.5 662.5,496.5 900,623.5 895,634 147.5,634',
]

// Dos lotes son linderos si comparten un tramo de medianera (lados
// horizontales o verticales superpuestos más de unos metros en el plano).
function lados(l: Lote) {
  const pts = l.points.split(' ').map((p) => p.split(',').map(Number) as [number, number])
  return pts.map((a, i) => [a, pts[(i + 1) % pts.length]] as const)
}

function comparten(a: Lote, b: Lote) {
  const T = 0.6
  for (const [[ax1, ay1], [ax2, ay2]] of lados(a)) {
    for (const [[bx1, by1], [bx2, by2]] of lados(b)) {
      const horiz = Math.abs(ay1 - ay2) < T && Math.abs(by1 - by2) < T && Math.abs(ay1 - by1) < T
      const vert = Math.abs(ax1 - ax2) < T && Math.abs(bx1 - bx2) < T && Math.abs(ax1 - bx1) < T
      const solape = horiz
        ? Math.min(Math.max(ax1, ax2), Math.max(bx1, bx2)) - Math.max(Math.min(ax1, ax2), Math.min(bx1, bx2))
        : vert
          ? Math.min(Math.max(ay1, ay2), Math.max(by1, by2)) - Math.max(Math.min(ay1, ay2), Math.min(by1, by2))
          : 0
      if (solape > 5) return true
    }
  }
  return false
}

/** true si los lotes forman un solo bloque continuo (se pueden unificar). */
export function sonContiguos(lotes: Lote[]) {
  if (lotes.length < 2) return true
  const visto = new Set([lotes[0].n])
  const cola = [lotes[0]]
  while (cola.length) {
    const actual = cola.shift()!
    for (const otro of lotes) {
      if (!visto.has(otro.n) && comparten(actual, otro)) {
        visto.add(otro.n)
        cola.push(otro)
      }
    }
  }
  return visto.size === lotes.length
}

export function formatM2(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

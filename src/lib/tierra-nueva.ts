// Tierra Nueva — Condos 22, 23 y 24 en Fisherton, Rosario.
// Desarrollan NM Capital y Proyectta+; comercializa SI INMOBILIARIA.
// No está en el feed de HILO como emprendimiento: la landing es estática y
// estos datos son la fuente. Tipologías y superficies calcadas de los planos
// oficiales (condos22-23-24.com.ar, sep-2026); precios y condiciones de pago
// los confirmó David (03-oct-2026). Assets en public/emprendimientos/tierra-nueva.

export const TN_BASE = '/emprendimientos/tierra-nueva'
export const TN_URL = 'https://siinmobiliaria.com/emprendimientos/tierra-nueva'
export const TN_WA_PHONE = '5493413340916'
// Casacuberta al 9100 (Condo 22), pin de los avisos de HILO.
export const TN_GEO = { lat: -32.9297, lng: -60.7617 }

export function tnWhatsappUrl(text: string) {
  return `https://wa.me/${TN_WA_PHONE}?text=${encodeURIComponent(text)}`
}

/** Condiciones vigentes. Si cambian, se tocan acá y la página se recalcula. */
export const TN_PRECIOS = {
  unDorm: { contado: 65000, financiado: 80000 },
  dosDorm: { contado: null as number | null, financiado: 129000 },
  cuotas: 36,
  entregaCondo22: 'Marzo 2028',
}

export function cuotaMensual(total: number, cuotas = TN_PRECIOS.cuotas) {
  return Math.round(total / cuotas)
}

export function usd(n: number) {
  return `USD ${n.toLocaleString('es-AR')}`
}

export type CondoId = 'condo-22' | 'condo-23' | 'condo-24'

export interface Condo {
  id: CondoId
  numero: string
  manzana: string
  lote: string
  calle: string
  render: string
  entrega: string | null
}

export const CONDOS: Condo[] = [
  {
    id: 'condo-22',
    numero: '22',
    manzana: 'Manzana B',
    lote: 'Lote 4',
    calle: 'Sobre calle Casacuberta',
    render: 'render-condo22.webp',
    entrega: TN_PRECIOS.entregaCondo22,
  },
  {
    id: 'condo-23',
    numero: '23',
    manzana: 'Manzana A',
    lote: 'Lote 16',
    calle: 'Sobre calle Parravicini, junto a Plaza TN 2',
    render: 'render-condo23.webp',
    entrega: null,
  },
  {
    id: 'condo-24',
    numero: '24',
    manzana: 'Manzana A',
    lote: 'Lote 2',
    calle: 'Sobre calle Alippi, frente al espacio verde',
    render: 'render-condo24.webp',
    entrega: null,
  },
]

export type Orientacion = 'Este' | 'Oeste'

export interface Tipologia {
  letra: string
  dormitorios: 1 | 2
  cubierta: number
  semicubierta: number
  orientacion: Orientacion
  planos: { pisos: string; img: string }[]
}

// Iguales en los tres condos (mismo edificio): 4 pisos × 9 unidades.
export const TIPOLOGIAS: Tipologia[] = [
  { letra: 'A', dormitorios: 1, cubierta: 46.3, semicubierta: 5.8, orientacion: 'Oeste', planos: [{ pisos: '1º y 3º piso', img: 'u-A1' }, { pisos: '2º y 4º piso', img: 'u-A2' }] },
  { letra: 'B', dormitorios: 1, cubierta: 46.3, semicubierta: 5.8, orientacion: 'Este', planos: [{ pisos: '1º y 3º piso', img: 'u-B1' }, { pisos: '2º y 4º piso', img: 'u-B2' }] },
  { letra: 'C', dormitorios: 2, cubierta: 61, semicubierta: 5.8, orientacion: 'Este', planos: [{ pisos: '1º y 3º piso', img: 'u-C1' }, { pisos: '2º y 4º piso', img: 'u-C2' }] },
  { letra: 'D', dormitorios: 2, cubierta: 61, semicubierta: 5.8, orientacion: 'Este', planos: [{ pisos: '1º y 3º piso', img: 'u-D1' }, { pisos: '2º y 4º piso', img: 'u-D2' }] },
  { letra: 'E', dormitorios: 1, cubierta: 46.3, semicubierta: 5.8, orientacion: 'Este', planos: [{ pisos: '1º y 3º piso', img: 'u-E1' }, { pisos: '2º y 4º piso', img: 'u-E2' }] },
  { letra: 'F', dormitorios: 1, cubierta: 46.3, semicubierta: 5.8, orientacion: 'Oeste', planos: [{ pisos: '1º y 3º piso', img: 'u-F1' }, { pisos: '2º y 4º piso', img: 'u-F2' }] },
  { letra: 'G', dormitorios: 2, cubierta: 61, semicubierta: 5.8, orientacion: 'Oeste', planos: [{ pisos: '1º y 3º piso', img: 'u-G1' }, { pisos: '2º y 4º piso', img: 'u-G2' }] },
  { letra: 'H', dormitorios: 1, cubierta: 42.2, semicubierta: 6.6, orientacion: 'Oeste', planos: [{ pisos: '1º y 3º piso', img: 'u-H1' }, { pisos: '2º y 4º piso', img: 'u-H2' }] },
  { letra: 'I', dormitorios: 2, cubierta: 61, semicubierta: 5.8, orientacion: 'Oeste', planos: [{ pisos: '1º y 3º piso', img: 'u-I1' }, { pisos: '2º y 4º piso', img: 'u-I2' }] },
]

export const COCHERA_M2 = 12.5

export function m2(n: number) {
  return `${n.toLocaleString('es-AR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} m²`
}

// ── Plano del barrio ────────────────────────────────────────────────────
// Calcado de la planta de emplazamiento oficial, en un sistema de
// coordenadas propio (≈ la lámina a 636 px de ancho). Rectángulos [x, y, w, h].

export interface LoteBarrio {
  rect: [number, number, number, number]
  nombre?: string
  condo?: CondoId
}

export const LOTES_BARRIO: LoteBarrio[] = [
  // Manzana B — fila norte (Casacuberta)
  { rect: [55, 265, 65, 80], nombre: 'Condo 21' },
  { rect: [120, 265, 65, 80] },
  { rect: [185, 265, 65, 80] },
  { rect: [250, 265, 65, 80], nombre: 'Condo 22', condo: 'condo-22' },
  { rect: [315, 265, 65, 80], nombre: 'Condo 8' },
  { rect: [380, 265, 65, 80], nombre: 'Condo 20' },
  { rect: [445, 265, 45, 70], nombre: 'Dúplex 3' },
  { rect: [445, 335, 45, 40], nombre: 'Dúplex 2' },
  { rect: [445, 375, 45, 50], nombre: 'Dúplex' },
  // Manzana B — fila sur (Alippi)
  { rect: [55, 345, 65, 80] },
  { rect: [120, 345, 195, 80], nombre: 'Condo 7' },
  { rect: [315, 345, 65, 80], nombre: 'Condo Loft 2' },
  { rect: [380, 345, 65, 80], nombre: 'Condo 11' },
  // Manzana A — fila norte (Alippi)
  { rect: [152, 458, 65, 75] },
  { rect: [217, 458, 65, 75], nombre: 'Condo 24', condo: 'condo-24' },
  { rect: [282, 458, 65, 75], nombre: 'Condo Loft' },
  { rect: [347, 458, 64, 75] },
  { rect: [411, 458, 65, 75], nombre: 'Condo 9' },
  { rect: [476, 458, 65, 75] },
  { rect: [541, 458, 46, 49], nombre: 'Office' },
  { rect: [541, 507, 46, 50], nombre: 'Condo 2' },
  { rect: [541, 557, 46, 55], nombre: 'Condo 1' },
  // Manzana A — fila media
  { rect: [217, 533, 65, 79], nombre: 'Plaza TN' },
  { rect: [282, 533, 65, 79] },
  { rect: [347, 533, 64, 79] },
  { rect: [411, 533, 65, 79], nombre: 'Condo 3' },
  { rect: [476, 533, 65, 79] },
  // Manzana A — fila sur (Parravicini)
  { rect: [280, 640, 65, 72], nombre: 'Plaza TN 2' },
  { rect: [345, 640, 65, 72], nombre: 'Condo 23', condo: 'condo-23' },
  { rect: [410, 640, 65, 72] },
  { rect: [475, 640, 65, 72], nombre: 'Condo 10' },
  { rect: [540, 640, 47, 72], nombre: 'Suite' },
]

/** Sector reservorio y espacio verde (oeste de la manzana A). */
export const VERDE_BARRIO = '30,520 70,458 152,458 152,533 217,533 217,640 280,640 280,712 178,712'

export const CALLES_BARRIO: { label: string; x: number; y: number; vertical?: boolean }[] = [
  { label: 'Casacuberta', x: 270, y: 252 },
  { label: 'Alippi', x: 320, y: 445 },
  { label: 'Parravicini', x: 420, y: 628 },
  { label: 'Malabia', x: 604, y: 480, vertical: true },
]

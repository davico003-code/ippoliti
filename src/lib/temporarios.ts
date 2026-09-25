// Alquileres temporarios (David, 24-sep-2026): la propiedad muestra el valor por
// QUINCENA y/o por MES y sus condiciones bien claras.
//
// Los datos se cargan en HILO como operación "Alquiler temporario" y, en la
// DESCRIPCIÓN, un renglón por dato con la forma "Etiqueta: valor":
//
//   Quincena: $ 900.000
//   Mes: $ 1.500.000
//   Depósito: $ 300.000
//   Seña para reservar: 30%
//   Forma de pago: efectivo o transferencia
//   Estadía mínima: 1 quincena
//   Entrada: 14 h
//   Salida: 10 h
//   Disponible: enero y febrero
//   Incluye: luz, gas, wifi, ropa blanca, limpieza de salida
//
// Esos renglones salen de la descripción y se muestran ordenados; el resto del
// texto queda como descripción. Módulo puro (sin imports) para testearlo con
// node --test.

export type PrecioTemporario = { periodo: 'quincena' | 'mes'; texto: string }

export type CondicionesTemporario = {
  precios: PrecioTemporario[]
  deposito: string | null
  sena: string | null
  formaPago: string | null
  estadiaMinima: string | null
  entrada: string | null
  salida: string | null
  disponible: string | null
  incluye: string[]
  /** La descripción sin los renglones de condiciones. */
  descripcion: string
}

type Campo = Exclude<keyof CondicionesTemporario, 'precios' | 'incluye' | 'descripcion'> | 'quincena' | 'mes' | 'incluye'

// Orden importa: "seña para reservar" antes que cualquier cosa que diga "pago".
const ETIQUETAS: { campo: Campo; re: RegExp }[] = [
  { campo: 'quincena', re: /^(valor|precio)?\s*(por\s+)?(la\s+)?quincena$/ },
  { campo: 'mes', re: /^(valor|precio)?\s*(por\s+)?(el\s+)?(mes|mensual)$/ },
  { campo: 'deposito', re: /^deposito( en garantia)?$|^garantia$/ },
  { campo: 'sena', re: /^(sena|reserva)( para reservar| de reserva)?$/ },
  { campo: 'formaPago', re: /^(forma|formas|medio|medios) de pago$|^pago$/ },
  { campo: 'estadiaMinima', re: /^(estadia|estadia minima|minimo|minimo de estadia|estadia min\.?)$/ },
  { campo: 'entrada', re: /^(entrada|check[\s-]?in|ingreso|horario de (entrada|ingreso))$/ },
  { campo: 'salida', re: /^(salida|check[\s-]?out|egreso|horario de (salida|egreso))$/ },
  { campo: 'disponible', re: /^(disponible|disponibilidad|fechas( disponibles)?|temporada)$/ },
  { campo: 'incluye', re: /^(incluye|servicios incluidos|que incluye)$/ },
]

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * "$ 1.500.000" → "ARS 1.500.000", "USD 900" → "USD 900". Si no hay un monto
 * claro, se devuelve el texto tal cual (ej. "a convenir").
 */
export function formatearMonto(valor: string): string {
  const v = valor.trim()
  const esUsd = /\b(usd|u\$s|us\$|dolares|dólares)\b/i.test(v) || /u\$s|us\$/i.test(v)
  const soloMonto = v.replace(/\b(ars|usd|pesos|dolares|dólares)\b|u\$s|us\$|\$/gi, '').trim()
  if (!/^\d{1,3}([.\s]\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(soloMonto)) return v
  const n = Number(soloMonto.replace(/[.\s]/g, '').replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return v
  return `${esUsd ? 'USD' : 'ARS'} ${Math.round(n).toLocaleString('es-AR')}`
}

function lista(valor: string): string[] {
  return valor
    .split(/\s*(?:,|;|·|\/|\sy\s|\se\s)\s*/i)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
}

export function leerCondicionesTemporario(descripcion: string, precioFeed?: string | null): CondicionesTemporario {
  const out: CondicionesTemporario = {
    precios: [],
    deposito: null,
    sena: null,
    formaPago: null,
    estadiaMinima: null,
    entrada: null,
    salida: null,
    disponible: null,
    incluye: [],
    descripcion: '',
  }
  let quincena: string | null = null
  let mes: string | null = null
  const resto: string[] = []

  for (const linea of (descripcion ?? '').split('\n')) {
    // "• Quincena: $ 900.000" / "- Mes – $ 1.500.000"
    const m = linea.match(/^\s*(?:[-•*·✓✔]\s*)?([^:–—\n]{2,40}?)\s*[:–—]\s*(.+?)\s*$/)
    const etiqueta = m ? normalizar(m[1]).replace(/[.:]$/, '') : ''
    const hit = m ? ETIQUETAS.find((e) => e.re.test(etiqueta)) : undefined
    if (!m || !hit) {
      resto.push(linea)
      continue
    }
    const valor = m[2]
    switch (hit.campo) {
      case 'quincena': quincena = formatearMonto(valor); break
      case 'mes': mes = formatearMonto(valor); break
      case 'deposito': out.deposito = formatearMonto(valor); break
      case 'incluye': out.incluye.push(...lista(valor)); break
      default: out[hit.campo] = valor
    }
  }

  if (quincena) out.precios.push({ periodo: 'quincena', texto: quincena })
  if (mes) out.precios.push({ periodo: 'mes', texto: mes })
  // Sin renglones de precio: el precio cargado en la operación, tomado por mes.
  if (!out.precios.length && precioFeed) out.precios.push({ periodo: 'mes', texto: precioFeed })

  out.descripcion = resto.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return out
}

export function tieneCondiciones(c: CondicionesTemporario): boolean {
  return Boolean(
    c.deposito || c.sena || c.formaPago || c.estadiaMinima || c.entrada || c.salida || c.disponible || c.incluye.length,
  )
}

// LO QUE DESLIZÓ en el mazo, en una línea para el asesor (David 5-oct: "hoy
// al asesor solo le llegan las que le gustaron; si también le llegan las que
// pasó, sabe qué busca de verdad"). Ejemplo:
//   "Deslizó 14: le gustaron 3 (USD 395–450 mil · 3–4 dorm · Funes Lakes, Vida)
//    y pasó 11 (la mayoría de menos de 3 dorm)."
// Viaja con la consulta (anónimos) o al link del cliente (lo mandó su asesor).
// Pura y sin imports: la prueba node --test (mazo-deslizadas.test.mjs).

export type Decision = {
  key: string
  accion: 'like' | 'pass' | 'super'
  /** El precio de la tarjeta, tal cual ("USD 395.000"). */
  precio: string
  dorm?: number | null
  zona: string | null
}

/** "USD 395.000" / "U$S 1.200.000" → 395000; en pesos o "Consultar" → null. */
export function usdDe(precio: string): number | null {
  const m = /(?:USD|U\$S|US\$|U\$D)\s*([\d.,]+)/i.exec(precio ?? '')
  if (!m) return null
  const n = Number(m[1].replace(/[.,]/g, ''))
  return Number.isFinite(n) && n >= 1000 ? n : null
}

const mil = (n: number) => Math.round(n / 1000).toLocaleString('es-AR')

function rangoUsd(ds: Decision[]): string | null {
  const v = ds.map((d) => usdDe(d.precio)).filter((n): n is number => n != null)
  if (!v.length) return null
  const a = Math.min(...v)
  const b = Math.max(...v)
  return mil(a) === mil(b) ? `USD ${mil(a)} mil` : `USD ${mil(a)}–${mil(b)} mil`
}

function rangoDorm(ds: Decision[]): string | null {
  const v = ds.map((d) => d.dorm).filter((n): n is number => n != null && n > 0)
  if (!v.length) return null
  const a = Math.min(...v)
  const b = Math.max(...v)
  return a === b ? `${a} dorm` : `${a}–${b} dorm`
}

/** Las zonas más repetidas (hasta 3), en orden de cuántas veces aparecen. */
function zonasTop(ds: Decision[], max = 3): string[] {
  const cuenta = new Map<string, number>()
  for (const d of ds) {
    const z = d.zona?.split('|')[0]?.trim()
    if (z) cuenta.set(z, (cuenta.get(z) ?? 0) + 1)
  }
  return Array.from(cuenta.entries())
    .sort((x, y) => y[1] - x[1])
    .slice(0, max)
    .map(([z]) => z)
}

const parentesis = (partes: (string | null)[]) => {
  const t = partes.filter(Boolean).join(' · ')
  return t ? ` (${t})` : ''
}

/** Qué tienen en común las que pasó y las que le gustaron no (la primera que se cumpla en 6 de cada 10). */
function patronDePasadas(likes: Decision[], pasadas: Decision[]): string | null {
  if (pasadas.length < 3 || !likes.length) return null
  const mayoria = (n: number) => n / pasadas.length >= 0.6
  const dormLikes = likes.map((d) => d.dorm).filter((n): n is number => n != null && n > 0)
  if (dormLikes.length) {
    const min = Math.min(...dormLikes)
    if (min > 1 && mayoria(pasadas.filter((d) => d.dorm != null && d.dorm > 0 && d.dorm < min).length)) return `la mayoría de menos de ${min} dorm`
  }
  const usdLikes = likes.map((d) => usdDe(d.precio)).filter((n): n is number => n != null)
  if (usdLikes.length) {
    const max = Math.max(...usdLikes)
    const min = Math.min(...usdLikes)
    if (mayoria(pasadas.filter((d) => (usdDe(d.precio) ?? 0) > max * 1.1).length)) return `la mayoría arriba de USD ${mil(max)} mil`
    if (mayoria(pasadas.filter((d) => { const u = usdDe(d.precio); return u != null && u < min * 0.9 }).length)) return `la mayoría abajo de USD ${mil(min)} mil`
  }
  const zonasLikes = new Set(zonasTop(likes, 99))
  const otras = pasadas.filter((d) => { const z = d.zona?.split('|')[0]?.trim(); return z && !zonasLikes.has(z) })
  const [top] = zonasTop(otras, 1)
  if (top && mayoria(otras.length) && otras.filter((d) => d.zona?.split('|')[0]?.trim() === top).length / pasadas.length >= 0.4) return `la mayoría en ${top}`
  return null
}

/** La línea para el asesor; null con menos de 3 decisiones (no dice nada todavía). */
export function resumenDeslizadas(decisiones: Decision[]): string | null {
  // La última decisión de cada casa (↺ y volver a decidir no cuentan doble).
  const porKey = new Map<string, Decision>()
  for (const d of decisiones) porKey.set(d.key, d)
  const ds = Array.from(porKey.values())
  if (ds.length < 3) return null
  const likes = ds.filter((d) => d.accion !== 'pass')
  const pasadas = ds.filter((d) => d.accion === 'pass')
  const supers = ds.filter((d) => d.accion === 'super').length
  const n = ds.length
  if (!likes.length) return `Deslizó ${n} y no marcó ninguna${parentesis([rangoUsd(pasadas), zonasTop(pasadas).join(', ') || null])}.`
  const detalle = parentesis([rangoUsd(likes), rangoDorm(likes), zonasTop(likes).join(', ') || null, supers ? `pidió visitar ${supers}` : null])
  const gustaron = likes.length === 1 ? 'le gustó 1' : `le gustaron ${likes.length}`
  if (!pasadas.length) return `Deslizó ${n}: ${likes.length === 1 ? gustaron : `le gustaron todas`}${detalle}.`
  const patron = patronDePasadas(likes, pasadas)
  return `Deslizó ${n}: ${gustaron}${detalle} y pasó ${pasadas.length}${patron ? ` (${patron})` : ''}.`
}

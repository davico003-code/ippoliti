// Loader de Google Fonts para Satori (ImageResponse).
//
// Satori necesita las fuentes como ArrayBuffer. Las bajamos de Google Fonts
// usando el truco del User-Agent: con un UA de Chrome viejo, el CSS2 endpoint
// devuelve TTFs en lugar de WOFF2. Los extraemos del CSS y los fetcheamos.
//
// Todo se cachea en memoria con un Map global. En primer cold-start se bajan
// ~15 archivos TTF (~1-2 MB total). Los siguientes renders dentro de la misma
// instancia reutilizan el cache — costo cero.
//
// Para llamar la primera vez: `await cargarFuentesParaSatori()` y pasar el
// array al constructor de ImageResponse.

type Estilo = 'normal' | 'italic'

export interface FontSpec {
  family: string
  weight: number
  style: Estilo
}

export interface SatoriFont {
  name: string
  data: ArrayBuffer
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style: 'normal' | 'italic'
}

// ─── Lista de fuentes a precargar ─────────────────────────────────────────
// Derivada de config/estilos-marca.ts PESOS_CARGADOS, materializada acá como
// FontSpecs para no depender del tipo de readonly arrays.
const FUENTES_A_CARGAR: FontSpec[] = [
  // Raleway normal — 7 pesos
  { family: 'Raleway', weight: 200, style: 'normal' },
  { family: 'Raleway', weight: 300, style: 'normal' },
  { family: 'Raleway', weight: 400, style: 'normal' },
  { family: 'Raleway', weight: 500, style: 'normal' },
  { family: 'Raleway', weight: 600, style: 'normal' },
  { family: 'Raleway', weight: 700, style: 'normal' },
  { family: 'Raleway', weight: 800, style: 'normal' },
  // Raleway italic — 2 pesos
  { family: 'Raleway', weight: 300, style: 'italic' },
  { family: 'Raleway', weight: 400, style: 'italic' },
  // Poppins — 4 pesos (solo para números)
  { family: 'Poppins', weight: 500, style: 'normal' },
  { family: 'Poppins', weight: 600, style: 'normal' },
  { family: 'Poppins', weight: 700, style: 'normal' },
  { family: 'Poppins', weight: 800, style: 'normal' },
  // Audiowide — 1 peso (solo para "SI" del logo)
  { family: 'Audiowide', weight: 400, style: 'normal' },
  // Montserrat — 2 pesos (solo para "INMOBILIARIA")
  { family: 'Montserrat', weight: 600, style: 'normal' },
  { family: 'Montserrat', weight: 700, style: 'normal' },
]

// ─── Cache global ─────────────────────────────────────────────────────────
const cache = new Map<string, ArrayBuffer>()
let warmPromise: Promise<SatoriFont[]> | null = null

function cacheKey(spec: FontSpec): string {
  return `${spec.family}__${spec.weight}__${spec.style}`
}

// ─── Fetch de un archivo TTF desde Google Fonts ───────────────────────────
async function fetchFont(spec: FontSpec): Promise<ArrayBuffer> {
  const key = cacheKey(spec)
  const hit = cache.get(key)
  if (hit) return hit

  const familyEncoded = spec.family.replace(/ /g, '+')
  const css2Url = spec.style === 'italic'
    ? `https://fonts.googleapis.com/css2?family=${familyEncoded}:ital,wght@1,${spec.weight}&display=swap`
    : `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@${spec.weight}&display=swap`

  // UA "desnudo" (sin identificación de browser) → Google Fonts cae al
  // fallback y sirve TTF en vez de WOFF2 (Satori no soporta WOFF2).
  const cssRes = await fetch(css2Url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!cssRes.ok) {
    throw new Error(`[fonts] CSS fetch falló para ${key}: HTTP ${cssRes.status}`)
  }
  const css = await cssRes.text()

  // Buscamos la URL del TTF dentro del CSS
  const match = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)\s*format\('(truetype|opentype)'\)/)
  if (!match) {
    throw new Error(`[fonts] No encontré URL TTF en CSS de ${key}. CSS:\n${css.slice(0, 300)}`)
  }
  const fontUrl = match[1]

  const fontRes = await fetch(fontUrl)
  if (!fontRes.ok) {
    throw new Error(`[fonts] Binary fetch falló para ${key}: HTTP ${fontRes.status}`)
  }
  const buffer = await fontRes.arrayBuffer()
  cache.set(key, buffer)
  return buffer
}

// ─── API pública ──────────────────────────────────────────────────────────

/** Asegura que todas las fuentes estén cacheadas y devuelve el array listo
 *  para pasárselo a `ImageResponse({ fonts })`. La primera llamada puede
 *  tardar 1-3s; siguientes son instantáneas (todo en memoria). */
export async function cargarFuentesParaSatori(): Promise<SatoriFont[]> {
  if (warmPromise) return warmPromise
  warmPromise = (async () => {
    const buffers = await Promise.all(FUENTES_A_CARGAR.map(fetchFont))
    return FUENTES_A_CARGAR.map((spec, i) => ({
      name: spec.family,
      data: buffers[i],
      weight: spec.weight as SatoriFont['weight'],
      style: spec.style,
    }))
  })()
  try {
    return await warmPromise
  } catch (err) {
    // Si falló, permitir reintento en la próxima llamada
    warmPromise = null
    throw err
  }
}

/** Permite invalidar el cache (ej: para tests). */
export function invalidarCacheFuentes(): void {
  cache.clear()
  warmPromise = null
}

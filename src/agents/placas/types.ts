// Tipos del sistema de placas — modelo de BLOQUES COMPONIBLES.
//
// Una placa tiene:
//  - Chrome obligatorio: head-bar (tag izq + pag der) + logo al pie + meta-foot
//  - Body: stack de bloques que Claude compone libremente
//
// El chrome es layout fijo. Claude solo llena los 3 textos del chrome.
// Los bloques van dentro del body, centrados verticalmente por default.

// ─── Fondo y layout ────────────────────────────────────────────────────────
export type Fondo = 'verde-profundo' | 'crema' | 'blanco'

/** Alineación vertical del stack de bloques dentro del body. Default 'centro'. */
export type AlineacionVertical = 'centro' | 'arriba' | 'abajo'

// ─── Bloques: discriminated union ─────────────────────────────────────────
//
// Claude arma el body de cada placa eligiendo qué bloques incluir y en qué
// orden. Cada bloque es autocontenido. El renderer calcula márgenes entre
// bloques según tipo previo/siguiente.

export type TipoBloque =
  | 'eyebrow'
  | 'titulo'
  | 'bajada'
  | 'parrafo'
  | 'numero-hero'
  | 'numero-shock'
  | 'breakdown'
  | 'lista'
  | 'cita'
  | 'comparativa'
  | 'imagen'
  | 'grafico'
  | 'fuente'
  | 'cta-actions'
  | 'handle'
  | 'divider'
  | 'spacer'

// ── Helpers de tipo ──
export interface ComparativaLado {
  label: string
  valor: string
  sub?: string
}

export interface ImagenOverlay {
  numero?: string
  titulo?: string
  texto?: string
  posicion?: 'top' | 'bottom' | 'center'
}

export type GraficoData =
  | { tipo: 'barras'; datos: Array<{ label: string; valor: number }>; unidad?: string }
  | { tipo: 'linea'; datos: Array<{ label: string; valor: number }>; unidad?: string }
  | { tipo: 'dona'; datos: Array<{ label: string; valor: number }> }

export type Bloque =
  /** Etiqueta corta con línea decorativa al frente. "Inversión · Funes" */
  | { tipo: 'eyebrow'; texto: string }
  /** Título grande. Soporta `*italic*` y `**bold**` inline. */
  | { tipo: 'titulo'; texto: string; tamaño?: 'xl' | 'lg' | 'md'; italica?: boolean }
  /** Frase complementaria al título (Raleway italic). */
  | { tipo: 'bajada'; texto: string }
  /** Párrafo de texto. `tamaño: 'xl'` lo hace del tamaño de texto-desc (28px escalados). */
  | {
      tipo: 'parrafo'
      texto: string
      italica?: boolean
      tamaño?: 'sm' | 'md' | 'lg' | 'xl'
    }
  /** Número hero con unidad + contexto opcionales. Anotación lateral. */
  | {
      tipo: 'numero-hero'
      valor: string
      /** Sufijo con superscript: "21" + sup: ",2%" */
      sup?: string
      /** Valor secundario de contexto al lado */
      anotacion_valor?: string
      /** Label uppercase debajo del valor secundario */
      anotacion_label?: string
    }
  /** Variante potente: número gigante color verde brillante sobre fondo oscuro. */
  | { tipo: 'numero-shock'; valor: string; sup?: string }
  /** Breakdown: 2-4 items en columnas con líneas divisoras. */
  | { tipo: 'breakdown'; items: Array<{ label: string; valor: string }> }
  /** Lista con título opcional + 3-4 items numerados/bullets. */
  | {
      tipo: 'lista'
      /** Headline sobre los items (ej: "4 cosas que miramos antes de invertir"). */
      titulo?: string
      items: string[]
      estilo?: 'numerada' | 'bullets'
    }
  /** Cita editorial con atribución. */
  | { tipo: 'cita'; frase: string; atribucion: string }
  /** Dos bloques lado a lado. */
  | { tipo: 'comparativa'; izquierda: ComparativaLado; derecha: ComparativaLado; titulo?: string }
  /** Imagen Unsplash. Overlay opcional. */
  | { tipo: 'imagen'; url: string; alt?: string; overlay?: ImagenOverlay }
  /** Gráfico SVG (barras/línea/dona). */
  | { tipo: 'grafico'; data: GraficoData; titulo?: string }
  /** Cita de fuente al pie. Italic pequeño. */
  | { tipo: 'fuente'; texto: string }
  /** Iconos Like / Compartir / Seguinos (solo en CTA final). */
  | { tipo: 'cta-actions'; destacado?: 'seguir' | 'compartir' | 'like' }
  /** Handle IG (solo en CTA final). */
  | { tipo: 'handle'; texto: string }
  /** Línea horizontal fina. Usar con moderación. */
  | { tipo: 'divider' }
  /** Espacio vertical vacío. */
  | { tipo: 'spacer'; tamaño?: 'xs' | 'sm' | 'md' | 'lg' }

// ─── Placa: composición de bloques + chrome ────────────────────────────────

export interface Placa {
  orden: number
  fondo: Fondo
  /** Descriptor humano del propósito. Solo para logs y UI admin. */
  nombre?: string

  // ── Chrome (obligatorio, Claude llena los 3 textos) ──────────────────────
  /** Tag con puntito verde delante. Arriba-izquierda. Ejemplos:
   *  "SI · Reporte 02", "Caso 01 · Venta · Funes", "Dato del mercado". */
  head_bar_izquierda: string
  /** Paginador o contexto corto. Arriba-derecha. Ejemplos:
   *  "Funes · Oct 2025", "Página 02 / 06", "Gracias por leer". */
  head_bar_derecha: string
  /** Texto chico a la derecha del logo. Abajo-derecha. Ejemplos:
   *  "Deslizá →", "Próximo →", "Última →", "@inmobiliaria.si". */
  meta_foot: string

  // ── Body ─────────────────────────────────────────────────────────────────
  bloques: Bloque[]

  // ── Overrides opcionales ─────────────────────────────────────────────────
  alineacion?: AlineacionVertical
}

export interface Carrusel {
  total: number
  placas: Placa[]
}

// ─── Renderizado ───────────────────────────────────────────────────────────

export type EstadoPlaca = 'pendiente' | 'aprobada' | 'regenerada'

export interface PlacaRenderizada {
  numero: number
  placa: Placa
  url_png: string
  estado: EstadoPlaca
}

export interface CarruselPublicado {
  slug: string
  nota_titulo: string
  nota_url: string
  placas: PlacaRenderizada[]
  generado_en: string
  aprobado_global: boolean
  intentos_regeneracion: Record<number, number>
}

// ─── Input al extractor ────────────────────────────────────────────────────

export interface NotaParaExtractor {
  titulo: string
  slug: string
  meta_description: string
  bajada: string
  contenido_markdown: string
  keywords: string[]
  categoria: string
  imagen_sugerida: string
  imagen_url?: string
}

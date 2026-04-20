// Tipos del sistema de placas — modelo de BLOQUES COMPONIBLES.
//
// Una placa no tiene "tipo". Es una composición de `bloques` que Claude
// elige y ordena libremente. El renderer itera los bloques y los apila con
// spacing coherente. Algunos elementos (logo) son chrome siempre presente.
//
// Esto le da a Claude libertad real de composición: puede combinar
// (ej: eyebrow + número + cita + fuente en una sola placa) o proponer
// estructuras atípicas sin estar limitado a 9 "tipos" rígidos.

// ─── Fondo y layout ────────────────────────────────────────────────────────
export type Fondo = 'verde-profundo' | 'crema' | 'blanco'

/** Cómo alinear el stack de bloques dentro de la zona segura. */
export type AlineacionVertical = 'centro' | 'arriba' | 'abajo'

/** Cómo mostrar el logo en una placa específica. Default: 'pie'. */
export type LogoMode = 'pie' | 'centrado-grande' | 'oculto'

// ─── Bloques — discriminated union ─────────────────────────────────────────
//
// Claude arma cada placa eligiendo qué bloques incluir y en qué orden.
// Cada bloque es autocontenido: lleva toda la data que necesita para renderizar.
// El renderer decide los márgenes entre bloques según tipo previo/siguiente.

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

// ── Helpers ──
export interface ComparativaLado {
  label: string
  valor: string
  sub?: string
}

export interface ImagenOverlay {
  numero?: string
  titulo?: string
  texto?: string
  /** Posición del bloque de texto sobre la imagen. Default 'bottom'. */
  posicion?: 'top' | 'bottom' | 'center'
}

export type GraficoData =
  | { tipo: 'barras'; datos: Array<{ label: string; valor: number }>; unidad?: string }
  | { tipo: 'linea'; datos: Array<{ label: string; valor: number }>; unidad?: string }
  | { tipo: 'dona'; datos: Array<{ label: string; valor: number }> }

// ── Bloques concretos ──
export type Bloque =
  /** Categoría / contexto pequeño arriba de un título o número.
   *  "Inversión · Funes", "Caso real", "Mercado · Rosario". */
  | { tipo: 'eyebrow'; texto: string }
  /** Título grande. Soporta `*italic*` y `**bold**` inline si se necesita
   *  enfatizar una palabra. Tamaño ajustable. */
  | { tipo: 'titulo'; texto: string; tamaño?: 'xl' | 'lg' | 'md'; italica?: boolean }
  /** Bajada complementaria de un título. */
  | { tipo: 'bajada'; texto: string }
  /** Párrafo de texto corrido (sin viñeta, sin estilo especial). */
  | { tipo: 'parrafo'; texto: string; italica?: boolean }
  /** Número hero con unidad y contexto opcionales. El layout visual depende
   *  del orden: si va arriba y solo, ocupa el centro; si viene después de
   *  eyebrow + algo, actúa como dato destacado. */
  | {
      tipo: 'numero-hero'
      valor: string
      unidad?: string
      /** Línea explicativa debajo o al lado. */
      contexto?: string
    }
  /** Variante potente: número gigante en fondo oscuro + texto + fuente. */
  | { tipo: 'numero-shock'; valor: string; texto: string; fuente: string }
  /** Breakdown en columnas o filas: Compra / Gastos / Venta, etc. */
  | { tipo: 'breakdown'; items: Array<{ label: string; valor: string }> }
  /** Lista de items. Cada ≤ 90 chars para no romper layout. */
  | { tipo: 'lista'; items: string[]; estilo?: 'numerada' | 'bullets' }
  /** Cita editorial con atribución. Italic por default. */
  | { tipo: 'cita'; frase: string; atribucion: string }
  /** Dos bloques lado a lado con valores contrastados. */
  | { tipo: 'comparativa'; izquierda: ComparativaLado; derecha: ComparativaLado; titulo?: string }
  /** Imagen (Unsplash) de fondo completo o con overlay de texto. */
  | { tipo: 'imagen'; url: string; alt?: string; overlay?: ImagenOverlay }
  /** Gráfico SVG inline. */
  | { tipo: 'grafico'; data: GraficoData; titulo?: string }
  /** Pie con cita de fuente pequeña. */
  | { tipo: 'fuente'; texto: string }
  /** Iconos Like / Compartir / Seguinos (solo en CTA final). */
  | { tipo: 'cta-actions'; destacado?: 'seguir' | 'compartir' | 'like' }
  /** Handle de Instagram (solo en CTA final). */
  | { tipo: 'handle'; texto: string }
  /** Línea horizontal fina para separar secciones. */
  | { tipo: 'divider' }
  /** Espacio vertical configurable. */
  | { tipo: 'spacer'; tamaño?: 'xs' | 'sm' | 'md' | 'lg' }

// ─── Placa: composición de bloques ─────────────────────────────────────────

export interface Placa {
  orden: number
  fondo: Fondo
  /** Descriptor humano del propósito de la placa — para logs y la UI admin.
   *  Ejemplos: "portada", "caso-real", "comparativa-zonas", "cta". */
  nombre?: string
  bloques: Bloque[]
  /** Alineación vertical del stack dentro de la zona segura. Default 'centro'. */
  alineacion?: AlineacionVertical
  /** Override del logo. Default 'pie'. */
  logo?: LogoMode
  /** Override del número de slide (ej: "02 · 06"). Default: se calcula auto. */
  ocultar_numero_slide?: boolean
}

export interface Carrusel {
  total: number
  placas: Placa[]
}

// ─── Renderizado ───────────────────────────────────────────────────────────

export type EstadoPlaca = 'pendiente' | 'aprobada' | 'regenerada'

export interface PlacaRenderizada {
  numero: number
  /** Guardamos el shape completo de la placa para poder regenerar/editar sin
   *  re-llamar a Claude. */
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

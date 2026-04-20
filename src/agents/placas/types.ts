// Tipos del sistema de placas de Instagram.
//
// El flujo es:
//   1. Extractor (Claude) → CarruselExtraido (placas aún sin renderizar)
//   2. Renderer → cada PlacaExtraida se convierte en PNG → PlacaRenderizada
//   3. Upload + Redis → CarruselPublicado (con URLs de Blob + estado)
//
// Los tipos usan discriminated union sobre `tipo` para que TS infiera el
// shape de `contenido` según el template.

// ─── Fondos disponibles ─────────────────────────────────────────────────────
export type Fondo = 'verde-profundo' | 'crema' | 'blanco'

// ─── Tipos de placa (9) ─────────────────────────────────────────────────────
export type TipoPlaca =
  | 'portada'
  | 'dato-numero'
  | 'dato-lista'
  | 'dato-shock'
  | 'cita-editorial'
  | 'comparativa'
  | 'grafico'
  | 'imagen-dato'
  | 'cta-final'

// ─── Contenidos por tipo ────────────────────────────────────────────────────

export interface PortadaContent {
  /** "Inversión · Funes", "Mercado · Roldán" */
  eyebrow: string
  /** Puede incluir marcadores inline `*italic*` `**bold**` que el template renderizará */
  titulo: string
  bajada?: string
}

export interface DatoNumeroContent {
  /** "Caso real · Funes", "Promedio de barrio" */
  eyebrow: string
  /** El número hero, ej: "USD 850", "+17,7%" */
  numero: string
  /** Contexto al lado del número, ej: "/m²" o "anual" */
  unidad?: string
  /** Párrafo explicativo corto */
  explicacion: string
  /** Breakdown opcional (ej: Compra / Gastos / Venta) — máximo 4 filas */
  breakdown?: Array<{ label: string; valor: string }>
  fuente?: string
}

export interface DatoListaContent {
  eyebrow?: string
  titulo: string
  /** 3-4 items. Cada uno ≤ 90 chars para no romper layout. */
  items: string[]
}

export interface DatoShockContent {
  numero: string
  texto: string
  /** Obligatoria — evitar datos huérfanos sin respaldo. */
  fuente: string
}

export interface CitaEditorialContent {
  frase: string
  atribucion: string
}

export interface ComparativaContent {
  titulo?: string
  izquierda: { label: string; valor: string; sub?: string }
  derecha: { label: string; valor: string; sub?: string }
  fuente?: string
}

/** Gráfico embedible — SVG generado server-side con estética sobria */
export type GraficoData =
  | { tipo: 'barras'; datos: Array<{ label: string; valor: number }>; unidad?: string }
  | { tipo: 'linea'; datos: Array<{ label: string; valor: number }>; unidad?: string }
  | { tipo: 'dona'; datos: Array<{ label: string; valor: number }> }

export interface GraficoContent {
  titulo: string
  descripcion?: string
  fuente: string
  grafico: GraficoData
}

export interface ImagenDatoContent {
  /** URL Unsplash (preferentemente la misma de la nota para consistencia) */
  imagen_url: string
  imagen_alt?: string
  overlay_titulo: string
  overlay_numero?: string
  overlay_texto?: string
}

export interface CtaFinalContent {
  /** "Si llegaste hasta acá" */
  eyebrow: string
  titulo: string
  bajada: string
  /** "@inmobiliaria.si" */
  handle: string
}

// ─── Placa (discriminated union por `tipo`) ─────────────────────────────────

export type PlacaExtraida =
  | { orden: number; tipo: 'portada';         fondo: Fondo; contenido: PortadaContent }
  | { orden: number; tipo: 'dato-numero';     fondo: Fondo; contenido: DatoNumeroContent }
  | { orden: number; tipo: 'dato-lista';      fondo: Fondo; contenido: DatoListaContent }
  | { orden: number; tipo: 'dato-shock';      fondo: Fondo; contenido: DatoShockContent }
  | { orden: number; tipo: 'cita-editorial';  fondo: Fondo; contenido: CitaEditorialContent }
  | { orden: number; tipo: 'comparativa';     fondo: Fondo; contenido: ComparativaContent }
  | { orden: number; tipo: 'grafico';         fondo: Fondo; contenido: GraficoContent }
  | { orden: number; tipo: 'imagen-dato';     fondo: Fondo; contenido: ImagenDatoContent }
  | { orden: number; tipo: 'cta-final';       fondo: Fondo; contenido: CtaFinalContent }

export interface CarruselExtraido {
  total_placas: number
  placas: PlacaExtraida[]
}

// ─── Placas renderizadas + metadata guardada ────────────────────────────────

export type EstadoPlaca = 'pendiente' | 'aprobada' | 'regenerada'

export interface PlacaRenderizada {
  numero: number
  tipo: TipoPlaca
  fondo: Fondo
  /** Guardamos el contenido para poder regenerar o editar sin re-llamar a Claude */
  contenido: PlacaExtraida['contenido']
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

// ─── Input a Claude: resumen de la nota que viene del Blob ──────────────────
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

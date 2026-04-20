// Tokens de diseño del sistema de placas.
// Todos los templates leen de acá — NO hardcodear colores, tamaños ni fuentes
// en los archivos de templates (salvo excepciones documentadas).

import type { Fondo } from '../types'

// ─── Paleta ────────────────────────────────────────────────────────────────
export const COLORES = {
  /** Verde de marca para el logo y elementos principales */
  verdeMarca: '#1f6b3f',
  /** Verde profundo — fondo oscuro de placas */
  verdeProfundo: '#14492a',
  /** Verde brillante — acento sobre fondo oscuro */
  verdeBrillante: '#2c8d54',
  /** Crema editorial — fondo claro default */
  crema: '#f5f0e6',
  /** Blanco hueso — fondo claro alterno */
  blanco: '#fafaf7',
  /** Negro de cuerpo */
  ink: '#131313',
  /** Gris texto secundario */
  grisTexto: '#767676',
  /** Línea suave para separadores sobre claro */
  lineaSuave: '#d8d2c4',
  /** Línea suave sobre fondo oscuro */
  lineaSuaveDark: 'rgba(255,255,255,0.2)',
} as const

/** Mapeo fondo → colores derivados de texto y UI */
export const TEMAS_FONDO: Record<
  Fondo,
  {
    bg: string
    ink: string
    muted: string
    linea: string
    /** Color de acento para números hero y elementos destacados */
    acento: string
  }
> = {
  'verde-profundo': {
    bg: COLORES.verdeProfundo,
    ink: '#ffffff',
    muted: 'rgba(255,255,255,0.7)',
    linea: COLORES.lineaSuaveDark,
    acento: COLORES.verdeBrillante,
  },
  crema: {
    bg: COLORES.crema,
    ink: COLORES.ink,
    muted: COLORES.grisTexto,
    linea: COLORES.lineaSuave,
    acento: COLORES.verdeMarca,
  },
  blanco: {
    bg: COLORES.blanco,
    ink: COLORES.ink,
    muted: COLORES.grisTexto,
    linea: COLORES.lineaSuave,
    acento: COLORES.verdeMarca,
  },
}

// ─── Dimensiones ──────────────────────────────────────────────────────────
export const DIMENSIONES = {
  ancho: 1080,
  alto: 1350,
  margenSuperior: 180,
  margenInferior: 180,
  margenLateral: 50,
  /** Zona segura de contenido (centrada) */
  anchoSeguro: 980, // 1080 - 50*2
  altoSeguro: 990, // 1350 - 180*2
  /** Factor retina para Satori */
  scale: 2,
} as const

// ─── Fuentes ──────────────────────────────────────────────────────────────
// Nombres tal como los espera Satori (match exacto con lo que se pasa al
// constructor `{ fonts: [...] }` en el renderer).
export const FUENTES = {
  raleway: 'Raleway',
  poppins: 'Poppins',
  audiowide: 'Audiowide',
  montserrat: 'Montserrat',
} as const

/** Pesos que efectivamente vamos a cargar — cargar más pesa el bundle sin
 *  beneficio. Ajustar acá si un template pide un peso adicional. */
export const PESOS_CARGADOS = {
  raleway: [200, 300, 400, 500, 600, 700, 800] as const,
  /** Raleway italic solo para citas editoriales */
  ralewayItalic: [300, 400] as const,
  poppins: [500, 600, 700, 800] as const,
  audiowide: [400] as const, // único peso disponible
  montserrat: [600, 700] as const,
}

// ─── Tipografía base (sizes, weights, letter-spacings reutilizables) ──────
export const TIPO = {
  /** Eyebrow (categoría/zona arriba de títulos) */
  eyebrow: {
    fontFamily: FUENTES.raleway,
    fontWeight: 500,
    fontSize: 26,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
  },
  /** Título hero de portada (Raleway light) */
  titulo: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontSize: 84,
    lineHeight: 1.12,
    letterSpacing: '-0.01em',
  },
  tituloItalico: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontStyle: 'italic' as const,
  },
  /** Bajada corta */
  bajada: {
    fontFamily: FUENTES.raleway,
    fontWeight: 400,
    fontSize: 32,
    lineHeight: 1.4,
  },
  /** Cuerpo de texto */
  cuerpo: {
    fontFamily: FUENTES.raleway,
    fontWeight: 400,
    fontSize: 28,
    lineHeight: 1.5,
  },
  /** Número hero (Poppins grande) */
  numeroHero: {
    fontFamily: FUENTES.poppins,
    fontWeight: 700,
    fontSize: 200,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  /** Número secundario */
  numeroMedio: {
    fontFamily: FUENTES.poppins,
    fontWeight: 700,
    fontSize: 96,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  /** Fuente citada al pie — pequeño */
  fuente: {
    fontFamily: FUENTES.raleway,
    fontWeight: 500,
    fontSize: 20,
    letterSpacing: '0.04em',
  },
} as const

// ─── Logo proporción base ─────────────────────────────────────────────────
export const LOGO_BASE = {
  /** Font-size del "SI" en la caja */
  siFontSize: 56,
  siPaddingY: 6,
  siPaddingX: 20,
  siBorderRadius: 8,
  /** Font-size de "INMOBILIARIA" */
  inmoFontSize: 42,
  /** Espacio entre caja SI e INMOBILIARIA */
  gap: 14,
  /** Letter-spacing de INMOBILIARIA */
  inmoLetterSpacing: '0.14em',
  /** Compensación vertical del baseline de Audiowide (%/em) */
  siTranslateY: '-0.05em',
} as const

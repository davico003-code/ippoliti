// Tokens de diseño del sistema de placas.
// Valores calibrados contra el HTML de referencia aprobado (que estaba a 50%
// = 540×675). Todo acá está en escala real (1080×1350).

import type { Fondo } from '../types'

// ─── Paleta ────────────────────────────────────────────────────────────────
export const COLORES = {
  /** Verde de marca — logo, elementos principales */
  verdeMarca: '#1f6b3f',
  /** Verde profundo — fondo oscuro de placas */
  verdeProfundo: '#14492a',
  /** Verde brillante — acentos sobre fondo oscuro */
  verdeBrillante: '#2c8d54',
  /** Crema editorial — fondo claro default */
  crema: '#f5f0e6',
  /** Crema cálido — variante interna para bloques específicos */
  cremaCalido: '#ebe4d3',
  /** Blanco hueso — fondo claro alterno */
  blanco: '#fafaf7',
  /** Negro de cuerpo */
  ink: '#131313',
  /** Gris secundario */
  grisTexto: '#767676',
  /** Gris cuerpo de lista (ligeramente más oscuro que grisTexto) */
  grisCuerpo: '#2a2a2a',
  /** Línea suave sobre fondo claro */
  lineaSuave: '#d8d2c4',
  /** Línea suave sobre fondo oscuro */
  lineaSuaveDark: 'rgba(255,255,255,0.18)',
  /** Gris de texto sobre claro (más suave que grisTexto) */
  grisSuave: '#3a3a3a',
} as const

/** Mapeo Fondo → colores derivados (tema por fondo) */
export const TEMAS_FONDO: Record<
  Fondo,
  {
    bg: string
    ink: string
    muted: string
    linea: string
    acento: string
    /** Color usado por `em`/italic de énfasis dentro de títulos y cuerpos */
    enfasis: string
  }
> = {
  'verde-profundo': {
    bg: COLORES.verdeProfundo,
    ink: '#ffffff',
    muted: 'rgba(255,255,255,0.72)',
    linea: COLORES.lineaSuaveDark,
    acento: COLORES.verdeBrillante,
    enfasis: COLORES.verdeBrillante,
  },
  crema: {
    bg: COLORES.crema,
    ink: COLORES.ink,
    muted: COLORES.grisTexto,
    linea: COLORES.lineaSuave,
    acento: COLORES.verdeMarca,
    enfasis: COLORES.verdeProfundo,
  },
  blanco: {
    bg: COLORES.blanco,
    ink: COLORES.ink,
    muted: COLORES.grisTexto,
    linea: COLORES.lineaSuave,
    acento: COLORES.verdeMarca,
    enfasis: COLORES.verdeProfundo,
  },
}

// ─── Dimensiones (escala real 1080×1350) ──────────────────────────────────
export const DIMENSIONES = {
  ancho: 1080,
  alto: 1350,
  margenSuperior: 180,
  margenInferior: 180,
  margenLateral: 50,
  /** Zona segura (centrada) donde va head-bar + body + foot */
  anchoSeguro: 980, // 1080 - 50*2
  altoSeguro: 990, // 1350 - 180*2
  scale: 2, // retina para ImageResponse
} as const

// ─── Fuentes ──────────────────────────────────────────────────────────────
export const FUENTES = {
  raleway: 'Raleway',
  poppins: 'Poppins',
  audiowide: 'Audiowide',
  montserrat: 'Montserrat',
} as const

/** Pesos efectivamente cargados en Satori — ajustar si un bloque pide más */
export const PESOS_CARGADOS = {
  raleway: [200, 300, 400, 500, 600, 700, 800] as const,
  /** Italic en 300 y 400 para bajadas y citas */
  ralewayItalic: [300, 400] as const,
  poppins: [500, 600, 700, 800] as const,
  audiowide: [400] as const,
  montserrat: [600, 700] as const,
}

// ─── Tokens tipográficos (escala real) ────────────────────────────────────
export const TIPO = {
  /** Head-bar tag/paginador */
  headBar: {
    fontFamily: FUENTES.raleway,
    fontWeight: 600,
    fontSize: 24,
    letterSpacing: '0.24em',
    textTransform: 'uppercase' as const,
  },
  /** Meta-text del foot */
  metaFoot: {
    fontFamily: FUENTES.raleway,
    fontWeight: 500,
    fontSize: 22,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
  },
  /** Eyebrow con línea decorativa */
  eyebrow: {
    fontFamily: FUENTES.raleway,
    fontWeight: 600,
    fontSize: 26,
    letterSpacing: '0.32em',
    textTransform: 'uppercase' as const,
  },
  /** Título hero — Raleway ultra-light para aire editorial */
  titulo: {
    fontFamily: FUENTES.raleway,
    fontWeight: 200,
    fontSize: 136, // 68 * 2
    lineHeight: 0.96,
    letterSpacing: '-0.035em',
  },
  /** Título de lista / headline medio (Raleway 300 grande) */
  tituloMedio: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontSize: 56, // 28 * 2
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
  },
  /** Bajada (italic complementaria al título) */
  bajada: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontStyle: 'italic' as const,
    fontSize: 38, // 19 * 2
    lineHeight: 1.38,
  },
  /** Texto descriptivo acompañando un dato shock */
  textoDesc: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontSize: 56, // 28 * 2
    lineHeight: 1.22,
    letterSpacing: '-0.012em',
  },
  /** Cuerpo normal (raleway 400) */
  cuerpo: {
    fontFamily: FUENTES.raleway,
    fontWeight: 400,
    fontSize: 30, // ~15 * 2
    lineHeight: 1.45,
  },
  /** Número hero (Poppins 800 extremo) */
  numeroHero: {
    fontFamily: FUENTES.poppins,
    fontWeight: 800,
    fontSize: 272, // 136 * 2
    lineHeight: 0.85,
    letterSpacing: '-0.055em',
  },
  /** Número shock — variante más grande para fondo oscuro */
  numeroShock: {
    fontFamily: FUENTES.poppins,
    fontWeight: 800,
    fontSize: 360, // 180 * 2
    lineHeight: 0.82,
    letterSpacing: '-0.055em',
  },
  /** Anotación al lado del número hero (valor secundario) */
  numeroAnotacionValor: {
    fontFamily: FUENTES.poppins,
    fontWeight: 700,
    fontSize: 34, // 17 * 2
    letterSpacing: '0.02em',
    lineHeight: 1,
  },
  /** Label del anotación (uppercase pequeño) */
  numeroAnotacionLabel: {
    fontFamily: FUENTES.raleway,
    fontWeight: 600,
    fontSize: 22, // 11 * 2
    letterSpacing: '0.24em',
    textTransform: 'uppercase' as const,
  },
  /** Cita editorial */
  cita: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontStyle: 'italic' as const,
    fontSize: 92, // 46 * 2
    lineHeight: 1.1,
    letterSpacing: '-0.018em',
  },
  citaAtribucion: {
    fontFamily: FUENTES.raleway,
    fontWeight: 500,
    fontSize: 30,
    lineHeight: 1.45,
  },
  /** Fuente citada al pie (italic pequeño) */
  fuente: {
    fontFamily: FUENTES.raleway,
    fontWeight: 300,
    fontStyle: 'italic' as const,
    fontSize: 28, // 14 * 2
    letterSpacing: '0.02em',
  },
  /** Breakdown column — label */
  breakdownLabel: {
    fontFamily: FUENTES.raleway,
    fontWeight: 700,
    fontSize: 20, // 10 * 2
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
  },
  /** Breakdown column — valor */
  breakdownValor: {
    fontFamily: FUENTES.poppins,
    fontWeight: 600,
    fontSize: 30, // 15 * 2
    lineHeight: 1.1,
  },
  /** Lista item — número (Poppins 700) */
  listaNumero: {
    fontFamily: FUENTES.poppins,
    fontWeight: 700,
    fontSize: 32, // 16 * 2
    letterSpacing: '0.04em',
    lineHeight: 1,
  },
  /** Lista item — texto */
  listaTexto: {
    fontFamily: FUENTES.raleway,
    fontWeight: 400,
    fontSize: 30, // 15 * 2
    lineHeight: 1.38,
  },
  /** CTA action — número 01/02/03 */
  ctaNumero: {
    fontFamily: FUENTES.poppins,
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: '0.3em',
  },
  /** CTA action — título */
  ctaTitulo: {
    fontFamily: FUENTES.raleway,
    fontWeight: 700,
    fontSize: 34, // 17 * 2
    lineHeight: 1,
  },
  /** CTA action — desc */
  ctaDesc: {
    fontFamily: FUENTES.raleway,
    fontWeight: 400,
    fontSize: 24, // 12 * 2
    lineHeight: 1.35,
  },
} as const

// ─── Layout — paddings, gaps, borders ─────────────────────────────────────
export const LAYOUT = {
  /** Padding bottom del head-bar (antes del border-bottom) */
  headBarPaddingBottom: 28, // 14 * 2
  /** Gap entre el puntito verde y el texto del head-bar.left */
  headBarGap: 20,
  /** Diámetro del puntito verde */
  headBarDotSize: 14,

  /** Padding top del foot (después del border-top) */
  footPaddingTop: 28,

  /** Eyebrow: margin-bottom + línea decorativa */
  eyebrowMarginBottom: 44, // 22 * 2
  eyebrowLineWidth: 56, // 28 * 2
  eyebrowLineHeight: 2, // 1 * 2
  eyebrowGap: 24,

  /** Bajada: margin-top + padding-top (separada del título por línea) */
  bajadaMarginTop: 48,
  bajadaPaddingTop: 36,

  /** Entre el número hero y la anotación */
  numeroHeroGap: 32,
  numeroHeroAnotacionPaddingTop: 32,

  /** Breakdown-cols: padding-top + divisores */
  breakdownColsPaddingTop: 36,

  /** Lista: padding vertical de cada item */
  listaItemPadding: 22,
  listaItemGap: 28,
  /** Min-width del número de item */
  listaItemNumWidth: 60,

  /** CTA actions: padding-top tras border */
  ctaActionsPaddingTop: 44,
  ctaActionPadding: 20,
  ctaIconSize: 60,

  /** Fuente citada: margin-top cuando sigue a un dato */
  fuenteMarginTop: 40,

  /** Cita atribución: margin-top + padding-top + border-top */
  citaAtribMarginTop: 56,
  citaAtribPaddingTop: 40,

  /** Borde de línea (grosor) */
  borderWidth: 2,
} as const

// ─── Logo proporciones (escala real) ──────────────────────────────────────
export const LOGO_BASE = {
  /** Caja SI: font-size del glifo */
  siFontSize: 48, // 24 * 2
  siPaddingY: 8, // 4 * 2
  siPaddingX: 18, // 9 * 2
  siBorderRadius: 8, // 4 * 2
  /** Altura mínima de la caja (para que el cuadrado no colapse con chars angostos) */
  siMinHeight: 68, // 34 * 2
  siMinWidth: 76, // 38 * 2
  /** INMOBILIARIA */
  inmoFontSize: 34, // 17 * 2
  /** Espacio entre caja SI e INMOBILIARIA */
  gap: 16, // 8 * 2
  inmoLetterSpacing: '0.14em',
  /** Compensación baseline de Audiowide */
  siTranslateY: '-0.05em',
} as const

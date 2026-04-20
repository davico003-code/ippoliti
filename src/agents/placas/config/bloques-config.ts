// Registro de bloques — mapping TipoBloque → componente JSX renderer.
//
// Cada bloque tiene un renderer tipado que recibe la props del bloque
// (inferidas del discriminated union de `Bloque`) + un RenderContext con los
// colores derivados del fondo de la placa.
//
// Se completa incrementalmente: se deja `null` en lo que falta para que el
// renderer explote con mensaje claro si Claude pide un bloque no implementado.

import type { ReactNode } from 'react'
import type { Bloque, Fondo, TipoBloque } from '../types'

/** Contexto que el renderer pasa a cada bloque — todos los colores derivados
 *  del fondo más metadata útil del layout. */
export interface RenderContext {
  fondo: Fondo
  tema: {
    bg: string
    ink: string
    muted: string
    linea: string
    acento: string
  }
  /** Índice del bloque en la placa (0-based). Sirve para que el bloque ajuste
   *  márgenes o tamaños según su posición (ej: primer eyebrow = sin mt). */
  indice: number
  /** Cantidad total de bloques en la placa. */
  total: number
  /** Tipo del bloque anterior — útil para calcular spacing contextual. */
  tipoPrevio?: TipoBloque
  /** Tipo del bloque siguiente. */
  tipoSiguiente?: TipoBloque
}

/** Tipo del renderer de un bloque específico. Discriminated por `tipo`. */
export type BloqueRenderer<T extends TipoBloque> = (
  bloque: Extract<Bloque, { tipo: T }>,
  ctx: RenderContext,
) => ReactNode

/** Registro completo. Cada tipo se completa al crear el archivo en `bloques/`. */
export const BLOQUES_REGISTRY: { [K in TipoBloque]: BloqueRenderer<K> | null } = {
  eyebrow: null,
  titulo: null,
  bajada: null,
  parrafo: null,
  'numero-hero': null,
  'numero-shock': null,
  breakdown: null,
  lista: null,
  cita: null,
  comparativa: null,
  imagen: null,
  grafico: null,
  fuente: null,
  'cta-actions': null,
  handle: null,
  divider: null,
  spacer: null,
}

/** Helper con error explícito si Claude pide un bloque no implementado. */
export function getBloqueRenderer<T extends TipoBloque>(tipo: T): BloqueRenderer<T> {
  const renderer = BLOQUES_REGISTRY[tipo]
  if (!renderer) {
    throw new Error(
      `[placas/bloques] Bloque "${tipo}" no está implementado. ` +
        `Revisar src/agents/placas/bloques/${tipo}.tsx y registrarlo en bloques-config.ts`,
    )
  }
  return renderer as BloqueRenderer<T>
}

// ─── Catálogo para el extractor ───────────────────────────────────────────
//
// Este array es la fuente de verdad que se inyecta en el prompt de Claude
// para decirle qué bloques puede elegir. Cuando se agregue un bloque nuevo,
// sumar acá la entrada con la descripción para que Claude lo conozca.

export interface CatalogoBloque {
  tipo: TipoBloque
  descripcion: string
  /** Shape de los props obligatorios (texto informativo para el prompt). */
  props: string
  /** Cuándo conviene usarlo — guía editorial para Claude. */
  cuando_usar: string
}

export const CATALOGO_BLOQUES: CatalogoBloque[] = [
  {
    tipo: 'eyebrow',
    descripcion: 'Categoría o contexto corto sobre un título o número. Raleway uppercase.',
    props: '{ texto: string }',
    cuando_usar:
      'Casi siempre al inicio de una placa. Ejemplos: "Inversión · Funes", "Caso real", "Mercado · Rosario". ≤ 40 chars.',
  },
  {
    tipo: 'titulo',
    descripcion: 'Título grande editorial. Raleway light. Soporta *italic* y **bold** inline.',
    props: '{ texto: string; tamaño?: "xl"|"lg"|"md"; italica?: boolean }',
    cuando_usar: 'Portadas, títulos de sección importante. Máximo 4 líneas visuales.',
  },
  {
    tipo: 'bajada',
    descripcion: 'Frase complementaria debajo de un título.',
    props: '{ texto: string }',
    cuando_usar: 'Después de un título para agregar contexto. ≤ 120 chars.',
  },
  {
    tipo: 'parrafo',
    descripcion: 'Texto corrido explicativo.',
    props: '{ texto: string; italica?: boolean }',
    cuando_usar: 'Para desarrollar un caso o explicar un dato. ≤ 220 chars por bloque.',
  },
  {
    tipo: 'numero-hero',
    descripcion: 'Número gigante en Poppins con unidad y contexto opcionales.',
    props: '{ valor: string; unidad?: string; contexto?: string }',
    cuando_usar: 'Cuando el valor es lo principal: "+17,7%", "USD 850", "43 años".',
  },
  {
    tipo: 'numero-shock',
    descripcion: 'Número gigante con texto explicativo y fuente — típicamente sobre fondo oscuro.',
    props: '{ valor: string; texto: string; fuente: string }',
    cuando_usar: 'Estadística potente que requiere impacto visual + respaldo.',
  },
  {
    tipo: 'breakdown',
    descripcion: 'Tabla de 2-4 pares label:valor (ej: Compra/Gastos/Venta).',
    props: '{ items: [{ label: string; valor: string }] }',
    cuando_usar: 'Desglose de un número hero. ≤ 4 filas para no saturar.',
  },
  {
    tipo: 'lista',
    descripcion: 'Lista de 3-4 items numerados o con bullets finos.',
    props: '{ items: string[]; estilo?: "numerada"|"bullets" }',
    cuando_usar: 'Pasos, checklist, enumeraciones. Cada item ≤ 90 chars.',
  },
  {
    tipo: 'cita',
    descripcion: 'Frase editorial en italic + atribución. Sin comillas decorativas grandes.',
    props: '{ frase: string; atribucion: string }',
    cuando_usar: 'Una vez por carrusel máximo. Frase ≤ 180 chars.',
  },
  {
    tipo: 'comparativa',
    descripcion: 'Dos bloques lado a lado con etiqueta y valor contrastado.',
    props: '{ izquierda: {label,valor,sub?}; derecha: {label,valor,sub?}; titulo?: string }',
    cuando_usar: 'Comparar dos zonas, dos momentos, dos tipos de propiedad.',
  },
  {
    tipo: 'imagen',
    descripcion: 'Imagen Unsplash ocupando ancho. Overlay opcional de texto.',
    props: '{ url: string; alt?: string; overlay?: { numero?, titulo?, texto?, posicion? } }',
    cuando_usar: 'Placas de contexto urbano o cuando el tema es tan visual que lo amerita.',
  },
  {
    tipo: 'grafico',
    descripcion: 'Gráfico SVG: barras, línea o dona. Paleta de verdes de marca.',
    props: '{ data: GraficoData; titulo?: string }',
    cuando_usar: 'Datos evolutivos o distribuciones que se ven mejor visualizadas.',
  },
  {
    tipo: 'fuente',
    descripcion: 'Cita de fuente pequeña al pie.',
    props: '{ texto: string }',
    cuando_usar: 'Siempre que se muestre un dato numérico.',
  },
  {
    tipo: 'cta-actions',
    descripcion: 'Iconos Like / Compartir / Seguinos (SVG inline).',
    props: '{ destacado?: "seguir"|"compartir"|"like" }',
    cuando_usar: 'Solo en la placa final del carrusel (CTA).',
  },
  {
    tipo: 'handle',
    descripcion: 'Handle de Instagram.',
    props: '{ texto: string }',
    cuando_usar: 'Solo en la placa final (ej: "@inmobiliaria.si").',
  },
  {
    tipo: 'divider',
    descripcion: 'Línea horizontal fina.',
    props: '{}',
    cuando_usar: 'Para separar secciones. Usar con moderación.',
  },
  {
    tipo: 'spacer',
    descripcion: 'Espacio vertical vacío configurable.',
    props: '{ tamaño?: "xs"|"sm"|"md"|"lg" }',
    cuando_usar: 'Solo si el spacing auto entre bloques no alcanza.',
  },
]

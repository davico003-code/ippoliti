// Registro de bloques + catálogo para el extractor.
//
// BLOQUES_REGISTRY: mapping tipo → renderer JSX. Se completa incrementalmente.
// CATALOGO_BLOQUES: descripción legible que se inyecta en el prompt de Claude
// para que sepa qué bloques puede elegir y cuándo.

import type { ReactNode } from 'react'
import type { Bloque, Fondo, TipoBloque } from '../types'
import { renderEyebrow } from '../bloques/eyebrow'
import { renderTitulo } from '../bloques/titulo'
import { renderBajada } from '../bloques/bajada'

export interface RenderContext {
  fondo: Fondo
  tema: {
    bg: string
    ink: string
    muted: string
    linea: string
    acento: string
    enfasis: string
  }
  indice: number
  total: number
  tipoPrevio?: TipoBloque
  tipoSiguiente?: TipoBloque
}

export type BloqueRenderer<T extends TipoBloque> = (
  bloque: Extract<Bloque, { tipo: T }>,
  ctx: RenderContext,
) => ReactNode

export const BLOQUES_REGISTRY: { [K in TipoBloque]: BloqueRenderer<K> | null } = {
  eyebrow: renderEyebrow,
  titulo: renderTitulo,
  bajada: renderBajada,
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

export interface CatalogoBloque {
  tipo: TipoBloque
  descripcion: string
  props: string
  cuando_usar: string
}

export const CATALOGO_BLOQUES: CatalogoBloque[] = [
  {
    tipo: 'eyebrow',
    descripcion: 'Etiqueta corta con línea decorativa al frente. Raleway 600 uppercase 26px.',
    props: '{ texto: string }',
    cuando_usar:
      'Arriba de un título o cifra cuando conviene dar contexto de sección. "Inversión en Funes", "Conclusión", "Si llegaste hasta acá". ≤ 40 chars. No es lo mismo que head_bar_izquierda (chrome) — el eyebrow vive dentro del body.',
  },
  {
    tipo: 'titulo',
    descripcion: 'Título grande editorial. Raleway 200 (ultra-light) 136px. Soporta *italic* y **bold** inline.',
    props: '{ texto: string; tamaño?: "xl"|"lg"|"md"; italica?: boolean }',
    cuando_usar:
      'Portadas, headlines de sección importante. Usar *italic* en 1-2 palabras para acento (se pintan con el color enfasis del tema). Usar **bold** para una palabra que pesa. Máximo 4 líneas visuales.',
  },
  {
    tipo: 'bajada',
    descripcion: 'Frase en Raleway italic 300 38px debajo de un título. Lleva border-top fino de separación.',
    props: '{ texto: string }',
    cuando_usar: 'Después de un título para agregar contexto editorial. ≤ 140 chars.',
  },
  {
    tipo: 'parrafo',
    descripcion: 'Párrafo de texto. Tamaño default 30px (Raleway 400). "xl" sube a 56px (Raleway 300) para descripciones grandes.',
    props: '{ texto: string; italica?: boolean; tamaño?: "sm"|"md"|"lg"|"xl" }',
    cuando_usar:
      'Para explicar un caso o contextualizar un dato. ≤ 220 chars. Usar italica=true para texto corrido editorial (ej: bajo de eyebrow y antes de un número).',
  },
  {
    tipo: 'numero-hero',
    descripcion: 'Número gigante Poppins 800 a 272px. Soporta sup (superscript) para decimales "," o "%". Admite anotación lateral con valor + label uppercase.',
    props: '{ valor: string; sup?: string; anotacion_valor?: string; anotacion_label?: string }',
    cuando_usar:
      'Cuando el número es la estrella: "21,2%" (valor="21", sup=",2%"), "USD 850" (valor="USD 850"), "+17,7%". La anotación agrega un dato secundario ("+ USD 7.000" + label "GANANCIA NETA · 12 MESES").',
  },
  {
    tipo: 'numero-shock',
    descripcion: 'Número extremo Poppins 800 a 360px. Siempre color verde brillante. Pensado para fondo oscuro.',
    props: '{ valor: string; sup?: string }',
    cuando_usar:
      'Estadística potente sobre fondo verde-profundo que requiere impacto máximo. Acompañar siempre con un parrafo (texto-desc) y un bloque fuente debajo.',
  },
  {
    tipo: 'breakdown',
    descripcion: 'Tabla 2-4 columnas con label uppercase chico + valor Poppins 600. Líneas divisoras verticales.',
    props: '{ items: [{ label: string; valor: string }] }',
    cuando_usar: 'Desglose debajo de un número hero. Ej: Compra / Gastos / Venta. Exactamente 2-4 items.',
  },
  {
    tipo: 'lista',
    descripcion: 'Lista numerada con título headline opcional. Items separados por líneas finas.',
    props: '{ titulo?: string; items: string[]; estilo?: "numerada"|"bullets" }',
    cuando_usar:
      'Pasos, checklist, enumeraciones. El título va arriba como headline de la lista (ej: "4 cosas que miramos antes de invertir en Funes o Roldán"). Cada item ≤ 90 chars. Ideal 3-4 items.',
  },
  {
    tipo: 'cita',
    descripcion: 'Frase editorial en Raleway italic 300 a 92px + atribución más chica debajo con border-top.',
    props: '{ frase: string; atribucion: string }',
    cuando_usar:
      'Una sola vez por carrusel (placa de cierre o clímax). Frase ≤ 180 chars. Atribución con cargo y respaldo: "— David Flores, Corredor Inmobiliario (Mat. N° 0621)".',
  },
  {
    tipo: 'comparativa',
    descripcion: 'Dos columnas con label + valor contrastados.',
    props: '{ izquierda: {label, valor, sub?}; derecha: {label, valor, sub?}; titulo?: string }',
    cuando_usar: 'Comparar Funes vs Roldán, 2024 vs 2026, casa vs depto.',
  },
  {
    tipo: 'imagen',
    descripcion: 'Imagen Unsplash ancho completo con overlay de texto opcional.',
    props: '{ url: string; alt?: string; overlay?: { numero?, titulo?, texto?, posicion? } }',
    cuando_usar: 'Contexto urbano o visual. La imagen_url de la nota suele ser la mejor opción (ya está curada).',
  },
  {
    tipo: 'grafico',
    descripcion: 'Gráfico SVG barras/línea/dona. Paleta de verdes de marca.',
    props: '{ data: GraficoData; titulo?: string }',
    cuando_usar: 'Datos evolutivos, distribuciones, rankings visuales. Siempre acompañar con bloque fuente.',
  },
  {
    tipo: 'fuente',
    descripcion: 'Cita de fuente al pie. Raleway italic 300 a 28px.',
    props: '{ texto: string }',
    cuando_usar:
      'Siempre que se muestre un dato numérico del que haya fuente externa. "— Relevamiento SI Inmobiliaria 2024-2025", "Fuente: COCIR Rosario", etc.',
  },
  {
    tipo: 'cta-actions',
    descripcion: 'Grid de 3 acciones Like / Compartir / Seguinos con iconos SVG. La tercera destacada en verde profundo.',
    props: '{ destacado?: "seguir"|"compartir"|"like" }',
    cuando_usar: 'SOLO en la placa final del carrusel (CTA). Default destaca "seguir".',
  },
  {
    tipo: 'handle',
    descripcion: 'Handle de Instagram.',
    props: '{ texto: string }',
    cuando_usar: 'Solo en CTA final. Ej: "@inmobiliaria.si".',
  },
  {
    tipo: 'divider',
    descripcion: 'Línea horizontal fina.',
    props: '{}',
    cuando_usar: 'Casi nunca — los bloques ya traen sus propias líneas cuando corresponde. Usar solo si se necesita un corte visual claro.',
  },
  {
    tipo: 'spacer',
    descripcion: 'Espacio vertical vacío configurable.',
    props: '{ tamaño?: "xs"|"sm"|"md"|"lg" }',
    cuando_usar: 'Último recurso si el spacing auto entre bloques no alcanza. Preferir no usarlo.',
  },
]

// ─── Guía de chrome ───────────────────────────────────────────────────────
//
// Además de elegir bloques, Claude debe llenar los 3 textos del chrome para
// CADA placa. Esto se inyecta en el prompt junto con el catálogo.

export const CHROME_GUIDE = {
  head_bar_izquierda: {
    descripcion: 'Tag con punto verde delante. Arriba-izquierda de la placa.',
    ejemplos: [
      'SI · Reporte 02',
      'Caso 01 · Venta · Funes',
      'Antes de invertir',
      'Dato del mercado',
      'Para llevarte',
      'SI · Comunidad',
    ],
    regla: 'Raleway uppercase ≤ 40 chars. Coherente entre placas del mismo carrusel (opcionalmente numeradas).',
  },
  head_bar_derecha: {
    descripcion: 'Paginador o contexto corto. Arriba-derecha.',
    ejemplos: ['Funes · Oct 2025', 'Página 02 / 06', 'Gracias por leer', 'Octubre 2025'],
    regla:
      'Patrón preferido: "Página NN / TOTAL" para placas internas. La portada puede llevar ubicación+mes. La CTA final "Gracias por leer" o similar.',
  },
  meta_foot: {
    descripcion: 'Texto chico a la derecha del logo. Abajo-derecha.',
    ejemplos: ['Deslizá →', 'Próximo →', 'Alquiler →', 'Cita →', 'Última →', '@inmobiliaria.si'],
    regla:
      'Indica qué viene después. La CTA final suele llevar el handle ("@inmobiliaria.si"). Placas internas: "Próximo →" o algo descriptivo del próximo tema.',
  },
}

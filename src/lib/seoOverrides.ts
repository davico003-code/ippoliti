// Overrides de SEO por propiedad (keyed por ID de Tokko) para las unidades de
// emprendimientos. Corrigen en la WEB los datos malos del CRM: títulos con la
// cantidad de dormitorios equivocada, typos en la descripción y las meta
// descriptions duplicadas de Distrito Roldán (5 fichas con el mismo texto
// compiten entre sí en Google). La fuente de verdad sigue siendo el CRM: cuando
// los datos se corrijan ahí, estos overrides se pueden retirar.
//
// IMPORTANTE: el slug/URL se genera a partir de publication_title, por eso el
// override se aplica DESPUÉS de calcular el slug canónico (ver la ficha) — las
// URLs indexadas no cambian, solo <title>, H1, meta y el texto visible.
//
// Datos verificados contra el feed (suite_amount / bathroom_amount / superficie
// / precio) el 2026-07-11:
//   7268239 → suite=1, baños=1, 80 m², USD 183.000 ⇒ es 1 DORMITORIO (el título
//             del CRM decía 2; la descripción decía 1 — la descripción tenía razón)
//   7407995 → suite=2, baños=2, 80 m², USD 208.000 ⇒ es 2 DORMITORIOS (el título
//             del CRM decía 1; la descripción decía 2 — ídem)

export interface PropertySeoOverride {
  /** Reemplaza publication_title en <title>, H1, OG y JSON-LD (no en el slug). */
  title: string
  /** Meta description única (la del CRM está duplicada o con errores). */
  metaDescription: string
  /** Correcciones puntuales sobre el texto visible de la descripción. */
  bodyFixes?: Array<[RegExp, string]>
}

// Variante de marca: el CRM escribe "DockGarden" pegado; Google también recibe
// búsquedas por "Dock Garden" separado. En el texto visible sumamos la forma
// separada (el instructivo SEO pide usar ambas).
const DOCK_GARDEN_SPACING: Array<[RegExp, string]> = [[/DockGarden/g, 'Dock Garden']]

export const PROPERTY_SEO: Record<number, PropertySeoOverride> = {
  // ── DockGarden — Aldea Fisherton (dev 67173) ──────────────────────────────
  7268078: {
    // Dúplex 3 dorm, 3 baños, 153 m² cubiertos, USD 410.000
    title: 'Departamento dúplex 3 dormitorios con terraza en Dock Garden, Fisherton',
    metaDescription:
      'Dock Garden Fisherton – Departamento 3 dormitorios dúplex con balcón y terraza privada. 153 m² cubiertos, 3 baños. USD 410.000 con financiación.',
    bodyFixes: DOCK_GARDEN_SPACING,
  },
  7268088: {
    // 3 dorm, 2 baños, 158 m² cubiertos, USD 356.000
    title: 'Departamento 3 dormitorios con balcón en Dock Garden, Fisherton',
    metaDescription:
      'Dock Garden Fisherton – Departamento 3 dormitorios con balcón privado. 158 m² cubiertos, 2 baños, en condominio con paseo comercial. USD 356.000.',
    bodyFixes: DOCK_GARDEN_SPACING,
  },
  7268239: {
    // REAL: 1 dorm (el título del CRM decía 2), 1 baño, 80 m², USD 183.000
    title: 'Departamento 1 dormitorio de 80 m² en Dock Garden, Fisherton',
    metaDescription:
      'Dock Garden Fisherton – Departamento 1 dormitorio de 80 m² en condominio de baja altura en Aldea Fisherton, Rosario. USD 183.000 con financiación.',
    bodyFixes: [...DOCK_GARDEN_SPACING, [/Undidad/gi, 'Unidad']],
  },
  7407995: {
    // REAL: 2 dorm (el título del CRM decía 1), 2 baños, 80 m², USD 208.000
    title: 'Departamento 2 dormitorios y 2 baños en Dock Garden, Fisherton',
    metaDescription:
      'Dock Garden Fisherton – Departamento 2 dormitorios y 2 baños de 80 m² en la Aldea Fisherton, Rosario. USD 208.000 con financiación disponible.',
    bodyFixes: [...DOCK_GARDEN_SPACING, [/DORMITORIOs/g, 'Dormitorios']],
  },

  // ── Distrito Roldán (dev 67178) — metas únicas por lote ───────────────────
  7509726: {
    // Lote residencial 444 m², USD 37.736
    title: 'Lote residencial 444 m² con financiación en Distrito Roldán',
    metaDescription:
      'Lote residencial de 444 m² en Distrito Roldán, barrio abierto sobre Ruta 9. Servicios subterráneos y financiación 30% + 24 cuotas fijas. USD 37.736.',
  },
  7510528: {
    // Lote residencial 546 m², USD 51.908
    title: 'Lote residencial 546 m² en Distrito Roldán, Ruta 9',
    metaDescription:
      'Lote residencial de 546 m² en Distrito Roldán, a minutos de Funes y Rosario. Barrio abierto con todos los servicios y financiación en dólares. USD 51.908.',
  },
  7510568: {
    // Lote 546 m², USD 46.444
    title: 'Lote de 546 m² con financiación en cuotas en Distrito Roldán',
    metaDescription:
      'Lote de 546 m² en Distrito Roldán con financiación 30% + 24 cuotas fijas en dólares. Barrio abierto con área comercial propia sobre Ruta 9. USD 46.444.',
  },
  7526741: {
    // Lote comercial 654 m², USD 176.661
    title: 'Lote comercial 654 m² sobre Ruta 9 en Distrito Roldán',
    metaDescription:
      'Lote comercial de 654 m² al frente sobre Ruta 9 en Distrito Roldán, ideal para local u oficina de renta. Con dársenas de estacionamiento. USD 176.661.',
  },
  8024607: {
    // Lote comercial 630 m², USD 170.100
    title: 'Lote comercial 630 m² con frente a Ruta 9 en Distrito Roldán',
    metaDescription:
      'Lote comercial de 630 m² sobre Ruta 9 en Distrito Roldán, apto local, showroom u oficina. Financiación 30% + 24 cuotas fijas en dólares. USD 170.100.',
  },
}

/**
 * Aplica el override al objeto de la propiedad (muta título y corrige typos en
 * la descripción). Llamar DESPUÉS de calcular el slug canónico para no cambiar
 * la URL. Devuelve el mismo objeto para encadenar.
 */
export function applyPropertySeoOverride<
  T extends { id: number; publication_title: string; description: string; description_only: string; rich_description: string },
>(property: T): T {
  const seo = PROPERTY_SEO[property.id]
  if (!seo) return property
  property.publication_title = seo.title
  // La descripción del emprendimiento viene anidada en el payload de la unidad.
  const dev = (property as { development?: { description?: string } }).development
  for (const [pattern, replacement] of seo.bodyFixes ?? []) {
    if (property.description) property.description = property.description.replace(pattern, replacement)
    if (property.description_only) property.description_only = property.description_only.replace(pattern, replacement)
    if (property.rich_description) property.rich_description = property.rich_description.replace(pattern, replacement)
    if (dev?.description) dev.description = dev.description.replace(pattern, replacement)
  }
  return property
}

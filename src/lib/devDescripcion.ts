// Estructura la descripción libre que viene del CRM para la landing de
// emprendimientos. El texto llega como líneas sueltas donde algunas son
// subtítulos ("El Proyecto", "Amenities y Servicios", "Financiación Accesible").
// Acá se detectan esos subtítulos y cada bloque se rutea a la sección del
// funnel que le corresponde. Si el texto no trae subtítulos, todo queda como
// párrafos de presentación (misma salida que antes, sin romper nada).

export interface BloqueDescripcion {
  titulo: string
  lineas: string[]
}

export interface PasoFinanciacion {
  etiqueta: string
  valor: string
}

export interface DescripcionEstructurada {
  /** Párrafos de presentación (antes del primer subtítulo). */
  presentacion: string[]
  /** Bloques generales del proyecto ("El Proyecto", "Condominio"…). */
  bloques: BloqueDescripcion[]
  /** Líneas del bloque de amenities/servicios. */
  amenities: string[]
  /** Texto del bloque de ubicación. */
  ubicacion: string[]
  financiacion: {
    texto: string[]
    /** Líneas tipo "Seña: 5 %" → pasos del plan. */
    pasos: PasoFinanciacion[]
  }
  /** Párrafos de cierre (después del plan de financiación). */
  cierre: string[]
}

// Subtítulo: línea corta, sin puntuación final, sin "etiqueta: valor" ni cifras.
function esSubtitulo(linea: string): boolean {
  return linea.length <= 60 && !/[.:;,!?]$/.test(linea) && !/[:\d]/.test(linea)
}

const PASO_RE = /^([^:]{2,24}):\s*(.{1,60})$/

export function estructurarDescripcion(lineasCrudas: string[]): DescripcionEstructurada {
  const lineas = lineasCrudas.map(l => l.trim()).filter(Boolean)
  const out: DescripcionEstructurada = {
    presentacion: [],
    bloques: [],
    amenities: [],
    ubicacion: [],
    financiacion: { texto: [], pasos: [] },
    cierre: [],
  }

  let actual: BloqueDescripcion | null = null
  const bloques: BloqueDescripcion[] = []
  lineas.forEach((linea, i) => {
    // Taglines decorativas del CRM ("CONDOMINIO | PASEO COMERCIAL | …").
    if (linea.includes('|')) return
    if (esSubtitulo(linea)) {
      const siguiente = lineas[i + 1]
      // Un subtítulo sin cuerpo (seguido de otro subtítulo o del final) es el
      // nombre del emprendimiento repetido: el H1 ya lo dice.
      if (!siguiente || esSubtitulo(siguiente) || siguiente.includes('|')) return
      actual = { titulo: linea, lineas: [] }
      bloques.push(actual)
      return
    }
    if (actual) actual.lineas.push(linea)
    else out.presentacion.push(linea)
  })

  for (const b of bloques) {
    if (/financ/i.test(b.titulo)) {
      let vioPasos = false
      let textoPostPasos = 0
      for (const l of b.lineas) {
        const m = l.match(PASO_RE)
        if (m) {
          out.financiacion.pasos.push({ etiqueta: m[1].trim(), valor: m[2].trim() })
          vioPasos = true
        } else if (!vioPasos) {
          out.financiacion.texto.push(l)
        } else if (textoPostPasos === 0) {
          // La aclaración que sigue al plan ("se pueden ajustar plazos…").
          out.financiacion.texto.push(l)
          textoPostPasos++
        } else {
          out.cierre.push(l)
        }
      }
    } else if (/amenit|servicio/i.test(b.titulo)) {
      out.amenities.push(...b.lineas)
    } else if (/ubicaci/i.test(b.titulo)) {
      out.ubicacion.push(...b.lineas)
    } else {
      out.bloques.push(b)
    }
  }

  return out
}

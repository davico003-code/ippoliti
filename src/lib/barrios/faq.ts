import type { Barrio } from '@/lib/barrios'

export interface FAQ {
  pregunta: string
  respuesta: string
}

export function buildBarrioFaqs(barrio: Barrio): FAQ[] {
  const faqs: FAQ[] = []
  const nombre = barrio.nombre

  faqs.push({
    pregunta: `¿Cuánto cuesta un lote en ${nombre}?`,
    respuesta: barrio.comercial.precioLoteDesdeUSD
      ? `Los lotes en ${nombre} arrancan en USD ${barrio.comercial.precioLoteDesdeUSD.toLocaleString('es-AR')}${barrio.comercial.notaComercial ? `. ${barrio.comercial.notaComercial}` : '.'} Pedí precio actualizado por WhatsApp.`
      : `Hoy los precios en ${nombre} se mueven con stock, por eso preferimos pasártelos al día por WhatsApp en lugar de publicar números que se quedan viejos. // TODO: completar con David`,
  })

  if (barrio.datosDuros.medidaLoteDesde) {
    const hasta = barrio.datosDuros.medidaLoteHasta ?? barrio.datosDuros.medidaLoteDesde
    faqs.push({
      pregunta: `¿De qué tamaño son los lotes en ${nombre}?`,
      respuesta:
        barrio.datosDuros.medidaLoteDesde === hasta
          ? `Lotes uniformes de ${barrio.datosDuros.medidaLoteDesde} m².`
          : `Lotes desde ${barrio.datosDuros.medidaLoteDesde} m² hasta ${hasta} m², según ubicación dentro del barrio.`,
    })
  }

  if (barrio.amenities.some((a) => a.id.includes('seguridad'))) {
    faqs.push({
      pregunta: `¿Cómo es la seguridad en ${nombre}?`,
      respuesta:
        barrio.seguridad.length > 1
          ? `${barrio.seguridad.join('. ')}.`
          : `Vigilancia 24hs con control de accesos. ${barrio.seguridad[0] ?? ''}`.trim(),
    })
  }

  if (barrio.ubicacion.distanciaCentroRosarioMin) {
    faqs.push({
      pregunta: `¿A cuánto está ${nombre} del centro de Rosario?`,
      respuesta: `Aproximadamente ${barrio.ubicacion.distanciaCentroRosarioMin} minutos en auto, accediendo por ${barrio.ubicacion.accesos[0] ?? 'autopista Rosario–Córdoba'}.`,
    })
  }

  if (barrio.datosDuros.distintivos?.length) {
    faqs.push({
      pregunta: `¿Qué tiene de distinto ${nombre} comparado con otros barrios del corredor?`,
      respuesta: barrio.datosDuros.distintivos.slice(0, 3).join('. ') + '.',
    })
  }

  faqs.push({
    pregunta: `¿Hay financiación disponible para comprar en ${nombre}?`,
    respuesta:
      '// TODO: completar con David — depende del lote y del desarrollador. Hoy hay opciones de pago en cuotas en USD para muchas unidades; pedinos el detalle al consultar por una unidad puntual.',
  })

  return faqs
}

export const HUB_FAQS: FAQ[] = [
  {
    pregunta: '¿Cuál es el mejor barrio privado de Funes para vivir todo el año?',
    respuesta:
      'No hay "mejor" universal — depende del comprador. Si querés barrio ya vivido y reventa demostrada, San Sebastián y Funes Hills Miraflores son los más consolidados. Si valorás lifestyle y diseño nuevo, Vida Lagoon y Funes Lakes están redefiniendo lo que se entiende por barrio privado en el corredor.',
  },
  {
    pregunta: '¿Qué barrios cerrados tienen acceso al agua en Funes?',
    respuesta:
      'Funes Lakes es el único barrio náutico real (cada lote tiene salida privada al agua sobre 10 km de costa). Vida Lagoon tiene laguna cristalina de 23.300 m² con playa de arena de cuarzo. Otros barrios del universo Vida tienen lagunas más chicas como amenity.',
  },
  {
    pregunta: '¿Cuánto cuesta un lote en barrio cerrado en Funes hoy?',
    respuesta:
      'El rango va de USD 60.000 en barrios en desarrollo accesibles a más de USD 300.000 en lotes premium. Funes Hills Miraflores arranca alrededor de USD 75.000 según stock. Como los precios se mueven, recomendamos pedir el listado actualizado por WhatsApp.',
  },
  {
    pregunta: '¿Qué barrio conviene para invertir en Funes en 2026?',
    respuesta:
      'Para upside de revalorización, los premium en desarrollo (Vida Lagoon, Funes Lakes) son los que más se apreciaron en los últimos 24 meses por escasez de producto comparable. Para reventa rápida y liquidez, San Sebastián sigue siendo el de mejor mercado secundario.',
  },
  {
    pregunta: '¿Cuál es la diferencia entre San Sebastián y Funes Lakes?',
    respuesta:
      'San Sebastián es un barrio consolidado de 587 lotes con 15 años de vida, Club House operativo y reventa demostrada — pensado para "vivir todo el año". Funes Lakes es un proyecto premium en desarrollo, único barrio náutico del corredor, pensado para un comprador que busca lifestyle internacional sin moverse de Rosario.',
  },
  {
    pregunta: '¿Qué barrio cerrado tiene golf en Funes?',
    respuesta:
      'Kentucky Club de Campo es el único del corredor con campo de golf de 18 hoyos dentro del perímetro. Sus 242 hectáreas también incluyen lago artificial de 7 ha y arboleda añosa.',
  },
  {
    pregunta: '¿Cuáles son los barrios privados más nuevos del corredor?',
    respuesta:
      'Los más nuevos son los del universo Vida (Lagoon, Barrio Cerrado, Club de Campo, Jardín, Green) y Funes Lakes, todos en distintas etapas de desarrollo. Vida Lagoon es el primer "barrio destino" del interior del país.',
  },
  {
    pregunta: '¿Cuánto se tarda desde Funes al centro de Rosario?',
    respuesta:
      'Entre 15 y 20 minutos en auto por autopista Rosario–Córdoba, según el barrio y la hora. San Sebastián y Kentucky están a unos 15 min, Funes Lakes a 20 min, Funes Hills Miraflores a 17 min.',
  },
]

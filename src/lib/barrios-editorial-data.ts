// src/lib/barrios-editorial-data.ts
// Editorial SEO data merged into BARRIOS at module load time (src/lib/barrios.ts).
// Fuente: documento maestro 11-landings/barrios_data.json + kentucky.html.
// David Flores · Mat. 0621 · CMCPSF · 2026-05-13

export interface StatEditorial {
  value: string
  unit: string
  label: string
}

export interface ContenidoSEO {
  intro: string
  vidaAdentro: string
  ubicacionTexto: string
  miradaBroker: string
  comparado: string
}

export interface FAQItem {
  pregunta: string
  respuesta: string
}

export interface BarrioPalette {
  from: string
  to: string
  accent: string
}

export interface BarrioEditorial {
  tier?: 'Premium' | 'Consolidado' | 'Consolidado con vida joven' | 'En desarrollo'
  tierColor?: string
  palette?: BarrioPalette
  elementoSvg?: string
  stats?: StatEditorial[]
  amenitiesEditorial?: string[]
  contenidoSEO?: ContenidoSEO
  faqExtendida?: FAQItem[]
  keywords?: string
  comparativaKeys?: string[]
  subtitulo?: string
  ubicacionEditorial?: string
  distanciaRosario?: string
}

export const BARRIOS_EDITORIAL: Record<string, BarrioEditorial> = {
  'vida-lagoon': {
    tier: 'En desarrollo',
    tierColor: '#666666',
    palette: { from: '#0E4E66', to: '#1A8FB0', accent: '#E8F4F8' },
    elementoSvg: 'olas',
    subtitulo: 'Laguna cristalina de 23.300 m² en Funes',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '20 min',
    stats: [
      { value: '1.042', unit: '', label: 'Lotes totales' },
      { value: '100', unit: 'ha', label: 'Superficie' },
      { value: '23.300', unit: 'm²', label: 'Laguna cristalina' },
      { value: '20', unit: 'min', label: 'A Rosario' },
    ],
    amenitiesEditorial: [
      'Laguna cristalina 23.300 m² con playa',
      'Club House frente al agua',
      'Escuela de náutica',
      'Embarcaderos SUP / kayak',
      'Canchas de tenis y paddle',
      'Pileta climatizada',
      'Seguridad 24 hs',
      'Tendido subterráneo',
    ],
    contenidoSEO: {
      intro:
        'Vida Lagoon es un desarrollo de 100 hectáreas en Funes organizado alrededor de una laguna cristalina Crystal Lagoons de 23.300 m². Distribuye 1.042 lotes en etapas, con los frentistas al agua como tier máximo del barrio.',
      vidaAdentro:
        'Club House frente a la laguna, playa de arena de uso común, escuela de náutica, embarcaderos de SUP y kayak, canchas de tenis y paddle. Seguridad 24 hs con doble portal. Perfil de vecindario: familias 30-45 años, varias mudadas desde Buenos Aires.',
      ubicacionTexto:
        'Funes, 20 minutos de Rosario por Autopista Rosario–Córdoba con acceso directo. Colegios privados de Funes (Belgrano, San Antonio, Woodlands) a menos de 15 minutos. GO Sanatorio sobre Ruta 9 a 10 minutos.',
      miradaBroker:
        'Vida Lagoon vende algo concreto: agua de baño dentro del barrio, todos los días, no como amenitie de fin de semana. El sistema Crystal Lagoons tiene casos probados en Chile, Uruguay y Brasil. Entrega por etapas hasta 2028: para vivir, andá; para invertir a 18-24 meses, margen ajustado por volatilidad cambiaria.',
      comparado:
        'Único proyecto del eje Funes con laguna cristalina apta para baño. Kentucky tiene golf y lago decorativo. Funes Lakes ofrece canales navegables sin baño cristalino. Vida CdC apunta a deporte sin componente acuática.',
    },
    faqExtendida: [
      {
        pregunta: '¿Cuánto cuesta un lote en Vida Lagoon?',
        respuesta:
          'Depende de etapa, ubicación y frente al agua. Los frentistas se cotizan muy por encima del segundo anillo. Te pasamos valores actualizados al consultar.',
      },
      {
        pregunta: '¿La laguna es de baño todo el año?',
        respuesta:
          'Es apta para baño los meses cálidos (octubre a marzo aprox.). El sistema Crystal Lagoons mantiene calidad de agua los 12 meses.',
      },
      {
        pregunta: '¿Cuáles son las expensas?',
        respuesta:
          'Incluyen seguridad, mantenimiento de laguna (ítem principal), espacios comunes y escuela de náutica. Cuadro actualizado al consultar.',
      },
      {
        pregunta: '¿Cuándo se entregan los lotes?',
        respuesta:
          'Etapas 1 y 2 entregadas. Las siguientes con cronograma escalonado hasta 2028. Confirma la desarrolladora al reservar.',
      },
      {
        pregunta: '¿Hay financiación?',
        respuesta:
          'Planes en cuotas en dólares, desde 24 hasta 60 cuotas según etapa. Para casos puntuales también se gestionan créditos hipotecarios.',
      },
    ],
    keywords: 'vida lagoon funes, barrio cerrado funes, laguna cristalina, crystal lagoons argentina, lotes en venta funes',
    comparativaKeys: ['Kentucky', 'Funes Lakes', 'Vida Club de Campo'],
  },

  kentucky: {
    tier: 'Premium',
    tierColor: '#C9A961',
    palette: { from: '#2D4A2E', to: '#4A7A4D', accent: '#F4E4B8' },
    elementoSvg: 'golf',
    subtitulo: 'El country tradicional de Funes con golf 18 hoyos',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '25 min',
    stats: [
      { value: '676', unit: '', label: 'Lotes totales' },
      { value: '242', unit: 'ha', label: 'Superficie' },
      { value: '1.200', unit: 'm²', label: 'Lote promedio' },
      { value: '18', unit: '', label: 'Hoyos de golf' },
    ],
    amenitiesEditorial: [
      'Cancha de golf 18 hoyos',
      'Lago artificial de 7 hectáreas',
      'Microclima por columna de eucaliptos',
      'Club House con restaurant',
      'Pileta climatizada',
      'Canchas de tenis y paddle',
      'Espacio de equitación',
      'Escuela de golf',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'Kentucky es el club de campo decano de Funes. Nacido en los 90, fue de los proyectos que empujó el crecimiento premium fuera de Rosario y legitimó la idea de vivir en barrio cerrado en la zona. Sus 242 hectáreas distribuyen 676 lotes con un promedio cercano a los 1.200 m², algo difícil de replicar hoy por costos y densidad.',
      vidaAdentro:
        'Lo primero que se percibe es físico: una columna frondosa de eucaliptos genera un microclima que no se siente en otros barrios. La arquitectura promedio supera los 400 m² construidos, con firmas de arquitectos reconocidos y predominio del estilo country americano y mediterráneo, distinto al minimalismo de los desarrollos nuevos. Muchas propiedades están retiradas del frente, con vegetación que las separa de la calle. La vida social pasa por el Club House, el campo de 18 hoyos y los torneos mensuales.',
      ubicacionTexto:
        'Funes, acceso por colectora de Ruta 9. 25 minutos del centro de Rosario por autopista, 5 del centro de Funes. Cercanía a los colegios de Funes (Belgrano, San Antonio, Woodlands) y a los de Fisherton (Inglés, San Patricio, Dante). GO Sanatorio a 10 minutos. Aeropuerto a 20.',
      miradaBroker:
        'Kentucky se vende solo y, a la vez, no se vende tan fácil. Buena parte del stock no llega al portal: las casas se mueven entre contactos, family offices y redes privadas antes de publicarse. Eso obliga a tener el barrio mapeado y a trabajar con tiempo. Para perfil aspiracional puro hay alternativas más nuevas. Para perfil patrimonial-tradicional, donde se valora prestigio histórico y discreción, no hay reemplazo en la zona. En pandemia se aceleró la valorización porque mucha gente que tenía Kentucky como segunda residencia se mudó definitivamente.',
      comparado:
        'Único barrio con cancha de golf de 18 hoyos en la zona. Vida CdC tiene practice con 3 greens-isla, distinto producto. En lote promedio (1.200 m²) y superficie (242 ha) está por encima de cualquier desarrollo nuevo. No compite por infraestructura moderna sino por marca histórica y tipología de propietario.',
    },
    faqExtendida: [
      {
        pregunta: '¿Vive Lionel Messi en Kentucky?',
        respuesta:
          'Sí, es público que Lionel Messi tiene su residencia en Kentucky cuando está en Rosario. Históricamente otras figuras del fútbol argentino también eligieron el barrio (Mascherano, Maxi Rodríguez, Cristian González entre los más mencionados). El perfil del vecindario es transversal: figuras del deporte que buscan privacidad, más una mayoría de empresarios y desarrolladores rosarinos de bajo perfil.',
      },
      {
        pregunta: '¿Cuánto cuesta una propiedad en Kentucky?',
        respuesta:
          'Los valores están en el tier alto y varían según ubicación, lote y nivel de construcción. Buena parte del stock real no se publica y se mueve off-market — para acceder a esas oportunidades conviene trabajar con un broker que opere la zona.',
      },
      {
        pregunta: '¿El campo de golf es exclusivo?',
        respuesta:
          'Sí. Los 18 hoyos son de uso exclusivo de propietarios y sus invitados según reglamento del club. Hay categorías de socios y escuela activa.',
      },
      {
        pregunta: '¿Por qué dicen que Kentucky tiene microclima?',
        respuesta:
          'Por la columna de eucaliptos que rodea y atraviesa parte del barrio. La masa forestal madura genera sombra, retiene humedad y baja algunos grados la temperatura. Se percibe físicamente al ingresar, no es marketing.',
      },
      {
        pregunta: '¿Cómo se compra si las casas no se publican?',
        respuesta:
          'La mayoría de las operaciones premium se cierran entre redes privadas antes de llegar al portal abierto. Lo mejor es manifestar interés con un broker que opere Kentucky para que active red y te avise cuando aparece algo alineado. Trabajamos así habitualmente.',
      },
    ],
    keywords: 'kentucky funes club de campo, golf 18 hoyos rosario, country messi rosario, barrio cerrado premium funes, kentucky lotes en venta',
    comparativaKeys: ['Vida Lagoon', 'Funes Lakes', 'Vida Club de Campo'],
  },

  'funes-lakes': {
    tier: 'En desarrollo',
    tierColor: '#666666',
    palette: { from: '#0A3A5C', to: '#2A7AB0', accent: '#C8E6F2' },
    elementoSvg: 'islas',
    subtitulo: 'Barrio náutico de 8 islas conectadas',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '22 min',
    stats: [
      { value: '485', unit: '', label: 'Lotes totales' },
      { value: '50', unit: 'ha', label: 'Superficie' },
      { value: '8', unit: '', label: 'Islas' },
      { value: '10', unit: 'km', label: 'Costa privada' },
    ],
    amenitiesEditorial: [
      '8 islas con canales navegables',
      '10 km de costa privada',
      'Club House con vista panorámica',
      'Pileta y deck frente al agua',
      'Embarcaderos comunes',
      'Canchas de tenis y paddle',
      'Seguridad 24 hs con patrullaje',
      'Tendido subterráneo',
    ],
    contenidoSEO: {
      intro:
        'Funes Lakes es un sistema de 8 islas conectadas por canales internos sobre 50 hectáreas, diseñado por Estudio BO. 485 lotes distribuidos en las islas, muchos con frente directo a canal y opción de muelle propio.',
      vidaAdentro:
        'Los lotes con frente a canal permiten embarcaciones menores (kayak, vela, motor eléctrico). Varios ya tienen muelle privado. Club House sobre isla central con vista panorámica, restaurant, pileta, deck. Canchas de tenis y paddle. Patrullaje interno por agua y tierra.',
      ubicacionTexto:
        'Funes, sobre el eje de Av. Fuerza Aérea. 22 minutos de Rosario por autopista, 5 del centro de Funes. Colegios privados dentro de los 15 minutos. GO Sanatorio a 8.',
      miradaBroker:
        'Funes Lakes vende algo muy específico: vivir con costa privada y opción de muelle. Eso no es para todos. Los frentistas a canal valen 30-50% más que los internos y el mantenimiento del sistema de agua se refleja en expensas más altas. Pero la rotación es bajísima: el que entra raramente vende. No hay otro barrio náutico de canales en la zona.',
      comparado:
        'Único producto náutico de canales en la zona. Vida Lagoon ofrece laguna cristalina sin canales navegables. Kentucky tiene lago artificial decorativo. El diferencial concreto es la posibilidad de costa privada con muelle propio.',
    },
    faqExtendida: [
      {
        pregunta: '¿Se pueden tener embarcaciones con motor?',
        respuesta:
          'El reglamento permite vela, remo y motores eléctricos. Los motores a combustión no están permitidos para preservar la calidad del agua.',
      },
      {
        pregunta: '¿Todos los lotes tienen frente al agua?',
        respuesta:
          'Aproximadamente la mitad son frentistas directos. Los internos tienen acceso peatonal a costas comunes vía espacios verdes compartidos. La diferencia de valor entre frentista e interno es notable.',
      },
      {
        pregunta: '¿Cuánto cuestan las expensas?',
        respuesta:
          'Altas para la zona por el mantenimiento técnico permanente del sistema de canales. Te pasamos el valor exacto al consultar.',
      },
      {
        pregunta: '¿Es seguro para chicos vivir con canales?',
        respuesta:
          'El barrio tiene normativa específica de cercado perimetral para frentistas y barandas en zonas críticas. Como en cualquier propiedad con agua, la supervisión diaria es responsabilidad de los padres.',
      },
      {
        pregunta: '¿Quién mantiene los canales?',
        respuesta:
          'El consorcio contrata mantenimiento técnico permanente. El costo está incluido en las expensas.',
      },
    ],
    keywords: 'funes lakes, barrio nautico funes, lotes frente al agua santa fe, casa con muelle propio rosario, estudio bo funes',
    comparativaKeys: ['Vida Lagoon', 'Kentucky', 'Vida Club de Campo'],
  },

  'vida-club-de-campo': {
    tier: 'En desarrollo',
    tierColor: '#666666',
    palette: { from: '#1F4D2E', to: '#3D7050', accent: '#F0E8D0' },
    elementoSvg: 'golf',
    subtitulo: 'Practice de golf y Club House de autor',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '22 min',
    stats: [
      { value: '659', unit: '', label: 'Lotes totales' },
      { value: '135', unit: 'ha', label: 'Superficie' },
      { value: '3', unit: '', label: 'Greens-isla practice' },
      { value: '8', unit: '', label: 'Canchas tenis' },
    ],
    amenitiesEditorial: [
      'Practice de golf con 3 greens-isla',
      'Club House de autor (hormigón + madera)',
      '7-8 canchas de tenis polvo de ladrillo',
      'Pileta climatizada',
      'Cancha de fútbol',
      'Restaurant en Club House',
      'Salón de eventos',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'Vida Club de Campo distribuye 659 lotes de 1.000 a 1.270 m² sobre 135 hectáreas en Funes. Suma dos diferenciales: practice de golf propio con 3 greens-isla funcionales y un Club House de autor en hormigón visto y madera, planta octogonal con jardín central. Completan la propuesta 7-8 canchas de tenis de polvo de ladrillo.',
      vidaAdentro:
        'El practice atrae golfistas que quieren entrenar a diario sin la formalidad de un campo de 18 hoyos. Las canchas de tenis lo convierten en polo tenístico real: torneos y escuela activa. Vecindario mixto: mitad familias ya instaladas, mitad lotes en construcción.',
      ubicacionTexto:
        'Funes, sobre el eje principal, con acceso directo a autopista. 22 minutos de Rosario, 5 del centro de Funes. Colegios de Funes a 15 minutos. GO Sanatorio a 10.',
      miradaBroker:
        'Entendió cómo competir con Kentucky sin imitarlo. En vez de ofrecer un campo de 18 hoyos menor, ofrece un practice serio que cubre el 80% de la práctica habitual de un golfista, con costo de mantenimiento más bajo, lo que se refleja en expensas más razonables. Para familia ABC1 joven que quiere infraestructura premium sin la carga de un country tradicional, este es el barrio.',
      comparado:
        'Más chico y nuevo que Kentucky (135 vs 242 ha), pero con arquitectura más contemporánea y mayor cantidad de canchas de tenis. Frente a Funes Lakes, formato club tradicional vs náutico.',
    },
    faqExtendida: [
      {
        pregunta: '¿El practice reemplaza una cancha de 18 hoyos?',
        respuesta:
          'No, son productos distintos. El practice cubre driving, approach y putting — permite entrenar técnica y juego corto todos los días. Para 18 hoyos, los socios suelen ir al Jockey Club o Kentucky por convenio.',
      },
      {
        pregunta: '¿Cuánto se demora en construir?',
        respuesta:
          'El reglamento define plazos máximos desde la escrituración (24 a 36 meses típicamente). Hay arquitectos especializados en el barrio que podemos recomendar.',
      },
      {
        pregunta: '¿Cómo es el Club House?',
        respuesta:
          'Planta octogonal con jardín central, comedor con techo de madera y vista a las canchas, salón separable, deck exterior. Vale la pena visitarlo.',
      },
      {
        pregunta: '¿Qué stock tienen?',
        respuesta:
          'Stock actualizado contra el sistema central. Lotes en distintas ubicaciones (frente al practice, sobre canchas, internos) y valores. Pedinos el listado al día.',
      },
      {
        pregunta: '¿Restaurant abierto al público?',
        respuesta:
          'Restringido a propietarios e invitados según reglamento. Para conocer el espacio, la visita guiada con almuerzo se coordina con tu broker.',
      },
    ],
    keywords: 'vida club de campo funes, practice golf funes, canchas tenis polvo ladrillo, club house arquitectura, barrio cerrado funes premium',
    comparativaKeys: ['Kentucky', 'Vida Lagoon', 'Funes Lakes'],
  },

  'san-sebastian': {
    tier: 'Consolidado con vida joven',
    tierColor: '#3D8B5C',
    palette: { from: '#1A5C38', to: '#2D7A4F', accent: '#E8F4EE' },
    elementoSvg: 'trazado',
    subtitulo: 'Consolidado con generador eléctrico para todo el barrio',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '23 min',
    stats: [
      { value: '587', unit: '', label: 'Lotes totales' },
      { value: '68', unit: 'ha', label: 'Superficie' },
      { value: '100%', unit: '', label: 'Cobertura generador' },
      { value: '20+', unit: 'años', label: 'De comunidad' },
    ],
    amenitiesEditorial: [
      'Generador eléctrico cobertura total',
      'Club House con restaurant',
      'Pileta climatizada',
      'Canchas de tenis y paddle',
      'Cancha de fútbol',
      'SUM para eventos',
      'Forestación madura',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'San Sebastián es uno de los pioneros de Funes y está casi totalmente habitado. 68 hectáreas, 587 lotes, diseño de Estudio BO. Diferencial técnico concreto: generador eléctrico que alimenta el barrio completo durante cortes generales. En una zona con cortes prolongados frecuentes, eso es calidad de vida real.',
      vidaAdentro:
        'Forestación de décadas en calles internas, casas terminadas en gran mayoría, rotación baja. Club House con restaurant, pileta climatizada, tenis, paddle, fútbol. Vecindario transversal: jóvenes con hijos chicos, familias maduras con adolescentes, adultos sin chicos.',
      ubicacionTexto:
        'Funes, acceso desde colectora de Ruta 9. 23 minutos de Rosario por autopista, 3 del centro de Funes. Colegios privados (Belgrano, San Antonio, Woodlands, Northfield) dentro de los 10 minutos. GO Sanatorio a 8.',
      miradaBroker:
        'Se vende solo: el comprador lo entiende en cinco minutos. No hace falta explicarle el proyecto porque el proyecto ya pasó — lo que ve es el resultado de 20+ años. Stock siempre limitado: las propiedades buenas se van en semanas. El diferencial del generador se aprecia el primer verano que cortan luz en todo Funes y la casa sigue con aire acondicionado.',
      comparado:
        'Frente a los Funes Hills, mayor superficie y comunidad más consolidada, más el generador completo. Frente a Kentucky, sin golf pero ticket más accesible. Frente a desarrollos en obra, certeza de barrio terminado.',
    },
    faqExtendida: [
      {
        pregunta: '¿Cómo funciona el generador eléctrico?',
        respuesta:
          'Es de uso colectivo, entra automáticamente ante cortes prolongados de EPE. Cubre todas las viviendas para servicios esenciales (iluminación, heladera, climatización). Mantenimiento en expensas.',
      },
      {
        pregunta: '¿Qué tipo de casas hay?',
        respuesta:
          'Arquitectura variada por las distintas épocas. Desde casas de los 2000 estilo tradicional hasta intervenciones modernas recientes. Algunos lotes con casa para refaccionar, otros listas para mudarse.',
      },
      {
        pregunta: '¿Cuánto vale el m² aproximadamente?',
        respuesta:
          'San Sebastián tiende al rango medio-alto de la zona. Las casas terminadas se valuan mejor por la consolidación del barrio. Te pasamos comparables al consultar.',
      },
      {
        pregunta: '¿Es buen barrio para chicos?',
        respuesta:
          'Sí. Calles internas seguras, bicicletas circulando, doble portal con seguridad 24 hs. La comunidad tiene chicos de varias edades.',
      },
      {
        pregunta: '¿Hay vida social en el Club House?',
        respuesta:
          'Restaurant abierto a propietarios e invitados, eventos sociales frecuentes. No es bar nocturno — es espacio de comidas y reuniones.',
      },
    ],
    keywords: 'san sebastian funes, barrio cerrado consolidado funes, generador electrico barrio, estudio bo funes, lotes en venta funes',
    comparativaKeys: ['Kentucky', 'Funes Hills Cadaqués', 'Vida Club de Campo'],
  },

  'funes-hills-san-marino': {
    tier: 'Consolidado',
    tierColor: '#1A5C38',
    palette: { from: '#3A4A55', to: '#5A6A75', accent: '#E0E6EC' },
    elementoSvg: 'rayos',
    subtitulo: 'Comunidad chica con grupo electrógeno integrado',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '22 min',
    stats: [
      { value: 'Chica', unit: '', label: 'Escala' },
      { value: '100%', unit: '', label: 'Cobertura electrógeno' },
      { value: 'Sí', unit: '', label: 'Tendido subterráneo' },
      { value: '24h', unit: '', label: 'Seguridad' },
    ],
    amenitiesEditorial: [
      'Grupo electrógeno integrado',
      'Tendido subterráneo',
      'Club House funcional',
      'Pileta y deck',
      'Canchas de tenis',
      'SUM',
      'Forestación en maduración',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'Funes Hills San Marino es uno de los sub-barrios del cluster Funes Hills, sobre Av. Fuerza Aérea. Escala deliberadamente menor que otros barrios de la zona — vecindario donde se conoce a todos. Diferencial técnico: grupo electrógeno integrado.',
      vidaAdentro:
        'Comunidad íntima: se conoce a todos, los chicos se mueven libres, los eventos los organizan los vecinos. Club House funcional, pileta, canchas de tenis. No hay golf ni equitación. Vecindario maduro: familias con hijos preadolescentes que valoran la calma.',
      ubicacionTexto:
        'Funes, sobre Av. Fuerza Aérea. 22 minutos de Rosario, 5 del centro de Funes, 12 de Fisherton. Colegios privados de Funes a menos de 8 minutos. GO Sanatorio a 10.',
      miradaBroker:
        "Para clientes que vienen de Buenos Aires o del exterior y dicen 'no quiero un barrio gigante donde no conozca a nadie', es de los pocos donde se cumple. Escala chica = comunidad funcional, expensas razonables y stock limitado. El grupo electrógeno es decisivo para trabajo desde casa o adultos mayores. No es barrio para flipping — es para tenencia.",
      comparado:
        'Dentro del cluster Funes Hills: San Marino es el más chico e íntimo, Cadaqués el de lotes generosos, Miraflores el deportivo. Frente a San Sebastián, más chico pero ticket más accesible.',
    },
    faqExtendida: [
      {
        pregunta: '¿Cuál es la diferencia entre los Funes Hills?',
        respuesta:
          'Tres barrios con reglamento compartido. San Marino: chico, íntimo. Cadaqués: lotes generosos en tierras altas con boulevard. Miraflores: deportivo, 4 canchas de tenis.',
      },
      {
        pregunta: '¿Las expensas son más bajas por ser chico?',
        respuesta:
          'En general sí, más accesibles que los premium por escala. Te pasamos el cuadro actualizado al consultar.',
      },
      {
        pregunta: '¿Es buen barrio para chicos chicos?',
        respuesta:
          'Muy bueno para edad escolar. Para 0-5 años, infraestructura funcional pero no abundante: pileta y parque, sin amenities específicos.',
      },
      {
        pregunta: '¿Qué arquitectura permite el reglamento?',
        respuesta:
          'Contemporánea con diversidad — casas tradicionales y minimalistas. Conviene consultar el reglamento específicamente antes de presentar planos.',
      },
      {
        pregunta: '¿Se valoriza con el tiempo?',
        respuesta:
          'Sí, lento pero sostenido. Consolidación del cluster y baja rotación interna sostienen valuaciones crecientes. Para inversión patrimonial de largo plazo.',
      },
    ],
    keywords: 'funes hills san marino, barrio cerrado chico funes, grupo electrogeno barrio, comunidad intima funes, lotes funes hills',
    comparativaKeys: ['Funes Hills Cadaqués', 'Funes Hills Miraflores', 'San Sebastián'],
  },

  'funes-hills-cadaques': {
    tier: 'Consolidado',
    tierColor: '#1A5C38',
    palette: { from: '#3F5A2C', to: '#6B8847', accent: '#F0EBC8' },
    elementoSvg: 'arboles',
    subtitulo: 'Lotes de 800 m² en las tierras altas de Funes',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '23 min',
    stats: [
      { value: '800', unit: 'm²', label: 'Lote típico' },
      { value: 'Altas', unit: '', label: 'Tierras' },
      { value: 'Sí', unit: '', label: 'Boulevard forestado' },
      { value: 'Consolidado', unit: '', label: 'Estado' },
    ],
    amenitiesEditorial: [
      'Boulevard central forestado',
      'Lotes de 800 m²',
      'Tierras altas (sin riesgo hídrico)',
      'Club House compartido',
      'Pileta común',
      'Canchas de tenis',
      'Forestación madura',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'Funes Hills Cadaqués distribuye lotes de 800 m² sobre tierras altas de Funes (dato técnico relevante en zonas con napas variables). Boulevard central forestado con arboleda de más de 15 años, arquitectura contemporánea, comunidad consolidada.',
      vidaAdentro:
        'Los 800 m² permiten casa con jardín amplio, pileta privada y estacionamiento doble sin sentirse apretado. El boulevard central es el espacio público más distintivo del barrio. Club House compartido con resto del cluster. Vecindario maduro: profesionales con consultorios en Rosario.',
      ubicacionTexto:
        'Funes, acceso desde colectora de Ruta 9 y Av. Fuerza Aérea. 23 minutos de Rosario, 4 del centro de Funes. Colegios privados dentro de los 8 minutos. GO Sanatorio a 10.',
      miradaBroker:
        'Para quien quiere lote generoso sin pagar ticket Kentucky o Vida CdC. Los 800 m² alcanzan para casa de cuatro dormitorios con margen. La calidad de las tierras altas es diferencial técnico que se aprecia con los años: pisos secos, mejor comportamiento estructural. Buen barrio para vivir, buen barrio para inversión de largo plazo.',
      comparado:
        'Dentro del cluster Funes Hills, Cadaqués tiene los lotes más generosos y la planificación más distintiva. Frente a San Sebastián, sin generador completo pero con tierras altas y lotes mayores. Frente a los premium, ticket más accesible.',
    },
    faqExtendida: [
      {
        pregunta: '¿Por qué importa que sean tierras altas?',
        respuesta:
          'No tienen problemas de napa freática: pisos secos, sótanos posibles, mejor comportamiento estructural, menor humedad. En zona con napas variables, es diferencial técnico que se valora.',
      },
      {
        pregunta: '¿Qué arquitectura hay construida?',
        respuesta:
          'Diversidad. Casas tradicionales de los primeros años, contemporáneas con cubiertas planas y materiales nobles, intervenciones racionalistas. Reglamento permite variedad con rigor en alturas.',
      },
      {
        pregunta: '¿Los 800 m² alcanzan para casa familiar?',
        respuesta:
          'Sí, sobradamente. Una casa de 250-300 m² construidos en 800 m² deja buen jardín, pileta, estacionamiento doble y quincho.',
      },
      {
        pregunta: '¿Comparte servicios con los otros Funes Hills?',
        respuesta:
          'Algunos espacios comunes del cluster (pileta, canchas) son compartidos con reglamento específico. Cadaqués tiene identidad arquitectónica propia y boulevard exclusivo.',
      },
      {
        pregunta: '¿Cómo se distingue Cadaqués al recorrerlo?',
        respuesta:
          'El boulevard central con forestación de 15+ años. Calles internas más anchas que en barrios nuevos. Arboleda con sombra en verano y colores en otoño.',
      },
    ],
    keywords: 'funes hills cadaques, lotes 800 m2 funes, tierras altas funes, boulevard barrio cerrado, barrio cerrado consolidado funes',
    comparativaKeys: ['Funes Hills San Marino', 'Funes Hills Miraflores', 'San Sebastián'],
  },

  'funes-hills-miraflores': {
    tier: 'Consolidado',
    tierColor: '#1A5C38',
    palette: { from: '#7A3A2C', to: '#A65540', accent: '#F5E0D0' },
    elementoSvg: 'tenis',
    subtitulo: 'Polo tenístico del cluster Funes Hills',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '22 min',
    stats: [
      { value: '308', unit: '', label: 'Lotes totales' },
      { value: '800-1.215', unit: 'm²', label: 'Rango de lote' },
      { value: '4', unit: '', label: 'Canchas tenis pdl' },
      { value: 'Av. F. Aérea', unit: '4204', label: 'Ubicación' },
    ],
    amenitiesEditorial: [
      '4 canchas de tenis polvo de ladrillo',
      'Club House con restaurant',
      'Escuela de tenis',
      'Cancha de fútbol',
      'Pileta común',
      'Salón de eventos',
      'Forestación interna',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'Funes Hills Miraflores es el sub-barrio deportivo del cluster Funes Hills. 308 lotes de 800 a 1.215 m² sobre Av. Fuerza Aérea 4204, rodeando 4 canchas de tenis de polvo de ladrillo. Que un barrio cerrado de la zona mantenga 4 canchas pdl funcionales es indicador del nivel del club interno.',
      vidaAdentro:
        'Vida deportiva todo el año: torneos internos mensuales, escuela de chicos, partidos los fines de semana. Club House con vista a las canchas. Vecindario con perfil deportivo: familias con hijos en edad activa (8 a 16 años) que practican tenis, fútbol, ciclismo.',
      ubicacionTexto:
        'Funes, Av. Fuerza Aérea 4204. 22 minutos de Rosario por autopista, 5 del centro de Funes. Colegios privados de Funes y Fisherton (12 minutos). GO Sanatorio a 10.',
      miradaBroker:
        'Para familias tenísticas o con perfil deportivo definido. Las 4 canchas pdl son propuesta única en la zona — ningún otro barrio cerrado mantiene esa cantidad de canchas de polvo de ladrillo funcionales. Para chicos que entrenan en serio, la casa de los padres es a la vez el club. Si la familia no es tenística, parte del ticket se paga por algo que no se va a usar.',
      comparado:
        'Dentro del cluster Funes Hills, Miraflores es el más deportivo. Cadaqués apunta a lotes generosos. San Marino a comunidad chica. Frente a Kentucky o Vida CdC, sin golf pero con tenis pdl en cantidad notable.',
    },
    faqExtendida: [
      {
        pregunta: '¿Por qué importan las canchas de polvo de ladrillo?',
        respuesta:
          'Es la superficie del tenis sudamericano y europeo continental. Rinde técnica más elaborada que el cemento (cambios de ritmo, slices). Es la superficie de Roland Garros. Mantener 4 canchas pdl funcionales requiere mantenimiento intensivo.',
      },
      {
        pregunta: '¿Hay escuela de tenis para chicos?',
        respuesta:
          'Sí, con profesores estables y torneos internos. Muchos chicos arrancan a los 6-7 años y siguen hasta la adolescencia. La escuela admite hijos de invitados según cupo.',
      },
      {
        pregunta: '¿Cómo es el Club House?',
        respuesta:
          'Vista directa a las canchas, restaurant a socios e invitados, salón de eventos. Funcional, no exuberante. Fines de semana en torneos es punto de encuentro.',
      },
      {
        pregunta: '¿Es buen barrio si no juego tenis?',
        respuesta:
          'Sigue siendo barrio consolidado con todas las virtudes del cluster. Pero el diferencial real es tenístico — si no se aprovecha, se está pagando algo que no se usa.',
      },
      {
        pregunta: '¿Qué stock hay disponible?',
        respuesta:
          'Trabajamos con stock actualizado. Las ubicaciones cerca de las canchas tienen mayor demanda. Pedinos el listado al día.',
      },
    ],
    keywords: 'funes hills miraflores, canchas tenis polvo ladrillo funes, barrio deportivo funes, tenis profesional barrio cerrado, av fuerza aerea funes',
    comparativaKeys: ['Funes Hills Cadaqués', 'Funes Hills San Marino', 'Vida Club de Campo'],
  },

  'vida-barrio-cerrado': {
    tier: 'Consolidado con vida joven',
    tierColor: '#3D8B5C',
    palette: { from: '#5A4A2A', to: '#8A7A4A', accent: '#F0E8D0' },
    elementoSvg: 'trama-urbana',
    subtitulo: 'Centro comercial propio integrado al ingreso',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '21 min',
    stats: [
      { value: '294', unit: '', label: 'Lotes totales' },
      { value: '35', unit: 'ha', label: 'Superficie' },
      { value: 'Sí', unit: '', label: 'Centro comercial' },
      { value: 'Funes', unit: '', label: 'Ubicación' },
    ],
    amenitiesEditorial: [
      'Centro comercial propio',
      'Mini-market integrado',
      'Club House con pileta',
      'Canchas de tenis y paddle',
      'Cancha de fútbol',
      'SUM',
      'Áreas verdes amplias',
      'Seguridad 24 hs',
      'Fibra óptica',
    ],
    contenidoSEO: {
      intro:
        'Vida Barrio Cerrado tiene una característica que en la zona casi no se replica: centro comercial propio integrado al ingreso, con locales gastronómicos, mini-market, peluquería y servicios profesionales. 35 hectáreas, 294 lotes. Es la idea de neighborhood village americano aplicada a Funes.',
      vidaAdentro:
        'El centro comercial reduce dependencia del afuera: café, panadería, mini-market, peluquería, gimnasio y servicios profesionales a 3 minutos a pie. Club House integrado, lo que genera vida social activa. Pileta, canchas, SUM. Los locales abren progresivamente a medida que se completa la ocupación.',
      ubicacionTexto:
        'Funes, 21 minutos de Rosario por autopista, 5 del centro de Funes. Parte del cluster Vida junto a Lagoon, Jardín y Green. Colegios privados dentro de los 15 minutos. GO Sanatorio a 10.',
      miradaBroker:
        'Probablemente la propuesta más innovadora del cluster Vida. El centro comercial integrado viene de barrios americanos tipo Town Center — resuelve algo concreto: hoy en la zona, para tomar un café fuera de casa hay que manejar 5-10 minutos al centro de Funes. Acá está a 3 minutos a pie. Para inversión, el centro comercial es la apuesta más fuerte y el factor con mayor variabilidad: depende de qué tan rápido se ocupen los locales.',
      comparado:
        'Dentro del cluster Vida, propuesta comercial diferenciada. Lagoon vende laguna, Jardín conectividad a autopista, Green valor de entrada — Vida BC vende vida comercial caminable. Frente a consolidados, en construcción pero con servicio que ningún consolidado tiene.',
    },
    faqExtendida: [
      {
        pregunta: '¿Cuándo se entrega Vida Barrio Cerrado?',
        respuesta:
          'Por etapas. Las iniciales ya están entregadas con habitabilidad. Las siguientes en cronograma escalonado hasta 2027-2028. El centro comercial tiene operativos sus primeros locales.',
      },
      {
        pregunta: '¿El centro comercial es de uso público o solo socios?',
        respuesta:
          'De uso de propietarios e invitados, con regulación de acceso. Algunos servicios (gastronomía) pueden tener accesos diferenciados según el operador.',
      },
      {
        pregunta: '¿Qué tipo de locales tiene?',
        respuesta:
          'Vida diaria: café, panadería, mini-market, peluquería, gimnasio, servicios profesionales (médicos, abogados, contadores) y gastronomía. Mix definitivo depende de qué operadores se confirmen.',
      },
      {
        pregunta: '¿Hay descuento para propietarios?',
        respuesta:
          'Cada local define sus condiciones independientemente. Varios operadores ofrecen descuentos para propietarios pero el reglamento no obliga descuentos.',
      },
      {
        pregunta: '¿Cómo influye el centro comercial en las expensas?',
        respuesta:
          'El centro comercial tiene gestión propia separada por su naturaleza comercial. La estructura de costos del barrio se balancea con el ingreso de los locales.',
      },
    ],
    keywords: 'vida barrio cerrado funes, barrio cerrado con centro comercial, town center funes, vida cluster funes, lotes en venta funes',
    comparativaKeys: ['Vida Lagoon', 'Vida Jardín', 'Vida Green'],
  },

  'vida-jardin': {
    tier: 'En desarrollo',
    tierColor: '#666666',
    palette: { from: '#3A5A3F', to: '#6A8A6F', accent: '#E8F0E8' },
    elementoSvg: 'jardin',
    subtitulo: 'Acceso directo a la autopista',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '20 min',
    stats: [
      { value: '242', unit: '', label: 'Lotes totales' },
      { value: '800-1.100', unit: 'm²', label: 'Rango de lote' },
      { value: 'Directo', unit: '', label: 'Acceso autopista' },
      { value: '20', unit: 'min', label: 'A Rosario' },
    ],
    amenitiesEditorial: [
      'Acceso directo a autopista',
      'Lotes 800-1.100 m²',
      'Club House con pileta',
      'Canchas de tenis y paddle',
      'SUM',
      'Áreas verdes compartidas',
      'Forestación en desarrollo',
      'Seguridad 24 hs',
    ],
    contenidoSEO: {
      intro:
        'Vida Jardín se distingue por ubicación estratégica: acceso directo a la autopista, sin colectoras. 242 lotes de 800 a 1.100 m². Para profesionales que viajan a Rosario a diario o se mueven a Buenos Aires/Córdoba con frecuencia, ese diferencial logístico ahorra 5-10 minutos por viaje.',
      vidaAdentro:
        "Lotes amplios para casas familiares con jardín generoso. Club House con pileta, canchas de tenis, SUM. Filosofía: 'jardín privado, comunidad pública'. Vecindario en formación: profesionales jóvenes con hijos, gente que valora salir rápido del barrio.",
      ubicacionTexto:
        'Funes, acceso directo a Autopista Rosario–Córdoba (sin colectoras). 20 minutos de Rosario, 5 del centro de Funes. Parte del cluster Vida.',
      miradaBroker:
        'Propuesta simple y eficaz: barrio cerrado bien hecho, lotes generosos, acceso logístico óptimo. No tiene amenities exuberantes pero tampoco intenta competir con Kentucky o Vida Lagoon. Lo que vende es simplicidad y logística — para profesionales jóvenes que viajan mucho a Rosario, este es de los más razonables. El acceso directo a autopista ahorra horas anuales reales.',
      comparado:
        'Dentro del cluster Vida, no tiene la potencia de Lagoon ni la innovación de Vida BC, pero tiene la mejor logística. Frente a Green, lotes más grandes y ubicación más madura.',
    },
    faqExtendida: [
      {
        pregunta: "¿Qué significa 'acceso directo a la autopista'?",
        respuesta:
          'El portal del barrio conecta directamente con la rama de ingreso a la Autopista Rosario–Córdoba, sin transitar por colectora. En hora pico evita demoras de 5-10 minutos vs barrios con colectora.',
      },
      {
        pregunta: '¿Cuándo se entrega?',
        respuesta:
          'Por etapas. Las primeras entregadas y habitables. Las siguientes con cronograma escalonado. Fecha exacta de cada lote se confirma al reservar.',
      },
      {
        pregunta: '¿Cómo se compara con Vida Green?',
        respuesta:
          'Vida Jardín tiene lotes más grandes (800-1.100 m² vs 500-700) y ticket más alto. Green es la entrada al cluster Vida desde valor y target más joven.',
      },
      {
        pregunta: '¿Es buen barrio para chicos?',
        respuesta:
          'Sí. Casas con jardín generoso, club house con pileta y canchas, cercanía a colegios. Comunidad infantil en formación.',
      },
      {
        pregunta: '¿Hay financiación?',
        respuesta:
          'Planes en cuotas en dólares con distintas modalidades según etapa. Para casos puntuales se gestionan créditos hipotecarios.',
      },
    ],
    keywords: 'vida jardin funes, barrio cerrado autopista, acceso directo autopista rosario cordoba, vida cluster funes, lotes en funes',
    comparativaKeys: ['Vida Lagoon', 'Vida Barrio Cerrado', 'Vida Green'],
  },

  'vida-green': {
    tier: 'En desarrollo',
    tierColor: '#666666',
    palette: { from: '#2A6A4A', to: '#4F9A6F', accent: '#E0F0E5' },
    elementoSvg: 'verde-fresco',
    subtitulo: 'Entrada al cluster Vida desde valor',
    ubicacionEditorial: 'Funes, Santa Fe',
    distanciaRosario: '21 min',
    stats: [
      { value: '419', unit: '', label: 'Lotes totales' },
      { value: '500-700', unit: 'm²', label: 'Rango de lote' },
      { value: 'Mediados', unit: '2026', label: 'Entrega prevista' },
      { value: '21', unit: 'min', label: 'A Rosario' },
    ],
    amenitiesEditorial: [
      'Club House con pileta',
      'Canchas de tenis y paddle',
      'Cancha de fútbol',
      'SUM',
      'Áreas verdes amplias',
      'Parque infantil',
      'Forestación inicial',
      'Seguridad 24 hs',
      'Fibra óptica',
    ],
    contenidoSEO: {
      intro:
        'Vida Green es la entrada al cluster Vida desde valor. 419 lotes de 500 a 700 m² apuntan a parejas jóvenes y familias en formación que buscan barrio cerrado con ticket más accesible. Entrega prevista mediados de 2026: ventana de inversión interesante en pre-entrega.',
      vidaAdentro:
        'Casas tipo 150-200 m² construidos en lotes 500-700 m², sin sentirse apretado. Club House con pileta, canchas, SUM. Perfil: parejas jóvenes, primer hogar familiar, profesionales en formación. Es el barrio donde se arma la primera comunidad — chicos que crecen juntos, parejas que se hacen amigas en los primeros años.',
      ubicacionTexto:
        'Funes, parte del cluster Vida. 21 minutos de Rosario por autopista, 5 del centro de Funes. Colegios privados dentro de los 15 minutos. GO Sanatorio a 10.',
      miradaBroker:
        'Para parejas jóvenes que quieren entrar al ecosistema de barrios cerrados desde ticket razonable. No es para amenities premium ni lotes grandes — es para primera casa propia en barrio cerrado, segura, con infraestructura nueva y comunidad fresca. Timing: comprar pre-entrega permite capturar apreciación de 15-25% típica entre pre-obra y obra terminada.',
      comparado:
        'El más accesible de los Vida. Frente a Lagoon (premium), Vida BC (centro comercial) y Jardín (autopista directa), Green es la puerta de entrada desde valor. Frente a consolidados a ticket similar, ofrece infraestructura nueva y upside de pre-entrega.',
    },
    faqExtendida: [
      {
        pregunta: '¿Cuándo se entrega Vida Green?',
        respuesta:
          'Mediados de 2026 según cronograma de la desarrolladora. Las primeras etapas avanzan en obra activa. Fecha exacta de cada lote se confirma al reservar.',
      },
      {
        pregunta: '¿Es buena inversión comprar en pre-entrega?',
        respuesta:
          'Históricamente, los lotes pre-entrega de la zona se aprecian 15-25% entre reserva y entrega, asumiendo estabilidad cambiaria. Conviene evaluarlo como inversión patrimonial de mediano plazo, no flipping rápido.',
      },
      {
        pregunta: '¿Los lotes de 500 m² alcanzan para casa familiar?',
        respuesta:
          'Sí, para casa tipo (3-4 dormitorios, 150-200 m² construidos). Los 500-700 m² alcanzan con margen para jardín, pileta moderada y estacionamiento.',
      },
      {
        pregunta: '¿Qué stock tienen?',
        respuesta:
          'Stock vivo actualizado contra la desarrolladora. Lotes en distintas ubicaciones y etapas. Pedinos el listado al día por WhatsApp.',
      },
      {
        pregunta: '¿Cómo es el reglamento de construcción?',
        respuesta:
          'Define alturas máximas, retiros mínimos y lineamientos estéticos. Permite arquitectura contemporánea con flexibilidad.',
      },
    ],
    keywords: 'vida green funes, lotes 500 m2 funes, barrio cerrado entrega 2026, primera casa barrio cerrado, vida cluster pre entrega',
    comparativaKeys: ['Vida Lagoon', 'Vida Jardín', 'Vida Barrio Cerrado'],
  },
}

export function getBarrioEditorial(slug: string): BarrioEditorial | undefined {
  return BARRIOS_EDITORIAL[slug]
}

// Lookup desde el "nombre" usado por comparativaKeys (humano, con tildes/espacios)
// hacia el slug usado por las rutas.
export const BARRIO_NOMBRE_TO_SLUG: Record<string, string> = {
  'Vida Lagoon': 'vida-lagoon',
  Kentucky: 'kentucky',
  'Funes Lakes': 'funes-lakes',
  'Vida Club de Campo': 'vida-club-de-campo',
  'San Sebastián': 'san-sebastian',
  'Funes Hills San Marino': 'funes-hills-san-marino',
  'Funes Hills Cadaqués': 'funes-hills-cadaques',
  'Funes Hills Miraflores': 'funes-hills-miraflores',
  'Vida Barrio Cerrado': 'vida-barrio-cerrado',
  'Vida Jardín': 'vida-jardin',
  'Vida Green': 'vida-green',
}

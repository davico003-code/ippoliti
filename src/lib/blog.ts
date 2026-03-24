export interface BlogPost {
  slug: string
  title: string
  date: string          // YYYY-MM-DD
  dateDisplay: string   // human-readable
  source: string
  image: string         // placeholder path or external
  summary: string
  content: string       // full article body (HTML-safe plain text with paragraphs)
}

export const posts: BlogPost[] = [
  {
    slug: 'por-que-si-inmobiliaria-43-anos-historia-familiar-roldan',
    title: 'Por qué SI Inmobiliaria: 43 años de historia familiar en Roldán',
    date: '2025-11-15',
    dateDisplay: '15 de noviembre de 2025',
    source: 'elroldanense.com',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    summary:
      'Desde 1983, Susana Ippoliti construyó una inmobiliaria basada en la confianza, la cercanía y el conocimiento profundo de Roldán. Hoy, con Laura y David, SI Inmobiliaria sigue siendo la referencia del mercado local.',
    content: `Cuando Susana Ippoliti abrió las puertas de su inmobiliaria en Roldán en 1983, la ciudad era un pueblo tranquilo de la pampa santafesina con apenas unos miles de habitantes. Cuatro décadas después, Roldán se transformó en una de las ciudades con mayor crecimiento del Gran Rosario, y SI Inmobiliaria acompañó cada etapa de esa transformación.

La historia de SI Inmobiliaria es inseparable de la historia de Roldán. Susana fue testigo y protagonista del desarrollo urbano de la ciudad: desde los primeros loteos en el casco céntrico hasta la explosión de los barrios cerrados como Tierra de Sueños, Fincas de Roldán y Los Raigales. "Conocemos cada manzana, cada calle, cada barrio porque estuvimos ahí cuando se crearon", suele decir Susana.

Lo que distingue a SI Inmobiliaria de las grandes cadenas o franquicias inmobiliarias es su carácter familiar. Susana formó a sus hijos Laura y David en el oficio, transmitiendo no solo conocimientos técnicos sino también valores: la importancia de la palabra, el trato personalizado y la transparencia en cada operación. "Para nosotros cada cliente es un vecino, no un número", explica Laura, quien hoy lidera el área de ventas desde la oficina de Catamarca 775.

La inmobiliaria cuenta con estudio jurídico propio, un diferencial que pocos competidores pueden ofrecer. Esto permite agilizar trámites, verificar la documentación de cada propiedad y brindar seguridad legal completa tanto a compradores como a vendedores. David, por su parte, incorporó herramientas digitales para modernizar la gestión: desde publicación en portales inmobiliarios hasta recorridos virtuales y atención por WhatsApp.

El cambio de nombre a "SI Inmobiliaria" en 2024 marcó un hito: mantener la esencia familiar pero con una identidad renovada que refleja el compromiso de decir "sí" a cada desafío del mercado. Las dos letras representan las iniciales de Susana Ippoliti y, al mismo tiempo, una actitud positiva hacia el futuro.

Hoy, con oficinas en 1ro de Mayo 258 (administración) y Catamarca 775 (ventas), SI Inmobiliaria sigue siendo la inmobiliaria de referencia en Roldán. Más de 40 años de trayectoria, tres generaciones de compromiso y un conocimiento del mercado local que solo da la experiencia.`,
  },
  {
    slug: 'mercado-inmobiliario-roldan-como-saber-propiedad-bien-valuada',
    title: 'El mercado inmobiliario en Roldán: cómo saber si tu propiedad está bien valuada',
    date: '2025-08-20',
    dateDisplay: '20 de agosto de 2025',
    source: 'Entrevista El Roldanense, 2020',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    summary:
      'Una tasación profesional es clave para vender al precio justo. Susana Ippoliti explica qué factores determinan el valor real de una propiedad en Roldán y por qué no alcanza con mirar portales online.',
    content: `El mercado inmobiliario de Roldán tiene particularidades que lo distinguen de Rosario, Funes o cualquier otra ciudad de la región. Entender estas diferencias es fundamental para valuar correctamente una propiedad y no cometer errores que pueden costar miles de dólares.

"Muchos propietarios ponen el precio basándose en lo que ven en portales de internet, pero eso es un error grave", advierte Susana Ippoliti, fundadora de SI Inmobiliaria y con más de 40 años de experiencia en el mercado local. "Los precios publicados no son los precios de cierre. Una propiedad puede estar publicada a 120 mil dólares y venderse a 95 mil. Sin conocer el mercado real, es imposible fijar un precio correcto."

Los factores que determinan el valor de una propiedad en Roldán son múltiples y específicos de la zona. La ubicación dentro de la ciudad es determinante: no es lo mismo una casa en el casco céntrico, con todos los servicios y a metros de la plaza, que una vivienda en un barrio nuevo donde aún no llegó el gas natural o el asfalto.

El tamaño del lote tiene una incidencia particular en Roldán. A diferencia de Rosario, donde los terrenos son pequeños y caros, en Roldán los lotes de 300 a 600 metros cuadrados son la norma. Esto hace que la relación entre metros cubiertos y superficie total sea un factor clave en la valuación. Una casa de 150m² cubiertos en un lote de 600m² tiene un valor proporcionalmente diferente a la misma superficie en un lote de 300m².

La orientación de la propiedad, el estado de conservación, la antigüedad, los materiales de construcción y la existencia de mejoras como pileta, quincho o garage también influyen en el precio. Pero quizás el factor más importante es el barrio: en Roldán, la diferencia de precio entre un barrio abierto y un country puede ser del 40% o más para superficies similares.

"Nosotros tasamos y entregamos el informe en 24 horas", explica Susana. "No es solo un número: es un análisis del mercado actual con comparables reales de la zona, tendencias de precio y recomendaciones para maximizar el valor de venta."

SI Inmobiliaria realiza tasaciones profesionales desde 1983. Con oficinas en 1ro de Mayo 258 y Catamarca 775 en Roldán, el equipo de Susana, Laura y David conoce el valor real de cada metro cuadrado de la ciudad.`,
  },
  {
    slug: 'si-inmobiliaria-abre-funes-galeria-arte',
    title: 'SI Inmobiliaria abre en Funes: inmobiliaria + galería de arte',
    date: '2025-05-10',
    dateDisplay: '10 de mayo de 2025',
    source: 'infofunes.com.ar',
    image: 'https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=800&q=80',
    summary:
      'La expansión a Funes combina el negocio inmobiliario con una propuesta cultural única: un espacio donde el arte y las propiedades conviven bajo el mismo techo.',
    content: `SI Inmobiliaria dio un paso audaz en su expansión al abrir una nueva oficina en Funes que rompe con el formato tradicional de una inmobiliaria: el espacio funciona también como galería de arte contemporáneo, creando un punto de encuentro entre cultura y negocios inmobiliarios.

La idea surgió de la convicción de que una inmobiliaria puede ser mucho más que un lugar donde se firman contratos. "Queríamos crear un espacio donde la gente quiera venir, no solo cuando necesita comprar o alquilar, sino porque se siente atraída por lo que ofrecemos", explica el equipo de SI Inmobiliaria.

La oficina de Funes exhibe obras de artistas locales y regionales en rotación permanente. Las paredes que normalmente mostrarían planos y fotos de propiedades ahora alternan entre cuadros, fotografías artísticas y las fichas de los inmuebles en venta o alquiler. El resultado es un ambiente cálido, estéticamente cuidado y completamente diferente a cualquier otra inmobiliaria de la zona.

Esta apuesta por la cultura no es casual. Funes es una ciudad con un perfil sociocultural marcado: muchos de sus residentes son profesionales, artistas y emprendedores que valoran la estética y el diseño. Al posicionar la oficina como un espacio cultural, SI Inmobiliaria conecta con su público de una manera más profunda y genuina.

El modelo de negocio se mantiene intacto: venta y alquiler de propiedades en Funes y la zona oeste del Gran Rosario, tasaciones profesionales y asesoramiento jurídico con el respaldo de más de 40 años de experiencia. Lo que cambia es la experiencia del cliente al visitar la oficina.

La apertura en Funes complementa las dos oficinas que SI Inmobiliaria ya tiene en Roldán (1ro de Mayo 258 y Catamarca 775) y consolida la presencia de la empresa en las dos ciudades de mayor crecimiento de la zona oeste. Con esta expansión, SI Inmobiliaria reafirma su compromiso con la innovación sin perder su esencia familiar.

"Funes es una plaza natural para nosotros", señalan desde la empresa. "Muchos de nuestros clientes de Roldán se mudan a Funes y viceversa. Tener presencia en ambas ciudades nos permite ofrecer un servicio más completo."`,
  },
  {
    slug: 'de-susana-ippoliti-a-si-inmobiliaria-cambio-dice-si-futuro',
    title: 'De Susana Ippoliti a SI Inmobiliaria: el cambio que dice sí al futuro',
    date: '2024-08-01',
    dateDisplay: '1 de agosto de 2024',
    source: 'Comunicado agosto 2024',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    summary:
      'En agosto de 2024, la inmobiliaria fundada por Susana Ippoliti renovó su identidad. El nuevo nombre "SI" honra las iniciales de su fundadora y representa una actitud: decir sí a cada nuevo desafío.',
    content: `En agosto de 2024, la inmobiliaria más tradicional de Roldán dio un paso que muchos esperaban y pocos imaginaban: Susana Ippoliti Inmobiliaria se convirtió en SI Inmobiliaria. El cambio de nombre no fue un capricho de marketing sino una decisión meditada que refleja la evolución de una empresa familiar hacia su segunda generación de liderazgo.

Las letras "SI" encierran un doble significado cuidadosamente elegido. Por un lado, son las iniciales de Susana Ippoliti, la fundadora que en 1983 abrió la primera oficina en Roldán y construyó, ladrillo a ladrillo, una reputación basada en la confianza y el profesionalismo. Por otro lado, "SI" es una declaración de intenciones: decir sí al cambio, sí a la innovación, sí a las nuevas generaciones que toman la posta.

El proceso de rebranding incluyó una nueva identidad visual con el verde institucional como color protagonista, un logo moderno que mantiene la solidez de la marca y una renovación completa de la presencia digital. El sitio web fue rediseñado desde cero con tecnología de última generación, integrando el catálogo de propiedades en tiempo real, mapas interactivos y herramientas de búsqueda avanzada.

Laura y David, los hijos de Susana, lideran esta nueva etapa con la misma filosofía que heredaron: honestidad, cercanía y compromiso con cada cliente. "No cambiamos lo que somos. Cambiamos la forma de mostrarlo", explican. "Nuestra esencia sigue siendo la misma: una familia que acompaña a otras familias en las decisiones más importantes de su vida."

El cambio también se manifestó en la apertura de una nueva oficina de ventas en Catamarca 775, que complementa la oficina histórica de administración en 1ro de Mayo 258. Con esta nueva estructura, SI Inmobiliaria separó las áreas de negocio para brindar un servicio más especializado: ventas y tasaciones en Catamarca, administración de alquileres y asesoría legal en 1ro de Mayo.

La respuesta del mercado fue inmediata. Clientes de toda la vida reconocieron la marca renovada y nuevos clientes se acercaron atraídos por una imagen fresca que, sin embargo, lleva más de 40 años de experiencia detrás. "Lo mejor que nos dijeron fue: 'Siguen siendo ustedes, pero mejor'", comparte Laura con una sonrisa.

SI Inmobiliaria hoy opera en Roldán y Funes con un equipo comprometido, tecnología actual y la trayectoria más extensa de la zona. El "sí" no es solo un nombre: es una promesa de seguir diciendo sí a cada familia que confía en ellos.`,
  },
  {
    slug: 'inmobiliarias-en-funes',
    title: 'Las mejores inmobiliarias en Funes: guía completa 2025',
    date: '2026-01-20',
    dateDisplay: '20 de enero de 2026',
    source: 'SI Inmobiliaria',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    summary:
      'Guía para elegir inmobiliaria en Funes. Qué tener en cuenta, cómo funciona el mercado inmobiliario de Funes y por qué la trayectoria y el conocimiento local hacen la diferencia.',
    content: `Funes se consolidó como uno de los destinos residenciales más buscados del Gran Rosario. Con barrios como Funes Hills, Kentucky, Portal de Funes, María Eugenia Residences y una oferta que crece año a año, elegir la inmobiliaria correcta puede marcar la diferencia entre una buena operación y una experiencia frustrante.

¿Qué hace que una inmobiliaria en Funes sea confiable?

El mercado inmobiliario de Funes tiene particularidades que solo un profesional con experiencia local puede interpretar correctamente. No alcanza con publicar propiedades en un portal: se necesita conocer el terreno, los barrios, las normativas municipales, las tendencias de precio y, sobre todo, a las personas.

Una buena inmobiliaria en Funes debería ofrecer: conocimiento profundo de cada barrio y desarrollo, tasaciones basadas en datos reales de operaciones cerradas (no en precios de publicación), asesoramiento legal con abogados especializados en derecho inmobiliario, transparencia en las comisiones y los costos asociados a la operación, y un acompañamiento genuino desde la primera consulta hasta la firma de la escritura.

El mercado inmobiliario de Funes en 2025

Funes atraviesa un momento interesante. La demanda de casas con jardín y pileta se mantiene firme desde la pandemia, impulsada por familias que trabajan de forma remota o híbrida y priorizan la calidad de vida sobre la cercanía al centro de Rosario. Los barrios cerrados siguen siendo los más buscados, pero los barrios abiertos con buena infraestructura están ganando terreno por su relación precio-calidad.

Los terrenos en loteos nuevos representan una oportunidad para quienes quieren construir a medida. La clave está en evaluar correctamente la ubicación, los servicios disponibles, la orientación y el potencial de valorización. Un error frecuente es comprar el lote más barato sin analizar estos factores — y terminar pagando más a largo plazo.

Los valores en Funes varían enormemente según la zona. Un terreno en un country puede costar el doble que uno en barrio abierto, a igual superficie. Una casa de tres dormitorios en Funes Hills no tiene el mismo valor que una casa similar en el casco urbano. Estas diferencias solo las conoce quien opera en la zona hace años.

¿Por qué elegir SI Inmobiliaria en Funes?

SI Inmobiliaria opera en Funes con el respaldo de más de 40 años de trayectoria en el mercado inmobiliario regional. Fundada por Susana Ippoliti en 1983 en Roldán, la empresa expandió su presencia a Funes con una propuesta que combina experiencia, tecnología y un trato genuinamente personalizado.

Lo que nos diferencia es simple: conocemos cada calle, cada barrio, cada desarrollo de la zona porque llevamos décadas trabajando aquí. No somos una franquicia ni una plataforma digital impersonal. Somos una familia — Susana, Laura y David — que acompaña a otras familias en las decisiones más importantes de su vida.

Contamos con estudio jurídico propio para resolver cualquier tema legal de la operación, realizamos tasaciones profesionales gratuitas con informe en 24 horas, y administramos alquileres con total transparencia. Nuestra oficina en Funes combina el negocio inmobiliario con un espacio cultural, creando un ambiente donde nuestros clientes se sienten cómodos y bienvenidos.

Cómo contactarnos

Si estás buscando comprar, vender o alquilar en Funes, te invitamos a consultarnos sin compromiso. Podés escribirnos por WhatsApp al 341 210 1694, llamarnos al (341) 210-1694, o visitarnos en nuestras oficinas. Te contactamos en menos de 24 horas.

También podés solicitar una tasación profesional de tu propiedad completando el formulario en nuestra sección de tasaciones. En 24 horas te enviamos el informe con el valor real de mercado.`,
  },
  {
    slug: 'inmobiliarias-en-roldan',
    title: 'Inmobiliarias en Roldán: cómo elegir la mejor para tu operación',
    date: '2026-02-05',
    dateDisplay: '5 de febrero de 2026',
    source: 'SI Inmobiliaria',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    summary:
      'Roldán crece y la oferta inmobiliaria también. Te contamos qué mirar a la hora de elegir una inmobiliaria en Roldán y cómo asegurarte una operación segura.',
    content: `Roldán dejó de ser un pueblo hace tiempo. Con más de 30.000 habitantes y un crecimiento que no se detiene, la ciudad se posicionó como el destino estrella para familias del Gran Rosario que buscan casas amplias, barrios con servicios completos y un ritmo de vida más tranquilo. Naturalmente, la oferta de inmobiliarias en Roldán creció al mismo ritmo.

¿Cómo elegir la mejor inmobiliaria en Roldán?

Con tantas opciones disponibles, elegir la inmobiliaria correcta requiere evaluar algunos factores clave que van más allá del marketing y las fotos bonitas en redes sociales.

Trayectoria comprobable. Una inmobiliaria que lleva años operando en Roldán conoce la historia de cada barrio, sabe qué terrenos tienen problemas de escrituración, entiende los ciclos del mercado local y tiene una red de contactos que agiliza cualquier operación. Preguntá hace cuánto trabajan en Roldán y pedí referencias de clientes anteriores.

Asesoramiento legal incluido. Las operaciones inmobiliarias implican documentación compleja: boletos de compraventa, escrituras, certificados de dominio, libre deuda, aprobaciones municipales. Una inmobiliaria seria debería contar con asesoría legal especializada o, mejor aún, con estudio jurídico propio. Esto evita sorpresas y protege tu inversión.

Tasaciones basadas en datos reales. Desconfiá de quien te dice el precio que querés escuchar. Una buena tasación se basa en comparables reales — es decir, operaciones efectivamente cerradas en la zona, no en precios de publicación inflados. La diferencia puede ser del 20% o más.

Transparencia en comisiones. Antes de firmar cualquier autorización de venta, asegurate de entender exactamente cuánto cobra la inmobiliaria, qué servicios están incluidos y si hay costos adicionales. Las comisiones en Roldán varían entre el 3% y el 4% según la operación, pero cada inmobiliaria tiene su esquema.

Presencia física. En un mercado donde muchas operaciones se hacen por WhatsApp, tener una oficina donde ir a consultar personalmente sigue siendo un diferencial importante. Te da seguridad, te permite conocer al equipo y genera una relación de confianza que los mensajes de texto no logran.

El mercado inmobiliario de Roldán hoy

Roldán ofrece una variedad de opciones que pocas ciudades de su tamaño pueden igualar. Desde terrenos en loteos nuevos con financiación en pesos y dólares, hasta casas premium en countries como Tierra de Sueños, Fincas de Roldán y Los Raigales. Los departamentos en el centro también ganan tracción, especialmente para inversores que buscan renta.

Los precios en Roldán son sensiblemente más accesibles que en Funes y mucho más que en Rosario. Un terreno de 400m² con servicios completos puede conseguirse desde USD 25.000 en zonas en desarrollo. Casas de tres dormitorios con pileta arrancan en USD 90.000 en barrios abiertos. Esta relación precio-calidad de vida es la que sigue atrayendo familias año tras año.

SI Inmobiliaria: la inmobiliaria con más trayectoria en Roldán

Fundada en 1983 por Susana Ippoliti, SI Inmobiliaria es la inmobiliaria más antigua y experimentada de Roldán. Con dos oficinas en la ciudad — 1ro de Mayo 258 (administración) y Catamarca 775 (ventas) — y un equipo familiar conformado por Susana, Laura y David, ofrecemos un servicio que ninguna franquicia puede replicar: conocimiento profundo del terreno, trato personalizado y compromiso real con cada cliente.

Contamos con estudio jurídico propio, tasaciones gratuitas con informe en 24hs, administración de alquileres y presencia en los principales portales inmobiliarios. Más de 40 años de operaciones exitosas en Roldán nos respaldan.

¿Querés consultar? Escribinos por WhatsApp al 341 210 1694 o visitá nuestra sección de tasaciones para solicitar una valuación profesional sin costo.`,
  },
  {
    slug: 'comprar-casa-funes-roldan',
    title: 'Comprar casa en Funes o Roldán: todo lo que necesitás saber en 2025',
    date: '2026-03-01',
    dateDisplay: '1 de marzo de 2026',
    source: 'SI Inmobiliaria',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    summary:
      'Guía completa para comprar casa en Funes o Roldán. Comparativa de precios, barrios, trámites legales y consejos de expertos con más de 40 años de experiencia.',
    content: `La decisión de comprar una casa es probablemente la más importante que vas a tomar en tu vida. Y si estás evaluando Funes o Roldán como destino, estás mirando las dos ciudades con mejor proyección del Gran Rosario. Pero cada una tiene su perfil, sus ventajas y sus particularidades. Esta guía te ayuda a entender las diferencias y tomar la mejor decisión.

Funes vs Roldán: comparativa general

Ambas ciudades están sobre el corredor oeste de Rosario, conectadas por la Autopista Rosario-Córdoba. Funes está a 15 km del centro de Rosario; Roldán a 25 km. Esa diferencia de 10 km se traduce en precios: una propiedad similar cuesta entre un 20% y un 30% más en Funes que en Roldán.

Funes es ideal para quienes priorizan la cercanía a Rosario, buscan barrios cerrados premium con amenities completos y tienen un presupuesto más holgado. Es la ciudad elegida por muchos profesionales que trabajan en Rosario y quieren llegar en 20 minutos a su oficina.

Roldán es la opción para familias que buscan la mejor relación precio-calidad de vida. Los terrenos son más grandes, las casas más amplias y la ciudad tiene una identidad propia que no depende de Rosario. En los últimos años, Roldán sumó infraestructura de primer nivel: colegios, centros de salud, comercios y espacios recreativos.

¿Cuánto cuesta comprar casa en Funes?

Los valores en Funes varían enormemente según la ubicación. En barrios cerrados premium como Funes Hills o Kentucky, una casa de tres dormitorios con pileta parte de USD 180.000 y puede superar los USD 400.000 en propiedades de alta gama. En barrios abiertos, la misma tipología arranca en USD 120.000. Los terrenos en loteos nuevos van desde USD 35.000 a USD 80.000 según superficie y ubicación.

¿Cuánto cuesta comprar casa en Roldán?

Roldán ofrece valores considerablemente más accesibles. Casas de tres dormitorios con pileta en barrios como Tierra de Sueños o Los Raigales arrancan en USD 90.000. En el casco céntrico, propiedades más antiguas pero bien mantenidas pueden conseguirse desde USD 70.000. Los terrenos con servicios completos parten de USD 20.000 en zonas en desarrollo y USD 35.000 en barrios consolidados.

Qué mirar antes de comprar

Documentación legal. Es fundamental verificar que la propiedad tenga escritura, que no existan embargos, inhibiciones o deudas pendientes, y que los planos aprobados coincidan con la construcción real. Un error en este punto puede costarte años de trámites y miles de dólares. Por eso es imprescindible contar con asesoría legal especializada.

Estado real de la propiedad. Las fotos y los recorridos virtuales ayudan, pero nada reemplaza una visita presencial acompañado por un profesional que pueda identificar problemas estructurales, de humedad, de instalaciones o de terminaciones. Pedí siempre una inspección antes de ofertar.

Servicios del barrio. Verificá qué servicios tiene el barrio: gas natural, cloacas, agua corriente, asfalto, transporte público, cercanía a colegios y centros de salud. Algunos loteos nuevos ofrecen precios tentadores pero no tienen todos los servicios habilitados, lo que implica costos adicionales.

Financiación. Si no contás con el total en efectivo, consultá las opciones de financiación. Muchos desarrolladores ofrecen planes en cuotas en pesos o dólares. Los créditos hipotecarios UVA también son una opción para propiedades con escritura. Una inmobiliaria con experiencia puede guiarte en las alternativas disponibles.

¿Por qué consultar con SI Inmobiliaria?

Con más de 40 años operando en Roldán y Funes, somos la inmobiliaria que mejor conoce ambos mercados. Nuestro equipo — Susana, Laura y David — te asesora de forma honesta y personalizada, sin presión de venta. Contamos con estudio jurídico propio para garantizar la seguridad de la operación y realizamos tasaciones profesionales gratuitas.

Ya sea que busques tu primera casa, una inversión o cambiar a un hogar más grande, te acompañamos en todo el proceso. Consultanos por WhatsApp al 341 210 1694 o visitá nuestras oficinas en Roldán (Catamarca 775) y Funes. Te contactamos en menos de 24 horas.

Si estás pensando en vender antes de comprar, podés solicitar una tasación sin costo en nuestra sección de tasaciones. En 24 horas te enviamos el valor real de tu propiedad.`,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date))
}

// Copy editorial de la sección Intro de cada ficha de barrio (rediseño 2026-06).
// Redactado a partir de los datos curados de lib/barrios.ts (datosDuros,
// miradaBroker, distintivos). Registro rioplatense profesional, tono de
// broker — no folleto. Si un barrio no tiene entry, la ficha cae a
// contenidoSEO.intro como fallback.

export interface IntroEditorial {
  titulo: string
  parrafos: string[]
}

export const INTRO_EDITORIAL: Record<string, IntroEditorial> = {
  kentucky: {
    titulo: 'El clásico del corredor, con el único golf de 18 hoyos',
    parrafos: [
      'Kentucky no compite en la categoría de los barrios de moda: juega otro torneo. Son 242 hectáreas —el más grande del corredor— donde los lotes ocupan apenas un tercio de la superficie y el resto es golf, lago y arboledas que tardaron cincuenta años en formarse. El campo de 18 hoyos dentro del perímetro no existe en ningún otro barrio de la zona.',
      'Es un barrio maduro, de identidad fuerte y vecindario discreto, con diseño urbano de Estudio BO. El ticket es alto y el comprador típico ya pasó por otros barrios: acá no se compra lifestyle de lanzamiento, se compra pertenencia. Para el golfista, directamente no hay segunda opción en Funes.',
      'Como inversión, la lógica es la del activo escaso: lotes de 1.200 m² en el barrio con mayor identidad propia del corredor, donde la arboleda madura y la escala no se pueden replicar.',
    ],
  },
  'san-sebastian': {
    titulo: 'Consolidación real sobre la autopista',
    parrafos: [
      'San Sebastián es la respuesta corta a la pregunta "¿dónde se conserva mejor el valor?". No es el barrio más nuevo ni el de los lotes más grandes: es un barrio vivido, con 587 lotes en 68 hectáreas, dos bosques internos y una plaza central de más de 30.000 m² verdes que ya funciona como centro de la vida cotidiana.',
      'El acceso directo a la autopista Rosario–Córdoba resuelve la ecuación diaria de quien trabaja en Rosario, y el generador eléctrico para todo el barrio resuelve la otra pregunta que en Funes importa: qué pasa cuando se corta la luz. Comunidad joven, dinámica, de escala media.',
      'Para el comprador que busca entrar a un barrio que ya demostró reventa y liquidez, es de los nombres más seguros del corredor.',
    ],
  },
  'vida-lagoon': {
    titulo: 'La laguna cristalina que cambió el corredor',
    parrafos: [
      'Vida Lagoon trajo a Funes un concepto que en otros mercados ya está probado hace veinte años: el barrio destino. La laguna cristalina de 23.300 m² con playa de arena de cuarzo no es decoración de render — es la razón por la que la casa se usa los 365 días del año, del verano con playa propia al invierno con costa para caminar.',
      'Son 1.042 lotes en 100 hectáreas, el proyecto más ambicioso del corredor y el primero de su tipo en el interior del país. Todavía en etapa de desarrollo, lo que define la oportunidad: entrar antes de la entrega final, con el diferencial de precio que eso implica.',
      'Para el comprador que puede pagarlo, es el barrio con mayor potencial de revalorización de la zona — y para la familia, el que más se parece a vivir de vacaciones.',
    ],
  },
  'vida-barrio-cerrado': {
    titulo: 'Servicios reales en la puerta de tu casa',
    parrafos: [
      'Vida Barrio Cerrado resuelve algo que ningún otro barrio del corredor resuelve: las compras del día. El centro comercial propio integrado al ingreso —supermercado, locales, oficinas— significa no manejar diez minutos por un faltante, y le cambia la vida diaria a cualquier familia.',
      'Son 294 lotes en 35 hectáreas, escala media y vecindario joven, con un Club House que suma más de 120 m² de paredes verdes. La ubicación juega a favor: cerca del Aeropuerto Internacional de Rosario y del polo comercial de Fisherton.',
      'Es el barrio para quien pesa la comodidad cotidiana por encima del amenity de catálogo: planificación pensada por gente que vivió en barrios, no solo que los vende.',
    ],
  },
  'vida-club-de-campo': {
    titulo: 'El secreto mejor guardado del corredor',
    parrafos: [
      'Vida Club de Campo es conocido por los lotes grandes —1.000 a 1.270 m², uniformes— pero su verdadero diferencial está puertas adentro: practice de golf propio con tres greens-isla, un caso que fuera de Kentucky no existe en la zona, y un set de siete a ocho canchas de tenis de polvo de ladrillo junto al reservorio.',
      'El Club House es de autor: hormigón visto y madera en planta octogonal con jardín central, a la altura de la arquitectura que el barrio quiere atraer. Son 659 lotes en 135 hectáreas con escala campestre real.',
      'Queda a un escalón de Kentucky en categoría, a una fracción del ticket. Para el comprador que quiere campo, deporte y diseño sin pagar la prima del clásico, es la compra inteligente del corredor.',
    ],
  },
  'vida-jardin': {
    titulo: 'La autopista en la puerta, el deporte adentro',
    parrafos: [
      'Vida Jardín gana por ubicación: acceso directo a la autopista y a Av. Fuerza Aérea, adentro del paraguas Vida. Para quien va y vuelve a Rosario todos los días, ese detalle cambia la calidad de vida más que cualquier amenity — el tiempo de viaje es el costo oculto que casi nadie calcula al comprar.',
      'Son 242 lotes amplios, de 800 a 1.100 m², con tenis, pádel y fútbol dentro del perímetro: el set deportivo completo sin pagar cuota de club afuera.',
      'Es el barrio práctico del ecosistema Vida — menos marketing, más ecuación diaria resuelta. Funciona especialmente bien para familias jóvenes que priorizan logística y espacio.',
    ],
  },
  'vida-green': {
    titulo: 'La entrada accesible al universo Vida',
    parrafos: [
      'Vida Green es la puerta de entrada al ecosistema Vida con el ticket más bajo. Los lotes son más compactos que en el resto del cluster —500 a 700 m²— y esa es exactamente la propuesta: bajar el precio de entrada sin salir del paraguas de desarrollos que más creció en Funes.',
      'El detalle que no es menor: cuatro canchas de tenis y dos de pádel para 419 lotes. La proporción de amenities por lote es mejor que la de barrios bastante más caros, con entrega prevista para mediados de 2026.',
      'Para la primera casa propia o la primera inversión en el corredor, es de las formas más eficientes de entrar al mercado de Funes hoy.',
    ],
  },
  'funes-lakes': {
    titulo: 'Ocho islas, diez kilómetros de costa propia',
    parrafos: [
      'Funes Lakes no es un barrio con laguna: es un archipiélago. Ocho islas interconectadas —Singapur, Sumatra, Borneo, Bali, Java, Timor, Komodo y Guinea— donde el 100% de los lotes tiene salida privada al agua. Diez kilómetros de costa repartidos en 50 hectáreas, con 20 hectáreas de lagos y canales navegables.',
      'Es el único producto náutico real del interior del país: lo más parecido a Tigre o Nordelta sin moverse de Funes, con el kayak saliendo del fondo de la casa. El diseño es de Estudio BO —los mismos de Kentucky y San Sebastián— y la seguridad suma un segundo anillo natural: el agua.',
      'Para el comprador que alguna vez valoró una propiedad frente al agua, acá no hay comparables. Eso, en bienes raíces, es la definición de potencial.',
    ],
  },
  'funes-hills-san-marino': {
    titulo: 'Escala chica, electrógeno para todo el barrio',
    parrafos: [
      'San Marino tiene el diferencial menos glamoroso y más usado del corredor: grupo electrógeno que cubre el 100% de las unidades. Cuando se corta la luz en Funes —y se corta—, la casa sigue funcionando. Para quien trabaja desde casa o tiene chicos, eso vale más que tres amenities de catálogo.',
      'Es un barrio deliberadamente chico, prolijo y muy bien mantenido. La escala es una virtud: los vecinos se conocen, las decisiones de consorcio son ágiles y el mantenimiento se nota en cada calle.',
      'Funciona para el comprador que ya descartó los barrios grandes y busca comunidad consolidada con la infraestructura crítica resuelta.',
    ],
  },
  'funes-hills-cadaques': {
    titulo: 'El punto medio justo, en tierras altas',
    parrafos: [
      'Cadaqués es la respuesta para quien no quiere ni un mega-barrio ni una escala mínima. Lotes estándar de 800 m² (20 × 40), boulevard central forestado desde el ingreso y un set de amenities suficiente, sin sobreoferta que infle expensas.',
      'El dato que en Funes importa más de lo que parece: tierras altas. La cota define drenaje y vista, y acá no es marketing — cuando llueve fuerte, se nota. Es un barrio maduro, de 15 a 20 años, con la forestación 100% desarrollada y prácticamente todo habitado.',
      'De los barrios mejor balanceados del corredor: consolidación, medida de lote y precio en un equilibrio que explica por qué la reventa acá nunca se queda quieta.',
    ],
  },
  'funes-hills-miraflores': {
    titulo: 'El barrio más práctico del corredor',
    parrafos: [
      'Miraflores resuelve la vida diaria como ningún otro: en la rotonda del ingreso ya hay panaderías, centros de salud, gimnasios y comercios. Vivir acá no obliga a planificar cada salida — y esa comodidad, día tras día, vale más que cualquier render.',
      'Puertas adentro es el polo tenístico del cluster Funes Hills: cuatro canchas de polvo de ladrillo, el formato que le importa al que juega en serio, más Club House con delivery interno y doble vía de acceso controlado.',
      'Son 308 lotes de 800 a 1.215 m² con forestación desarrollada y reventa demostrada. Para la familia que quiere un consolidado de referencia con servicios al alcance, es difícil encontrarle un contra.',
    ],
  },
}

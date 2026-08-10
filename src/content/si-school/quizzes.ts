// Preguntas de cierre por cápsula (multiple choice autocorregible).
// Clave: `${capSlug}/${capsulaSlug}`. Redactadas a partir del contenido de
// cada cápsula; el recordatorio es lo que se muestra al responder mal.
// Cápsulas sin entrada acá se completan sin quiz (fallback en CapsulaCard).

import type { QuizPregunta } from '@/lib/si-school/types'

export const QUIZZES: Record<string, QuizPregunta[]> = {
  "capacidad-01/01-bienvenida": [
    {
      "pregunta": "Arrancás una semana cargada de trabajo y te preguntás cuándo hacer SI School. ¿Cuál es el enfoque correcto según la bienvenida?",
      "opciones": [
        "Bloquearte una tarde libre por semana para estudiar las cápsulas con tranquilidad y sin interrupciones.",
        "Leer las cápsulas entre llamado y llamado, mientras laburás, porque el programa está diseñado para usarse trabajando, no después del trabajo.",
        "Dejar SI School para cuando baje el ritmo de operaciones, porque el trabajo real siempre va primero."
      ],
      "correcta": 1,
      "porQue": "SI School no es un curso aparte del trabajo: es el sistema operativo que usás todos los días mientras laburás, y por eso las cápsulas son cortas.",
      "recordatorio": "Esto no es un curso: es el sistema operativo con el que vas a trabajar durante 3 o 4 meses, mientras laburás. Las cápsulas son cortas para leerlas entre llamado y llamado, no para encerrarte una tarde a estudiar."
    },
    {
      "pregunta": "Terminás una cápsula y hay un concepto que no te cierra del todo, pero si lo decís sentís que vas a avanzar más lento. ¿Qué hacés?",
      "opciones": [
        "Avanzás igual: con la práctica el concepto se va a terminar entendiendo solo.",
        "Respondés lo que creés que el mentor quiere escuchar, para desbloquear la siguiente capacidad rápido.",
        "Lo decís abiertamente, porque cada capacidad se desbloquea cuando demostrás que la dominás, y fingir entender es la peor versión del programa.",
        "Lo anotás para consultarlo recién al final del programa, así no frenás el ritmo."
      ],
      "correcta": 2,
      "porQue": "El programa desbloquea por dominio demostrado, no por lectura terminada, y la honestidad sobre lo que no entendés es la única condición que pide David.",
      "recordatorio": "Sé honesto: si no entendés algo, decílo; si no estás de acuerdo, decílo. Acá no se gana nada llegando antes — se gana llegando bien."
    }
  ],
  "capacidad-01/02-frase-fundacional": [
    {
      "pregunta": "Un lead nuevo te escribe por una propiedad y vos le respondés firmando como \"SI Inmobiliaria\", sin presentarte con tu nombre. Según la frase fundacional, ¿qué está fallando?",
      "opciones": [
        "Te estás escondiendo atrás de la marca: el cliente necesita hablar con vos, con nombre y criterio propio, porque la relación es entre vos y él, no entre él y un logo.",
        "Nada, porque la marca SI le da más confianza al cliente que un agente que recién arranca.",
        "El problema es de formato: habría que responder más rápido, no importa quién firma.",
        "Está bien al principio; tu nombre lo das recién cuando el lead califica y muestra interés real."
      ],
      "correcta": 0,
      "porQue": "SI es el sistema y vos sos la persona: detrás de cada operación hay alguien tomando una decisión grande que necesita hablar con una persona, no con una marca.",
      "recordatorio": "No somos una marca que vende propiedades: somos personas que acompañan compradores, vendedores, inversores y desarrolladores. SI es el sistema. Vos sos la persona — la relación es entre vos y el cliente, no entre el cliente y un logo."
    },
    {
      "pregunta": "Un comprador te pide opciones y vos tenés 8 propiedades que más o menos encajan. ¿Qué hacés según la frase fundacional?",
      "opciones": [
        "Le mandás las 8, porque cuantas más opciones vea, más rápido va a encontrar la que le gusta.",
        "Le mandás las 8 pero ordenadas de mejor a peor, para que él haga su propio filtro.",
        "Le mandás 3 con criterio y le explicás por qué esas tres, porque acompañar a alguien no es tirarle información.",
        "No le mandás nada hasta tener una reunión presencial donde entender mejor qué busca."
      ],
      "correcta": 2,
      "porQue": "Mandar propiedades en masa es tirar info; acompañar es elegir con criterio y explicar el porqué de cada una.",
      "recordatorio": "Cada decisión se valida contra la frase fundacional: ¿es acompañar a alguien o es tirar info? Le mando 3 con criterio, y le explico por qué esas tres."
    },
    {
      "pregunta": "Un colega te dice: \"yo cierro la operación, cobro y a otra cosa — cliente nuevo, lead nuevo\". Según la cápsula, ¿qué error de razonamiento está cometiendo?",
      "opciones": [
        "Ninguno: en este rubro los clientes compran una vez cada muchos años, así que conviene rotar rápido.",
        "Trata el cierre como un final, cuando una operación bien cerrada es el principio de una relación que puede traer 3, 5 o 10 operaciones más a lo largo de tu carrera.",
        "El error es de eficiencia: debería automatizar la búsqueda de leads nuevos en vez de hacerla a mano.",
        "El error es cobrar y desaparecer: debería mandarle un regalo al cliente para quedar bien."
      ],
      "correcta": 1,
      "porQue": "El 95% de los agentes ignora que la relación sigue después del cierre, y por eso tienen que mendigar leads nuevos todos los meses en vez de construir cartera.",
      "recordatorio": "Una operación bien cerrada no es un final: es el principio de una relación que, mientras sigas estando ahí, trae más operaciones — primera casa, mudanza, inversión, los hijos, los recomendados. El que entiende esto deja de mendigar leads y construye cartera."
    }
  ],
  "capacidad-01/03-principio-largo-plazo": [
    {
      "pregunta": "Un propietario te ofrece la captación de su casa, pero pide un precio 30% arriba de mercado. Te dice: \"arrancamos así y después vemos si bajamos\". ¿Qué hacés?",
      "opciones": [
        "La tomás: tener producto en cartera siempre suma y el precio se acomoda solo con el tiempo.",
        "La tomás con un acuerdo verbal de revisar el precio en 60 días si no aparecen consultas.",
        "La tomás solo si te firma exclusividad, para que al menos el esfuerzo esté protegido.",
        "Le mostrás comparables y le decís que su precio está caro, aunque eso te cueste perder la captación."
      ],
      "correcta": 3,
      "porQue": "Decir la verdad con comparables construye relación; captar caro para tener cartel la consume, porque el dueño te va a culpar a vos cuando no se venda.",
      "recordatorio": "El agente SI se hace una sola pregunta antes de cada decisión: ¿esto construye relación o la consume? Aceptar una captación 30% arriba de mercado para \"tener producto\" la consume."
    },
    {
      "pregunta": "Estás por prometerle a un dueño un plazo de venta que sabés que no se va a cumplir, porque sentís que si no lo hacés, la captación se la lleva otro. ¿Cómo aplicás el test ácido?",
      "opciones": [
        "Proyectás la decisión 2 años adelante: ese dueño va a ser un cliente que te evita, así que no lo hacés, aunque pierdas la operación de hoy.",
        "Prometés el plazo pero lo dejás por escrito con condiciones, así estás cubierto si no se cumple.",
        "Prometés el plazo porque primero hay que ganar la captación; las expectativas se manejan después.",
        "Consultás con un colega qué plazo promete él y prometés algo parecido para no quedar afuera."
      ],
      "correcta": 0,
      "porQue": "El test ácido es proyectar cada decisión 2 años hacia adelante y preguntarte si genera un cliente que te recomienda o uno que te evita — y si es lo segundo, no se hace.",
      "recordatorio": "Tomá cualquier decisión y proyectala 2 años adelante: ¿va a ser un cliente que me recomienda o uno que me evita? Si es la segunda, no lo hagas, aunque pierdas la operación de hoy."
    },
    {
      "pregunta": "Un colega te dice: \"eso del largo plazo es filosofía linda, pero con eso no se paga el alquiler\". ¿Qué le contestás según la cápsula?",
      "opciones": [
        "Tiene razón en parte: el largo plazo es para agentes con espalda financiera, el que arranca necesita golpes rápidos.",
        "Es una cuestión de valores: aunque rinda menos plata, trabajar así te deja dormir tranquilo.",
        "Es matemática, no filosofía: captar 100 propiedades en precio te hace vender 70 y construir una cartera de 200-300 contactos en 5 años; captar a cualquier precio te deja 25 ventas y enemigos.",
        "Depende del mercado: en Funes y Roldán el largo plazo funciona, en mercados más grandes no."
      ],
      "correcta": 2,
      "porQue": "El principio no es un valor moral sino estrategia comercial con números concretos: la diferencia es que da resultado en 24 meses, no en 24 horas.",
      "recordatorio": "Largo plazo sobre golpe rápido no es valor moral: es estrategia comercial. La diferencia es que da resultado en 24 meses, no en 24 horas — por eso la mayoría no lo aplica."
    }
  ],
  "capacidad-01/04-principio-dar-mas": [
    {
      "pregunta": "Un comprador te pide info de una casa en Roldán. ¿Cuál de estas respuestas está \"al nivel SI\"?",
      "opciones": [
        "Le mandás la ficha completa con fotos y precio en menos de 5 minutos, porque la velocidad de respuesta es lo que más valora un cliente.",
        "Le mandás la ficha, más 3 datos del barrio que no preguntó (tránsito, colegios, evolución de valores) y una propiedad alternativa que no consideró pero le puede encajar mejor.",
        "Le mandás la ficha y le ofrecés coordinar visita ese mismo día, con un detalle de cortesía para la primera reunión."
      ],
      "correcta": 1,
      "porQue": "Dar más es subir el estándar de la entrega con información útil que el cliente no pidió, no responder más rápido ni sumar gestos de marketing.",
      "recordatorio": "Dar más de lo que el cliente espera no es marketing ni regalos: es el estándar mínimo de cómo trabajás, todos los días, en cada interacción."
    },
    {
      "pregunta": "Un agente nuevo entiende \"dar más\" así: se baja la comisión sin discutir, le dedica tardes enteras a cualquier lead que escribe y responde mensajes hasta la medianoche. ¿Qué le dirías?",
      "opciones": [
        "Que va por buen camino: al principio hay que dar todo para hacerse de una cartera.",
        "Que está bien la actitud pero le falta medirlo: tiene que registrar cuántos referidos le trae cada esfuerzo extra.",
        "Que solo le sobra lo de la comisión: el tiempo ilimitado a los leads sí es dar más.",
        "Que entendió mal el principio: eso es venderte barato, regalar energía y desorganización — dar más es subir el estándar de cada cosa que entregás, no esfuerzo extra todo el tiempo."
      ],
      "correcta": 3,
      "porQue": "La cápsula distingue explícitamente: dar más no es regalar tiempo a leads que no califican, ni bajarte la comisión, ni trabajar 16 horas — es estándar más alto, todo el tiempo.",
      "recordatorio": "Dar más no es esfuerzo extra todo el tiempo: es estándar más alto, todo el tiempo. Antes de mandar cualquier cosa preguntate: ¿esto está al nivel SI o al nivel promedio? Si está al nivel promedio, mejoralo antes de mandar."
    }
  ],
  "capacidad-01/05-principio-foco": [
    {
      "pregunta": "Son las 10 de la mañana. Tenés 3 leads calientes sin seguimiento desde hace dos días, y también tenías planeado subir contenido a Instagram y reorganizar tu base en Tokko. ¿Qué hacés primero?",
      "opciones": [
        "El seguimiento a los 3 leads: una operación se cae 4 veces más por falta de seguimiento que por precio, y abandonarlos por otras tareas es regalar plata.",
        "El contenido de Instagram primero, porque tiene horario óptimo de publicación, y los leads a la tarde.",
        "Reorganizar Tokko primero: con la base ordenada, después el seguimiento sale más rápido.",
        "Un poco de cada cosa, repartiendo la mañana en bloques para no descuidar nada."
      ],
      "correcta": 0,
      "porQue": "El seguimiento a leads que ya mostraron interés concreto es lo primero en el orden de impacto: es lo que acerca una operación al cierre, mientras que lo demás solo te mantiene ocupado.",
      "recordatorio": "Antes de cada tarea preguntate: ¿esto acerca una operación al cierre, o solamente me mantiene ocupado? Si solo te mantiene ocupado, no es prioridad."
    },
    {
      "pregunta": "Terminás el día habiendo trabajado 11 horas: miraste portales, reorganizaste la agenda, respondiste DMs y cargaste propiedades. Te sentís productivo. ¿Cómo evaluás el día según la cápsula?",
      "opciones": [
        "Fue un buen día: 11 horas de trabajo son 11 horas de trabajo, la constancia es lo que paga.",
        "Fue un día flojo de suerte: hiciste todo bien pero no entró ninguna oportunidad.",
        "Fue un día de ocupación, no de producción: casi nada de eso movió la aguja, y si menos de 4 horas fueron a cosas que acercan cierres, mañana corregís.",
        "Fue un día de inversión: ordenar sistemas y presencia digital rinde a largo plazo, así que cuenta como mover la aguja."
      ],
      "correcta": 2,
      "porQue": "Trabajar no es lo mismo que producir: el test diario es contar cuántas horas fueron a cosas que mueven la aguja, y esas tareas suelen ser justamente las incómodas que el cerebro evita.",
      "recordatorio": "Al terminar el día preguntate cuántas de tus 8 horas estuvieron en cosas que mueven la aguja. Si fueron menos de 4, mañana corregís. El cerebro busca lo cómodo, no lo importante — tu trabajo es resistir esa tentación."
    }
  ],
  "capacidad-01/06-mapa-sistema": [
    {
      "pregunta": "Captaste una propiedad y, como estás apurado, guardás los datos del dueño y las fotos en tu celular para cargarlos en Tokko \"cuando tengas un rato\". ¿Cuál es el problema?",
      "opciones": [
        "Ninguno grave, mientras vos tengas la información a mano para responder consultas.",
        "El problema es de seguridad: los datos del dueño no deberían estar en un celular personal.",
        "Si no está cargado en Tokko, no existe para el equipo: Tokko no es una opción, todo lo que toques pasa por ahí.",
        "El problema es de imagen: al dueño le da desconfianza que no uses un sistema formal."
      ],
      "correcta": 2,
      "porQue": "Tokko es la base de datos del equipo y la regla es explícita: lo que no está cargado ahí no existe para el equipo.",
      "recordatorio": "Tokko no es una opción — todo lo que toques pasa por Tokko. Si no está cargado ahí, no existe para el equipo."
    },
    {
      "pregunta": "Un colega broker te dice que tiene un cliente ideal para una propiedad tuya y te pide la info para mostrársela. ¿Cómo lo resolvés con el sistema SI?",
      "opciones": [
        "Le generás un link de verficha.casa: muestra la propiedad sin marca SI y con el contacto del colega como referente — cero filtración de info, cero pelea por el cliente.",
        "Le mandás la ficha oficial con marca SI, así el cliente sabe de quién es la propiedad realmente.",
        "Le pedís el contacto del cliente para manejar vos la conversación directamente.",
        "No compartís nada: las propiedades de cartera no se muestran a través de otros brokers."
      ],
      "correcta": 0,
      "porQue": "verficha.casa existe exactamente para eso: compartir en white-label con el colega como referente, sin filtrar información ni disputar el cliente.",
      "recordatorio": "Cuando un colega broker quiere compartir una propiedad tuya con su cliente, le generás un link white-label de verficha.casa, sin marca SI y con el contacto del colega como referente. Cero filtración de info, cero pelea por el cliente."
    },
    {
      "pregunta": "Un comprador te confirma interés real en comprar en Funes. Según el mapa del sistema, ¿cuál es la jugada correcta?",
      "opciones": [
        "Mandarle todas las propiedades disponibles de Funes por WhatsApp, para que nada se le escape.",
        "Armarle una selección curada de 3 a 5 propiedades elegidas con criterio, explicarle por qué cada una y pedirle feedback específico para saber si vas bien o tenés que reorientar.",
        "Invitarlo a recorrer las 3 mejores propiedades directamente, porque las visitas convencen más que las fichas.",
        "Derivarlo a la web de SI para que filtre solo y te escriba cuando algo le guste."
      ],
      "correcta": 1,
      "porQue": "El sistema de selección con feedback — el corazón operativo de SI — reemplaza el envío masivo por una selección con criterio cuyo feedback te orienta.",
      "recordatorio": "Cuando un comprador muestra interés, no le mandás 12 propiedades sueltas: le armás una selección curada de 3 a 5, le explicás por qué cada una y le pedís feedback. Este sistema es el corazón operativo de SI."
    }
  ],
  "capacidad-01/07-abc-negocio": [
    {
      "pregunta": "Un agente que recién arranca te dice: \"yo voy a empezar por buscar compradores, que es lo más fácil, y después veo cómo consigo propiedades\". ¿Qué error está cometiendo según el ABC?",
      "opciones": [
        "Ninguno: los compradores son más fáciles de conseguir y generan actividad desde el día uno.",
        "Quiere empezar por el medio: sin propiedades en precio de mercado no hay producto y no hay negocio — captar es la etapa que más subestiman los que arrancan.",
        "El error es de marketing: primero debería construir presencia en redes y recién después salir a buscar clientes.",
        "El error es de orden menor: da igual por dónde empieces mientras trabajes las tres etapas en paralelo."
      ],
      "correcta": 1,
      "porQue": "El programa está ordenado a propósito: captar es la base, y salir a buscar compradores sin cartera ni sistema es el error más común de los que arrancan.",
      "recordatorio": "Sin propiedades en precio de mercado, no hay negocio. Cada capacidad construye sobre la anterior: si te saltás una, las siguientes se desarman."
    },
    {
      "pregunta": "Cerrás un mes con 100 publicaciones subidas, 200 consultas respondidas y 50 visitas hechas, pero ninguna operación concretada. ¿Cómo se lee ese mes según la cápsula?",
      "opciones": [
        "Fue un mes de siembra: toda esa actividad va a rendir en los meses siguientes.",
        "Fue un mes aceptable: el volumen de consultas y visitas demuestra que el mercado te está respondiendo.",
        "Fue un mes de mala suerte: hiciste todo el trabajo y el cierre no dependía de vos.",
        "Fue un mes de 0 ingresos: la inmobiliaria gana plata por concretar operaciones, y hasta que el dinero no cambia de manos, todo lo demás es trabajo en proceso."
      ],
      "correcta": 3,
      "porQue": "Lo que hacés durante el día se mide contra cierres reales, no contra actividad: publicaciones, consultas y visitas sin cierre son 0 ingresos.",
      "recordatorio": "En este negocio no te pagan por estar. Te pagan por hacer que las cosas pasen. Si no estás generando oportunidades, conduciendo conversaciones cualificadas, haciendo seguimiento o sosteniendo relaciones, estás trabajando pero no estás avanzando."
    }
  ],
  "capacidad-02/01-por-que-esto-va-antes": [
    {
      "pregunta": "Martín arrancó hace dos meses como agente. Todavía no le entró ninguna consulta y te dice: \"Cuando empiecen a entrar leads, ahí me pongo a armar mi presencia. Ahora no tiene sentido, no tengo nada que mostrar\". Según la cápsula, ¿qué le dirías?",
      "opciones": [
        "Tiene razón: sin operaciones cerradas no hay contenido creíble, mejor esperar a tener algo concreto.",
        "Que el problema es de la inmobiliaria: los leads los tiene que generar la agencia, no el agente.",
        "Que lo tiene al revés: la presencia se construye antes de tener leads, y si nadie sabe que existe como agente, las consultas nunca van a entrar.",
        "Que compre publicidad para acelerar: la presencia orgánica es demasiado lenta para alguien que recién arranca."
      ],
      "correcta": 2,
      "porQue": "El error clásico del agente nuevo es esperar consultas para \"después construir marca\": la presencia genera las consultas, no al revés.",
      "recordatorio": "La presencia se construye antes de tener leads. No al revés. Tu trabajo en los primeros 6 meses no es vender: es que la gente sepa que vos te dedicás a esto."
    },
    {
      "pregunta": "Una agente nueva entiende que tiene que \"ser conocida\" y se frustra: \"Yo nunca voy a lograr que todo Rosario sepa quién soy\". ¿Qué es lo que en realidad le pide la cápsula para sus primeros meses?",
      "opciones": [
        "Que en un radio chico —su barrio, su club, sus contactos, los vecinos de Funes o Roldán— quede claro a qué se dedica y cómo trabaja.",
        "Que invierta en alcance masivo hasta que su nombre suene en toda la ciudad.",
        "Que cierre al menos una venta rápido, porque nada posiciona más que un resultado concreto.",
        "Que espere: el reconocimiento llega solo con los años de trabajo, sin hacer nada activo."
      ],
      "correcta": 0,
      "porQue": "\"Que la gente sepa\" no significa que todo Rosario te conozca: significa que tu círculo cercano tenga claro a qué te dedicás y cómo trabajás.",
      "recordatorio": "\"Que la gente sepa\" no es fama: es que en un radio chico —tu barrio, tu club, tus contactos— quede claro a qué te dedicás y cómo trabajás. Eso, hecho bien durante unos meses, hace que los primeros mensajes entren solos."
    }
  ],
  "capacidad-02/02-empezar-por-donde-te-conocen": [
    {
      "pregunta": "Sofía arranca en el rubro y decide avisarle a su entorno. Abre WhatsApp y le manda a todos sus contactos: \"Hola, ¿cómo estás? Te cuento que arranqué en inmobiliaria. Si conocés a alguien que quiera vender, avisame\". ¿Qué falló según la cápsula?",
      "opciones": [
        "Nada: es la forma más directa y honesta de activar el círculo cercano.",
        "Está pidiendo favores en frío: eso genera incomodidad y la hace ver como otra vendedora más; lo que sirve es posicionarse sin pedir.",
        "El canal: ese mensaje funciona, pero tendría que haberlo mandado por Instagram y no por WhatsApp.",
        "El timing: primero tendría que haber cerrado una operación para tener algo que contar."
      ],
      "correcta": 1,
      "porQue": "Mandar difusión en frío pidiendo referidos es pedir favores; la forma que sirve es contar a qué te dedicás cuando aparece en una conversación natural, sin pedir nada.",
      "recordatorio": "REGLA: Tu entorno tiene que saber a qué te dedicás. No tiene que sentir que tu trabajo es venderles."
    },
    {
      "pregunta": "En el club, un conocido le pregunta a Juan en qué anda. Juan, que arrancó en inmobiliaria hace un mes, duda porque no quiere parecer que está vendiendo. ¿Qué hace el que entendió la cápsula?",
      "opciones": [
        "Cambia de tema: mezclar el trabajo con el club queda mal y puede incomodar.",
        "Le cuenta y aprovecha para pedirle que le pase contactos de gente que quiera vender.",
        "Le dice que anda \"en bienes raíces\" sin dar detalle, para no quemarse antes de tener resultados.",
        "Le cuenta con naturalidad que ahora se dedica a inmobiliaria, y nada más: la conversación apareció sola, no hay que pedir nada."
      ],
      "correcta": 3,
      "porQue": "Posicionarse sin pedir es exactamente eso: contar a qué te dedicás cuando aparece en una conversación natural, sin convertirlo en un pedido de referidos.",
      "recordatorio": "La presencia se construye en círculos concéntricos: lo más cerca, primero. No contarle a tu entorno es perder el activo más valioso que tiene un agente que arranca: gente que ya confía en vos. Pero contarles no es pedirles: es posicionarte sin pedir."
    }
  ],
  "capacidad-02/03-instagram-tu-vidriera": [
    {
      "pregunta": "Lucía arma su perfil de Instagram como agente: pone el logo de la inmobiliaria de foto, y en la bio escribe \"Los sueños no se alquilan, se cumplen ✨🏡\" con una lista de servicios. ¿Qué le corregirías según la cápsula?",
      "opciones": [
        "Foto: su cara, no un logo. Bio: qué hace, dónde opera y cómo la encuentran, en pocas palabras y sin frases motivacionales.",
        "Solo la foto: el logo transmite menos confianza, pero la frase motivacional está bien porque genera cercanía.",
        "Nada: el logo da imagen de empresa seria y la bio emotiva diferencia de los perfiles fríos.",
        "Que borre la bio y deje solo el link de WhatsApp: cuanto menos texto, más profesional."
      ],
      "correcta": 0,
      "porQue": "La bio tiene que decir qué hacés, dónde operás y cómo te encuentran, y la foto tiene que ser tu cara porque la gente sigue personas, no marcas.",
      "recordatorio": "La bio dice tres cosas en pocas palabras: qué hacés, dónde operás, cómo te encuentran. La foto de perfil es tu cara, no un logo: la gente sigue personas, no marcas."
    },
    {
      "pregunta": "Diego tiene 15 propiedades en cartera y publica una por día, todos los días, para \"mostrar movimiento\". Las consultas no llegan. ¿Cuál es el diagnóstico según la cápsula?",
      "opciones": [
        "Le falta constancia: debería publicar las 15 propiedades por semana en vez de una por día.",
        "El problema es el formato: las propiedades tienen que ir solo en reels, que son los que llegan a gente nueva.",
        "Su perfil se lee como un clasificado: le falta el contenido que construye autoridad —mercado de su zona, detrás de escena, casos resueltos, quién es él— y propiedades curadas, una o dos por semana.",
        "Está bien encaminado: solo tiene que esperar, porque la autoridad se construye con volumen de publicaciones."
      ],
      "correcta": 2,
      "porQue": "Publicar solo propiedades convierte el perfil en un clasificado; la autoridad la construye el contenido que muestra que entendés el rubro y conocés tu zona, con propiedades destacadas una o dos veces por semana.",
      "recordatorio": "Si todo tu contenido es \"casa en venta, casa en venta, casa en venta\", tu perfil se lee como un clasificado, y un clasificado no construye autoridad. La construye el contenido que muestra que entendés el rubro y conocés tu zona mejor que el promedio."
    },
    {
      "pregunta": "Es viernes a la noche y a Camila le entra un DM: alguien pregunta por una propiedad que publicó. Ella piensa: \"El lunes en horario laboral lo contesto bien, con toda la data\". ¿Qué dice la cápsula sobre esto?",
      "opciones": [
        "Hace bien: responder fuera de horario transmite desesperación y baja el valor percibido.",
        "Se equivoca: si tardás 48 horas en contestar un DM la persona ya te olvidó; la respuesta rápida es parte de la presencia, no algo aparte.",
        "Depende del contenido: si la consulta es de precio puede esperar, si es de visita hay que contestar ya.",
        "Lo correcto es derivarlo automáticamente a WhatsApp Business y responder recién ahí."
      ],
      "correcta": 1,
      "porQue": "La respuesta rápida en Instagram es parte de la presencia: dejar pasar el fin de semana es exactamente el escenario de las 48 horas en que la persona ya te olvidó.",
      "recordatorio": "Respondé los DMs y los comentarios: si tardás 48 horas en contestar un DM, la persona ya te olvidó. La respuesta rápida en Instagram es parte de la presencia, no algo aparte."
    }
  ],
  "capacidad-02/04-marca-personal-vs-reputacion-local": [
    {
      "pregunta": "Dos agentes comparan cuentas. Agustín tiene 5.000 seguidores que juntó con reels virales de tips generales. Paula tiene 800, casi todos de Funes y alrededores, donde ella opera. ¿Quién está mejor posicionado para generar trabajo y por qué?",
      "opciones": [
        "Agustín: con más alcance, tarde o temprano algún seguidor se convierte en cliente.",
        "Agustín: los seguidores son la métrica que valida a un agente frente a un dueño que va a tasar.",
        "Están igual: lo que define el trabajo es la cartera de propiedades, no las redes.",
        "Paula: podés tener 5.000 seguidores y cero clientes si son random, y 800 con trabajo constante si son del barrio donde operás."
      ],
      "correcta": 3,
      "porQue": "La reputación local no mide seguidores sino cuánta gente de tu zona te identifica como referente: quiere ser recomendada, no conocida.",
      "recordatorio": "Podés tener 5.000 seguidores y cero clientes si los seguidores son random. Y podés tener 800 seguidores y trabajo constante si esos 800 son del barrio donde operás. La reputación funciona en menciones, no en likes ni seguidores."
    },
    {
      "pregunta": "Antes de publicar, Nico duda entre dos ideas: un reel con música y \"5 errores que cometés al comprar tu primera casa\", o un posteo con el rango de valores que se movió este mes en Cerrado de Funes. ¿Cuál elige el que va atrás de reputación local, según la cápsula?",
      "opciones": [
        "El de valores de Cerrado de Funes: ese contenido solo lo puede hacer alguien que opera ahí, y se acumula construyendo la sensación de que sabés más de la zona que el resto.",
        "El reel de los 5 errores: tiene más chances de explotar y el alcance siempre suma.",
        "Los dos a la vez: publicar mucho es más importante que elegir qué publicar.",
        "Ninguno: los datos de valores son información sensible que no conviene mostrar públicamente."
      ],
      "correcta": 0,
      "porQue": "La pregunta de la reputación local es \"¿qué de esto le importa al vecino que está pensando en vender en mi zona?\", y ese contenido solo lo puede hacer alguien que opera ahí.",
      "recordatorio": "El contenido genérico lo puede hacer cualquiera y se olvida en dos días. El contenido local solo lo puede hacer alguien que opera ahí, y se acumula: cada pieza construye la sensación de que vos sabés más de la zona que el resto."
    }
  ],
  "capacidad-02/05-lo-que-no-hacer": [
    {
      "pregunta": "Federico planifica su mes en Instagram: cuatro semanas, cuatro propiedades de su cartera, una por semana. \"Así muestro todo lo que tengo\", dice. ¿Qué le marca la cápsula?",
      "opciones": [
        "Está bien: una propiedad por semana es exactamente la frecuencia recomendada, no hay nada que corregir.",
        "Rompe la regla 80-20: si todo es promoción, la gente deja de mirar; el 80% del contenido tiene que ser valor, conocimiento, zona y oficio, y solo el 20% promoción concreta.",
        "El problema es el orden: primero las propiedades más caras, que son las que posicionan.",
        "Le falta agresividad comercial: cuatro propiedades por mes es poco para generar consultas."
      ],
      "correcta": 1,
      "porQue": "La fórmula \"esta semana la propiedad, la próxima la propiedad\" hace que la gente deje de mirar: la regla es 80% valor y 20% promoción.",
      "recordatorio": "La regla es 80-20: 80% de tu contenido es valor, conocimiento, zona y oficio. 20% es promoción concreta de una propiedad. Si vendés en todas las publicaciones, la gente deja de mirar."
    },
    {
      "pregunta": "En un posteo de una casa, alguien comenta: \"¿Precio?\". Valentina piensa que responder el número ahí mismo muestra transparencia y le sirve a todos los que miran. ¿Qué dice la cápsula?",
      "opciones": [
        "Tiene razón Valentina: ocultar el precio en 2026 genera desconfianza y espanta compradores.",
        "Conviene no responder nada: el que pregunta por comentarios no es un comprador serio.",
        "Se responde por DM: las consultas concretas, las negociaciones y los datos sensibles van por canales privados; tu feed no es un mostrador.",
        "Se responde \"te mando info\" y se deja pasar unos días para generar expectativa."
      ],
      "correcta": 2,
      "porQue": "Lo que se atiende por privado no se atiende en redes: la consulta concreta se lleva al DM porque el feed no es un mostrador.",
      "recordatorio": "Atendé por privado lo que va por privado: si te preguntan el precio por comentarios, respondés por DM. Las negociaciones, las consultas concretas y los datos sensibles van por canales privados. Tu feed no es un mostrador."
    },
    {
      "pregunta": "A Ramiro se le cayó una operación a días de la firma. Venía documentando el proceso en redes y ahora duda: \"Si cuento que se cayó, quedo como un improvisado. Mejor lo borro y sigo mostrando solo los cierres\". ¿Qué dice la cápsula sobre ese razonamiento?",
      "opciones": [
        "Se equivoca: la gente no confía en el agente que parece no tener problemas; mostrar el oficio entero, incluida una operación que se cayó, lo hace humano, y humano se traduce en creíble.",
        "Hace bien: en redes solo se muestran resultados positivos, porque los fracasos espantan clientes.",
        "Debería contarlo pero echándole la culpa a la otra inmobiliaria, para que quede claro que no fue error suyo.",
        "Debería borrar todo el proceso y no documentar más operaciones hasta tener una que cierre segura."
      ],
      "correcta": 0,
      "porQue": "Hablar siempre desde el éxito es el error más sutil de la lista: la confianza la construye el que muestra el oficio entero, incluidas las partes incómodas.",
      "recordatorio": "La gente no confía en el agente que parece no tener problemas. Confía en el que muestra el oficio entero, incluidas las partes incómodas: una operación que se cayó, un cliente difícil, un error que sirvió para aprender. Eso te hace humano, y humano se traduce en creíble."
    }
  ],
  "capacidad-03/01-captacion-consecuencia": [
    {
      "pregunta": "Estás por entrar a tu primera pretasación del mes y todavía no captaste ninguna exclusiva. Sentís la presión. Según la cápsula, ¿con qué idea tenés que entrar a la reunión?",
      "opciones": [
        "\"Tengo que firmar hoy, no puedo dejar pasar esta oportunidad\"",
        "\"Voy a mostrarle todas las ventajas de SI hasta convencerlo\"",
        "\"Voy a entender qué necesita esta persona\"",
        "\"Voy a prometerle lo que quiere escuchar para que se sienta cómodo\""
      ],
      "correcta": 2,
      "porQue": "El cambio de postura —entrar a entender en vez de entrar a cerrar— se nota en todo, y paradójicamente es lo que hace que firmes más: la gente confía más en el que no parece desesperado por cerrar.",
      "recordatorio": "El agente que entra pensando en su comisión, no capta. El que entra pensando en el cliente, capta. Es matemática del oficio, no filosofía."
    },
    {
      "pregunta": "A los diez minutos de una pretasación, el propietario se pone a la defensiva y empieza a contestarte con monosílabos. Según la cápsula, ¿cuál es la causa más probable?",
      "opciones": [
        "Siente que le estás vendiendo algo en vez de escucharlo, y se cierra con razón",
        "No tiene necesidad real de vender y hay que descartarlo",
        "Es una persona difícil; con propietarios así conviene ir directo a hablar de precio",
        "Le falta información sobre SI; hay que contarle más de la trayectoria de la empresa"
      ],
      "correcta": 0,
      "porQue": "Cuando el agente entra con la idea de \"sacar la exclusiva\", el propietario lo siente desde el primer minuto: no siente que lo escuchan, siente que le venden, y se cierra.",
      "recordatorio": "La captación es lo que pasa cuando hacés bien todo lo anterior: entregás valor, escuchás más de lo que hablás, decís verdades incómodas. La firma del Acuerdo es la consecuencia natural de una relación bien construida, no el objetivo de una técnica de venta."
    }
  ],
  "capacidad-03/02-objetivos-primer-cuatrimestre": [
    {
      "pregunta": "Llevás 2 meses en SI y todavía no captaste ninguna exclusiva. Empezás a pensar que el rubro no es para vos. Según la cápsula, ¿qué corresponde hacer?",
      "opciones": [
        "Aceptar que si a los 2 meses no hay resultados, probablemente el rubro no sea lo tuyo",
        "Revisar tu actividad diaria: si no estás sosteniendo las 3 conversaciones nuevas por día, las 2 visitas semanales y el contenido en redes, ahí está el ajuste",
        "Bajar la vara: los objetivos de SI son para agentes con experiencia, no para alguien que arranca",
        "Enfocarte solo en vender y dejar la captación para cuando tengas más cancha"
      ],
      "correcta": 1,
      "porQue": "No llegar a los números no quiere decir que el rubro no es para vos: quiere decir que algo en tu actividad diaria hay que ajustar, porque si la actividad se sostiene 4 meses, los números aparecen — es estadística pura.",
      "recordatorio": "Objetivo del cuatrimestre: vender 1 propiedad y captar 3 exclusivas con documentación completa. Si hacés la actividad diaria sostenida durante 4 meses, los números aparecen; si la hacés a medias, no."
    },
    {
      "pregunta": "Un compañero nuevo te dice: \"Dejé el pádel y el gimnasio porque me sacaban horas de trabajo\". Según la cápsula, ¿qué está entendiendo mal?",
      "opciones": [
        "Nada: al arrancar hay que sacrificar el tiempo libre para dedicarlo a captar",
        "Debería reemplazarlos por más horas de publicaciones en portales, que rinden más",
        "Tiene razón en dejarlos, pero debería compensarlo con más llamados en frío",
        "Mantener la red de relaciones activa —pádel, gimnasio, café, escuela— no es esparcimiento: es parte del trabajo"
      ],
      "correcta": 3,
      "porQue": "La actividad diaria que hace posibles los objetivos incluye explícitamente mantener viva la red de relaciones en la vida cotidiana: cortarla es cortar el canal número uno de captación.",
      "recordatorio": "Mantener tu red de relaciones activa —pádel, gimnasio, café, escuela— no es esparcimiento: es parte del trabajo. Este rubro pide tiempo antes de devolver resultados, y los que aguantan la incomodidad del primer año son los que después marcan la diferencia."
    }
  ],
  "capacidad-03/03-de-donde-sale-captacion": [
    {
      "pregunta": "Querés captar 3 exclusivas en tus primeros 4 meses. Según la estadística histórica del rubro que da la cápsula, ¿qué necesitás tener?",
      "opciones": [
        "Unos 300 contactos vivos, porque por cada 100 contactos sostenidos salen unas 5 reuniones y de esas sale aproximadamente 1 exclusiva",
        "Unas 30 reuniones de pretasación agendadas por adelantado",
        "Unos 100 contactos bien elegidos, porque lo que importa es la calidad y no la cantidad",
        "Una base de 300 leads comprados en campañas digitales de la zona"
      ],
      "correcta": 0,
      "porQue": "La cuenta de la cápsula es directa: 100 contactos sostenidos ≈ 5 reuniones ≈ 1 exclusiva, así que 3 exclusivas piden unos 300 contactos vivos — que ya tenés si hacés vida normal en Funes o Roldán; lo que falta es que sepan a qué te dedicás.",
      "recordatorio": "Por cada 100 contactos sostenidos salen aproximadamente 5 reuniones de captación, y de esas sale aproximadamente 1 exclusiva. Para 3 exclusivas en 4 meses necesitás 300 contactos vivos — y que sepan a qué te dedicás."
    },
    {
      "pregunta": "Vas a tu primera pretasación y pensás: \"Tranquilo, digo que vengo de SI y con los 40 años de trayectoria la firma sale sola\". ¿Qué tiene de errado ese razonamiento?",
      "opciones": [
        "Nada: la trayectoria de la marca es justamente lo que cierra las exclusivas",
        "La marca conviene no mencionarla, porque el propietario tiene que confiar en vos y no en la empresa",
        "La marca te abre la puerta, pero adentro de la reunión sos vos el que sostiene la conversación con criterio; si el propietario te ve verde, la marca no te salva",
        "El error es ir solo: a las primeras pretasaciones hay que ir siempre con un agente senior"
      ],
      "correcta": 2,
      "porQue": "La cápsula reconoce que la marca SI suma y abre puertas que un agente nuevo no tendría, pero es explícita en que la marca no firma exclusivas por vos.",
      "recordatorio": "La marca SI no firma exclusivas por vos: la marca te abre la puerta. Adentro de la reunión, sos vos el que tiene que sostener la conversación con criterio y profesionalismo."
    },
    {
      "pregunta": "Una campaña digital en tu zona te trae 10 leads de propietarios que marcaron interés en vender. ¿Cómo los tenés que leer?",
      "opciones": [
        "Como captaciones casi cerradas: si dejaron sus datos es porque ya decidieron vender",
        "Como una pérdida de tiempo: los leads de campañas nunca terminan en exclusivas",
        "Como reemplazo de la red de relaciones: si la campaña funciona, ya no hace falta el trabajo cara a cara",
        "Como leads tibios: la tecnología es palanca, y sos vos el que los convierte en captaciones reales con conversación, escucha y profesionalismo"
      ],
      "correcta": 3,
      "porQue": "La regla de la cápsula es que la tecnología es palanca y no reemplaza el trabajo humano: la campaña trae leads tibios y el agente los convierte en captaciones reales.",
      "recordatorio": "La tecnología es palanca, no reemplaza el trabajo humano. Una campaña te trae leads tibios — vos los convertís en captaciones reales con conversación, escucha y profesionalismo."
    }
  ],
  "capacidad-03/04-red-relaciones-motor": [
    {
      "pregunta": "Jugando al pádel, uno de tu grupo comenta que su cuñado está pensando en mudarse. ¿Qué hacés en ese momento?",
      "opciones": [
        "Le pedís el teléfono del cuñado para escribirle esa misma semana",
        "Escuchás, opinás como profesional, das un dato real del mercado de la zona, y no pedís el contacto",
        "Le pasás tu tarjeta para que se la dé al cuñado y quedás a disposición",
        "Le ofrecés una tasación gratis para el cuñado como gancho"
      ],
      "correcta": 1,
      "porQue": "El que pide el contacto lo siente como invasión; si aportás criterio sin vender, la próxima vez que se vean, el de pádel le va a haber pasado tu nombre al cuñado solo.",
      "recordatorio": "Dar más de lo que se espera, no pedir. Estar atento cuando la oportunidad aparece sola, no forzarla. Y cuando aparece, hacer las cosas tan bien que esa persona te recomiende a otras 3 sin que se lo pidas."
    },
    {
      "pregunta": "Un agente nuevo, ansioso por resultados, decide mandar un mensaje a toda su agenda: \"Hola! Ahora trabajo en inmobiliaria, ¿conocés a alguien que quiera vender?\". Según la cápsula, ¿qué va a pasar?",
      "opciones": [
        "Es una buena jugada: de 300 contactos, alguno seguro tiene una propiedad para vender",
        "No va a funcionar, pero al menos no pierde nada por intentarlo",
        "Va a quemar su red en una semana, y una red quemada no se recupera",
        "Va a funcionar solo si el mensaje está bien redactado y personalizado"
      ],
      "correcta": 2,
      "porQue": "Meterse a la red con la cabeza de \"tengo que sacar negocio\" —mensajes en frío, pedir referidos, pegar la tarjeta en el grupo de WhatsApp— la quema, y el daño no se recupera.",
      "recordatorio": "Si te metés a tu red con la cabeza de \"tengo que sacar negocio\", la quemás — y no se recupera. La red funciona cuando vivís tu vida normal y, cuando la conversación sobre tu trabajo aparece sola, sabés qué decir y cómo decirlo."
    }
  ],
  "capacidad-03/05-presencia-redes-captar": [
    {
      "pregunta": "Querés que tu Instagram empiece a atraer propietarios que están pensando en vender. ¿Cuál de estos contenidos es el indicado según la cápsula?",
      "opciones": [
        "Fotos de propiedades con el texto \"VENDIDA\" para mostrar que vendés",
        "Un reel con música de tendencia: \"5 errores al vender tu casa\", adaptado de cuentas grandes de Estados Unidos",
        "Frases motivacionales del estilo \"tu casa te está esperando\" para generar cercanía",
        "Datos concretos de tu zona: \"En Funes Norte se publicaron 12 casas nuevas este mes, los valores promedio están entre X e Y\""
      ],
      "correcta": 3,
      "porQue": "El propietario que está por vender no busca propiedades, te busca a vos: información de mercado con datos concretos le hace pensar \"este tipo sabe\" y guarda tu nombre para cuando decida moverse.",
      "recordatorio": "El vendedor no busca propiedades — te busca a vos: quiere saber si sos serio, si conocés la zona, si tenés criterio. Lo que atrae propietarios es información de mercado con datos concretos, análisis honesto de errores típicos y el proceso real de tu trabajo."
    },
    {
      "pregunta": "Un agente nuevo te dice: \"Me incomoda salir en cámara, así que armé mi cuenta con el logo de SI y fotos de las propiedades. Queda profesional igual\". ¿Qué le decís según la cápsula?",
      "opciones": [
        "Que esa incomodidad hay que trabajarla: no hay forma de captar bien sin que tu cara esté visible, porque el propietario confía en una persona, no en un logo",
        "Que está bien: lo importante es la calidad de las fotos y la constancia de publicación",
        "Que use el logo mientras arranca y ya va a mostrar la cara cuando tenga más seguidores",
        "Que compense la falta de cara con más publicaciones por semana"
      ],
      "correcta": 0,
      "porQue": "La cápsula es directa: el propietario que va a confiar la venta de su casa confía en una persona, y un perfil de logo con propiedades sueltas parece un clasificado, no un profesional.",
      "recordatorio": "Si vas a captar propietarios, tu cara tiene que estar visible. No tu logo, no fotos de propiedades sueltas. Tu cara — porque el propietario que va a confiar la venta de su casa va a confiar en una persona, no en un logo."
    }
  ],
  "capacidad-03/06-nurc-filtro": [
    {
      "pregunta": "En una pretasación, el propietario te dice: \"Mirá, apuro no tengo. Lo pongo a la venta y si aparece un buen precio, vendo. Quiero ver cuánto me dan\". ¿Cómo lo leés con NURC?",
      "opciones": [
        "Es un propietario ideal: sin apuro va a estar abierto a escuchar tu asesoramiento con calma",
        "Tiene urgencia baja pero eso se compensa publicando a un precio atractivo",
        "No hay necesidad real — está probando el mercado: va a pedir precio inflado, no va a negociar, y tu trabajo se va a hacer al pedo",
        "Hay que firmarlo rápido igual, porque una propiedad más en cartera siempre suma"
      ],
      "correcta": 2,
      "porQue": "\"Quiero ver cuánto vale\" y \"si aparece un buen precio vendo\" son exactamente las frases que la cápsula marca como \"no necesidad\": si no hay motivo real, no hay venta real.",
      "recordatorio": "Si no hay motivo real, no hay venta real. NURC evalúa Necesidad, Urgencia, Realismo y Capacidad: con las cuatro en \"Tiene\", avanzás; con tres o cuatro en \"No tiene\", no tomes la propiedad."
    },
    {
      "pregunta": "Un propietario tiene necesidad real (una herencia a repartir) y fecha concreta, pero pide un precio 25% arriba de mercado porque \"hace 3 años una casa así valía eso\". Las demás variables dan bien. ¿Qué hacés?",
      "opciones": [
        "La descartás de entrada: sin realismo no hay captación posible, sin excepciones",
        "La tomás al precio que pide: una vez publicada, el mercado le va a enseñar solo",
        "La tomás pero sin invertir en difusión hasta que baje el precio",
        "Evaluás el caso: con una variable en \"No tiene\" se analiza caso por caso, y el realismo es justamente algo que se puede trabajar asesorándolo bien"
      ],
      "correcta": 3,
      "porQue": "Con una o dos variables en \"No tiene\" se evalúa caso por caso, y la cápsula da el ejemplo exacto: un propietario sin realismo puede pasar a tener realismo si lo asesorás bien — lo que no se trabaja es la falta de necesidad y urgencia juntas.",
      "recordatorio": "Con una o dos variables en \"No tiene\", evaluás caso por caso: el realismo se puede trabajar con buen asesoramiento; un propietario sin urgencia y sin necesidad real no se va a mover. El propietario con realismo entiende que el precio inicial define el resultado y que el primer mes es el más importante."
    },
    {
      "pregunta": "Terminás una pretasación de una casa espectacular en una muy buena zona, pero el cuadro NURC te da tres variables en \"No tiene\". Estás arrancando y tu cartera está vacía. ¿Qué corresponde?",
      "opciones": [
        "Tomarla igual: una propiedad linda en cartera te da vidriera aunque no se venda",
        "No tomarla: con tres o cuatro en \"No tiene\", tomarla es gastar meses de energía, presupuesto y tiempo para que termine siendo solo parámetro de comparación de otras",
        "Tomarla a prueba por 60 días y ver cómo responde el mercado",
        "Tomarla solo si el propietario acepta la exclusividad"
      ],
      "correcta": 1,
      "porQue": "Decirle \"no\" a una captación inviable es una de las cosas más profesionales que vas a hacer: la vidriera que da una propiedad invendible se paga con meses de energía, plata de publicidad y compradores reales que la descartan.",
      "recordatorio": "Decir \"no\" no es perder. Es ganar tiempo para captaciones que sí van a salir."
    }
  ],
  "capacidad-03/07-primera-reunion-acuerdo": [
    {
      "pregunta": "Al final de una buena primera reunión, el propietario te dice: \"Prefiero probar con tres o cuatro inmobiliarias a la vez, así se vende más rápido\". ¿Cómo respondés según la cápsula?",
      "opciones": [
        "Aceptás la no exclusiva para no perder la propiedad y después intentás convertirla",
        "Le decís que SI no trabaja así y que si quiere multilistado busque otra inmobiliaria",
        "Le explicás que las propiedades en multilistado suelen tardar más y venderse por menos, porque el comprador que la ve publicada en 10 lugares desconfía — la exclusiva bien trabajada lo protege a él como vendedor",
        "Le ofrecés una comisión más baja a cambio de la exclusividad"
      ],
      "correcta": 2,
      "porQue": "El argumento de la cápsula no es defender el interés de la inmobiliaria sino el del vendedor: el multilistado genera desconfianza en el comprador y termina jugando en contra del precio y del plazo.",
      "recordatorio": "La postura SI es siempre exclusiva, salvo casos justificados. El plazo mínimo aceptable es 90 días y el ideal es 120 (el default del sistema); 60 días solo en casos muy específicos y con muy buena razón."
    },
    {
      "pregunta": "Un amigo cercano te da su departamento para vender y te dice: \"Entre nosotros no hace falta firmar nada, nos conocemos de toda la vida\". ¿Qué hacés?",
      "opciones": [
        "No le pedís la firma: la confianza personal reemplaza al papel, igual que con la familia directa",
        "Cargás la ficha en el sistema sin Acuerdo y lo firmás más adelante si aparece un comprador",
        "Le pedís solo la documentación, que es lo que realmente importa para publicar",
        "Le pedís el Acuerdo igual: la excepción es solo para familia directa, y con conocidos hay que ser más profesional, no menos, porque ahí se juega tu reputación con todo tu entorno"
      ],
      "correcta": 3,
      "porQue": "La firma del Acuerdo solo es opcional con familia directa (padres, hermanos, hijos); con conocidos cercanos y amigos el proceso profesional se sostiene, porque la confianza no exime del proceso.",
      "recordatorio": "Sin Acuerdo firmado, una propiedad no entra al sistema. La única excepción razonable es la familia directa (padres, hermanos, hijos), y aun ahí la ficha se carga igual completa; con conocidos hay que ser más profesional, no menos."
    },
    {
      "pregunta": "Firmaste el Acuerdo hace dos semanas y el propietario te viene dilatando: \"Después te paso el plano\", \"El título lo tiene mi escribano\". No querés insistirle para no molestar. ¿Qué dice la cápsula de esta situación?",
      "opciones": [
        "Insistir con los papeles es profesionalismo, no molestia: una propiedad no se publica con documentación incompleta, y el que entrega a tiempo demuestra que la operación va a llegar a cierre",
        "Publicás igual para no perder tiempo de mercado y completás la documentación sobre la marcha",
        "Esperás sin presionar: insistir puede dañar la relación de confianza que construiste",
        "Le avisás que si en 30 días no entrega los papeles, cancelás el Acuerdo"
      ],
      "correcta": 0,
      "porQue": "Acomodarse a la demora por no querer \"molestar\" es el error típico del agente nuevo: un propietario que se ofende porque le pedís documentación no es propietario para SI.",
      "recordatorio": "La regla SI es clara: una propiedad no se publica con documentación incompleta. La insistencia con los papeles no es molestar — es profesionalismo."
    }
  ],
  "capacidad-04/01-acompanar-no-atender": [
    {
      "pregunta": "Te entra una consulta por una casa en Funes. Tenés la ficha a mano y podrías responder en 30 segundos. ¿Qué hacés?",
      "opciones": [
        "Respondo al toque con la ficha completa: en este rubro el que responde primero gana el lead.",
        "Me tomo cinco minutos para mirar la propiedad, entender el contexto de la consulta y ver si encaja con lo que pide la persona. Recién después respondo.",
        "Le mando esa ficha más otras 10 propiedades similares para que tenga variedad y elija.",
        "Le respondo directamente proponiendo una visita, así no se enfría."
      ],
      "correcta": 1,
      "porQue": "El agente que acompaña piensa antes de responder: toma cinco minutos para entender el contexto y ver si la propiedad encaja, en vez de responder por reflejo.",
      "recordatorio": "Atender un lead es responder por reflejo. Acompañar a un comprador es pensar antes de responder y guiarlo con criterio hacia una decisión buena para él. La operación es la consecuencia, no el objetivo."
    },
    {
      "pregunta": "Venís hablando con un comprador que todavía duda. Un colega te dice: \"apretalo un poco, que si no se te escapa la comisión\". Según la cápsula, ¿qué razonamiento es el correcto?",
      "opciones": [
        "Tiene razón: si no peleás por cerrar, otro agente cierra por vos.",
        "Presiono un poco pero con elegancia, para que no se note que quiero cerrar.",
        "Sigo construyendo confianza y dando valor real: la operación se cierra cuando el comprador está convencido, no cuando el agente lo convenció.",
        "Lo dejo de atender: si duda, no es un comprador serio."
      ],
      "correcta": 2,
      "porQue": "La operación se cierra cuando se tiene que cerrar, y antes de eso hay que construir confianza y dar valor: el cierre es consecuencia, no objetivo.",
      "recordatorio": "REGLA DE ORO: El agente que entra pensando en su comisión, no cierra. El que entra pensando en el cliente, cierra."
    }
  ],
  "capacidad-04/02-de-donde-llegan-leads": [
    {
      "pregunta": "Te asignan por rotación una consulta de una propiedad de oficina, justo cuando estás a full con dos leads de propiedades que captaste vos. ¿Cómo manejás la rotativa?",
      "opciones": [
        "Con el mismo nivel de profesionalismo que las mías: todos los leads importan igual, sin importar por dónde entraron.",
        "La respondo rápido con la ficha para cumplir, y le dedico el tiempo de calidad a mis captaciones, que son las que me generan más.",
        "Le aviso al coordinador que estoy ocupado para que se la pasen a otro colega.",
        "La dejo para el final del día: las rotativas vuelven a rotar si no las atendés."
      ],
      "correcta": 0,
      "porQue": "La regla es explícita: no hay \"este es importante porque es mío\" y \"este lo atiendo a la apurada porque es rotativo\"; cada lead se trata con el mismo profesionalismo.",
      "recordatorio": "Los leads no son tuyos: son oportunidades que el sistema te dio. Cada lead, entre por rotación o por tu captación, se trata con el mismo nivel de profesionalismo. Todos importan igual."
    },
    {
      "pregunta": "Captaste una casa en Roldán y ya está publicada. Un colega te dice que las consultas que entren por esa casa se van a repartir rotativamente entre todo el equipo. ¿Es así?",
      "opciones": [
        "Sí: todas las consultas de portales caen en Tokko y rotan entre los agentes.",
        "Depende del portal: las de Mercado Libre rotan y las de ZonaProp no.",
        "No: las consultas sobre una propiedad que captaste vos te caen directamente a vos, porque vos trajiste el producto.",
        "No: las consultas de captaciones propias las maneja directamente la oficina."
      ],
      "correcta": 2,
      "porQue": "Las consultas sobre propiedades captadas por vos no rotan: te llegan directo porque vos trajiste el producto; la rotación aplica a propiedades de oficina y emprendimientos.",
      "recordatorio": "Las consultas de propiedades de oficina se asignan rotativamente; las de propiedades que captaste vos te caen directamente. En ambos casos, la consulta llega a tu WhatsApp y desde ahí coordinás todo."
    }
  ],
  "capacidad-04/03-primeros-60-segundos": [
    {
      "pregunta": "Entra este mensaje: \"Hola, vi la casa de USD 250.000 en Funes. ¿Está disponible? Pasame info\". ¿Cuál es la respuesta correcta según la cápsula?",
      "opciones": [
        "Mandarle la ficha completa (fotos, precio, m², expensas) y cerrar con \"si te interesa, coordinamos visita\".",
        "Decirle que primero necesitás que responda unas preguntas y que después le pasás la info.",
        "Saludarlo por su nombre, avisarle que la info se la pasás en un rato, y antes hacerle una pregunta corta: ¿es para vivir o inversión, y qué le llamó la atención de esa propiedad?",
        "Responder solo \"Sí, está disponible\" y esperar a ver qué tan interesado está."
      ],
      "correcta": 2,
      "porQue": "La respuesta correcta abre conversación: saluda por el nombre, avisa que la info viene (no la niega, no genera ansiedad), te posiciona como profesional que pregunta antes de actuar y filtra desde el minuto uno.",
      "recordatorio": "REGLA: No mandes ficha hasta que tengas claras al menos tres cosas: para qué busca, qué le llamó la atención de esa propiedad, y si tiene algo para entregar o si va con cash o crédito."
    },
    {
      "pregunta": "Le hiciste las preguntas de apertura y el cliente responde: \"No, mandame nomás la info\". Insistís una vez con amabilidad y tampoco responde nada. ¿Cómo lo leés?",
      "opciones": [
        "Es una señal del filtro inicial: o no es el momento, o no es el lead correcto. No le dedico horas a alguien que no da ni una respuesta.",
        "Es normal, la gente no quiere dar datos por WhatsApp: le mando la ficha completa y una selección de propiedades similares para engancharlo.",
        "Lo llamo por teléfono de inmediato para sacarle las respuestas por voz.",
        "Lo bloqueo: si no responde preguntas, es un comprador tóxico."
      ],
      "correcta": 0,
      "porQue": "El filtro inicial existe justamente para esto: el que es serio responde con detalle, y el que no responde te está dando una señal que te ahorra horas después.",
      "recordatorio": "El filtro del primer minuto separa al serio del que no lo es: si el cliente no responde las preguntas básicas, es señal de que no es momento o no es el lead correcto. Ese filtro inicial te ahorra horas después."
    },
    {
      "pregunta": "Llevás 3 idas y vueltas por WhatsApp con un cliente que responde bien y con detalle. ¿Cuál es el próximo paso ideal?",
      "opciones": [
        "Seguir por mensaje: si la conversación fluye por escrito, no hay que tocarla.",
        "Proponerle una llamada corta de 10 minutos, sin forzar: la voz construye una confianza que el texto no transmite.",
        "Invitarlo directamente a una visita: ya respondió suficiente.",
        "Pedirle su mail para mandarle la información más formal."
      ],
      "correcta": 1,
      "porQue": "Después de las primeras 2 o 3 idas y vueltas por mensaje, lo ideal es proponer una llamada corta, porque ahí se construye confianza real y tu tasa de cierre se multiplica — sin forzar al que prefiere mensajes.",
      "recordatorio": "WhatsApp es el canal de entrada, pero la llamada telefónica es donde se construye confianza real. Después de 2 o 3 idas y vueltas, proponé una llamada corta; si el cliente prefiere mensajes, no lo fuerces."
    }
  ],
  "capacidad-04/04-preguntas-que-filtran": [
    {
      "pregunta": "Tenés la lista de preguntas que filtran al comprador (búsqueda, presupuesto, tiempo y decisión). Un cliente nuevo te responde con buena onda. ¿Cómo se las hacés?",
      "opciones": [
        "Le mando las 11 preguntas juntas en un solo mensaje, así tengo todo el perfil de una.",
        "Le mando un formulario para que lo complete antes de seguir la conversación.",
        "Empiezo solo por las de presupuesto, que son las que de verdad importan.",
        "Voy metiendo 4 o 5 en la conversación natural, una por vez, a medida que el cliente me da espacio."
      ],
      "correcta": 3,
      "porQue": "Las preguntas no se hacen todas juntas como interrogatorio: se van metiendo en la conversación natural, y 4 o 5 bien hechas dan más material que 11 mal hechas.",
      "recordatorio": "No hagas las preguntas como interrogatorio: metelas en la conversación natural, una por vez. Hacé 4 o 5 bien hechas y vas a tener mucho más material que con 11 mal hechas."
    },
    {
      "pregunta": "Le preguntás a un cliente por su presupuesto y sus plazos, y responde: \"No sé, estoy mirando... depende\". Volvés a intentar más adelante y sigue igual de vago. ¿Qué hacés?",
      "opciones": [
        "Le armo igual una selección de propiedades: capaz viendo opciones concretas se define.",
        "No le dedico tiempo activo hasta que la información sea más clara: las respuestas vagas son señal de alerta, esté o no listo.",
        "Lo presiono con una pregunta directa: \"¿tenés la plata o no?\", para sacarme la duda.",
        "Lo descarto definitivamente: el que no da información no es comprador."
      ],
      "correcta": 1,
      "porQue": "Las respuestas vagas o evasivas pueden significar que no está listo o que no es serio, y en ambos casos la conducta es la misma: no dedicarle tiempo activo hasta que la información sea más clara.",
      "recordatorio": "Las respuestas honestas y detalladas son señal de comprador real. Las vagas o evasivas son señal de alerta: no le dediques tiempo activo hasta que la información sea más clara."
    }
  ],
  "capacidad-04/05-comprador-toxico": [
    {
      "pregunta": "Un comprador te descartó una casa por \"muy lejos\", otra por \"muy chica\", una de 200 metros por \"muy cara\" y una más barata otra vez por \"muy chica\". Además te pidió \"todas las casas entre 200 y 400 mil en Funes y Roldán\". ¿Qué hacés?",
      "opciones": [
        "Miro la conversación entera y espero a confirmar el patrón en 2-3 interacciones: ya hay dos red flags claros (descartes contradictorios y pedir todo sin criterio), pero el patrón es lo que importa.",
        "Le mando todo lo que tengo en ese rango: con más opciones, alguna le va a cerrar.",
        "Le digo de frente que sus criterios se contradicen y que así no puedo trabajar.",
        "Lo bloqueo en el momento: dos red flags alcanzan para cortar de una."
      ],
      "correcta": 0,
      "porQue": "No se descarta en el primer mensaje: se confirma el patrón en 2-3 interacciones, porque a veces alguien reacciona mal una vez, pero acá ya hay red flags acumulándose.",
      "recordatorio": "Si ves dos o tres red flags en menos de una semana, es comprador tóxico. Pero primero confirmá: mirá la conversación entera y esperá 2-3 interacciones — el patrón es lo que importa, no un mensaje suelto."
    },
    {
      "pregunta": "Un comprador te hace preguntas muy detalladas, te pide criterio sobre cada propiedad, chequea todo y no acepta cualquier cosa. Te empieza a resultar demandante. ¿Es un comprador tóxico?",
      "opciones": [
        "Sí: el que exige tanto nunca va a estar conforme con nada.",
        "Sí, si además te hace perder tiempo con tantas preguntas.",
        "No: es un comprador exigente, que es legítimo y valorable. El tóxico es el que no valora tu trabajo, no respeta tu tiempo y maltrata — otra cosa distinta.",
        "Depende del presupuesto: si compra caro, se le tolera la exigencia."
      ],
      "correcta": 2,
      "porQue": "La cápsula distingue explícitamente: el exigente es legítimo y valorable porque le importa lo que compra y te pide criterio; el tóxico es el que no valora tu trabajo, no respeta tu tiempo y nunca está conforme.",
      "recordatorio": "Comprador exigente no es comprador tóxico: el exigente es legítimo y valorable. El tóxico es el que no valora tu trabajo, no respeta tu tiempo y nunca está conforme. Identificarlo rápido no es crueldad, es supervivencia profesional."
    },
    {
      "pregunta": "Confirmaste que un comprador es tóxico: te maltrató en varias conversaciones y exige cosas desproporcionadas. Te vuelve a escribir pidiendo una ficha. ¿Qué hacés?",
      "opciones": [
        "Le explico con respeto que por su trato decidí no priorizarlo más, así queda claro.",
        "Le respondo cuando puedo, profesional y breve, y le mando la ficha con el estándar mínimo — sin decirle nada de mi decisión ni regalarle mi mejor versión.",
        "Lo bloqueo directamente para no gastar ni un minuto más.",
        "Le respondo con el estándar SI completo: el profesionalismo se sostiene con todos por igual."
      ],
      "correcta": 1,
      "porQue": "El manejo correcto es pasar a baja prioridad sin anunciarlo: respondés profesional y breve, cumplís lo que sí podés con el estándar mínimo, y no le regalás tu mejor versión ni generás conflicto explicándole el descarte.",
      "recordatorio": "Con el tóxico confirmado: límite con elegancia, baja prioridad y estándar mínimo. No le digas que es tóxico ni le expliques que lo descartaste — eso genera conflicto innecesario. Dedicale ese tiempo a compradores que sí valoran lo que hacés."
    }
  ],
  "capacidad-04/06-seleccion-con-feedback": [
    {
      "pregunta": "Filtraste bien a un cliente y encontrás 9 propiedades de cartera que encajan con lo que pidió. ¿Qué le mandás?",
      "opciones": [
        "Las 9, en mensajes separados: mientras más opciones vea, más chances de que algo le guste.",
        "No más de 4, elegidas con criterio, unificadas en un solo link, con un mensaje corto que explica por qué elegí esas 4.",
        "Las 2 mejores nada más, para no abrumarlo, sin mucha explicación.",
        "Los links de Zonaprop de las 9, y que él me diga cuáles quiere ver."
      ],
      "correcta": 1,
      "porQue": "La primera selección es de máximo 4 propiedades en una sola entrega curada con explicación del criterio: más cantidad marea, hace comparar cosas incomparables y diluye tu criterio.",
      "recordatorio": "La primera selección es de no más de 4 propiedades, unificadas en un solo link, con un mensaje que explica por qué esas 4. Más cantidad marea al cliente y diluye tu criterio. Mandar 12 links sueltos no es conducir una conversación: es tirar info."
    },
    {
      "pregunta": "Ya le mandaste la selección con su explicación. ¿Cómo cerrás el mensaje para conseguir feedback que te sirva?",
      "opciones": [
        "\"¿Qué te parece? Cualquier cosa me decís.\"",
        "\"Avisame cuando quieras coordinar visita de alguna.\"",
        "\"Después contame si te gustaron.\"",
        "\"¿Cuál descartarías de una y por qué? ¿Cuál te genera más interés? ¿Qué falta o sobra en alguna?\""
      ],
      "correcta": 3,
      "porQue": "El sistema pide feedback específico, no abierto: preguntas como \"cuál descartarías y por qué\" te dan información accionable que un \"qué te parece\" nunca te da.",
      "recordatorio": "Pedí feedback específico, no abierto: no \"qué te parece\" sino \"cuál descartarías y por qué\". El cliente además puede marcar, comentar y reaccionar dentro del mismo link de la selección — eso te da información mucho más rica."
    },
    {
      "pregunta": "Mandaste la selección y el cliente responde tibio: \"buenas, voy mirando\", sin concretar nada. Según el semáforo de feedback, ¿qué corresponde?",
      "opciones": [
        "Es amarillo: pido una segunda interacción más específica antes de invertir más tiempo.",
        "Es verde con timidez: lo invito a visitar la que yo creo que más le encaja.",
        "Es rojo: pasa directo a seguimiento liviano.",
        "Le armo enseguida una segunda selección con más propiedades para reactivarlo."
      ],
      "correcta": 0,
      "porQue": "Respuesta tibia y vaga sin concretar es amarillo: antes de invertir más tiempo, pedís una segunda interacción más específica — rojo sería no responder en 72 horas o responder evasivo.",
      "recordatorio": "Semáforo del feedback: verde (respuesta con detalle e interés concreto) → visita; amarillo (tibio, vago) → pedís una segunda interacción más específica antes de invertir más tiempo; rojo (sin respuesta en 72 horas o evasivo) → seguimiento liviano."
    }
  ],
  "capacidad-04/07-visita-objeciones": [
    {
      "pregunta": "Termina la visita y el cliente te dice: \"Lo voy a pensar\". ¿Qué hacés?",
      "opciones": [
        "Le digo \"perfecto, tomate tu tiempo\" y espero a que me escriba.",
        "Le meto un poco de urgencia: \"pensalo rápido porque hay otra persona interesada\".",
        "Le pregunto: \"¿Qué necesitás pensar específicamente? ¿Es el precio, la ubicación, algo del estado?\". Si me dice algo concreto, sé sobre qué trabajar.",
        "Le ofrezco directamente un descuento para destrabar la decisión."
      ],
      "correcta": 2,
      "porQue": "\"Lo voy a pensar\" es la objeción que el agente nuevo deja pasar: hay que preguntar qué necesita pensar específicamente, porque una respuesta concreta te dice sobre qué trabajar y una vaga te avisa que va a pasar al limbo.",
      "recordatorio": "Ante \"lo voy a pensar\", preguntá qué necesita pensar específicamente. Si responde algo concreto, sabés sobre qué trabajar; si dice \"no, en general\", probablemente no está listo. Tener una respuesta lista para cada objeción no es ser robot: es estar preparado."
    },
    {
      "pregunta": "En plena visita el cliente te dice: \"Me parece cara\". ¿Cuál es la reacción correcta?",
      "opciones": [
        "Preguntarle: \"¿Comparado con qué? ¿Viste otras similares más baratas?\" — a veces comparó con propiedades distintas, y otras veces tiene razón y hay que llevar la objeción al dueño.",
        "Defender el precio explicando todo lo que la propiedad vale.",
        "Decirle que el precio lo pone el dueño y que vos no podés hacer nada.",
        "Ofrecerle de entrada que el dueño seguro acepta una rebaja."
      ],
      "correcta": 0,
      "porQue": "La respuesta correcta no es defenderse sino preguntar con qué compara: eso te dice si la comparación es válida o si efectivamente hay que trabajar la objeción con el dueño.",
      "recordatorio": "Ante \"me parece caro\", no respondas a la defensiva: preguntá \"¿comparado con qué?\". A veces el cliente comparó con propiedades distintas y vale explicárselo; otras veces tiene razón y hay que llevar la objeción al dueño."
    },
    {
      "pregunta": "Después de la visita, el cliente está claramente enganchado con la propiedad: pregunta detalles, se imagina viviendo ahí. Pero no dice nada de hacer una oferta. ¿Qué hacés?",
      "opciones": [
        "Espero: si el interés es real, la oferta la va a proponer él.",
        "Lo estimulo yo, preguntando con criterio: \"Te veo con interés real. ¿Querés que hablemos de qué oferta tendría sentido hacer? Te puedo ayudar a pensar el número y la estrategia\".",
        "Le mando más propiedades similares para que compare antes de decidir.",
        "Le digo que si no ofrece esta semana, la propiedad se vende."
      ],
      "correcta": 1,
      "porQue": "El cliente rara vez propone la oferta solo: cuando hay interés real, el agente la estimula preguntando con criterio y dándole herramientas para armarla — sin vender ni presionar.",
      "recordatorio": "El cliente rara vez dice solo \"quiero hacer una oferta\". Si está claramente enganchado, vos lo estimulás: no vendiendo ni presionando, sino preguntando con criterio y dándole herramientas para pensar el número y la estrategia."
    }
  ],
  "capacidad-04/08-cuando-no-es": [
    {
      "pregunta": "Le mandaste la selección a un lead, un follow-up amable a los 5 días, y a las 2 semanas nunca respondió nada. ¿Qué hacés?",
      "opciones": [
        "Le escribo una vez más explicándole que necesito una respuesta para saber si sigo buscándole opciones.",
        "Lo paso a seguimiento liviano: lo agendo en Tokko con estado claro y le mando un mensaje cada 2-3 meses con info útil de mercado, sin pedido ni presión.",
        "Lo elimino de mis contactos: el que no responde en 2 semanas no compra nunca.",
        "Le sigo escribiendo cada semana hasta que responda algo."
      ],
      "correcta": 1,
      "porQue": "Sin respuesta sostenida no es comprador activo: no se descarta del todo ni se persigue — se pasa a seguimiento liviano, que te mantiene presente sin gastar energía.",
      "recordatorio": "Selección + follow-up a los 5 días + 2 semanas sin respuesta = no es comprador activo. Pasa a seguimiento liviano: lo agendás en Tokko y le mandás info útil cada 2-3 meses, sin enojo, sin reproche, sin explicación. Simplemente dejás de ser proactivo."
    },
    {
      "pregunta": "Tenés 40 leads en el teléfono y sentís que no llegás a atender bien a ninguno. La mayoría responde tibio; unos 5 muestran señales reales de compra. ¿Cuál es la jugada correcta?",
      "opciones": [
        "Concentrarme en los 5 activos y pasar a los 35 tibios a seguimiento liviano: atiendo mucho mejor a los que van a comprar y mantengo la puerta abierta con el resto.",
        "Repartir el tiempo parejo entre los 40: nunca sabés cuál termina comprando.",
        "Descartar definitivamente a los 35 tibios para limpiar la agenda.",
        "Pedir que me deriven menos leads hasta ponerme al día con todos."
      ],
      "correcta": 0,
      "porQue": "La cantidad de leads activos que se pueden manejar bien es limitada: dispersarse en 40 tibios hace atender mal a los 5 que iban a comprar, mientras que concentrarse en los activos y dejar al resto en seguimiento liviano mejora la atención sin cerrar puertas.",
      "recordatorio": "La cantidad de leads activos que un agente puede manejar bien es limitada. Si te dispersás con 40 leads tibios, atendés mal a los 5 que iban a comprar. Es contraintuitivo: vendés más vendiéndole a menos."
    }
  ],
  "capacidad-04/09-tokko-durante-conversacion": [
    {
      "pregunta": "Terminás una visita donde el cliente planteó dos objeciones importantes, y te está entrando otra conversación por WhatsApp. ¿Qué hacés con Tokko?",
      "opciones": [
        "Anoto todo el fin de semana, cuando tenga tiempo de escribir bien el detalle de cada lead.",
        "No hace falta cargar nada: la conversación quedó en WhatsApp y ahí está todo.",
        "Antes de pasar a otra cosa, dos minutos en Tokko: cargo el hito de la visita con una nota breve de tres o cuatro líneas (cómo fue, qué objeciones aparecieron).",
        "Cargo la transcripción completa de la visita, mensaje por mensaje, para no perder nada."
      ],
      "correcta": 2,
      "porQue": "La regla es cargar los hitos importantes en el momento, con notas breves de tres o cuatro líneas — ni cada mensaje suelto (insostenible) ni dejarlo para después.",
      "recordatorio": "REGLA: Después de cada conversación importante, antes de pasar a otra cosa, dos minutos en Tokko. No más. Pero dos minutos, sí o sí. Se cargan los hitos con notas breves de tres o cuatro líneas — no una novela, no cada mensaje suelto."
    },
    {
      "pregunta": "Te vas de vacaciones dos semanas y un colega tiene que retomar tus conversaciones con compradores. ¿Qué es lo que le permite hacerlo sin volver a empezar de cero?",
      "opciones": [
        "Que le reenvíes los chats de WhatsApp de cada cliente antes de irte.",
        "Que los hitos de cada conversación estén cargados en Tokko con notas que cualquiera del equipo pueda leer y entender.",
        "Que le dejes un audio largo contándole el estado de cada lead.",
        "Nada: lo correcto es que los clientes esperen a que vuelvas."
      ],
      "correcta": 1,
      "porQue": "Tokko es lo que le permite a un colega retomar sin empezar de cero: los hitos cargados con notas breves que cualquiera del equipo puede leer y entender — el cliente no tiene por qué pagar el costo de tu ausencia.",
      "recordatorio": "Si una propiedad o una conversación no está en Tokko, para el equipo SI no existe. Tokko es tu memoria externa y la del equipo: si un colega tiene que retomar tu conversación, es lo que le permite hacerlo sin volver a empezar de cero."
    }
  ],
  "capacidad-05/01-toda-oferta-se-traslada": [
    {
      "pregunta": "Te llega una oferta 20% abajo del precio publicado y estás convencido de que el propietario la va a rechazar mal. ¿Qué hacés?",
      "opciones": [
        "Te la guardás para no molestar al dueño con algo que va a rechazar seguro",
        "Se la trasladás igual, con tu consejo profesional de no aceptarla si esa es tu lectura: la decisión es del dueño, no tuya",
        "Le decís al comprador que con ese número no hay chances y esperás a que la mejore antes de pasarla",
        "La dejás en espera por si aparece otra oferta mejor para presentarlas juntas"
      ],
      "correcta": 1,
      "porQue": "Filtrar la oferta es decidir vos por el propietario; tu trabajo es asesorarlo, y además una oferta baja hoy puede quedar como referencia que destrabe la venta en 3 meses.",
      "recordatorio": "Toda oferta se traslada. Punto. No es tu trabajo decidir por el propietario: es tu trabajo asesorarlo, y por precio bajo jamás se filtra una oferta."
    },
    {
      "pregunta": "Un interesado te hace una oferta 35% abajo del precio publicado. Además, en la conversación te maltrata, exige que el dueño le conteste en una hora y descalifica la propiedad con insultos. ¿Qué hacés?",
      "opciones": [
        "La trasladás igual: toda oferta se traslada, sin ninguna excepción posible",
        "Trasladás solo el número y le ocultás al dueño los malos modos del comprador",
        "Le pedís que suba el precio antes de trasladar nada",
        "Podés decidir no trasladarla y cortar la conversación: la excepción única es la ofensa en las formas, no en el precio"
      ],
      "correcta": 3,
      "porQue": "La regla admite una sola excepción, y es cuando la oferta es ofensiva en términos personales — por precio bajo se traslada siempre, pero ante maltrato podés cortar.",
      "recordatorio": "Por precio bajo, siempre se traslada. La única excepción es la oferta ofensiva en la forma (maltrato, exigencias absurdas, insultos): ahí podés decidir no trasladarla y cortar."
    }
  ],
  "capacidad-05/02-cuando-estimular-oferta": [
    {
      "pregunta": "En una visita, el comprador te dice \"está cara y el baño habría que arreglarlo\", pero sigue recorriendo la casa y te pregunta cuánto salen los impuestos. ¿Qué hacés?",
      "opciones": [
        "Lo das por perdido: el que objeta el precio no va a comprar",
        "Defendés el precio con argumentos hasta desarmar la objeción",
        "Leés las objeciones y las preguntas de detalle como señales de interés y tirás el gancho: \"Te veo con interés real. ¿Te animás a hacer una oferta?\"",
        "Le ofrecés bajar el precio ahí mismo para que no se enfríe"
      ],
      "correcta": 2,
      "porQue": "El cliente que no está interesado se va sin decir nada; el que objeta y pregunta detalles ya se imaginó comprando, y ese es el momento de estimular la oferta con una pregunta directa.",
      "recordatorio": "Detectás señales → tirás el gancho con una pregunta directa → escuchás cómo reacciona. Si reacciona con cifras, avanzás; si evade, todavía no es el momento o no es el cliente."
    },
    {
      "pregunta": "Un comprador vuelve a visitar la propiedad por segunda vez, ahora con la pareja. Sentís que es el momento, pero te da miedo presionarlo. ¿Qué hacés?",
      "opciones": [
        "Tirás la pregunta directa, sin presión barata: \"¿Querés que armemos juntos una oferta para llevarle al dueño?\"",
        "Le decís que hay otro comprador interesado, para que se apure a decidir",
        "Esperás unos días a que él saque el tema solo, así no se siente presionado",
        "Le mandás más fotos y planos y dejás que decida por su cuenta"
      ],
      "correcta": 0,
      "porQue": "La repetición de visita es señal clarísima de interés y el momento no se deja pasar; la pregunta directa abre el juego, mientras que la presión barata tipo \"hay otro interesado\" mata la confianza y esperar enfría el impulso.",
      "recordatorio": "No esperes que el cliente saque el tema: el interés se enfría con los días. Vos identificás el momento y estimulás la oferta con una pregunta concreta, sin frases de vendedor desesperado."
    }
  ],
  "capacidad-05/03-como-armar-oferta-seria": [
    {
      "pregunta": "La propiedad está publicada en USD 220.000 y el comprador te dice \"ofrezco 180\". ¿Qué hacés?",
      "opciones": [
        "Lo pensás con él: le explicás que 18% abajo probablemente el dueño la rechace de una, y le proponés alternativas con más chances (por ejemplo 195 cash con escritura corta), dejando que él decida",
        "La trasladás tal cual: tu trabajo es pasar lo que el comprador diga, no opinar sobre su número",
        "Lo convencés de subir todo lo posible, porque tu objetivo es que el vendedor cobre más",
        "No la trasladás hasta que llegue a un número que a vos te parezca razonable"
      ],
      "correcta": 0,
      "porQue": "La oferta la armás vos junto con el comprador: asesorar es decirle la verdad sobre qué tiene chances de prosperar, para que haga la mejor oferta posible para SU situación — no manipularlo ni pasarla cruda.",
      "recordatorio": "La oferta no se pasa cruda: la armás VOS junto con el comprador, con criterio profesional. Tu trabajo es que haga la mejor oferta posible para SU situación, no para la del vendedor."
    },
    {
      "pregunta": "Un propietario recibe dos ofertas: USD 215.000 con anticipo del 30% y 12 cuotas, y USD 200.000 cash. Te pregunta cuál le conviene. ¿Qué le decís?",
      "opciones": [
        "La de 215.000: siempre conviene el número más alto",
        "Que decida él solo, vos no opinás sobre plata ajena",
        "Que no se comparan solo por precio: cada forma de pago tiene un valor distinto para el vendedor, y 200.000 cash pueden valer más que 215.000 financiados",
        "La de cuotas, porque financiar siempre le suma valor a la oferta"
      ],
      "correcta": 2,
      "porQue": "El precio es la variable más visible pero no la única: la forma de pago cambia el valor real de la oferta, y el agente que entiende eso arma cierres que por número solo parecían caídos.",
      "recordatorio": "Una oferta no es solamente un precio: tiene cinco variables (precio, forma de pago, plazo de escritura, condiciones y referéndum) y todas importan. USD 200.000 cash valen más que USD 215.000 con anticipo y cuotas."
    },
    {
      "pregunta": "Cortás la llamada con un comprador y te das cuenta de que definieron precio, forma de pago y condiciones, pero no hablaron de plazo de escritura ni de referéndum. ¿Qué hacés?",
      "opciones": [
        "La trasladás igual: con el precio y la forma de pago alcanza para arrancar, el resto se ve después",
        "Volvés a hablar con el comprador antes de trasladar nada: si queda alguna de las cinco variables sin definir, la oferta no está completa",
        "Completás vos los huecos con valores estándar para no molestarlo de nuevo",
        "Le pedís al propietario que proponga él el plazo que le convenga"
      ],
      "correcta": 1,
      "porQue": "Antes de cortar la llamada tenés que tener las cinco variables claras; una oferta con variables sin definir no está completa y pierde peso cuando la llevás al vendedor.",
      "recordatorio": "Cuando hables con un comprador, asegurate de tener las cinco variables claras antes de cortar la llamada. Si te queda alguna sin definir, la oferta no está completa."
    }
  ],
  "capacidad-05/04-trasladar-oferta-propietario": [
    {
      "pregunta": "Terminaste de armar una oferta seria un martes a las 21hs. El propietario suele contestar WhatsApp al toque. ¿Cómo se la trasladás?",
      "opciones": [
        "Le mandás un audio de WhatsApp con todos los datos, así le queda grabado",
        "Lo llamás por teléfono: necesitás escuchar cómo reacciona, y una oferta por WhatsApp pierde peso entre otros 30 mensajes",
        "Le mandás un mensaje de texto bien detallado para que lo procese con tiempo",
        "Esperás a la próxima reunión presencial para dársela en persona"
      ],
      "correcta": 1,
      "porQue": "La llamada te asegura que el dueño está prestando atención en el momento exacto en que recibe la información y te deja escuchar su reacción; el WhatsApp queda solo como plan B con nota explícita de \"te llamo, tengo algo concreto\".",
      "recordatorio": "Las ofertas no se trasladan por WhatsApp: se trasladan por llamada telefónica. Solo si la llamada no es posible va WhatsApp, con nota explícita de que tenés algo concreto para conversar."
    },
    {
      "pregunta": "Le trasladás al propietario una oferta de USD 195.000 (publicada en 220, primera oferta seria en 2 meses) y te contesta \"rechazo, quiero los 220\". ¿Qué hacés?",
      "opciones": [
        "Contestás \"OK, le digo al comprador\" y trasladás el rechazo tal cual",
        "Le insistís hasta que acepte los 195, porque vos leés mejor el mercado que él",
        "No trasladás nada todavía y dejás pasar unos días a ver si recapacita solo",
        "Le compartís tu lectura (cortar la primera oferta seria en 2 meses probablemente espante al comprador) y le sugerís una contraoferta que lo deje en el juego; si aun así insiste, trasladás el rechazo"
      ],
      "correcta": 3,
      "porQue": "Vos sos asesor, no buzón: das tu criterio profesional e intentás destrabar la negociación, pero la decisión final siempre es del dueño.",
      "recordatorio": "Vos no sos un buzón entre las partes: sos un asesor que maneja una negociación, con opinión propia. Toda contraoferta también se traslada, con tu lectura y tu sugerencia, y la decisión final es del dueño."
    }
  ],
  "capacidad-05/05-hasta-donde-negociacion": [
    {
      "pregunta": "Propiedad bien tasada con NURC y publicada en valor de mercado a USD 220.000. El comprador no se mueve de 198.000 (10% abajo) y el dueño no tiene ninguna urgencia por vender. ¿Qué hacés?",
      "opciones": [
        "Cerrás: 10% es un descuento normal, negociar implica bajar",
        "Cerrás solo si el comprador viene con cash",
        "No empujás ese cierre: en una propiedad bien tasada el descuento aceptable es máximo 5%; más que eso ya no es negociar, es que el dueño pierda plata real",
        "No cedés ni un dólar: el precio publicado se defiende siempre"
      ],
      "correcta": 2,
      "porQue": "En una propiedad en valor real, un cierre 10% abajo es plata perdida para el dueño, y forzarlo te deja un cliente descontento que va a hablar mal de SI durante años — más vale perder esa operación que cerrarla mal.",
      "recordatorio": "En propiedad bien tasada y publicada en precio, el descuento aceptable es máximo 5%. Descuentos mayores al 10% solo se justifican con urgencia real del dueño o con precio publicado muy fuera de mercado."
    },
    {
      "pregunta": "El dueño insistió en publicar por encima del valor real (se lo marcaste, pero pasó). Llega una oferta 8% abajo del precio publicado. ¿Cómo la leés?",
      "opciones": [
        "Puede ser razonable: cuando el precio publicado ya tenía margen, el descuento aceptable llega a entre 5% y 10%",
        "La descartás: más de 5% no se acepta nunca, sin importar cómo se publicó",
        "Defendés a muerte el precio publicado, porque negociar es no ceder",
        "Da lo mismo cómo se publicó: el descuento aceptable es siempre el mismo"
      ],
      "correcta": 0,
      "porQue": "El descuento aceptable depende de cómo estaba parado el precio inicial: si se publicó arriba de mercado, ese margen absorbe un descuento mayor sin que el dueño pierda valor real.",
      "recordatorio": "El descuento aceptable depende de cómo estaba parado el precio inicial: máximo 5% en propiedad bien tasada, entre 5% y 10% si se publicó por encima del valor real. Los dos errores típicos son regalar en propiedades bien tasadas y defender a muerte precios inflados."
    },
    {
      "pregunta": "Estás firmando el Acuerdo con un propietario y le recomendás publicar a USD 220.000. ¿Qué conversás en ese momento sobre la negociación futura?",
      "opciones": [
        "Nada: la negociación se conversa cuando llegue la primera oferta",
        "El margen de antemano: le anticipás que probablemente cierre entre 210 y 215, y que si necesita sí o sí 220 netos conviene publicar en 230 para tener margen",
        "Le prometés que vas a defender los 220 sin ceder nada",
        "Le pedís autorización para aceptar directamente cualquier oferta de 200 para arriba"
      ],
      "correcta": 1,
      "porQue": "Conversar el margen de negociación al firmar el Acuerdo hace que, cuando llegue la primera oferta a 210, el propietario no se sorprenda porque ya lo habían hablado.",
      "recordatorio": "Cuando captás una propiedad y firmás el Acuerdo, conversás de antemano el margen de negociación con el propietario. Eso te ahorra problemas cuando llegue la primera oferta."
    }
  ],
  "capacidad-05/06-referendum-sena-48-horas": [
    {
      "pregunta": "Hay acuerdo verbal en una operación de USD 200.000. El comprador ofrece dejar hoy mismo USD 2.000 de referéndum y a vos la cifra te parece chica. ¿Qué hacés?",
      "opciones": [
        "Le pedís directamente el 5-10% del total: es lo que corresponde para asegurar la operación",
        "Rechazás el referéndum y esperás a firmar la seña formal de una",
        "Le pedís que firme una promesa de USD 50.000 sin poner plata todavía",
        "Lo tomás: el referéndum es un monto simbólico, y una reserva de 2.000 firmada y entregada vale infinitamente más que una promesa verbal de 50.000"
      ],
      "correcta": 3,
      "porQue": "El objetivo del referéndum no es la cifra sino que ambas partes pongan algo concreto sobre la mesa: el compromiso firme es lo que importa, y el 5-10% corresponde recién a la seña formal.",
      "recordatorio": "El referéndum es un monto simbólico (entre USD 1.000 y 5.000) que sella el acuerdo de palabra: la cifra es lo de menos, el compromiso firme es lo que importa. La seña formal (5-10%) viene después."
    },
    {
      "pregunta": "Tomaste el referéndum el lunes. El escribano te dice que recién puede armar la seña en 10 días. ¿Qué hacés?",
      "opciones": [
        "Aceptás los 10 días: con el referéndum tomado, la operación ya está asegurada",
        "Te movés para que la seña se firme dentro de las 48 horas: coordinás escribano, juntás la documentación pendiente y organizás la firma, porque las operaciones se caen en los huecos de tiempo",
        "Le pedís al comprador que suba el monto del referéndum para compensar la espera",
        "Dejás que comprador y vendedor arreglen los tiempos entre ellos"
      ],
      "correcta": 1,
      "porQue": "El plazo referéndum → seña es de 48 horas por regla SI: cuanto más tiempo pasa entre el sí verbal y la formalización, más chances de que aparezca algo que rompa el acuerdo, y tu rol ahí es de coordinador que empuja cada paso.",
      "recordatorio": "El plazo para transformar el referéndum en seña formal es de 48 horas. No más. Las operaciones se caen en los huecos de tiempo, no en los momentos de decisión."
    }
  ],
  "capacidad-05/07-acompanar-hasta-escritura": [
    {
      "pregunta": "Se firmó la seña y el expediente quedó en manos del escribano. Tenés tres leads nuevos esperando. ¿Qué hacés con esta operación?",
      "opciones": [
        "Seguís encima: contacto con el escribano todas las semanas, documentación completa y avanzando, y vos como punto de contacto único del cliente hasta la escritura",
        "Ya está: la operación pasó, ahora la maneja el escribano y vos te enfocás en los leads nuevos",
        "Respondés solo si el cliente o el escribano te llaman con algún problema",
        "Le pedís al comprador que siga él el trámite y te avise la fecha de escritura"
      ],
      "correcta": 0,
      "porQue": "Las operaciones se caen entre la seña y la escritura por cosas que parecen menores, y si vos estás encima se resuelven antes de volverse grandes; desaparecer después de la seña es el error del agente promedio.",
      "recordatorio": "El agente acompaña al cliente desde la primera consulta hasta el día de la escritura. Nunca lo deja solo: las operaciones se caen entre la seña y la escritura por cosas que parecen menores."
    },
    {
      "pregunta": "Es el día de la escritura de una operación que cerraste, y justo ese día te caen dos visitas con compradores nuevos. ¿Qué hacés?",
      "opciones": [
        "Llamás al cliente a la mañana para felicitarlo y te vas a las visitas",
        "Le mandás un mensaje cálido y le pedís que te cuente cómo salió",
        "Reacomodás las visitas y vas: el día de la escritura estás físicamente presente, porque ese momento es el que construye tu cartera de los próximos años",
        "Vas solo si el cliente te lo pide explícitamente"
      ],
      "correcta": 2,
      "porQue": "Tu presencia física ese día comunica \"acompañé hasta el final\", y eso es lo que hace que ese cliente te recomiende y vuelva a pensarte cinco años después — no un mensaje ni una llamada.",
      "recordatorio": "El día de la escritura, estás físicamente presente. No mandás mensaje, no llamás: vas y estás. Cada operación acompañada bien planta un árbol; dejada colgada, planta nada."
    }
  ],
  "capacidad-05/08-errores-tipicos-cierre": [
    {
      "pregunta": "Venís sin cerrar hace meses y te llega una oferta 15% abajo en una propiedad que manejás. ¿Cómo la trasladás al propietario?",
      "opciones": [
        "No la trasladás: con ese número solo vas a hacer enojar al dueño",
        "La trasladás con tu criterio adelante: \"Te paso esta oferta, pero mi sugerencia es contraofertar más cerca de tu precio. Vamos por ahí\"",
        "La trasladás tal cual llega, con un \"el comprador no se mueve, qué hacemos\"",
        "Presionás al dueño para que la acepte: algo es mejor que nada"
      ],
      "correcta": 1,
      "porQue": "Guardarse la oferta y pasarla cruda con mensaje débil son los dos errores opuestos y típicos del agente nuevo; lo correcto es trasladar siempre, pero con tu lectura profesional adelante.",
      "recordatorio": "Toda oferta se traslada, pero con tu criterio profesional adelante. Ni te la guardás por vergüenza, ni la pasás cruda con un mensaje débil que rompa la operación."
    },
    {
      "pregunta": "Cerraste un referéndum por teléfono un viernes a la noche. Tenés todo claro en la cabeza: montos, escribano, fecha tentativa de seña. ¿Qué hacés con Tokko?",
      "opciones": [
        "Cargás todo igual antes de cerrar el día: si no lo cargás, no existe, y si te pasa algo nadie del equipo puede tomar la posta sin volver a empezar de cero",
        "Lo cargás cuando se firme la seña, así cargás todo junto una sola vez",
        "Con el comprobante firmado alcanza; Tokko es opcional en la etapa de cierre",
        "Le mandás un resumen por WhatsApp a tu coordinador y con eso ya queda registrado"
      ],
      "correcta": 0,
      "porQue": "Toda la trazabilidad del cierre (oferta, contraoferta, acuerdo, referéndum, seña, escribano, escritura) tiene que quedar registrada para que cualquiera del equipo pueda continuar la operación si vos no estás.",
      "recordatorio": "Toda la trazabilidad de la operación queda registrada en Tokko: oferta, contraoferta, acuerdo, referéndum, seña, escribano y escritura. Si no lo cargás, no existe."
    },
    {
      "pregunta": "Un comprador que ya señó te pide que le adelantes la llave para ir a medir muebles antes de la escritura. Te cae bien y parece un favor inofensivo. ¿Qué hacés?",
      "opciones": [
        "Se la das: ya señó, hay confianza y es un favor chico",
        "Le decís que le pida permiso directo al vendedor y que se arreglen entre ellos",
        "No lo decidís solo: las excepciones al protocolo se acuerdan con la inmobiliaria, así que lo consultás con tu coordinador antes de responder",
        "Se la das, pero le pedís que no lo comente con nadie"
      ],
      "correcta": 2,
      "porQue": "Cada paso del proceso tiene un protocolo por una razón, y decir que sí por simpatía a favores por afuera del proceso es la fuente número uno de problemas que aparecen 3 meses después.",
      "recordatorio": "Las excepciones se acuerdan con la inmobiliaria, no las decidís solo. Si tenés dudas, consultá con tu coordinador: hacer favores rápido es la fuente número uno de problemas que aparecen 3 meses después."
    }
  ],
  "capacidad-06/01-escritura-no-es-final": [
    {
      "pregunta": "Firmaste la escritura de un departamento en Funes, cobraste la comisión y el cliente quedó contento. En el sistema te queda la ficha abierta. ¿Qué hacés según lo que plantea la cápsula?",
      "opciones": [
        "Cerrás la ficha y archivás el contacto: la operación terminó bien y tu foco tiene que estar en el próximo lead, que es el que paga el mes que viene.",
        "Cerrás la operación pero no la relación: ese cliente arranca la fase más rentable, porque la repetición, los referidos y la reputación dependen de lo que hagas después de la escritura.",
        "Le mandás de inmediato un listado de otras propiedades en venta por si conoce a alguien interesado, para aprovechar que quedó conforme."
      ],
      "correcta": 1,
      "porQue": "En la escritura no termina nada: ahí empieza la fase más rentable, porque las tres fuentes de valor (repetición, referidos, reputación) dependen de lo que hacés después de la firma.",
      "recordatorio": "Las tres fuentes — repetición, referidos, reputación — tienen algo en común: dependen de lo que hagas después de la escritura, no de lo que hayas hecho antes. Un cliente bien atendido vale, en términos de carrera, unas tres veces la comisión que cobraste."
    },
    {
      "pregunta": "Un colega con 5 años en el rubro se queja: \"sigo dependiendo de los leads de portales, cada operación me cuesta lo mismo que la primera\". Según la lógica de la cápsula, ¿qué es lo más probable que haya pasado?",
      "opciones": [
        "No sostuvo la relación con sus clientes después de cada escritura: en 5 años de carrera bien sostenida, los referidos deberían ser su fuente principal de leads, por encima de portales y leads fríos.",
        "Tuvo mala suerte con la zona: en Funes y Roldán el mercado se mueve casi todo por portales y no hay mucho que hacer.",
        "Le faltó invertir más en publicidad: con más presupuesto en portales y redes, los leads fríos alcanzan para vivir del rubro.",
        "Atendió mal las operaciones: si los clientes hubieran quedado conformes, habrían vuelto solos sin necesidad de que él hiciera nada."
      ],
      "correcta": 0,
      "porQue": "En 5 años de carrera bien sostenida los referidos pasan a ser la fuente principal de leads, y eso depende del trabajo de postventa — atender bien no alcanza si después desaparecés del radar.",
      "recordatorio": "Un cliente satisfecho te recomienda a 2 o 3 personas en los siguientes 3 años. En 5 años de carrera bien sostenida, los referidos superan ampliamente a lo que entra por portales, redes y leads fríos — pero eso se construye con lo que hacés después de cada escritura."
    }
  ],
  "capacidad-06/02-dia-despues-ritual": [
    {
      "pregunta": "Cerraste una escritura el martes. Pensás pedirle la reseña de Google al cliente, pero te da cosa molestarlo tan pronto y decidís esperar un mes, cuando ya esté instalado. ¿Qué dice el material sobre esa decisión?",
      "opciones": [
        "Está bien esperar: un pedido tan pegado a la firma suena interesado y puede arruinar la buena impresión que dejaste.",
        "Mejor no pedir nunca: las reseñas valen más cuando salen por iniciativa propia del cliente, sin que nadie se las pida.",
        "Es un error: el pedido va a las 48 horas de la escritura, cuando el cliente todavía tiene fresca la satisfacción del cierre — ese es el momento en que la tasa de reseñas es muy alta."
      ],
      "correcta": 2,
      "porQue": "El pedido de reseña va 48 horas después de la escritura, justamente porque el momento fresco, emocional y satisfecho es el que produce la tasa más alta de reseñas.",
      "recordatorio": "La mayoría de los clientes no deja reseñas por iniciativa propia, simplemente porque nadie se las pide. Si vos pedís en el momento correcto — 48 horas después, fresco, emocional, satisfecho — la tasa de reseñas que vas a obtener es muy alta."
    },
    {
      "pregunta": "Vas a hacer la llamada del día después de la firma. El cliente compró bien y sabés que tiene capacidad de inversión, así que se te ocurre aprovechar la llamada para comentarle de un lote en Roldán que le podría interesar. ¿Qué corresponde según la cápsula?",
      "opciones": [
        "No mezclar: esa llamada es corta y sin agenda comercial — saludás, te ponés a disposición para lo que necesite, y listo. Su función es confirmarle que no fue una transacción, fue una relación.",
        "Aprovechar el momento: el cliente está contento y receptivo, y una oportunidad concreta de inversión es la mejor forma de demostrarle que seguís pensando en él.",
        "Reemplazar la llamada por un mensaje con el lote adjunto, así el cliente lo mira cuando quiere y no se siente presionado."
      ],
      "correcta": 0,
      "porQue": "La llamada de las primeras 48 horas es deliberadamente sin agenda comercial: su valor está en dejar grabado que fue una relación y no una transacción, y meterle una venta le quita exactamente eso.",
      "recordatorio": "En las primeras 48 horas va una llamada corta, sin agenda comercial: \"no me desaparezco después de la escritura, estoy\". Esa llamada le confirma al cliente que no fue una transacción — fue una relación. Y eso queda grabado."
    }
  ],
  "capacidad-06/03-toques-primer-ano": [
    {
      "pregunta": "Después de leer la cápsula, un agente decide que si cuatro toques funcionan, doce funcionan mejor: va a escribirle a cada cliente todos los meses durante el primer año. ¿Qué le dirías según el material?",
      "opciones": [
        "Tiene razón: cuanto más presente estés, más chances de que el cliente te recuerde cuando aparezca una operación.",
        "El sistema es cuatro toques en 12 meses, no más, no menos — y cada uno con un objetivo claro. Multiplicar contactos sin objetivo no es sostener la relación.",
        "Depende del cliente: con los que tienen perfil inversor conviene mensualmente, con el resto alcanza con el saludo del aniversario.",
        "Mejor ningún toque programado: si la relación fue buena, los contactos tienen que surgir naturalmente, no de un calendario."
      ],
      "correcta": 1,
      "porQue": "La regla es explícita: cuatro toques en los primeros 12 meses, no más, no menos, cada uno con un objetivo claro — el valor no está en la cantidad sino en el momento y el propósito de cada contacto.",
      "recordatorio": "Cuatro toques en los primeros 12 meses. No más, no menos. Cada uno con un objetivo claro: mes 1 la mudanza, mes 3 el informe de mercado de su zona, mes 6 la conversación abierta, mes 12 el saludo de aniversario."
    },
    {
      "pregunta": "Se cumplen 3 meses de la escritura de tu cliente que compró en Funes Norte. Te toca el segundo toque. ¿Qué le mandás?",
      "opciones": [
        "Un mensaje preguntando si conoce a alguien que quiera comprar o vender, porque a los 3 meses ya está en condiciones de referirte.",
        "Las propiedades nuevas que entraron a la cartera de SI este trimestre, por si le interesa alguna como inversión.",
        "Un saludo corto sin contenido, solo para que vea que te acordás de él.",
        "Un informe con los valores de Funes Norte del trimestre: información útil sobre el mercado de su zona, que te posiciona como fuente profesional y le recuerda que su propiedad es un activo que se mueve."
      ],
      "correcta": 3,
      "porQue": "El toque del mes 3 es información útil del mercado de la zona donde vive el cliente — algo concreto, no propaganda — porque te posiciona como fuente de información profesional.",
      "recordatorio": "Toque del mes 3: informe de mercado de su zona. Algo concreto, no propaganda. Te posiciona como fuente de información profesional y le recuerda al cliente que su propiedad es un activo que se mueve en un mercado."
    },
    {
      "pregunta": "En la llamada del mes 6, el cliente te cuenta al pasar que un primo está evaluando comprar un terreno. Vos no ibas a esa llamada a buscar nada — era \"sin agenda concreta\". ¿Por qué igual apareció esa oportunidad, según la lógica de la cápsula?",
      "opciones": [
        "Porque el objetivo real del toque del mes 6 es justamente ese: chequear si hay algo en movimiento que vos no sabés — si no preguntás, no te enterás.",
        "Fue casualidad: las llamadas sin agenda no tienen objetivo comercial y no hay que esperar nada de ellas.",
        "Porque el cliente se sintió en deuda por el cuadro y los mensajes anteriores, y devolvió el favor con un dato."
      ],
      "correcta": 0,
      "porQue": "El toque del mes 6 es sin agenda concreta en el tono, pero su objetivo es detectar movimientos que no conocés — familiares que quieren comprar, inversiones en evaluación, cambios de planes.",
      "recordatorio": "El objetivo del toque del mes 6 es chequear si hay algo en movimiento que vos no sabés. Algunos clientes a los 6 meses ya están pensando en una segunda operación. Si no preguntás, no te enterás."
    }
  ],
  "capacidad-06/04-referidos-activos": [
    {
      "pregunta": "Un agente nuevo quiere acelerar sus referidos y propone: \"les ofrezco una comisión a mis clientes por cada persona que me traigan, así tienen incentivo real\". Según la recomendación de la cápsula, ¿qué le decís?",
      "opciones": [
        "Es buena idea: el incentivo formal es la única forma de que el pedido de referidos pase de pasivo a activo.",
        "Es mala idea porque pedir referidos siempre suena a venta: mejor hacer buen trabajo y esperar que el cliente recomiende solo.",
        "Mejor empezar sin incentivo explícito: el que recomienda por plata recomienda por cantidad y no por calidad, mientras que el que recomienda porque lo trataste bien manda solo a personas a las que cree que podés ayudar de verdad.",
        "Depende del monto: si la gratificación es simbólica no distorsiona, y si es dinero en serio conviene formalizarla por escrito."
      ],
      "correcta": 2,
      "porQue": "La cápsula recomienda arrancar sin incentivo explícito: el referido que viene por calidad de trabajo es muchísimo más valioso que el que viene por plata, porque el cliente que recomienda por plata recomienda mal.",
      "recordatorio": "Empezá sin incentivo explícito. Si el cliente te recomienda por plata, recomienda por cantidad, no por calidad. Si te recomienda porque lo trataste bien, recomienda con criterio — y ese referido es muchísimo más valioso."
    },
    {
      "pregunta": "Un cliente que escrituró hace 6 meses te escribe para preguntarte por un electricista de la zona. Le resolvés el dato y la charla termina bien. ¿Qué hace el agente SI con esa interacción?",
      "opciones": [
        "Nada más: le resolviste el problema y eso alimenta la relación — pedirle algo ahora arruinaría el gesto.",
        "Cierra la conversación con un pedido casual de referidos: esa interacción positiva es uno de los tres momentos donde el pedido funciona naturalmente, pidiendo una presentación concreta y no un \"conocés a alguien\" abstracto.",
        "Le manda al día siguiente un mensaje formal de la inmobiliaria explicando el programa de recomendaciones de SI.",
        "Anota el contacto como \"cliente activo\" y espera al saludo del aniversario para pedirle referidos en ese momento."
      ],
      "correcta": 1,
      "porQue": "Cuando el cliente vuelve a contactarte por algo y la interacción es positiva, terminás la conversación con un pedido casual de presentación concreta — es uno de los tres momentos donde el pedido funciona.",
      "recordatorio": "El pedido de referidos funciona en tres momentos: después de la escritura, cuando el cliente vuelve a contactarte por algo, y cuando cerrás bien una operación con un referido suyo. Se pide sin formalismo: una presentación concreta, vos te encargás del resto, y el cliente queda bien con la persona que te mandó."
    }
  ],
  "capacidad-06/05-niveles-y-metricas": [
    {
      "pregunta": "Un agente que arrancó hace 8 meses cerró dos operaciones chicas y está desmoralizado: \"gano una fracción de lo que gana Martín, que hace 6 años que está\". ¿Cómo se lee esa situación según la cápsula?",
      "opciones": [
        "Se está midiendo contra el agente equivocado: él está en Nivel 1, donde el éxito no se mide en plata sino en construir red, cerrar las primeras operaciones y no abandonar el rubro — llegar al segundo año ya es hacer algo bien.",
        "La frustración es una señal válida: si a los 8 meses los ingresos no despegan, probablemente el rubro no es para él.",
        "Tiene que copiar la operatoria de Martín: hacer exactamente lo que hace un agente de Nivel 4 es la forma más rápida de llegar ahí.",
        "Le falta volumen de leads fríos: en el primer año lo único que importa es la cantidad de operaciones cerradas por mes."
      ],
      "correcta": 0,
      "porQue": "Si no entendés en qué fase estás, te frustrás midiéndote contra el agente equivocado: el Nivel 1 se mide en seguir adelante al año siguiente, no en plata.",
      "recordatorio": "Cada nivel tiene sus propios desafíos: lo que vale en Nivel 1 no vale en Nivel 4. El éxito del primer año no se mide en plata — se mide en si seguís adelante al año siguiente. La mayoría de los que arrancan no llegan al segundo año."
    },
    {
      "pregunta": "Un agente cierra buenas operaciones todos los meses y está conforme. Cuando revisa el origen, el 90% de sus cierres viene de leads fríos de portales y web. ¿Qué le dice esa métrica según la cápsula?",
      "opciones": [
        "Que su embudo funciona bárbaro: si los leads fríos alcanzan para cerrar todos los meses, no necesita nada más.",
        "Que tiene que subir la inversión en portales para escalar lo que ya le funciona.",
        "Que su cartera no es saludable: con 90% de leads fríos es dependiente del sistema — la carrera sustentable es cuando el 60% o más viene de referidos y repetición.",
        "Que tiene que dejar de atender leads fríos de inmediato y dedicarse solo a pedir referidos."
      ],
      "correcta": 2,
      "porQue": "La métrica de origen mide la salud de la cartera: 90% de leads fríos significa dependencia del sistema, mientras que 60%+ de referidos y repetición es lo que hace sustentable la carrera.",
      "recordatorio": "El origen de las operaciones te dice cuán saludable es tu cartera. Si el 90% viene de leads fríos, sos dependiente del sistema. Si el 60%+ viene de referidos y repetición, tu carrera es sustentable."
    },
    {
      "pregunta": "Un agente dice: \"cuando SI tenga el sistema de métricas en Hilo, empiezo a medir — mientras tanto no tiene sentido anotar a mano\". ¿Qué le contesta la cápsula?",
      "opciones": [
        "Tiene razón: medir a mano genera datos poco confiables y es mejor esperar la herramienta oficial.",
        "Que arme ya su propia planilla — una fila por operación con fecha, tipo, valor, comisión, origen y tiempo de proceso — y la revise el primer día de cada mes: en 6 meses va a ver patrones que hoy no ve.",
        "Que con recordar mentalmente sus cierres alcanza, porque un agente activo tiene pocas operaciones por año.",
        "Que lo único urgente de medir es la cantidad de operaciones cerradas por mes; el resto puede esperar a Hilo."
      ],
      "correcta": 1,
      "porQue": "Mientras no exista el sistema centralizado, el agente arma su propia planilla y la revisa el primer día de cada mes, porque lo que no se mide no se mejora.",
      "recordatorio": "Lo que no se mide, no se mejora. Mientras el sistema centralizado esté en desarrollo, armá tu propia planilla: una fila por operación, con fecha, tipo, valor, comisión, origen y tiempo de proceso. Revisala el primer día de cada mes — en 6 meses vas a ver patrones que hoy no ves."
    }
  ],
  "capacidad-06/06-quedarse-quieto": [
    {
      "pregunta": "Un agente de 4 años de carrera, con cartera consolidada, dejó de ir al pádel y a las juntadas del barrio: \"total, ya me conocen, ahora los clientes vienen solos\". Este año va bien. ¿Cuál es el riesgo según la cápsula?",
      "opciones": [
        "Ninguno grave: con cartera consolidada la reputación local se sostiene sola y las actividades sociales pasan a ser opcionales.",
        "El riesgo es de imagen: si lo ven menos, van a pensar que le va mal y eso espanta clientes.",
        "El riesgo es inmediato: al mes de dejar de ir, los referidos se cortan y lo va a notar en la facturación de ese mismo mes.",
        "El riesgo es silencioso: la red se cultiva todo el tiempo o se enfría, y una red enfriada deja de generar referidos sin avisar — se entera recién a fin de año cuando ve que entraron menos leads."
      ],
      "correcta": 3,
      "porQue": "Las formas de quedarse quieto son insidiosas porque ninguna se siente como un error mientras la cometés, y la red enfriada deja de generar referidos en silencio.",
      "recordatorio": "La red se cultiva todo el tiempo o se enfría. Y una red enfriada deja de generar referidos en silencio — no te enterás hasta que mirás los números a fin de año. Ninguna forma de quedarse quieto se siente como un error mientras la cometés."
    },
    {
      "pregunta": "Dos agentes arrancan parecido. Uno planea \"meses intensos de captación cuando haga falta, y descansar cuando la cartera esté llena\". El otro sostiene todos los días un mínimo: red, contenido, toques a históricos, métricas, formación. Según la cápsula, ¿quién construye la mejor carrera a 10 años y por qué?",
      "opciones": [
        "El segundo: el antídoto a quedarse quieto es la actividad diaria mínima durante toda la carrera — este rubro recompensa la constancia, no los chispazos; es un rubro de tejido lento.",
        "El primero: los sprints de captación concentrada rinden más que la actividad dispersa, y descansar evita el desgaste.",
        "Los dos igual: a 10 años lo que define la carrera es la cantidad total de operaciones, no cómo se distribuyó el esfuerzo.",
        "Depende del nivel: la constancia diaria es para el Nivel 1; a partir de cartera consolidada conviene pasar al modo por ráfagas."
      ],
      "correcta": 0,
      "porQue": "El agente que aguanta 10 años haciendo bien las cosas, sin grandes saltos pero sin retrocesos, termina mejor que el que tuvo un gran año y después se relajó — y el antídoto es la actividad diaria mínima sostenida toda la carrera.",
      "recordatorio": "El antídoto a quedarse quieto es uno solo: mantener actividad diaria mínima durante toda tu carrera, no solo en el primer año. No estamos en un rubro de chispazos — estamos en un rubro de tejido lento. El que entiende eso, gana."
    }
  ]
}

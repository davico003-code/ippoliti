import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guía Inteligente del Comprador | SI Inmobiliaria',
  description:
    '14 capítulos sobre cómo comprar en Funes y Roldán con criterio, sin errores y sin pagar de más. Guía gratuita de SI Inmobiliaria.',
}

const CHAPTERS = [
  {
    id: 1,
    title: '¿Estás en condiciones de comprar?',
    desc: 'Evaluá tu situación financiera, capacidad de ahorro y opciones de financiamiento antes de dar el primer paso.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Documentos financieros sobre escritorio',
    content: `Antes de mirar propiedades, lo primero es tener un diagnóstico honesto de tu situación financiera. No se trata solo de cuánto tenés ahorrado, sino de entender tu capacidad real de compra.

Empezá por separar los números: ¿cuánto tenés disponible en dólares hoy? ¿Tenés ingresos formales que te permitan acceder a un crédito hipotecario? ¿Podés sostener cuotas mensuales si financiás parte de la operación? Estos tres puntos definen tu universo de opciones.

En el mercado de Funes y Roldán, los rangos son amplios. Un lote con servicios arranca desde USD 20.000 en Roldán. Una casa de tres dormitorios con pileta en barrio cerrado puede superar los USD 250.000 en Funes. Entre esos extremos hay miles de opciones, pero necesitás saber dónde te ubicás vos.

Si tenés el total en dólares, tu negociación es más fuerte: podés pedir descuento por pago contado. Si necesitás financiamiento, existen créditos hipotecarios UVA y planes de cuotas de los desarrolladores. En SI Inmobiliaria podemos orientarte sobre las alternativas disponibles según tu perfil.

Dato que no falla: no mires propiedades que estén más de un 15% por encima de tu presupuesto real. Solo vas a frustrarte y perder tiempo.`,
  },
  {
    id: 2,
    title: 'Elegir la zona y el entorno',
    desc: 'Funes, Roldán, barrio abierto o cerrado: qué evaluar para acertar en la ubicación.',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f28f3c69?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Barrio residencial con casas y jardines',
    content: `La ubicación es el factor que más impacta en el valor de una propiedad, tanto hoy como en el futuro. En la zona oeste de Rosario, tenés dos grandes opciones: Funes y Roldán. Cada una tiene su perfil.

Funes es la ciudad más cercana a Rosario (15 km). Tiene una oferta consolidada de barrios cerrados, colegios privados, gastronomía y servicios. Los precios son más altos, pero la demanda es sostenida. Es ideal si trabajás en Rosario y priorizás la cercanía.

Roldán está a 25 km de Rosario pero ofrece terrenos más grandes, precios más accesibles y una identidad de ciudad propia que no depende de Rosario. En los últimos años sumó infraestructura de primer nivel y es la plaza de mayor crecimiento demográfico del Gran Rosario.

Dentro de cada ciudad, la diferencia entre barrio abierto y barrio cerrado es significativa. Los barrios cerrados ofrecen seguridad, amenities compartidos y una tasa de valorización superior, pero implican expensas mensuales. Los barrios abiertos dan más libertad constructiva y no tienen expensas, pero la seguridad depende del contexto urbano.

Visitá la zona en diferentes horarios: mañana, mediodía y noche. Recorré las calles. Hablá con vecinos si podés. No hay Google Maps que reemplace caminar el barrio.

Dato que no falla: un buen barrio con una casa modesta se valoriza más que una gran casa en un mal barrio.`,
  },
  {
    id: 3,
    title: 'La primera visita: qué mirar y qué preguntar',
    desc: 'Checklist para no dejarte llevar por la emoción y evaluar la propiedad con ojo profesional.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Departamento moderno con buena iluminación',
    content: `La primera visita es emocionante, pero también es donde se cometen los errores más caros. Llevá esta checklist mental y no te dejés llevar solo por la decoración o las fotos.

Estructura: buscá grietas en paredes (especialmente en las esquinas), manchas de humedad, pisos desnivelados. Estas son señales de problemas estructurales que pueden costar miles de dólares en reparación.

Instalaciones: preguntá la antigüedad de las cañerías, la instalación eléctrica y el techo. Una casa puede verse bien por fuera pero tener una instalación eléctrica de 30 años que necesita reemplazo total.

Orientación: la orientación norte o noreste es la más valorada porque recibe la mejor luz natural. Fijate cómo entra el sol en las habitaciones principales. Una casa oscura es una casa más difícil de vender después.

Servicios: verificá si tiene gas natural, cloacas, agua corriente y asfalto. La ausencia de alguno de estos servicios impacta el valor y la comodidad de vivir ahí.

Entorno inmediato: mirá qué hay alrededor. ¿Lotes vacíos? ¿Construcciones en marcha? ¿Negocios? El entorno te dice hacia dónde va el barrio.

Preguntá siempre: ¿por qué vende el propietario? La respuesta puede darte información valiosa sobre la propiedad y el barrio.

Dato que no falla: nunca compres solo con la primera visita. Volvé al menos una vez más, a diferente horario, y si podés llevá a alguien de confianza con ojo técnico.`,
  },
  {
    id: 4,
    title: 'Comprar lote vs. casa terminada',
    desc: 'Ventajas, riesgos y costos ocultos de cada opción según tu perfil y presupuesto.',
    content: `Esta es una de las decisiones más importantes y depende de tu perfil. No hay una opción universalmente mejor: depende de tu presupuesto, tu tiempo y tu tolerancia al riesgo.

Comprar un lote es ideal si querés construir a medida y tenés paciencia. Los terrenos en Roldán arrancan desde USD 20.000 y en Funes desde USD 35.000. La ventaja es que controlás el diseño, los materiales y la calidad de la construcción. La desventaja es que necesitás sumar el costo de construir (hoy entre USD 800 y USD 1.200 por metro cuadrado según la calidad) y el tiempo de obra (mínimo 10-12 meses).

Comprar una casa terminada te da la certeza de lo que estás comprando. No hay sorpresas de obra, no hay demoras, y podés mudarte de inmediato. La desventaja es que pagás el precio del mercado completo y es menos probable que la casa sea exactamente como la habrías diseñado vos.

Hay una opción intermedia: las casas a terminar o con refacción pendiente. Estas propiedades suelen ofrecer un descuento del 15-25% respecto a una casa terminada similar, y permiten personalizar las terminaciones. El riesgo es subestimar el costo de la obra faltante.

Dato que no falla: si comprás un lote, sumale siempre un 20% extra a lo que te presupueste el constructor. Las obras en Argentina siempre cuestan más de lo previsto.`,
  },
  {
    id: 5,
    title: 'Documentación: qué pedir y qué verificar',
    desc: 'Escritura, planos, deudas, inhibiciones: todo lo que tenés que chequear antes de firmar.',
    image: 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Documentos legales y firma de contrato',
    content: `Este capítulo puede salvarte de un desastre. La documentación es la parte menos glamorosa de comprar una propiedad, pero es la que protege tu inversión.

Título de propiedad: es el documento que acredita quién es el dueño legal del inmueble. Verificá que coincida con la persona que te vende y que no haya embargos, hipotecas o inhibiciones. Esto se hace a través de un informe de dominio en el Registro de la Propiedad.

Plano aprobado: todo inmueble debería tener un plano aprobado por el municipio que refleje la construcción real. Si hay ampliaciones no declaradas (algo frecuente en la zona), hay que regularizarlas antes de escriturar. Esto tiene un costo y un tiempo.

Libre deuda: pedí certificados de libre deuda de impuesto inmobiliario (provincial), tasa municipal y servicios (agua, gas, electricidad). Las deudas de la propiedad pueden transferirse al nuevo comprador si no se verifican.

Estado de expensas: si es un barrio cerrado, pedí los últimos 6 meses de liquidaciones de expensas y verificá que no haya deuda. También preguntá si hay cuotas extraordinarias aprobadas o en discusión.

Inhibición del vendedor: verificá en el Registro que el vendedor no esté inhibido para vender bienes. Una inhibición judicial impide la escrituración.

Dato que no falla: nunca hagas una seña o reserva sin que un abogado especializado haya revisado toda la documentación. En SI Inmobiliaria contamos con estudio jurídico propio para hacer esta verificación.`,
  },
  {
    id: 6,
    title: 'La reserva y el boleto de compraventa',
    desc: 'Cómo funciona cada paso legal, qué montos son habituales y qué derechos tenés.',
    content: `El proceso de compra tiene tres instancias legales: la reserva, el boleto de compraventa y la escritura. Entender cada una te protege.

La reserva es el primer paso. Es una señal de interés formal, generalmente del 1% al 3% del valor de la propiedad, que se entrega a la inmobiliaria para sacar la propiedad del mercado por un plazo determinado (usualmente 5 a 10 días). Si la operación avanza, ese monto se descuenta del precio. Si no avanza por culpa del vendedor, se devuelve. Si el comprador se arrepiente, lo pierde.

El boleto de compraventa es un contrato privado entre comprador y vendedor donde se pactan las condiciones de la operación: precio, forma de pago, plazos, y se entrega un anticipo más significativo (usualmente el 30% del total). A partir del boleto, el comprador tiene posesión de la propiedad y se fija una fecha para la escritura.

La escritura es el acto final ante escribano. Se transfiere el dominio del vendedor al comprador, se inscribe en el Registro de la Propiedad, y el comprador se convierte en dueño legal y registral.

Dato que no falla: leé cada documento antes de firmar, por más confianza que tengas. Y si algo no se entiende, preguntá. Un buen profesional inmobiliario explica cada cláusula.`,
  },
  {
    id: 7,
    title: 'Gastos ocultos que nadie te cuenta',
    desc: 'Comisiones, impuestos, escribanía, sellados: cuánto extra necesitás para cerrar la operación.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Gráficos de economía y finanzas',
    content: `El precio publicado de una propiedad no es lo que vas a terminar pagando. Hay gastos adicionales que muchos compradores no calculan y que pueden representar entre un 8% y un 12% extra del valor de la propiedad.

Comisión inmobiliaria: en Santa Fe, la comisión del comprador es del 3% al 4% más IVA del valor de la operación. Es un costo que se paga al momento de la escritura.

Honorarios del escribano: la escrituración tiene un costo que ronda el 2% al 3% del valor de la propiedad. Incluye los honorarios del escribano, aportes al colegio, y tasas registrales.

Impuesto de sellos: en Santa Fe es del 1.2% del valor escriturado, pagado por mitades entre comprador y vendedor.

ITI o Impuesto a la Transferencia de Inmuebles: es el 1.5% del valor de venta, a cargo del vendedor. Pero en la práctica, puede afectar la negociación del precio.

Certificados y estudios: informe de dominio, certificado catastral, y otros certificados pueden sumar entre USD 300 y USD 800.

Gastos de mudanza y conexión de servicios: transferir titularidad de servicios y el costo de la mudanza puede sumar entre USD 500 y USD 1.500.

Dato que no falla: cuando calcules tu presupuesto, sumale un 10% al precio de la propiedad. Ese es tu número real.`,
  },
  {
    id: 8,
    title: 'Créditos hipotecarios: lo que tenés que saber',
    desc: 'UVA, tasa fija, tasa mixta. Cuánto necesitás de enganche, cuánto pagás por mes y cuándo conviene.',
    content: `El crédito hipotecario volvió a ser una opción en Argentina. Después de años sin financiamiento accesible, varios bancos ofrecen líneas que permiten financiar hasta el 80% del valor de una propiedad. Pero no todos los créditos son iguales.

Créditos UVA: la cuota se ajusta por inflación (UVA = Unidad de Valor Adquisitivo). Arrancás pagando menos, pero la cuota sube con la inflación. La ventaja es que la tasa de interés real es baja (entre 3% y 8% anual). El riesgo es que si la inflación se dispara, la cuota puede crecer más rápido que tu salario.

Tasa mixta: algunos bancos ofrecen un período inicial (12-36 meses) con tasa fija y luego pasan a UVA. Esto da previsibilidad al principio pero el mismo riesgo a largo plazo.

¿Cuánto necesitás? Para un crédito del 80% del valor, necesitás el 20% restante como anticipo, más los gastos de escrituración y comisiones. Es decir, para una propiedad de USD 100.000, necesitás aproximadamente USD 30.000 entre anticipo y gastos.

Requisitos típicos: ingresos formales demostrables, antigüedad laboral mínima de 1-2 años, que la cuota no supere el 25-30% del ingreso neto, y que la propiedad tenga escritura al día.

Dato que no falla: sacá la cuenta de la cuota máxima con un escenario de inflación pesimista, no con el optimista. Si la podés pagar en el peor caso, avanzá tranquilo.`,
  },
  {
    id: 9,
    title: 'Cómo negociar sin perder la propiedad',
    desc: 'Estrategias reales de negociación en el mercado inmobiliario de Funes y Roldán.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Reunión de negocios con apretón de manos',
    content: `La negociación inmobiliaria es un arte que combina información, timing y sentido común. En el mercado de Funes y Roldán, la dinámica tiene particularidades que conviene conocer.

Investigá el mercado antes de ofertar. Conocé los precios reales de cierre en la zona, no los precios de publicación. Una propiedad puede estar publicada a USD 120.000 y cerrar a USD 100.000. Tu inmobiliaria debería darte esta información.

El primer número importa. Una oferta demasiado baja puede ofender al vendedor y cerrar la negociación. Una oferta razonable (entre un 5% y un 15% por debajo del precio publicado) muestra seriedad y abre la conversación.

El pago contado es tu mejor carta. Si tenés los dólares disponibles, tu poder de negociación es significativamente mayor. Un vendedor que necesita vender rápido puede aceptar un descuento del 10-15% por pago contado inmediato.

No te enamores de una sola propiedad. Si el vendedor percibe que estás desesperado, tu poder de negociación se evapora. Siempre tené alternativas y dejá que se note.

Los tiempos de escrituración también se negocian. A veces un vendedor acepta un precio menor a cambio de un cierre rápido, o viceversa.

Dato que no falla: dejá que tu inmobiliaria maneje la negociación. Un intermediario profesional puede decir cosas que entre partes generarían conflicto.`,
  },
  {
    id: 10,
    title: 'Comprar en barrio cerrado: lo que no te dicen',
    desc: 'Expensas, reglamento, restricciones de obra: la letra chica de vivir en un country.',
    content: `Los barrios cerrados de Funes y Roldán son la opción más buscada por familias que priorizan seguridad y calidad de vida. Pero antes de comprar, hay aspectos que muchos no consideran.

Expensas: un barrio cerrado tiene gastos fijos de mantenimiento (seguridad, espacios verdes, amenities). Las expensas en Funes van desde $80.000 hasta $350.000 mensuales según el barrio y los servicios. Este gasto es permanente y se ajusta periódicamente. Calculalo como un costo fijo antes de decidir.

Reglamento de edificación: la mayoría de los countries tienen normas estrictas sobre qué podés construir. Retiros obligatorios, altura máxima, porcentaje de ocupación del lote, materiales permitidos, y hasta paleta de colores. Pedí el reglamento y leelo antes de comprar el lote.

Restricciones de uso: algunos barrios no permiten alquileres temporarios, emprendimientos comerciales, ni ciertos tipos de mascotas. Si tenés un negocio desde casa o alquilás por Airbnb, verificá que el reglamento lo permita.

Plazo de construcción: muchos barrios exigen construir dentro de un plazo (1-3 años desde la compra). Si no cumplís, puede haber multas o sanciones. Esto es relevante si comprás un lote como inversión pura, sin intención de construir pronto.

Dato que no falla: hablá con los vecinos actuales del barrio antes de comprar. Te van a contar cosas que el vendedor o el desarrollador nunca mencionarían.`,
  },
  {
    id: 11,
    title: 'La tasación: cómo saber si el precio es justo',
    desc: 'Métodos de tasación, comparables reales y por qué nunca confiar solo en los portales online.',
    content: `Uno de los errores más costosos es pagar más de lo que una propiedad vale. Y el problema es que determinar el valor justo no es tan simple como mirar Zonaprop o Argenprop.

Los precios publicados no son precios de cierre. En el mercado argentino, la diferencia entre el precio publicado y el precio final de venta puede ser del 10% al 25%. Los portales muestran lo que el vendedor pretende, no lo que el mercado paga.

Una tasación profesional se basa en comparables reales: operaciones efectivamente cerradas en la misma zona, con características similares, en los últimos 6-12 meses. Esto requiere acceso a datos que solo los profesionales inmobiliarios de la zona manejan.

Los factores que definen el valor son: ubicación (barrio, manzana, orientación), superficie cubierta y del lote, antigüedad y estado de conservación, calidad constructiva, servicios disponibles, y el contexto del mercado.

En SI Inmobiliaria realizamos tasaciones profesionales con informe en 24 horas. No es solo un número: es un análisis del mercado con comparables reales, tendencias y recomendaciones.

Dato que no falla: si una propiedad tiene un precio significativamente menor al promedio de la zona, preguntá por qué. Puede ser una oportunidad genuina o puede haber un problema oculto.`,
  },
  {
    id: 12,
    title: 'Invertir para alquilar: números reales',
    desc: 'Renta bruta vs. neta, ocupación, gastos y retorno esperado en Funes y Roldán.',
    content: `Comprar para alquilar puede ser un excelente negocio si elegís bien la propiedad y hacés los números correctos. La clave es calcular la renta neta, no la bruta.

La renta bruta en Funes y Roldán ronda el 4-7% anual en dólares. Esto significa que una propiedad de USD 100.000 genera entre USD 4.000 y USD 7.000 anuales de alquiler. Pero este número es antes de gastos.

Gastos a descontar: impuesto inmobiliario, tasa municipal (si no los paga el inquilino), comisión de administración (8-10% del alquiler), reparaciones y mantenimiento (estimá un 5-8% del alquiler anual), períodos de vacancia (calculá 1 mes por año sin inquilino), y el impuesto a las ganancias si corresponde.

La renta neta real queda típicamente entre el 3% y el 5% anual. Parece poco, pero sumale la valorización del inmueble (5-15% anual en esta zona) y el rendimiento total es muy competitivo.

Las propiedades más fáciles de alquilar en la zona son las casas de 2-3 dormitorios en barrios cerrados (familias jóvenes que quieren probar la zona antes de comprar) y los departamentos de 1-2 ambientes en el centro de Roldán o Funes.

Dato que no falla: calculá siempre con un mes de vacancia al año y un fondo de reparaciones del 5%. Si con esos números el negocio sigue cerrando, es una buena inversión.`,
  },
  {
    id: 13,
    title: 'Errores frecuentes de compradores primerizos',
    desc: 'Los 8 errores que más vemos en la práctica y cómo evitarlos.',
    content: `En más de 40 años de operaciones, hemos visto estos errores repetirse una y otra vez. Evitalos y vas a ahorrarte tiempo, dinero y frustraciones.

1. Buscar solo por precio. El lote más barato suele ser el peor negocio a largo plazo. Sin servicios, en mala ubicación o con problemas legales, termina costando más.

2. No verificar la documentación. Compradores que pagan la totalidad y después descubren que la propiedad tiene un embargo, una sucesión sin terminar o planos no aprobados.

3. Saltear la inspección técnica. Comprar una casa sin que un profesional revise la estructura, las instalaciones y las terminaciones. Las sorpresas aparecen después de la mudanza.

4. Subestimar los gastos adicionales. No calcular comisiones, escrituración, sellados y mudanza. De repente necesitás un 10% más del que pensabas.

5. Decidir apurado. La ansiedad por cerrar lleva a aceptar condiciones desfavorables o a pagar de más. El mercado siempre tiene opciones.

6. No comparar. Visitar una o dos propiedades y decidir. Visitá al menos 5-6 opciones para tener referencia.

7. Ignorar las expensas. Comprar en un barrio cerrado sin calcular el impacto mensual de las expensas en el presupuesto familiar.

8. No tener asesoramiento legal. Confiar solo en la palabra del vendedor sin que un abogado revise la operación.

Dato que no falla: si algo parece demasiado bueno para ser verdad, probablemente lo sea. Investigá antes de emocionarte.`,
  },
  {
    id: 14,
    title: 'Checklist final antes de firmar',
    desc: 'La lista definitiva de verificación para cerrar tu compra con total seguridad.',
    content: `Llegaste al final del proceso. Antes de firmar la escritura, repasá esta lista punto por punto. Si alguno no se cumple, frenate y resolvé antes de avanzar.

Documentación verificada: título de propiedad limpio, sin embargos, inhibiciones ni hipotecas. Planos aprobados que coinciden con la construcción real. Libre deuda de impuestos, tasas y servicios.

Precio confirmado: el precio que vas a pagar está respaldado por una tasación profesional y es coherente con los valores de mercado de la zona.

Gastos calculados: tenés presupuestados todos los gastos adicionales (comisión, escribanía, sellados, impuestos) y tenés el dinero disponible para cubrirlos.

Financiamiento aprobado: si vas con crédito, tenés la pre-aprobación bancaria confirmada y los plazos coinciden con los de la escritura.

Escribano elegido: tenés un escribano designado (puede ser de tu elección, no necesariamente el que sugiere la inmobiliaria o el vendedor) y ya revisó la documentación.

Condiciones pactadas: todo lo acordado verbalmente está por escrito en el boleto de compraventa. Precio, forma de pago, plazos, qué queda en la propiedad (muebles fijos, aires acondicionados, etc.) y penalidades por incumplimiento.

Visita final: hiciste una última visita a la propiedad para verificar que todo esté en el estado acordado y que no haya cambios desde la primera visita.

Dato que no falla: la firma de la escritura es un acto solemne pero no tiene por qué ser estresante. Si hiciste todo bien desde el capítulo 1, este momento es simplemente la formalización de una decisión bien tomada.

Desde SI Inmobiliaria te acompañamos en cada uno de estos 14 pasos. Con más de 40 años de experiencia en Roldán y Funes, nuestro equipo — Susana, Laura y David — conoce cada detalle del proceso y está para ayudarte. Consultanos por WhatsApp al 341 210 1694 o visitá nuestras oficinas.`,
  },
]

const SIDEBAR_LINKS = [
  { label: 'David Flores', href: '/nosotros' },
  { label: 'Contenidos', href: '/blog' },
  { label: 'La Guía', href: '#indice' },
]

export default function GuiaCompradorPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section
        className="relative py-28 md:py-40 px-4 text-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-white/70 text-sm uppercase tracking-widest font-semibold mb-4">
            Recurso gratuito · SI Inmobiliaria
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Guía Inteligente<br />del Comprador
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            14 capítulos sobre cómo comprar en Funes y Roldán con criterio, sin errores y sin pagar de más.
          </p>
        </div>
      </section>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── SIDEBAR ── */}
          <aside className="lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap lg:flex-col gap-2 mb-6">
              {SIDEBAR_LINKS.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="px-4 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-full hover:bg-[#1A5C38] hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-400 hidden lg:block">
              SI Inmobiliaria · Desde 1983
            </p>
          </aside>

          {/* ── CONTENIDO ── */}
          <main className="flex-1 min-w-0">

            {/* ── ÍNDICE ── */}
            <section id="indice" className="mb-16">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">
                Índice de capítulos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHAPTERS.map(ch => (
                  <a
                    key={ch.id}
                    href={`#cap-${ch.id}`}
                    className="group flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1A5C38] hover:shadow-md transition-all"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-full bg-[#1A5C38] text-white text-sm font-bold flex items-center justify-center">
                      {ch.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-[#1A5C38] transition-colors">
                        {ch.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {ch.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-gray-300 group-hover:text-[#1A5C38] transition-colors mt-0.5">
                      &rarr;
                    </span>
                  </a>
                ))}
              </div>
            </section>

            {/* ── CAPÍTULOS ── */}
            {CHAPTERS.map(ch => (
              <article key={ch.id} id={`cap-${ch.id}`} className="mt-12 first:mt-0 scroll-mt-24">

                {/* Imagen del capítulo */}
                {ch.image && (
                  <div className="mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ch.image}
                      alt={ch.imageAlt || ch.title}
                      className="w-full h-[200px] md:h-[280px] object-cover rounded-xl"
                    />
                  </div>
                )}

                {/* Encabezado */}
                <div className="flex items-start gap-4 mb-6">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-[#1A5C38] text-white text-base font-bold flex items-center justify-center">
                    {ch.id}
                  </span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                      {ch.title}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">{ch.desc}</p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="prose-custom">
                  {ch.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('Dato que no falla:')) {
                      return (
                        <div key={i} className="my-6 bg-[#f0f7f4] border-l-[3px] border-[#1A5C38] rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-[1.8] m-0">
                            <strong className="text-[#1A5C38]">Dato que no falla:</strong>{' '}
                            {para.replace('Dato que no falla: ', '')}
                          </p>
                        </div>
                      )
                    }
                    if (para.startsWith('"') || para.startsWith('«')) {
                      return (
                        <blockquote
                          key={i}
                          className="my-6 border-l-[3px] border-[#1A5C38] pl-6 italic text-gray-600 text-[0.95rem] leading-[1.8]"
                        >
                          {para}
                        </blockquote>
                      )
                    }
                    return (
                      <p key={i} className="text-[0.95rem] text-gray-700 leading-[1.8] mb-4">
                        {para}
                      </p>
                    )
                  })}
                </div>

                {/* Separador */}
                <hr className="mt-10 border-gray-100" />
              </article>
            ))}

            {/* ── CTA FINAL ── */}
            <div className="mt-16 bg-[#1A5C38] rounded-2xl p-8 md:p-12 text-center text-white">
              <h3 className="text-2xl md:text-3xl font-black mb-4">
                ¿Listo para dar el siguiente paso?
              </h3>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Con más de 40 años de experiencia en Roldán y Funes, te acompañamos en cada paso de tu compra.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5493412101694?text=Hola!%20Quiero%20consultar%20por%20una%20propiedad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-[#1A5C38] font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Consultar por WhatsApp
                </a>
                <Link
                  href="/propiedades"
                  className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-center"
                >
                  Ver propiedades
                </Link>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}

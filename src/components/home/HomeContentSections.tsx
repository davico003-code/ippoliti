// Secciones de contenido editorial del home (SEO-heavy).
//
// Se renderiza server-side para que todo el copy quede en el HTML inicial
// y los crawlers lean keywords en H2/H3/párrafos. Monta:
//   - "Por qué elegir SI INMOBILIARIA"
//   - "Zonas donde operamos" (Funes, Roldán, Rosario/Fisherton)
//   - "Servicios inmobiliarios"
//   - "Preguntas frecuentes" (+ FAQPage JSON-LD schema)
//
// No usa H1 — sólo H2/H3, respetando la jerarquía existente del home.
// Tokens reusados del sistema: Verde #1A5C38, tipografías Raleway/Poppins.

import Link from 'next/link'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const PAPER = '#FAF7F2'

// ─── Zonas ─────────────────────────────────────────────────────────────────

interface Zona {
  nombre: string
  href: string
  barrios: string
  descripcion: string
  perfil: string
}

const ZONAS: Zona[] = [
  {
    nombre: 'Funes',
    href: '/propiedades?q=funes',
    barrios:
      'Kentucky Club de Campo, Funes Lake, Funes Hills, Tierra de Sueños, Aldea Fisherton y las urbanizaciones abiertas sobre ruta 9.',
    descripcion:
      'Funes concentra la oferta más premium del corredor oeste de Rosario, con casas en barrios cerrados y abiertos, precios desde USD 150.000 para terrenos y desde USD 300.000 para casas en venta Funes de 3 dormitorios. El crecimiento sostenido de pavimento, servicios y nuevos emprendimientos sigue empujando la valorización año a año.',
    perfil:
      'Perfil del comprador: familias que priorizan seguridad, escuela bilingüe cercana y rutas de conexión rápida con Fisherton y Rosario centro. Buena relación entre metros construidos y verde.',
  },
  {
    nombre: 'Roldán',
    href: '/propiedades?q=roldan',
    barrios:
      'Centro histórico, Tierra de Sueños, Aurea, Distrito Roldán, El Rocío y los nuevos desarrollos sobre la colectora.',
    descripcion:
      'Roldán es hoy la zona de mayor desarrollo en el corredor, con emprendimientos inmobiliarios en marcha y valores de entrada más accesibles que Funes. Casas en venta desde USD 180.000, lotes desde USD 45.000 con financiación directa del desarrollador en dólares.',
    perfil:
      'Perfil del comprador: inversores buscando valorización, familias primerizas y quienes quieren mejorar metros por el mismo presupuesto. La oficina histórica de SI INMOBILIARIA está en Roldán desde 1983.',
  },
  {
    nombre: 'Rosario',
    href: '/propiedades?q=rosario',
    barrios:
      'Fisherton, Alberdi, Parque Field y la franja oeste que conecta con Funes.',
    descripcion:
      'En Rosario trabajamos la franja oeste: Fisherton concentra la demanda de departamentos en Rosario premium y casas con terreno, mientras que Alberdi y Parque Field ofrecen departamentos a estrenar desde USD 90.000. Propiedades Santa Fe con operación ágil y documentación en regla.',
    perfil:
      'Perfil del comprador: profesionales que buscan cercanía al centro sin resignar verde, inversores para alquiler temporario y propietarios que quieren vender sin bajar el precio.',
  },
]

function ZonasSection() {
  return (
    <section id="zonas" className="bg-white" style={{ padding: '48px 0' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2
          className="text-2xl md:text-3xl tracking-tight mb-2"
          style={{ fontFamily: RALEWAY, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}
        >
          Zonas donde operamos: Funes, Roldán y Rosario
        </h2>
        <p
          className="text-sm md:text-base text-gray-600 mb-8 max-w-3xl"
          style={{ fontFamily: RALEWAY }}
        >
          Somos una inmobiliaria Funes, inmobiliaria Roldán e inmobiliaria Rosario
          con foco en el corredor oeste del Gran Rosario. Conocemos cada barrio,
          sus valores de referencia y la dinámica real de cada zona.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ZONAS.map(z => (
            <article
              key={z.nombre}
              className="rounded-2xl p-6"
              style={{ background: PAPER }}
            >
              <h3
                className="text-xl md:text-2xl mb-3"
                style={{ fontFamily: RALEWAY, fontWeight: 700, color: GREEN }}
              >
                {z.nombre}
              </h3>
              <p
                className="text-sm mb-3 italic"
                style={{ fontFamily: RALEWAY, color: '#4b5563', lineHeight: 1.5 }}
              >
                {z.barrios}
              </p>
              <p
                className="text-sm mb-3"
                style={{ fontFamily: POPPINS, color: '#1f2937', lineHeight: 1.6 }}
              >
                {z.descripcion}
              </p>
              <p
                className="text-sm mb-4"
                style={{ fontFamily: POPPINS, color: '#4b5563', lineHeight: 1.6 }}
              >
                {z.perfil}
              </p>
              <Link
                href={z.href}
                className="inline-block text-sm font-semibold"
                style={{ fontFamily: POPPINS, color: GREEN, textDecoration: 'underline' }}
              >
                Ver propiedades en {z.nombre} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Por qué elegir SI INMOBILIARIA ────────────────────────────────────────

function PorQueSection() {
  return (
    <section className="bg-white" style={{ padding: '48px 0', borderTop: '1px solid #f0ece3' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <h2
          className="text-2xl md:text-3xl tracking-tight mb-6"
          style={{ fontFamily: RALEWAY, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}
        >
          Por qué elegir SI INMOBILIARIA
        </h2>
        <div className="space-y-5" style={{ fontFamily: POPPINS, color: '#1f2937', lineHeight: 1.7 }}>
          <p className="text-base md:text-lg">
            SI INMOBILIARIA es una inmobiliaria familiar fundada en 1983 en
            Roldán. Más de 40 años operando en Funes, Roldán y Rosario nos
            dieron algo que no se compra: conocer las zonas palmo a palmo, los
            valores reales de cada barrio y la gente que construyó cada
            urbanización. Operamos bajo la matrícula del corredor David Flores
            (Mat. N° 0621).
          </p>
          <p className="text-base md:text-lg">
            Nuestro equipo lo formamos Susana, David y Laura Flores — tres
            generaciones trabajando juntas. Acompañamos cada operación con el
            criterio de quien va a seguir viviendo en la zona: sin presión de
            venta, con tasaciones inmobiliarias honestas y con la trazabilidad
            que exige una operación importante.
          </p>
          <p className="text-base md:text-lg">
            Hoy tenemos tres oficinas abiertas al público — una histórica en
            Roldán (1ro de Mayo 258), otra de ventas también en Roldán
            (Catamarca 775) y una en Funes (Hipólito Yrigoyen 2643, con galería
            de arte). Atendemos casas en venta Funes, departamentos Rosario,
            alquileres, tasaciones y el acompañamiento comercial de varios
            emprendimientos del corredor.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Servicios ─────────────────────────────────────────────────────────────

interface Servicio {
  titulo: string
  resumen: string
  href: string
  cta: string
}

const SERVICIOS: Servicio[] = [
  {
    titulo: 'Compra y venta',
    resumen:
      'Venta de casas, departamentos, terrenos y locales en Funes, Roldán y Rosario. Publicación multicanal, fotografía profesional y filtro de interesados reales. Ves sólo a quien va a comprar.',
    href: '/propiedades?op=venta',
    cta: 'Ver propiedades en venta',
  },
  {
    titulo: 'Alquileres',
    resumen:
      'Administramos alquileres temporarios y de largo plazo en el corredor oeste. Evaluación de garantes, contratos digitales y cobranza automatizada. Vos cobrás el 1° de cada mes, sin perseguir a nadie.',
    href: '/propiedades?op=alquiler',
    cta: 'Ver propiedades en alquiler',
  },
  {
    titulo: 'Tasaciones inmobiliarias en 24 horas',
    resumen:
      'Tasación profesional respaldada por la Mat. N° 0621 y nuestra base propia de operaciones del corredor. Entregamos informe escrito en 24 horas hábiles. Sin cargo si finalmente operás con nosotros.',
    href: '/tasaciones',
    cta: 'Solicitar tasación',
  },
  {
    titulo: 'Emprendimientos inmobiliarios',
    resumen:
      'Comercialización de desarrollos en pozo y en construcción con financiación directa en dólares: Hausing (Funes), Dockgarden (Aldea Fisherton), Distrito Roldán y Aurea. Evaluamos cada desarrollador antes de sumarlo.',
    href: '/emprendimientos',
    cta: 'Ver emprendimientos',
  },
]

function ServiciosSection() {
  return (
    <section className="bg-white" style={{ padding: '48px 0', borderTop: '1px solid #f0ece3' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2
          className="text-2xl md:text-3xl tracking-tight mb-2"
          style={{ fontFamily: RALEWAY, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}
        >
          Servicios inmobiliarios en el corredor oeste
        </h2>
        <p
          className="text-sm md:text-base text-gray-600 mb-8 max-w-3xl"
          style={{ fontFamily: RALEWAY }}
        >
          Todo lo que necesitás para comprar, vender, alquilar o tasar tu
          propiedad en Funes, Roldán y Rosario.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICIOS.map(s => (
            <article
              key={s.titulo}
              className="rounded-2xl p-6 border"
              style={{ borderColor: '#e5e7eb', background: '#fff' }}
            >
              <h3
                className="text-lg md:text-xl mb-2"
                style={{ fontFamily: RALEWAY, fontWeight: 700, color: '#111827' }}
              >
                {s.titulo}
              </h3>
              <p
                className="text-sm md:text-[15px] mb-4"
                style={{ fontFamily: POPPINS, color: '#4b5563', lineHeight: 1.6 }}
              >
                {s.resumen}
              </p>
              <Link
                href={s.href}
                className="inline-block text-sm font-semibold"
                style={{ fontFamily: POPPINS, color: GREEN }}
              >
                {s.cta} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ───────────────────────────────────────────────────────────────────

interface FAQ {
  q: string
  a: string
}

const FAQ_ITEMS: FAQ[] = [
  {
    q: '¿Cuánto cuesta tasar una propiedad con SI INMOBILIARIA?',
    a: 'La tasación inmobiliaria es sin cargo si finalmente operás con SI INMOBILIARIA. Si querés un informe independiente, el honorario se acuerda caso por caso. Entregamos tasaciones profesionales en 24 horas hábiles con respaldo de la Mat. N° 0621 y nuestra base propia de operaciones del corredor oeste.',
  },
  {
    q: '¿En qué zonas operan?',
    a: 'Operamos principalmente en Funes, Roldán y Rosario (con foco en Fisherton y la franja oeste). También trabajamos Granadero Baigorria, San Lorenzo y otras localidades del corredor oeste de Santa Fe. Para propiedades fuera de estas zonas te derivamos con colegas matriculados de confianza.',
  },
  {
    q: '¿Cómo funciona una operación de compraventa con SI INMOBILIARIA?',
    a: 'Empezamos con una reunión para entender qué buscás, definimos presupuesto y zona, y te mostramos una selección curada (no todo lo que existe). Cuando elegís, coordinamos oferta, reserva, boleto y escritura con el escribano que vos prefieras. Acompañamos la operación de punta a punta — desde la primera visita hasta la entrega de llaves.',
  },
  {
    q: '¿Qué diferencia hay entre alquilar con SI INMOBILIARIA y hacerlo por cuenta propia?',
    a: 'Evaluamos garantes y capacidad de pago, armamos el contrato con cláusulas claras y cobramos en tu nombre. Si hay demoras, nosotros gestionamos — vos no perseguís a nadie. Para el inquilino, el proceso es 100% digital y la garantía se puede resolver con seguros de caución o garantes tradicionales.',
  },
  {
    q: '¿Cómo evalúan el valor de una propiedad en Funes, Roldán o Rosario?',
    a: 'Cruzamos tres fuentes: operaciones cerradas (no sólo pedidos) de nuestra base interna y del COCIR Rosario, la oferta comparable activa, y variables específicas del inmueble — estado, antigüedad, servicios, orientación y barrio. El informe escrito incluye rango de precio sugerido y tiempo estimado de venta.',
  },
  {
    q: '¿Trabajan con emprendimientos en pozo?',
    a: 'Sí. Hoy comercializamos Hausing (casas premium en Funes), Dockgarden (condominio en Aldea Fisherton), Distrito Roldán (barrio abierto) y Aurea (barrio privado en Roldán, lotes desde 500 m²). Todos con financiación directa del desarrollador en dólares. Antes de sumar un desarrollo al portfolio, evaluamos al desarrollador y los plazos de obra.',
  },
  {
    q: '¿Publican todo lo que tienen en el sitio?',
    a: 'La mayoría sí, pero mantenemos operaciones off-market — propietarios que prefieren no publicar. Si estás buscando algo específico (barrio, tamaño, precio) y no lo ves en el sitio, escribinos: es muy probable que tengamos algo que matchee y que no esté publicado.',
  },
]

function FAQSection() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }

  return (
    <section
      className="bg-white"
      style={{ padding: '48px 0 64px', borderTop: '1px solid #f0ece3' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <h2
          className="text-2xl md:text-3xl tracking-tight mb-2"
          style={{ fontFamily: RALEWAY, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}
        >
          Preguntas frecuentes
        </h2>
        <p
          className="text-sm md:text-base text-gray-600 mb-8"
          style={{ fontFamily: RALEWAY }}
        >
          Respuestas a lo que más nos consultan sobre operación inmobiliaria en
          Funes, Roldán y Rosario.
        </p>
        <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
          {FAQ_ITEMS.map(f => (
            <details
              key={f.q}
              className="group py-4"
              style={{ borderColor: '#e5e7eb' }}
            >
              <summary
                className="flex items-start justify-between gap-4 cursor-pointer list-none"
                style={{
                  fontFamily: RALEWAY,
                  fontWeight: 600,
                  fontSize: 17,
                  color: '#111827',
                  lineHeight: 1.4,
                }}
              >
                <span>{f.q}</span>
                <span
                  className="flex-shrink-0 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                  style={{
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: GREEN,
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
              </summary>
              <p
                className="mt-3 text-[15px]"
                style={{
                  fontFamily: POPPINS,
                  color: '#4b5563',
                  lineHeight: 1.7,
                }}
              >
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Export principal ──────────────────────────────────────────────────────

export default function HomeContentSections() {
  return (
    <>
      <ZonasSection />
      <PorQueSection />
      <ServiciosSection />
      <FAQSection />
    </>
  )
}

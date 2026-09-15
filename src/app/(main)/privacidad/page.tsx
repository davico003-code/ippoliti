import type { Metadata } from 'next'

// Política de privacidad (14-sep-2026). La exige Meta para los formularios de
// Lead Ads y la piden los formularios propios (tasación, plano de lotes). Los
// datos de la empresa salen de /nosotros; no hay CUIT publicado en el sitio,
// así que no se inventa: se identifica por razón comercial y matrículas.

export const metadata: Metadata = {
  title: 'Política de privacidad | SI INMOBILIARIA',
  description:
    'Qué datos recopila SI INMOBILIARIA cuando consultás por una propiedad, pedís una tasación o completás un formulario, para qué los usa y cómo ejercer tus derechos (Ley 25.326).',
  alternates: { canonical: 'https://siinmobiliaria.com/privacidad' },
  robots: { index: true, follow: true },
}

const ACTUALIZADO = '14 de septiembre de 2026'

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-neutral-900">{titulo}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">SI INMOBILIARIA</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Política de privacidad</h1>
      <p className="mt-3 text-neutral-600">Última actualización: {ACTUALIZADO}.</p>

      <Seccion titulo="Quién es responsable de tus datos">
        <p>
          SI INMOBILIARIA es una inmobiliaria familiar que trabaja en Funes, Roldán y Rosario desde 1983. Los
          corredores responsables son Susana Ippoliti (Mat. COCIR N.° 0559) y David Flores (Mat. COCIR N.° 0621).
          Oficinas: Hipólito Yrigoyen 2643, Funes; Primero de Mayo 258 y Catamarca 775, Roldán.
        </p>
        <p>
          Para cualquier consulta sobre tus datos escribinos a{' '}
          <a className="underline" href="mailto:contacto@siinmobiliaria.com">
            contacto@siinmobiliaria.com
          </a>
          .
        </p>
      </Seccion>

      <Seccion titulo="Qué datos recopilamos">
        <p>Solo los que hacen falta para atender tu consulta:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Los que nos das vos: nombre, teléfono o WhatsApp, correo electrónico y lo que escribas en el mensaje.</li>
          <li>
            El contexto de la consulta: qué propiedad, lote o barrio te interesó, el rango de precios que viste y, si
            pediste una tasación, los datos del inmueble que describiste.
          </li>
          <li>
            Si completás un formulario dentro de Facebook o Instagram (formularios de Meta), recibimos los campos que
            completaste allí: nombre, teléfono, correo y tus respuestas a las preguntas del formulario.
          </li>
          <li>
            Datos de navegación: páginas visitadas, dispositivo y origen de la visita (por ejemplo, si llegaste desde un
            anuncio), mediante cookies y herramientas de medición.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="Para qué los usamos">
        <ul className="list-disc space-y-1 pl-6">
          <li>Responder tu consulta y ponerte en contacto con el agente que atiende esa propiedad.</li>
          <li>Coordinar visitas, enviarte fichas, planos y condiciones de financiación.</li>
          <li>Preparar la tasación que pediste.</li>
          <li>Medir qué anuncios y qué páginas funcionan, para no gastar en publicidad que no sirve.</li>
          <li>Enviarte novedades del mercado o propiedades similares, solo si lo aceptaste; podés darte de baja cuando quieras.</li>
        </ul>
      </Seccion>

      <Seccion titulo="Con quién compartimos tus datos">
        <p>
          No vendemos ni alquilamos tus datos. Los tratan, en nuestro nombre y solo para los fines de arriba, los
          proveedores que hacen funcionar el servicio: el alojamiento del sitio, nuestro sistema interno de gestión de
          consultas y las herramientas de medición de Meta (Facebook e Instagram) y Google. Si te comunicás por
          WhatsApp, la conversación se rige además por las condiciones de WhatsApp.
        </p>
        <p>
          Cuando publicamos una propiedad en portales de terceros (MercadoLibre, Argenprop y otros), las consultas que
          hacés allí llegan a través de esos portales, bajo sus propias políticas.
        </p>
      </Seccion>

      <Seccion titulo="Cookies y medición">
        <p>
          Usamos cookies propias y de terceros (Meta Pixel y Google) para medir el uso del sitio y la eficacia de la
          publicidad. Podés ajustar tus preferencias desde el botón «Privacidad» que aparece en el sitio y desde la
          configuración de tu navegador.
        </p>
      </Seccion>

      <Seccion titulo="Cuánto tiempo los conservamos">
        <p>
          Conservamos los datos de tu consulta mientras la relación comercial esté activa y por el plazo razonable para
          dar seguimiento a la operación. Si nos lo pedís, los eliminamos antes, salvo que exista una obligación legal de
          conservarlos.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos">
        <p>
          Podés pedir el acceso, la rectificación, la actualización o la supresión de tus datos, y retirar tu
          consentimiento para recibir comunicaciones, escribiendo a{' '}
          <a className="underline" href="mailto:contacto@siinmobiliaria.com">
            contacto@siinmobiliaria.com
          </a>
          . Respondemos dentro de los plazos que fija la Ley 25.326 de Protección de los Datos Personales.
        </p>
        <p>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley N.° 25.326.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N.° 25.326,
          tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus
          derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </Seccion>

      <Seccion titulo="Cambios en esta política">
        <p>
          Si cambiamos algo relevante, lo vamos a publicar en esta misma página con la fecha de actualización.
        </p>
      </Seccion>
    </main>
  )
}

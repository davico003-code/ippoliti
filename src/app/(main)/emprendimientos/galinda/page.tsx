// Landing de Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton,
// Funes. Ruta estática propia (le gana al [slug] dinámico).
//
// "Experiencia" (David, 22-nov-2026, aprobada sobre una página de prueba):
// portada con video real de dron, explorador piso por piso sobre el dibujo del
// conjunto, cada unidad en 3D para girarla, plano tocable de los locales,
// amenidades, obra filmada y cierre. SIN PRECIO (David, 17-nov-2026).
//
// Cómo está armada:
// - El HTML de la experiencia lo dibuja el servidor (experiencia/markup.ts) y
//   lo anima experiencia/motor.js desde MotorGalinda (cliente).
// - Lo que el motor arma al tocar (unidades, locales) también va ESCRITO acá,
//   en tablas, más las preguntas frecuentes y los datos estructurados: es lo
//   que lee Google. Los datos salen de experiencia/datos.ts y lib/galinda.ts.
// - Estilos encapsulados bajo .galx: fondo y colores propios, no siguen el
//   tema por horario de la web.

import type { Metadata } from 'next'
import Link from 'next/link'
import PropertyMapLazy from '@/components/PropertyMapLazy'
import MotorGalinda from '@/components/galinda/experiencia/MotorGalinda'
import { GALX_ABAJO, GALX_ARRIBA } from '@/components/galinda/experiencia/markup'
import { LOC, U } from '@/components/galinda/experiencia/datos'
import {
  GAL_AVANCE,
  GAL_BASE,
  GAL_ENTREGA_OFICINAS,
  GAL_ENTREGA_VIVIENDAS,
  GAL_FECHA_FOTOS,
  GAL_URL,
  galWhatsappUrl,
} from '@/lib/galinda'
import '@/components/galinda/experiencia/experiencia.css'
import '@/components/galinda/experiencia/extras.css'

const X = `${GAL_BASE}/x`
const SITIO = 'https://siinmobiliaria.com'

const TITLE = 'Departamentos en venta en Funes · Condominio Galinda!'
const DESCRIPTION =
  'Departamentos de 2 y 3 dormitorios en venta en Galinda!, condominio en Funes con pileta, gimnasio y parque propio, más oficinas y locales comerciales. Elegí el piso y mirá cada depto en 3D con su plano y sus metros. Entrega estimada en 2027.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: GAL_URL },
  openGraph: {
    title: 'Condominio Galinda! · Departamentos en venta en Funes',
    description: DESCRIPTION,
    url: GAL_URL,
    type: 'website',
    images: [{ url: 'https://siinmobiliaria.com/og-galinda.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Galinda! — Funes' }],
  },
}

const viviendas = U.filter((u) => !u.of)
const oficinas = U.filter((u) => u.of)
const nombre = (u: (typeof U)[number]) => `${u.of ? 'Oficina' : 'Unidad'} ${u.id}`
const waUnidad = (u: (typeof U)[number]) =>
  galWhatsappUrl(`Hola, vi la ${nombre(u).toLowerCase()} de Galinda! (${u.m2} m²) y quiero saber el precio.`)
const waLocal = (l: (typeof LOC)[number]) =>
  galWhatsappUrl(`Hola, vi el local ${l.id} de Galinda! (${l.t} m²) y quiero consultar el valor.`)

const mayus = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

const dos = viviendas.filter((u) => u.tipo.startsWith('2'))
const m2Dos = dos.map((u) => Number(u.m2))

const m2Viv = viviendas.map((u) => Number(u.m2))
const RANGO_VIV = `${Math.min(...m2Viv)} a ${Math.max(...m2Viv)} m²`

// Las mismas que se ven en la sección "Vivir en Galinda" (proyecto de Fundar).
const AMENIDADES = [
  'Piscina',
  'Solárium',
  'Parque',
  'Gimnasio',
  'Salón de usos múltiples',
  'Parrillero',
  'Lavadero',
  'Bicicletero',
  'Cocheras cubiertas',
  'Grupo electrógeno',
  'Seguridad permanente',
]

const UBICACION = [
  'Sobre la bajada de la autopista Rosario–Córdoba, en el acceso a Funes por calle Galindo.',
  'Frente a Lion Place, en la entrada de Funes.',
  'Con el paseo comercial abajo: comprás, comés y trabajás sin agarrar el auto.',
]

// Solo datos que ya están en la página (Fundar y David, nov-2026). Sin precios.
const PREGUNTAS: { p: string; r: string }[] = [
  {
    p: '¿Dónde queda Galinda!?',
    r: 'En Galindo y Picton, Funes, sobre la bajada de la autopista Rosario–Córdoba y frente a Lion Place, en la entrada de la ciudad.',
  },
  {
    p: '¿Galinda! es un condominio?',
    r: 'Sí. Es un condominio de usos mixtos en Funes: dos edificios de departamentos con parque propio, piscina, gimnasio y seguridad permanente, un edificio de oficinas y un paseo de locales comerciales en planta baja.',
  },
  {
    p: '¿Qué departamentos hay en venta?',
    r: `Hay ${viviendas.length} departamentos de 2 y 3 dormitorios en los pisos 2 y 3, de ${RANGO_VIV} totales, todos con balcón. En esta página podés elegir el piso, tocar cada unidad y verla en 3D con su plano.`,
  },
  {
    p: '¿Hay deptos de 2 dormitorios con pileta en Funes?',
    r: `Sí. En Galinda! hay ${dos.length} deptos de 2 dormitorios en venta, de ${Math.min(...m2Dos)} a ${Math.max(...m2Dos)} m² totales, y el condominio tiene piscina, solárium y parque propio.`,
  },
  {
    p: '¿Hay oficinas y locales comerciales?',
    r: `Sí. Queda una oficina, la 03-02, de 51 m², frente a la plazoleta y orientada al norte. En planta baja hay un paseo de locales comerciales, varios aptos para gastronomía: acá están los metros y el frente vidriado de los locales 31 a 39, y la disponibilidad se consulta por WhatsApp.`,
  },
  {
    p: '¿Cuándo se entrega?',
    r: `La obra está al ${GAL_AVANCE} % según Fundar (${GAL_FECHA_FOTOS}). Entrega estimada: las oficinas en ${GAL_ENTREGA_OFICINAS} y los departamentos en ${GAL_ENTREGA_VIVIENDAS}.`,
  },
  {
    p: '¿Cómo se paga?',
    r: 'Con un 30 % de anticipo y el saldo en 12 o 24 cuotas. Las cuotas pueden ser en pesos, ajustadas por el índice CAC. La forma de pago la confirma el desarrollador.',
  },
  {
    p: '¿Cuánto sale un departamento en Galinda!?',
    r: 'El precio se consulta. Escribinos por WhatsApp con la unidad que te interesa y te pasamos el valor y el plan de pagos de esa unidad.',
  },
  {
    p: '¿Qué amenidades tiene?',
    r: 'Parque propio de las viviendas, piscina, solárium, gimnasio, salón de usos múltiples, parrillero, lavadero, bicicletero, cocheras cubiertas, grupo electrógeno y seguridad permanente, según el proyecto de Fundar.',
  },
  {
    p: '¿Se puede visitar?',
    r: 'Sí. El showroom, la unidad modelo, ya está terminado. Coordinamos la visita por WhatsApp al 341 334-0916.',
  },
  {
    p: '¿Quién lo desarrolla y quién lo vende?',
    r: 'Lo desarrolla y construye Fundar. Lo comercializa SI INMOBILIARIA, con oficina en Funes.',
  },
]

export default function GalindaPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      // Complejo de departamentos (no un "lugar" genérico). Sin precios: la web no los muestra.
      '@type': 'ApartmentComplex',
      name: 'Galinda!',
      alternateName: 'Condominio Galinda!',
      numberOfAvailableAccommodationUnits: { '@type': 'QuantitativeValue', value: viviendas.length },
      numberOfBedrooms: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 3 },
      amenityFeature: AMENIDADES.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
      description: DESCRIPTION,
      url: GAL_URL,
      image: `${SITIO}${X}/img/portada-fin.webp`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Galindo y Picton',
        addressLocality: 'Funes',
        addressRegion: 'Santa Fe',
        addressCountry: 'AR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: -32.93135, longitude: -60.82085 },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
        { '@type': 'ListItem', position: 2, name: 'Emprendimientos', item: `${SITIO}/emprendimientos` },
        { '@type': 'ListItem', position: 3, name: 'Galinda!', item: GAL_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Unidades en venta en Galinda!, Funes',
      numberOfItems: U.length,
      itemListElement: U.map((u, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${nombre(u)} · ${u.tipo} · ${u.m2} m²`,
        url: u.ficha ? `${SITIO}/propiedades/${u.ficha}` : `${GAL_URL}#u-${u.id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PREGUNTAS.map((q) => ({
        '@type': 'Question',
        name: q.p,
        acceptedAnswer: { '@type': 'Answer', text: q.r },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'Galinda! en Funes, desde el aire',
      description: 'Video real de dron de la obra de Galinda!, sobre Av. Galindo, en Funes.',
      thumbnailUrl: `${SITIO}${X}/img/portada-fin.webp`,
      contentUrl: `${SITIO}${X}/clip/portada.mp4`,
      uploadDate: '2026-11-22T12:00:00-03:00',
      duration: 'PT10S',
    },
  ]

  return (
    <div className="galx">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Portada, explorador por pisos, amenidades, conjunto, obra y fechas. */}
      <div dangerouslySetInnerHTML={{ __html: GALX_ARRIBA }} />

      {/* ── Todo escrito: lo que el explorador muestra al tocar ── */}
      <section id="unidades" className="gx-tablas">
        <div className="wrap">
          <p className="rotulo">Todas las unidades</p>
          <h2>Departamentos de 2 y 3 dormitorios y una oficina, en venta en Funes</h2>
          <p className="bajada">
            Las <span className="num">{U.length}</span> unidades en venta en el condominio Galinda!, con sus metros. El precio se consulta por
            WhatsApp.
          </p>
          <div className="gx-tabla-caja">
            <table>
              <caption>Departamentos y oficina en venta en Galinda!, Funes</caption>
              <thead>
                <tr>
                  <th scope="col">Unidad</th>
                  <th scope="col">Tipo</th>
                  <th scope="col" className="gx-col-x">Ubicación</th>
                  <th scope="col">Total</th>
                  <th scope="col" className="gx-col-x">Exclusiva</th>
                  <th scope="col" className="gx-col-x">Entrega estimada</th>
                  <th scope="col">
                    <span className="sr-only">Ver o consultar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...viviendas, ...oficinas].map((u) => (
                  <tr key={u.id} id={`u-${u.id}`}>
                    <th scope="row">{u.id}</th>
                    <td>
                      {u.of ? (
                        'Oficina'
                      ) : (
                        <>
                          <span className="gx-col-x">Departamento de </span>
                          {u.tipo}
                        </>
                      )}
                    </td>
                    <td className="gx-col-x">
                      Piso <span className="num">{u.piso}</span> · {u.frente.charAt(0).toLowerCase() + u.frente.slice(1)}
                    </td>
                    <td className="n">{u.m2} m²</td>
                    <td className="n gx-col-x">{u.prop} m²</td>
                    <td className="gx-col-x">{mayus(u.of ? GAL_ENTREGA_OFICINAS : GAL_ENTREGA_VIVIENDAS)}</td>
                    <td>
                      {u.ficha ? (
                        <Link href={`/propiedades/${u.ficha}`}>Ver ficha</Link>
                      ) : (
                        <a href={waUnidad(u)} target="_blank" rel="noopener noreferrer">
                          Consultar
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 id="locales-comerciales">Locales comerciales en Funes: paseo de planta baja</h3>
          <p className="bajada">
            Locales <span className="num">31</span> a <span className="num">39</span>, con entrepiso. Total = planta baja +
            entrepiso + comunes. Los valores se consultan.
          </p>
          <div className="gx-tabla-caja">
            <table>
              <caption>Locales comerciales 31 a 39 de Galinda!, Funes</caption>
              <thead>
                <tr>
                  <th scope="col">Local</th>
                  <th scope="col">Uso</th>
                  <th scope="col" className="gx-col-x">Planta baja</th>
                  <th scope="col" className="gx-col-x">Entrepiso</th>
                  <th scope="col">Total</th>
                  <th scope="col" className="gx-col-x">Frente vidriado</th>
                  <th scope="col">
                    <span className="sr-only">Consultar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...LOC]
                  .sort((a, b) => a.id - b.id)
                  .map((l) => (
                    <tr key={l.id}>
                      <th scope="row">{l.id}</th>
                      <td>{l.g ? 'Apto gastronómico' : 'Local comercial'}</td>
                      <td className="n gx-col-x">{l.pb} m²</td>
                      <td className="n gx-col-x">{l.ep} m²</td>
                      <td className="n">{l.t} m²</td>
                      <td className="n gx-col-x">{l.fr} m</td>
                      <td>
                        <a href={waLocal(l)} target="_blank" rel="noopener noreferrer">
                          Consultar
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Ubicación ── */}
      <section id="ubicacion">
        <div className="wrap">
          <p className="rotulo">Dónde está</p>
          <h2>En la entrada de Funes, a un paso de la autopista</h2>
          <div className="gx-donde">
            <div>
              <p className="gx-dir">Galindo y Picton, Funes</p>
              <ul>
                {UBICACION.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <a
                className="btn gx-sec2"
                href="https://www.google.com/maps/search/?api=1&query=-32.93135,-60.82085"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en Google Maps
              </a>
            </div>
            <div className="gx-mapa-caja">
              <PropertyMapLazy lat={-32.93135} lng={-60.82085} address="Galindo y Picton, Funes" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Preguntas frecuentes ── */}
      <section id="preguntas">
        <div className="wrap">
          <p className="rotulo">Preguntas frecuentes</p>
          <h2>Lo que más nos preguntan de Galinda!</h2>
          <div className="gx-faq">
            {PREGUNTAS.map((q) => (
              <details key={q.p}>
                <summary>{q.p}</summary>
                <p>{q.r}</p>
              </details>
            ))}
          </div>
          <div className="gx-mas">
            <Link className="btn gx-sec2" href="/emprendimientos">
              Más emprendimientos
            </Link>
            <Link className="btn gx-sec2" href="/casas-en-venta-funes">
              Casas en venta en Funes
            </Link>
            <Link className="btn gx-sec2" href="/terrenos-funes">
              Terrenos en Funes
            </Link>
            <Link className="btn gx-sec2" href="/inmobiliaria-funes">
              SI INMOBILIARIA en Funes
            </Link>
          </div>
        </div>
      </section>

      {/* Cierre, plano en grande y barra fija del celular. */}
      <div dangerouslySetInnerHTML={{ __html: GALX_ABAJO }} />

      <div className="wrap gx-pie-pagina">
        <p className="gx-legal">
          Desarrolla y construye Fundar (fundar.com.ar). Comercializa SI INMOBILIARIA. Los videos de la portada y de la obra
          y las fotos del showroom son reales. El dibujo del conjunto, las plantas en 3D con muebles y la imagen del
          atardecer son ilustrativos: vale el plano de Fundar de cada unidad. Superficies aproximadas, sujetas a ajustes del
          proyecto final. Entrega estimada: oficinas, {GAL_ENTREGA_OFICINAS}; departamentos, {GAL_ENTREGA_VIVIENDAS}. Forma
          de pago sujeta a confirmación del desarrollador.
        </p>
      </div>

      <MotorGalinda />
    </div>
  )
}

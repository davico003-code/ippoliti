import type { Metadata } from 'next'
import TrackPageView from '@/components/recursos/TrackPageView'
import RecursoHero from '@/components/recursos/RecursoHero'
import CalculadoraCostos from './CalculadoraCostos'
import { COSTOS_STYLES } from './styles'
import {
  MATRIZ_RESIDENCIAL_BASE,
  MATRIZ_COMERCIAL_BASE,
  getAjusteIPC,
  ajustar,
  fmtUSD,
  formatMesAnio,
} from '@/lib/costos-construccion'

// Los valores por m² se ajustan por IPC (cron mensual día 22 → Redis):
// regenerar a diario alcanza de sobra y mantiene la página estática.
export const revalidate = 86400

// Índice de Costos de Construcción — integración del HTML de referencia
// aprobado (indice-costos-construccion.html). Contenido y valores textuales;
// tokens del sitio: verde #1A5C38, verde profundo #0F3F26 (gana sobre el
// #0E3A23 del HTML salvo en la escala del donut, que es la aprobada),
// Raleway títulos / Poppins datos vía next/font.

export const metadata: Metadata = {
  title: '¿Cuánto cuesta construir en Funes y Roldán? Índice de Costos | SI INMOBILIARIA',
  description:
    '¿Cuánto cuesta construir en Funes? Valores por m² llave en mano y por cuenta propia, casos reales de inversión y calculadora para proyectar tu obra.',
  alternates: { canonical: 'https://siinmobiliaria.com/recursos/costos-de-construccion' },
  openGraph: {
    title: '¿Cuánto cuesta construir en Funes y Roldán?',
    description:
      'Valores por m² llave en mano y por cuenta propia, casos reales y calculadora para proyectar tu obra en Funes y Roldán.',
    url: 'https://siinmobiliaria.com/recursos/costos-de-construccion',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuánto cuesta construir en Funes y Roldán?',
    description:
      'Valores por m² llave en mano y por cuenta propia, casos reales y calculadora de obra.',
    images: ['/og-image.jpg'],
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: 'https://siinmobiliaria.com/recursos' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Índice de Costos de Construcción',
        item: 'https://siinmobiliaria.com/recursos/costos-de-construccion',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Calculadora de costos de construcción',
    url: 'https://siinmobiliaria.com/recursos/costos-de-construccion',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
]

const CANONICAL = 'https://siinmobiliaria.com/recursos/costos-de-construccion'

const WHATSAPP_CAFE = `https://wa.me/5493412101694?text=${encodeURIComponent(
  'Hola! Vi la guía de costos de construcción y quiero coordinar una reunión.',
)}`

const WHATSAPP_COMPARTIR = `https://api.whatsapp.com/send?text=${encodeURIComponent(
  `Mirá esta guía de cuánto cuesta construir hoy: valores reales por m², casos concretos y calculadora 👉 ${CANONICAL}`,
)}`

// CSS scoped con prefijo `costos-` (mismo patrón que el índice de recursos).
// Adaptado del HTML de referencia con los tokens del sitio.

const CASOS_REALES = [
  {
    calidad: 'Línea Estándar',
    barrio: 'Tierra de Sueños 3',
    detalle: ['Lote: USD 20.000 (360 m²)', 'Construcción: 70 m² cubiertos + 20 m² semi'],
    obra: 'Costo Obra: USD 62.400',
    inversion: 'USD 82.400',
    mercado: 'USD 86.700',
  },
  {
    calidad: 'Línea Media',
    barrio: 'Funes City',
    detalle: ['Lote: USD 45.000 (500 m²)', 'Construcción: 120 m² cubiertos + 30 m² semi'],
    obra: 'Costo Obra: USD 152.685',
    inversion: 'USD 197.685',
    mercado: 'USD 207.900',
  },
  {
    calidad: 'Línea Media (Country)',
    barrio: 'Vida Lagoon / Funes Lakes',
    detalle: ['Lote: USD 80.000', 'Construcción: 130 m² cubiertos + 40 m² semi'],
    obra: 'Costo Obra: USD 169.650',
    inversion: 'USD 249.650',
    mercado: 'USD 262.500',
  },
  {
    calidad: 'Línea Alta',
    barrio: 'Funes Lakes / Vida Lagoon',
    detalle: ['Lote: USD 75.000', 'Construcción: 160 m² cubiertos + 80 m² semi'],
    obra: 'Costo Obra: USD 280.800',
    inversion: 'USD 355.800',
    mercado: 'USD 374.200',
  },
  {
    calidad: 'Línea Alta (Grande)',
    barrio: 'Barrio Vida',
    detalle: ['Lote: USD 180.000', 'Construcción: 180 m² cubiertos + 60 m² semi (240 m² tot.)'],
    obra: 'Costo Obra: USD 294.840',
    inversion: 'USD 474.840',
    mercado: 'USD 499.400',
  },
  {
    calidad: 'Línea Alta (2 Plantas)',
    barrio: 'San Sebastián',
    detalle: ['Lote: USD 200.000 (800 m²)', 'Construcción: 270 m² cub. + 80 m² semi (350 m² tot.)'],
    obra: 'Costo Obra: USD 435.240',
    inversion: 'USD 635.240',
    mercado: 'USD 668.100',
  },
  {
    calidad: 'Línea Alta',
    barrio: 'Vida Club de Campo',
    detalle: ['Lote: USD 150.000', 'Construcción: 350 m² cub. + 100 m² semi (450 m² tot.)'],
    obra: 'Costo Obra: USD 561.600',
    inversion: 'USD 711.600',
    mercado: 'USD 748.400',
  },
  {
    calidad: 'Premium Country',
    barrio: 'Kentucky Club de Campo',
    detalle: ['Lote: USD 450.000', 'Construcción: 350 m² cub. + 100 m² semi (450 m² tot.)'],
    obra: 'Costo Obra: USD 780.000',
    inversion: 'USD 1.230.000',
    mercado: 'USD 1.293.500',
  },
]

const DONUT_LEYENDA = [
  { color: '#0E3A23', label: 'Materiales', pct: '45%' },
  { color: '#2E7D4F', label: 'Mano de obra', pct: '30%' },
  { color: '#6FB98F', label: 'Honorarios', pct: '10%' },
  { color: '#B7DBC5', label: 'Imprevistos', pct: '10%' },
  { color: '#E3EFE7', label: 'Permisos', pct: '5%' },
]

export default async function CostosConstruccionPage() {
  const { factor, mes } = await getAjusteIPC()
  const residencial = MATRIZ_RESIDENCIAL_BASE.map((f) => ({
    ...f,
    cuentaPropia: fmtUSD(ajustar(f.cuentaPropiaBase, factor)),
    llaveEnMano: fmtUSD(ajustar(f.llaveBase, factor)),
  }))
  const comercial = MATRIZ_COMERCIAL_BASE.map((f) => ({
    ...f,
    cuentaPropia: fmtUSD(ajustar(f.cuentaPropiaBase, factor)),
    llaveEnMano: fmtUSD(ajustar(f.llaveBase, factor)),
  }))
  const calidades = MATRIZ_RESIDENCIAL_BASE.map((f) => {
    const valor = ajustar(f.llaveBase, factor)
    return {
      value: valor,
      label: `Residencial: ${f.calidad} (${fmtUSD(valor)}/m² Llave en Mano)`,
      slug: f.slug,
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackPageView event="recursos_costos_construccion_view" />
      <style dangerouslySetInnerHTML={{ __html: COSTOS_STYLES }} />

      <RecursoHero
        theme="green"
        eyebrow="Costos de construcción"
        title="¿Cuánto cuesta construir hoy?"
        subtitle={`Valores reales por m², casos concretos y una calculadora para proyectar tu inversión sin sorpresas. Valores actualizados · ${formatMesAnio(mes)}.`}
        breadcrumbLabel="¿Cuánto cuesta construir?"
      />

      <div className="costos-page">
        <div className="costos-container">
          {/* b. Qué incluye cada valor */}
          <h2 className="costos-block-title">¿Qué incluye cada valor?</h2>
          <div className="costos-def-grid">
            <div className="costos-def-card">
              <span className="costos-def-tag">Modalidad 1</span>
              <h4>Obra por Cuenta Propia</h4>
              <p>
                Contratás a un arquitecto para dirigir tu construcción, pero vos debés
                subcontratar y definir independientemente todos los rubros: gremios,
                materiales y tiempos de obra.
              </p>
            </div>
            <div className="costos-def-card costos-def-featured">
              <span className="costos-def-tag">Modalidad 2</span>
              <h4>Llave en Mano</h4>
              <p>
                La empresa se encarga de absolutamente todo, de principio a fin, y te
                entrega la propiedad lista para mudarte. Girás la llave y entrás.
              </p>
            </div>
          </div>

          {/* c. Matriz Residencial */}
          <h2 className="costos-block-title">Matriz Residencial</h2>
          <div className="costos-table-wrapper">
            <table className="costos-table">
              <thead>
                <tr>
                  <th>Calidad</th>
                  <th>Superficie</th>
                  <th>Referencias Constructivas Detalladas</th>
                  <th>Obra por Cuenta Propia</th>
                  <th className="costos-th-highlight">Llave en Mano</th>
                </tr>
              </thead>
              <tbody>
                {residencial.map((fila) => (
                  <tr key={fila.calidad}>
                    <td className="costos-td-title">{fila.calidad}</td>
                    <td className="costos-td-surface">{fila.superficie}</td>
                    <td className="costos-td-desc">{fila.desc}</td>
                    <td className="costos-td-price">{fila.cuentaPropia}</td>
                    <td className="costos-td-highlight">{fila.llaveEnMano}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* d. Matriz Comercial e Industrial */}
          <h2 className="costos-block-title costos-mt-56">Matriz Comercial e Industrial</h2>
          <div className="costos-table-wrapper">
            <table className="costos-table">
              <thead>
                <tr>
                  <th>Tipología</th>
                  <th>Especificaciones Técnicas</th>
                  <th>Obra por Cuenta Propia</th>
                  <th className="costos-th-highlight">Llave en Mano</th>
                </tr>
              </thead>
              <tbody>
                {comercial.map((fila) => (
                  <tr key={fila.tipologia}>
                    <td className="costos-td-title">{fila.tipologia}</td>
                    <td className="costos-td-desc">{fila.desc}</td>
                    <td className="costos-td-price">{fila.cuentaPropia}</td>
                    <td className="costos-td-highlight">{fila.llaveEnMano}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* e. Aclaración */}
          <div className="costos-disclaimer">
            <p>
              <strong>ACLARACIÓN IMPORTANTE SOBRE NUESTROS VALORES:</strong> Los precios por
              metro cuadrado expresados en esta tabla incluyen{' '}
              <strong>todo lo necesario para tu obra</strong>: aprobaciones, movimiento de
              suelo, estudio de suelo, honorarios y aportes profesionales, y el cálculo de
              estructura. Sin costos ocultos.
            </p>
            <p>
              Estos valores son una estimación en base a nuestra experiencia y a nuestro
              contacto permanente con constructores y desarrolladores. Pueden variar
              significativamente según la empresa que te construya, el arquitecto que esté
              detrás de la obra, la eficiencia a la hora de comprar materiales y la mano de
              obra especializada que trabaje en tu proyecto.
            </p>
          </div>

          {/* f. Casos Reales */}
          <h2 className="costos-block-title">Casos Reales de Inversión</h2>
          <p className="costos-examples-intro">
            Ejemplos concretos en la zona utilizando nuestra herramienta de costos (Llave en
            Mano), sumando el lote y proyectando el valor de venta terminada.
          </p>
          <div className="costos-table-wrapper costos-mb-72">
            <table className="costos-table costos-examples-table">
              <thead>
                <tr>
                  <th>Calidad y Ubicación</th>
                  <th>Detalle de la Propiedad</th>
                  <th>
                    Inversión Total <br />
                    <span className="costos-th-sub">(Lote + Obra Llave en Mano)</span>
                  </th>
                  <th className="costos-th-highlight">
                    Valor de Mercado <br />
                    <span className="costos-th-sub">(Propiedad Terminada)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {CASOS_REALES.map((caso, i) => (
                  <tr key={i}>
                    <td>
                      <span className="costos-td-title">{caso.calidad}</span>
                      <br />
                      <span className="costos-badge-barrio">{caso.barrio}</span>
                    </td>
                    <td className="costos-td-desc">
                      <strong>{caso.detalle[0].split(':')[0]}:</strong>
                      {caso.detalle[0].slice(caso.detalle[0].indexOf(':') + 1)}
                      <br />
                      <strong>{caso.detalle[1].split(':')[0]}:</strong>
                      {caso.detalle[1].slice(caso.detalle[1].indexOf(':') + 1)}
                      <br />
                      <em>{caso.obra}</em>
                    </td>
                    <td className="costos-td-price">{caso.inversion}</td>
                    <td className="costos-td-success">{caso.mercado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* g. Donut de composición */}
          <div className="costos-chart">
            <div className="costos-chart-info">
              <h3>¿De qué se compone el costo de una obra?</h3>
              <p>Composición orientativa para entender dónde se concentra la inversión.</p>
              <div>
                {DONUT_LEYENDA.map((item) => (
                  <div key={item.label} className="costos-legend-item">
                    <span className="costos-legend-dot" style={{ backgroundColor: item.color }} />
                    {item.label}
                    <span className="costos-pct">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="costos-donut-wrapper">
              <div className="costos-donut" role="img" aria-label="Composición del costo de obra: materiales 45%, mano de obra 30%, honorarios 10%, imprevistos 10%, permisos 5%">
                <div className="costos-donut-hole">
                  <span className="costos-hole-label">Inversión</span>
                  <span className="costos-hole-value">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* h. Calculadora */}
          <CalculadoraCostos calidades={calidades} />

          {/* i. Árbol de decisión */}
          <div className="costos-flow">
            <h2 className="costos-block-title">¿Qué camino es para vos?</h2>
            <p className="costos-flow-intro">Dos preguntas simples para saber por dónde empezar.</p>
            <div className="costos-tree">
              <ul>
                <li>
                  <div className="costos-flow-q costos-flow-start">¿Cuál es tu situación actual?</div>
                  <ul>
                    <li>
                      <div className="costos-flow-q">¿Tenés urgencia por mudarte?</div>
                      <ul>
                        <li>
                          <span className="costos-branch costos-branch-si">SÍ</span>
                          <div className="costos-flow-leaf">
                            <span className="costos-camino">Camino A</span>
                            <strong>Propiedad Terminada</strong>
                            <em>Casa lista — ¡Ya!</em>
                          </div>
                        </li>
                        <li className="costos-wide">
                          <span className="costos-branch costos-branch-no">NO</span>
                          <div className="costos-flow-q">¿Tenés tiempo para dedicarle a la obra?</div>
                          <ul>
                            <li>
                              <span className="costos-branch costos-branch-si">SÍ</span>
                              <div className="costos-flow-leaf">
                                <span className="costos-camino">Camino B</span>
                                <strong>Obra por Cuenta Propia</strong>
                                <em>A tu ritmo</em>
                              </div>
                            </li>
                            <li>
                              <span className="costos-branch costos-branch-no">NO</span>
                              <div className="costos-flow-leaf">
                                <span className="costos-camino">Camino C</span>
                                <strong>Llave en Mano</strong>
                                <em>Cero dolores de cabeza</em>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          {/* j. CTA final */}
          <div className="costos-cta">
            <div className="costos-cta-intro">
              <h3>¿Te sirvió nuestra información?</h3>
              <p>
                No dudes en llamarnos para asesorarte y ver qué te conviene a vos. Tenemos
                todas las opciones sobre la mesa, adaptadas a tu capital y a tu tiempo real.
              </p>
            </div>

            <div className="costos-cta-footer">
              <h4>Tomemos un café y definamos juntos qué se adapta más a vos.</h4>
              <div className="costos-cta-botones">
                <a
                  href={WHATSAPP_CAFE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="costos-btn-cafe"
                >
                  Coordinar un café con David
                </a>
                <a
                  href={WHATSAPP_COMPARTIR}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="costos-btn-compartir"
                >
                  Compartísela a ese amigo que no se decide
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

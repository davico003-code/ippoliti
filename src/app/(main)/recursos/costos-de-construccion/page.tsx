import type { Metadata } from 'next'
import TrackPageView from '@/components/recursos/TrackPageView'
import CalculadoraCostos from './CalculadoraCostos'
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
  title: '¿Cuánto cuesta construir en Funes y Roldán? Índice de Costos | SI Inmobiliaria',
  description:
    '¿Cuánto cuesta construir en Funes? Valores por m² llave en mano y por cuenta propia, casos reales de inversión y calculadora para proyectar tu obra.',
  alternates: { canonical: 'https://siinmobiliaria.com/recursos/costos-de-construccion' },
  openGraph: {
    title: '¿Cuánto cuesta construir en Funes y Roldán?',
    description:
      'Valores por m² llave en mano y por cuenta propia, casos reales y calculadora para proyectar tu obra en Funes y Roldán.',
    url: 'https://siinmobiliaria.com/recursos/costos-de-construccion',
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
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
const STYLES = `
  .costos-page {
    --c-verde: #1A5C38;
    --c-verde-profundo: #0E3A23;
    --c-verde-medio: #2E7D4F;
    --c-verde-vivo: #34A065;
    --c-carbon: #24292B;
    --c-carbon-claro: #353B3D;
    --c-menta: #EFF1F0;
    --c-menta-suave: #F6F7F7;
    --c-surface: #ffffff;
    --c-text-dark: #1F2624;
    --c-text-muted: #626B67;
    --c-border: #E4E7E6;
    --c-ganancia: #15803d;
    --c-ganancia-bg: #F0FAF3;
    --c-shadow-sm: 0 2px 8px rgba(30, 38, 35, 0.06);
    --c-shadow-md: 0 12px 32px -8px rgba(30, 38, 35, 0.14);
    --c-shadow-lg: 0 24px 48px -12px rgba(30, 38, 35, 0.22);
    --c-radius: 16px;
    --c-radius-sm: 10px;
    font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
    background: #F8F9F9;
    color: var(--c-text-dark);
    line-height: 1.65;
  }
  .costos-container { max-width: 1200px; margin: 0 auto; padding: 72px 20px; }
  .costos-page h1, .costos-page h2, .costos-page h3, .costos-page h4 {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
  }

  /* Encabezado */
  .costos-header { text-align: center; margin: 0 auto 64px; max-width: 820px; }
  .costos-badge-mes {
    display: inline-block; margin-top: 18px;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--c-verde); background: var(--c-menta);
    padding: 8px 18px; border-radius: 100px;
  }
  .costos-header h1 {
    color: var(--c-verde-profundo);
    font-size: clamp(26px, 6vw, 46px); font-weight: 900; line-height: 1.12;
    margin: 0 0 14px; letter-spacing: -1px;
  }
  .costos-header p { color: var(--c-text-muted); font-size: 17px; margin: 0; }

  .costos-block-title {
    color: var(--c-verde-profundo);
    font-size: 25px; font-weight: 800; letter-spacing: -0.4px;
    margin: 0 0 24px; display: flex; align-items: center; gap: 14px;
  }
  .costos-block-title::before {
    content: ''; display: block; width: 26px; height: 4px;
    background: var(--c-verde-vivo); border-radius: 4px; flex-shrink: 0;
  }
  .costos-block-title-light { color: #fff; margin-bottom: 10px; }

  /* Definiciones de modalidad */
  .costos-def-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 18px; margin-bottom: 48px;
  }
  .costos-def-card {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--c-radius); padding: 28px 26px; box-shadow: var(--c-shadow-sm);
  }
  .costos-def-tag {
    display: inline-block;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    color: var(--c-verde-medio); background: var(--c-menta);
    border-radius: 100px; padding: 5px 13px; margin-bottom: 14px;
  }
  .costos-def-card h4 {
    font-size: 17px; font-weight: 800; color: var(--c-verde-profundo);
    letter-spacing: -0.2px; margin: 0 0 8px;
  }
  .costos-def-card p { font-size: 13.5px; color: var(--c-text-muted); line-height: 1.7; margin: 0; }
  .costos-def-featured { background: var(--c-verde-profundo); border-color: var(--c-verde-profundo); }
  .costos-def-featured .costos-def-tag { background: rgba(255,255,255,0.14); color: #A7E3C0; }
  .costos-def-featured h4 { color: #fff; }
  .costos-def-featured p { color: rgba(255,255,255,0.78); }

  /* Tablas */
  .costos-table-wrapper {
    width: 100%; overflow-x: auto; margin-bottom: 18px;
    background: var(--c-surface); border-radius: var(--c-radius);
    box-shadow: var(--c-shadow-sm); border: 1px solid var(--c-border);
  }
  .costos-table { width: 100%; border-collapse: collapse; text-align: left; }
  .costos-table th {
    background: var(--c-carbon); color: rgba(255,255,255,0.92);
    padding: 18px 20px;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 12px; text-transform: uppercase; letter-spacing: 1.4px;
    font-weight: 700; white-space: nowrap;
  }
  .costos-table th.costos-th-highlight { background: var(--c-verde-vivo); color: #fff; font-weight: 800; }
  .costos-table td { padding: 22px 20px; border-bottom: 1px solid var(--c-border); vertical-align: top; }
  .costos-table tr:last-child td { border-bottom: none; }
  .costos-table tbody tr { transition: background-color 0.2s ease; }
  .costos-table tbody tr:hover td { background-color: var(--c-menta-suave); }
  .costos-td-title {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-weight: 800; color: var(--c-verde-profundo); font-size: 16px; white-space: nowrap;
  }
  .costos-td-surface { font-size: 12.5px; font-weight: 600; color: var(--c-verde-medio); white-space: nowrap; }
  .costos-td-desc { font-size: 13px; color: var(--c-text-muted); line-height: 1.65; min-width: 280px; }
  .costos-td-price { font-weight: 500; color: var(--c-text-dark); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .costos-td-highlight {
    font-weight: 700; color: var(--c-verde); background: var(--c-menta-suave);
    font-size: 16px; white-space: nowrap; font-variant-numeric: tabular-nums;
  }
  .costos-examples-table th { background: var(--c-carbon-claro); }
  .costos-badge-barrio {
    display: inline-block; background: var(--c-menta);
    padding: 4px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 600; color: var(--c-verde); margin-top: 7px;
  }
  .costos-td-success {
    font-weight: 700; color: var(--c-ganancia); background: var(--c-ganancia-bg);
    font-size: 16px; white-space: nowrap; font-variant-numeric: tabular-nums;
  }
  .costos-th-sub { font-size: 10px; font-weight: 400; opacity: 0.85; letter-spacing: 0.5px; text-transform: none; }
  .costos-examples-intro { color: var(--c-text-muted); margin: 0 0 24px; font-size: 15.5px; max-width: 760px; }
  .costos-mt-56 { margin-top: 56px; }
  .costos-mb-72 { margin-bottom: 72px; }

  /* Aclaración */
  .costos-disclaimer {
    font-size: 13.5px; color: var(--c-text-muted); margin-bottom: 72px; line-height: 1.75;
    background-color: var(--c-menta); padding: 26px 30px;
    border-radius: var(--c-radius-sm); border-left: 4px solid var(--c-verde);
  }
  .costos-disclaimer strong { color: var(--c-verde-profundo); font-weight: 600; }
  .costos-disclaimer p { margin: 0 0 10px; }
  .costos-disclaimer p:last-child { margin-bottom: 0; }

  /* Donut */
  .costos-chart {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--c-radius); padding: 56px 40px; margin-bottom: 72px;
    box-shadow: var(--c-shadow-sm);
    display: grid; grid-template-columns: 1fr 1.1fr; gap: 56px; align-items: center;
  }
  .costos-chart-info h3 {
    font-size: 24px; font-weight: 800; color: var(--c-verde-profundo);
    letter-spacing: -0.4px; margin: 0 0 10px;
  }
  .costos-chart-info > p { font-size: 15px; color: var(--c-text-muted); margin: 0 0 32px; }
  .costos-legend-item {
    display: flex; align-items: center; gap: 14px;
    font-size: 15px; color: var(--c-text-dark);
    padding: 13px 4px; border-bottom: 1px solid var(--c-border);
  }
  .costos-legend-item:last-child { border-bottom: none; }
  .costos-legend-item .costos-pct {
    margin-left: auto; font-weight: 600; color: var(--c-verde-profundo);
    font-variant-numeric: tabular-nums;
  }
  .costos-legend-dot { width: 13px; height: 13px; border-radius: 4px; display: inline-block; flex-shrink: 0; }
  .costos-donut-wrapper { display: flex; justify-content: center; align-items: center; }
  .costos-donut {
    width: 300px; height: 300px; border-radius: 50%;
    background: conic-gradient(
      #0E3A23 0% 45%,
      #2E7D4F 45% 75%,
      #6FB98F 75% 85%,
      #B7DBC5 85% 95%,
      #E3EFE7 95% 100%
    );
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--c-shadow-md);
  }
  .costos-donut-hole {
    width: 168px; height: 168px; border-radius: 50%;
    background-color: var(--c-surface);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
  }
  .costos-hole-label {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 11px; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; color: var(--c-text-muted);
  }
  .costos-hole-value {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 30px; font-weight: 900; color: var(--c-verde-profundo); letter-spacing: -0.5px;
  }

  /* Estimador (calculadora) */
  .costos-estimator {
    background: linear-gradient(150deg, var(--c-verde-profundo) 0%, var(--c-verde) 85%);
    border-radius: var(--c-radius); padding: 56px 50px; color: #fff;
    box-shadow: var(--c-shadow-lg); margin-bottom: 72px; position: relative; overflow: hidden;
  }
  .costos-estimator::after {
    content: ''; position: absolute; top: -120px; right: -120px;
    width: 380px; height: 380px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .costos-estimator .costos-block-title::before { background: var(--c-verde-vivo); }
  .costos-estimator-sub { color: rgba(255,255,255,0.75); font-size: 15.5px; margin: 0 0 24px; max-width: 640px; }
  .costos-form-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px; margin-top: 28px; position: relative;
  }
  .costos-input-group { display: flex; flex-direction: column; }
  .costos-input-full { grid-column: 1 / -1; }
  .costos-input-group label {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 12px; font-weight: 700; margin-bottom: 9px;
    color: rgba(255,255,255,0.88); text-transform: uppercase; letter-spacing: 1px;
  }
  .costos-input-wrapper { position: relative; }
  .costos-input-prefix {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--c-text-muted); font-weight: 600; font-size: 14px; z-index: 10;
  }
  .costos-input-group input, .costos-input-group select {
    width: 100%; padding: 15px 16px;
    border-radius: var(--c-radius-sm); border: 2px solid transparent;
    font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
    font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums;
    color: var(--c-verde-profundo); background: #fff;
    transition: border-color 0.25s, box-shadow 0.25s; outline: none; appearance: none;
  }
  input.costos-has-prefix { padding-left: 58px; }
  .costos-input-group input:focus, .costos-input-group select:focus {
    border-color: var(--c-verde-vivo);
    box-shadow: 0 0 0 4px rgba(52, 160, 101, 0.30);
  }
  .costos-input-group input::placeholder { color: #A9B5AE; font-weight: 500; }
  .costos-help-text { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 7px; }
  .costos-select-wrapper { position: relative; }
  .costos-select-wrapper::after {
    content: ''; position: absolute; right: 18px; top: 50%;
    width: 9px; height: 9px;
    border-right: 2px solid var(--c-verde); border-bottom: 2px solid var(--c-verde);
    transform: translateY(-70%) rotate(45deg); pointer-events: none;
  }
  .costos-btn-calc {
    background: #fff; color: var(--c-verde-profundo);
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 1.5px;
    padding: 19px 40px; border: none; border-radius: var(--c-radius-sm);
    cursor: pointer; width: 100%; margin-top: 36px;
    transition: transform 0.25s, box-shadow 0.25s; position: relative;
  }
  .costos-btn-calc:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }
  .costos-btn-calc:focus-visible { outline: 3px solid var(--c-verde-vivo); outline-offset: 3px; }
  .costos-results {
    margin-top: 40px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.14); border-radius: var(--c-radius-sm);
    padding: 32px; backdrop-filter: blur(4px); position: relative;
  }
  .costos-res-line {
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.12);
    font-size: 15.5px; color: rgba(255,255,255,0.85);
  }
  .costos-res-line strong { font-size: 20px; color: #fff; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .costos-res-total {
    margin-top: 22px; padding-top: 22px; border-top: 2px solid var(--c-verde-vivo);
    display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
  }
  .costos-res-total span {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 17px; font-weight: 700; color: #fff;
  }
  .costos-res-total strong {
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 34px; font-weight: 900; color: #7FE0A8;
    font-variant-numeric: tabular-nums; letter-spacing: -0.5px;
  }
  .costos-res-disclaimer {
    margin-top: 22px; font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.65);
    background: rgba(0,0,0,0.22); padding: 16px 18px;
    border-radius: 8px; border-left: 3px solid var(--c-verde-vivo);
  }
  .costos-res-disclaimer strong { color: rgba(255,255,255,0.9); font-weight: 600; }
  .costos-res-cta {
    margin-top: 26px; padding-top: 26px;
    border-top: 1px solid rgba(255,255,255,0.18);
    text-align: center;
  }
  .costos-res-logo { height: 30px; width: auto; margin: 0 auto 12px; display: block; }
  .costos-res-cta p {
    font-size: 14px; color: rgba(255,255,255,0.8);
    margin: 0 0 18px; max-width: 480px; margin-left: auto; margin-right: auto;
  }
  .costos-res-cta-botones { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .costos-res-btn-david {
    display: inline-block; background: #fff; color: var(--c-verde-profundo); text-decoration: none;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    padding: 14px 28px; border-radius: 100px;
    font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .costos-res-btn-david:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
  .costos-res-btn-compartir {
    display: inline-block; background: transparent; color: #fff; text-decoration: none;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    padding: 14px 28px; border-radius: 100px; border: 1.5px solid rgba(255,255,255,0.5);
    font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
    transition: background-color 0.25s, border-color 0.25s;
  }
  .costos-res-btn-compartir:hover { background: rgba(255,255,255,0.1); border-color: #fff; }

  /* Árbol de decisión */
  .costos-flow { margin-bottom: 72px; }
  .costos-flow-intro { color: var(--c-text-muted); font-size: 15.5px; max-width: 720px; margin: 0 0 12px; }
  .costos-tree { overflow-x: auto; padding: 12px 0 4px; }
  .costos-tree > ul { min-width: 580px; }
  .costos-tree ul {
    display: flex; justify-content: center; position: relative;
    padding: 32px 0 0; margin: 0; list-style: none;
  }
  .costos-tree li {
    flex: 1; position: relative; padding: 32px 8px 0;
    display: flex; flex-direction: column; align-items: center;
  }
  .costos-tree li.costos-wide { flex: 1.8; }
  .costos-tree li::before, .costos-tree li::after {
    content: ''; position: absolute; top: 0; right: 50%;
    border-top: 2px solid #D3D8D6; width: 50%; height: 32px;
  }
  .costos-tree li::after { right: auto; left: 50%; border-left: 2px solid #D3D8D6; }
  .costos-tree li:only-child::before, .costos-tree li:only-child::after { display: none; }
  .costos-tree li:only-child { padding-top: 0; }
  .costos-tree li:first-child::before, .costos-tree li:last-child::after { border: 0 none; }
  .costos-tree li:last-child::before { border-right: 2px solid #D3D8D6; border-radius: 0 12px 0 0; }
  .costos-tree li:first-child::after { border-radius: 12px 0 0 0; }
  .costos-tree ul ul::before {
    content: ''; position: absolute; top: 0; left: 50%;
    border-left: 2px solid #D3D8D6; width: 0; height: 32px;
  }
  .costos-flow-q {
    background: var(--c-surface); border: 2px solid var(--c-verde);
    color: var(--c-verde-profundo);
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-weight: 800; font-size: 14px; line-height: 1.35; text-align: center;
    padding: 14px 24px; border-radius: 100px; box-shadow: var(--c-shadow-sm);
    position: relative; z-index: 1; max-width: 280px;
  }
  .costos-flow-start {
    background: var(--c-carbon); border-color: var(--c-carbon);
    color: #fff; font-size: 15px; letter-spacing: 0.3px;
  }
  .costos-flow-leaf {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--c-radius); padding: 20px 18px; text-align: center;
    max-width: 230px; box-shadow: var(--c-shadow-sm); position: relative; z-index: 1;
  }
  .costos-camino {
    display: inline-block;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    color: #fff; background: var(--c-verde); border-radius: 100px;
    padding: 4px 13px; margin-bottom: 10px;
  }
  .costos-flow-leaf strong {
    display: block;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 15px; font-weight: 800; color: var(--c-verde-profundo);
    line-height: 1.3; margin-bottom: 4px;
  }
  .costos-flow-leaf em { font-style: normal; font-size: 12.5px; color: var(--c-text-muted); }
  .costos-branch {
    position: absolute; top: 16px; left: 50%; transform: translate(-50%, -50%); z-index: 2;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 11px; font-weight: 800; letter-spacing: 1px;
    padding: 3px 13px; border-radius: 100px;
  }
  .costos-branch-si { background: var(--c-verde); color: #fff; }
  .costos-branch-no { background: var(--c-surface); color: var(--c-verde-profundo); border: 2px solid #D3D8D6; }

  /* CTA */
  .costos-cta {
    background: var(--c-surface); padding: 64px 48px;
    border-radius: var(--c-radius); box-shadow: var(--c-shadow-sm); border: 1px solid var(--c-border);
  }
  .costos-cta-intro { text-align: center; max-width: 760px; margin: 0 auto 52px; }
  .costos-cta-intro h3 {
    font-size: clamp(26px, 4vw, 34px); color: var(--c-verde-profundo);
    margin: 0 0 16px; font-weight: 900; letter-spacing: -0.8px;
  }
  .costos-cta-intro p { font-size: 17px; color: var(--c-text-muted); margin: 0; }
  .costos-cta-footer { text-align: center; margin-top: 44px; }
  .costos-cta-footer h4 {
    font-size: 21px; color: var(--c-verde-profundo);
    margin: 0 0 26px; font-weight: 700; letter-spacing: -0.3px;
  }
  .costos-btn-cafe {
    display: inline-block; background: var(--c-verde); color: #fff; text-decoration: none;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    padding: 20px 52px; border-radius: 100px;
    font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;
    transition: background-color 0.25s, transform 0.25s, box-shadow 0.25s;
    box-shadow: var(--c-shadow-sm);
  }
  .costos-btn-cafe:hover { background: var(--c-verde-vivo); transform: translateY(-3px); box-shadow: var(--c-shadow-md); }
  .costos-btn-cafe:focus-visible { outline: 3px solid var(--c-verde-vivo); outline-offset: 3px; }
  .costos-cta-botones { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .costos-btn-compartir {
    display: inline-block; background: transparent; color: var(--c-verde); text-decoration: none;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    padding: 18px 38px; border-radius: 100px; border: 2px solid var(--c-verde);
    font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;
    transition: background-color 0.25s, color 0.25s, transform 0.25s;
  }
  .costos-btn-compartir:hover { background: var(--c-menta); transform: translateY(-3px); }
  .costos-btn-compartir:focus-visible { outline: 3px solid var(--c-verde-vivo); outline-offset: 3px; }

  @media (prefers-reduced-motion: reduce) {
    .costos-page * { transition: none !important; }
  }
  @media (max-width: 900px) {
    .costos-chart { grid-template-columns: 1fr; gap: 40px; padding: 44px 24px; }
    .costos-donut-wrapper { order: -1; }
  }
  @media (max-width: 768px) {
    .costos-page { font-size: 14px; }
    .costos-container { padding: 36px 14px; }
    .costos-header { margin-bottom: 36px; }
    .costos-header p { font-size: 14px; }
    .costos-block-title { font-size: 17px; margin-bottom: 16px; }
    .costos-block-title::before { width: 18px; height: 3px; }
    .costos-def-grid { gap: 12px; margin-bottom: 36px; }
    .costos-def-card { padding: 18px 16px; }
    .costos-def-tag { font-size: 9px; padding: 4px 10px; margin-bottom: 10px; }
    .costos-def-card h4 { font-size: 15px; margin-bottom: 5px; }
    .costos-def-card p { font-size: 12.5px; line-height: 1.6; }
    .costos-table th { padding: 12px 10px; font-size: 10px; letter-spacing: 0.8px; }
    .costos-table td { padding: 13px 10px; }
    .costos-td-title { font-size: 13.5px; }
    .costos-td-surface { font-size: 11px; }
    .costos-td-desc { font-size: 11.5px; min-width: 190px; line-height: 1.55; }
    .costos-td-price { font-size: 12.5px; }
    .costos-td-highlight, .costos-td-success { font-size: 13.5px; }
    .costos-badge-barrio { font-size: 10.5px; padding: 3px 9px; }
    .costos-examples-intro { font-size: 13px; margin-bottom: 16px; }
    .costos-disclaimer { padding: 16px 14px; margin-bottom: 48px; font-size: 12px; line-height: 1.65; }
    .costos-chart { padding: 28px 18px; gap: 24px; margin-bottom: 48px; }
    .costos-chart-info h3 { font-size: 17px; }
    .costos-chart-info > p { font-size: 13px; margin-bottom: 18px; }
    .costos-legend-item { font-size: 13px; padding: 9px 2px; gap: 10px; }
    .costos-legend-dot { width: 11px; height: 11px; }
    .costos-donut { width: 190px; height: 190px; }
    .costos-donut-hole { width: 108px; height: 108px; }
    .costos-hole-label { font-size: 9px; letter-spacing: 1.5px; }
    .costos-hole-value { font-size: 19px; }
    .costos-estimator { padding: 28px 16px; margin-bottom: 48px; }
    .costos-estimator-sub { font-size: 13px; margin-bottom: 14px; }
    .costos-form-grid { gap: 14px; margin-top: 18px; }
    .costos-input-group label { font-size: 10.5px; margin-bottom: 6px; }
    .costos-input-group input, .costos-input-group select { padding: 12px 13px; font-size: 14px; }
    input.costos-has-prefix { padding-left: 50px; }
    .costos-input-prefix { font-size: 12px; left: 13px; }
    .costos-help-text { font-size: 11px; margin-top: 5px; }
    .costos-btn-calc { padding: 15px 24px; font-size: 13px; margin-top: 22px; }
    .costos-results { padding: 18px 14px; margin-top: 26px; }
    .costos-res-line { font-size: 13px; padding: 11px 0; }
    .costos-res-line strong { font-size: 15px; }
    .costos-res-total { margin-top: 14px; padding-top: 14px; }
    .costos-res-total span { font-size: 14px; }
    .costos-res-total strong { font-size: 22px; }
    .costos-res-disclaimer { font-size: 11.5px; padding: 12px 13px; margin-top: 14px; }
    .costos-res-cta { margin-top: 18px; padding-top: 18px; }
    .costos-res-logo { height: 24px; }
    .costos-res-cta p { font-size: 12.5px; }
    .costos-res-btn-david, .costos-res-btn-compartir { width: 100%; padding: 13px 20px; font-size: 12px; }
    .costos-flow { margin-bottom: 48px; }
    .costos-flow-intro { font-size: 13px; margin-bottom: 6px; }
    .costos-cta { padding: 32px 14px; }
    .costos-cta-intro { margin-bottom: 20px; }
    .costos-cta-intro h3 { font-size: 21px; margin-bottom: 8px; }
    .costos-cta-intro p { font-size: 13.5px; }
    .costos-cta-footer { margin-top: 10px; }
    .costos-cta-footer h4 { font-size: 16px; margin-bottom: 16px; }
    .costos-btn-cafe { width: 100%; display: block; padding: 15px 24px; font-size: 13px; letter-spacing: 1px; }
    .costos-btn-compartir { width: 100%; display: block; padding: 14px 24px; font-size: 12px; letter-spacing: 1px; }
    .costos-badge-mes { font-size: 10px; padding: 6px 14px; margin-top: 12px; }
  }
`

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
    return { value: valor, label: `Residencial: ${f.calidad} (${fmtUSD(valor)}/m² Llave en Mano)` }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackPageView event="recursos_costos_construccion_view" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="costos-page">
        <div className="costos-container">
          {/* a. Header */}
          <header className="costos-header">
            <h1>¿Cuánto cuesta construir hoy?</h1>
            <p>
              Valores reales por m², casos concretos y una calculadora para proyectar tu
              inversión sin sorpresas.
            </p>
            <span className="costos-badge-mes">Valores actualizados · {formatMesAnio(mes)}</span>
          </header>

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

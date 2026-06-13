// CSS scoped `costos-*` compartido entre la página principal y /calculo.
// Paleta del HTML de referencia aprobado (carbón + verde SI como acento).
export const COSTOS_STYLES = `
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

  /* ─── Página de resultado /calculo ─── */
  .costos-calc-resumen {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px; margin-bottom: 32px;
  }
  .costos-calc-resumen-item {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--c-radius-sm); padding: 14px 16px;
  }
  .costos-calc-resumen-item .k {
    display: block;
    font-family: var(--font-raleway), 'Raleway', system-ui, sans-serif;
    font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--c-text-muted); margin-bottom: 4px;
  }
  .costos-calc-resumen-item .v {
    font-size: 15px; font-weight: 600; color: var(--c-text-dark);
    font-variant-numeric: tabular-nums;
  }
  .costos-calc-resultados {
    background: linear-gradient(150deg, var(--c-verde-profundo) 0%, var(--c-verde) 85%);
    border-radius: var(--c-radius); padding: 36px 32px; color: #fff;
    box-shadow: var(--c-shadow-lg); margin-bottom: 32px;
  }
  .costos-calc-detalle {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--c-radius); padding: 28px 26px; margin-bottom: 32px;
    box-shadow: var(--c-shadow-sm);
  }
  .costos-calc-detalle h3 {
    font-size: 17px; font-weight: 800; color: var(--c-verde-profundo);
    margin: 0 0 14px; letter-spacing: -0.2px;
  }
  .costos-calc-detalle ul { margin: 0 0 18px; padding-left: 18px; }
  .costos-calc-detalle li {
    font-size: 14px; color: var(--c-text-dark); margin-bottom: 6px;
    font-variant-numeric: tabular-nums;
  }
  .costos-calc-desc {
    font-size: 13px; color: var(--c-text-muted); line-height: 1.7;
    background: var(--c-menta-suave); border-radius: var(--c-radius-sm);
    padding: 16px 18px; margin: 0;
  }
  .costos-calc-cta {
    background: var(--c-surface); border: 1px solid var(--c-border);
    border-radius: var(--c-radius); padding: 40px 32px; text-align: center;
    box-shadow: var(--c-shadow-sm);
  }
  .costos-calc-cta h3 {
    font-size: 22px; font-weight: 900; color: var(--c-verde-profundo);
    margin: 0 0 20px; letter-spacing: -0.4px;
  }
  @media (max-width: 768px) {
    .costos-calc-resultados { padding: 24px 16px; }
    .costos-calc-detalle { padding: 18px 16px; }
    .costos-calc-cta { padding: 28px 16px; }
    .costos-calc-cta h3 { font-size: 18px; }
  }
`

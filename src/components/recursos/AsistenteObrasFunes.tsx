'use client'

import React, { useState, useMemo } from "react";

const LOGO_SI = "data:image/png;base64,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";

/* =========================================================================
   ASISTENTE DE OBRAS PARTICULARES — FUNES
   Fuentes:
   · Instructivo Obras Particulares Funes 04/2025 (Ord. 288/85 y modif.)
   · Ord. 1213/19 — Contribución por Mejoras / Mayor Aprovechamiento Urbanístico
   Hecho para SI Inmobiliaria · atención al cliente
   ========================================================================= */

// ---- DATOS DE ZONAS (del instructivo) --------------------------------------
const ZONAS = [
  { id:"eje-central", nombre:"Ejes del Área Central",
    detalle:"Arterias comerciales: J. Elorza, Pte. Perón, Av. Santa Fe, RN 9, Gral. López",
    supMin:250, anchoMin:12.5, fotMax:1.5, fotMin:0.4, fosMax:0.67, fosMin:0.2,
    alturaTxt:"PB + 2 pisos", alturaM:12,
    retiroFrente:"Sobre línea municipal (0 m)",
    retiroMedianera:"Permitido sobre eje (muro encaballado 30 cm) o retiro 1 m",
    tipologia:"Tipos 2 y 3 · fachada de medianera a medianera",
    centroManzana:"Sí — franja edificable 33,33 m (manzana 100×100)", notas:[] },
  { id:"central", nombre:"Área Central",
    detalle:"Casco: N° Vélez Sarsfield/Gral. López/Bs As · E Catamarca · S RN 9",
    supMin:250, anchoMin:12.5, fotMax:1.0, fotMin:0.3, fosMax:0.5, fosMin:0.15,
    alturaTxt:"PB + 2 pisos", alturaM:12,
    retiroFrente:"Sobre línea municipal (0 m)",
    retiroMedianera:"Permitido sobre eje (muro encaballado 30 cm) o retiro 1 m",
    tipologia:"Tipos 2 y 3 · fachada de medianera a medianera",
    centroManzana:"Sí — franja edificable 33,33 m (manzana 100×100)", notas:[] },
  { id:"norte-2122", nombre:"Área Norte (AN 2-1 y 2-2)",
    detalle:"Sectores urbanos AN 2-1 / AN 2-2",
    supMin:250, anchoMin:12.5, fotMax:0.8, fotMin:0.2, fosMax:0.4, fosMin:0.2,
    alturaTxt:"PB + 1 piso", alturaM:9,
    retiroFrente:"Sobre línea municipal. Si adopta retiro: franja no edificable 4 m mín.",
    retiroMedianera:"Permitido sobre eje (muro encaballado 30 cm) o retiro 1 m",
    tipologia:"Tipos 2, 21, 3, 31",
    centroManzana:"Aplica en AN 2-1 (manzana 100×100 → 33,33 m / lado 80 m → 26,67 m)", notas:[] },
  { id:"residencial-3", nombre:"Área Residencial 3",
    detalle:"Sectores AR 3-1 a AR 3-7",
    supMin:500, anchoMin:15, fotMax:0.6, fotMin:0.15, fosMax:0.3, fosMin:0.075,
    alturaTxt:"PB + 1 piso", alturaM:9,
    retiroFrente:"Retiro obligatorio 4 m mín.",
    retiroMedianera:"Permitido sobre eje (muro encaballado 30 cm) o retiro 1 m",
    tipologia:"Tipos 21/31 (frente ≤20 m) · 11/21/31 (frente >20 m)",
    centroManzana:"No", notas:[] },
  { id:"residencial-4", nombre:"Área Residencial 4",
    detalle:"Sectores AR 4-1 a AR 4-9",
    supMin:1000, anchoMin:25, fotMax:0.5, fotMin:0.1, fosMax:0.25, fosMin:0.05,
    alturaTxt:"PB + 1 piso", alturaM:9,
    retiroFrente:"Retiro obligatorio 5 m mín.",
    retiroMedianera:"Permitido sobre eje (muro encaballado 30 cm) o retiro 1 m",
    tipologia:"Tipos 11, 21, 31", centroManzana:"No", notas:[] },
  { id:"funes-norte", nombre:"Funes Norte (AN 2-3 · general)",
    detalle:"Loteo Funes Norte — régimen general",
    supMin:500, anchoMin:15, fotMax:0.5, fotMin:0.1, fosMax:0.25, fosMin:0.05,
    alturaTxt:"PB + 1 piso", alturaM:9,
    retiroFrente:"Retiro sobre línea municipal 3 m mín.",
    retiroMedianera:"Obligatorio en AMBAS medianeras, 2 m mín. (no se construye sobre eje)",
    tipologia:"—", centroManzana:"No",
    notas:["En Funes Norte y barrios cerrados NO se permite construir sobre el eje medianero ni tapiales divisorios."] },
  { id:"funes-norte-1356-a", nombre:"Funes Norte · Ord. 1356/20 — Mz 105, 90 y 88",
    detalle:"Manzanas con mayor aprovechamiento",
    supMin:500, anchoMin:15, fotMax:1.0, fotMin:null, fosMax:0.5, fosMin:null,
    alturaTxt:"PB + 2 pisos", alturaM:12,
    retiroFrente:"Servidumbre de jardín 5 m mín.",
    retiroMedianera:"Según régimen Funes Norte (no sobre eje)",
    tipologia:"—", centroManzana:"No", notas:[] },
  { id:"funes-norte-1356-b", nombre:"Funes Norte · Ord. 1356/20 — Mz 84-87, 91-94, 104",
    detalle:"Manzanas 84,85,86,87,91,92,93,94,104",
    supMin:500, anchoMin:15, fotMax:0.4, fotMin:null, fosMax:0.8, fosMin:null,
    alturaTxt:"PB + 1 piso", alturaM:9,
    retiroFrente:"Servidumbre de jardín 3 m mín.",
    retiroMedianera:"Según régimen Funes Norte (no sobre eje)",
    tipologia:"—", centroManzana:"No",
    notas:["⚠ En el instructivo figura FOT 0,40 y FOS 0,80 (un FOS mayor al FOT es atípico). Verificar con Planeamiento."] },
];

// ---- TASA DE EDIFICACIÓN — OBRA NUEVA (Ord. 1536/22) ------------------------
function alicuotaObraNueva(m2: number){
  if(m2<=60) return 0.005; if(m2<=100) return 0.01;
  if(m2<=150) return 0.012; if(m2<=200) return 0.013; return 0.015;
}
function tramoTexto(m2: number){
  if(m2<=60) return "0,50% (hasta 60 m²)"; if(m2<=100) return "1,00% (61–100 m²)";
  if(m2<=150) return "1,20% (101–150 m²)"; if(m2<=200) return "1,30% (151–200 m²)";
  return "1,50% (más de 200 m²)";
}

// ---- CHECKLISTS DE DOCUMENTACIÓN -------------------------------------------
const TRAMITES = {
  "obra-nueva": { label:"Obra nueva", items:[
    "Plano de mensura / reválida / verificación de límites con sellado de la Municipalidad",
    "Certificación de aportes profesionales del colegio",
    "Recibo de TGI (con cuenta, sección, manzana y lote visibles)",
    "Legajo de arquitectura: plantas, 2 cortes, vista 1:50, fachada 1:100, esquema 1:200, estructuras",
    "Planilla de iluminación y ventilación + rótulo reglamentario completo",
    "Legajo sanitario: plantas y cortes (pluvial, cloacal, agua fría/caliente) con colores reglamentarios" ]},
  "ampliacion-sin-final": { label:"Ampliación sin final", items:[
    "Plano anterior completo escaneado con sello de aprobación",
    "Certificación de aportes profesionales",
    "Recibo de TGI",
    "Legajo de arquitectura + estructuras + iluminación/ventilación + rótulo",
    "Legajo sanitario con rótulo" ]},
  "ampliacion-con-final": { label:"Ampliación con final", items:[
    "Plano anterior con sello de aprobación",
    "Certificado de final de obras anterior con sello",
    "Verificación de límites si la ampliación supera 25 m² cubiertos sobre medianeras",
    "Certificación de aportes profesionales",
    "Recibo de TGI",
    "Legajo de arquitectura + estructuras + legajo sanitario + rótulo" ]},
  "registro": { label:"Registro", items:[
    "Plano anterior con sello (si lo hubiere)",
    "Certificación de aportes profesionales",
    "Certificado de final de obras anterior con sello",
    "Recibo de TGI",
    "Legajo de registro: plantas, 2 cortes, fachada 1:100, esquema 1:200, rótulo + sanitaria visible" ]},
  "demolicion": { label:"Demolición", items:[
    "Plano anterior con sello de aprobación",
    "Certificado de final de obras anterior con sello y aportes definitivos",
    "Certificación de aportes profesionales",
    "Recibo de TGI",
    "Legajo de demolición: plantas, 2 cortes, fachada 1:100, esquema 1:200, rótulo" ]},
};

// ---- HELPERS ---------------------------------------------------------------
const nf  = new Intl.NumberFormat("es-AR",{ maximumFractionDigits:0 });
const nf1 = new Intl.NumberFormat("es-AR",{ maximumFractionDigits:1 });
const money = (n: number)=> "$ " + new Intl.NumberFormat("es-AR",{ maximumFractionDigits:0 }).format(Math.max(0,Math.round(n)));

// ---- INPUT NUMÉRICO CON SEPARADOR DE MILES -------------------------------
function NumInput({ value, onChange, ...rest }: {
  value: number
  onChange: (n: number) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>){
  const display = (value===0||(value as unknown)===""||value==null) ? "" : new Intl.NumberFormat("es-AR").format(value);
  const handle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const raw = String(e.target.value).replace(/[^\d]/g,"");
    onChange(raw===""?0:parseInt(raw,10));
  };
  return <input type="text" inputMode="numeric" value={display} onChange={handle} {...rest} />;
}

// ---- DESPLEGABLE (explicaciones) -----------------------------------------
function Collapse({ title, children }: { title: React.ReactNode; children: React.ReactNode }){
  return (
    <details className="aof-coll">
      <summary className="aof-coll-sum">{title}</summary>
      <div className="aof-coll-body">{children}</div>
    </details>
  );
}

// ============================================================================
export default function AsistenteObrasFunes(){
  const [zonaId,setZonaId]         = useState("residencial-3");
  const [supLote,setSupLote]       = useState(600);
  const [frente,setFrente]         = useState(15);
  const [fondo,setFondo]           = useState(40);
  const [supConstruir,setSupConstruir]= useState(300);
  const [montoObraTasa,setMontoObraTasa]= useState(0);
  const [paso,setPaso]             = useState(1);
  const [numeroBase,setNumeroBase] = useState(1200000);
  const [m2PB,setM2PB]             = useState(250);
  const [m2PA,setM2PA]             = useState(200);
  const [montoObraPH,setMontoObraPH]= useState(135000000);
  const [valFiscal,setValFiscal]   = useState(500000);
  const [fosUso,setFosUso]         = useState(0.5);
  const [fotUso,setFotUso]         = useState(1.0);
  const [usd,setUsd]               = useState(1300);
  const [incPH,setIncPH]           = useState(false);
  const [incUso,setIncUso]         = useState(false);
  const [tramite,setTramite]       = useState<keyof typeof TRAMITES>("obra-nueva");

  const zona = useMemo(()=>ZONAS.find(z=>z.id===zonaId) ?? ZONAS[0],[zonaId]);

  const ali = alicuotaObraNueva(supConstruir);
  const montoObra = montoObraTasa;
  const tasa = montoObra*ali;

  const fosMaxPBm2 = zona.fosMax * supLote;
  const fotMaxTotm2 = zona.fotMax * supLote;
  const m2Total = m2PB + m2PA;
  const m2ExtraFos = Math.max(0, m2PB - fosMaxPBm2);
  const m2ExtraFot = Math.max(0, m2Total - fotMaxTotm2);
  const cmFos = 0.5*numeroBase*m2ExtraFos;
  const cmFot = 0.5*numeroBase*m2ExtraFot;
  const cmSuperficies = cmFos+cmFot;

  const cmPH = 0.40*montoObraPH;

  const cmUsoVF  = 250*valFiscal*fosUso + 250*valFiscal*fotUso;
  const cmUsoUSD = 10*supLote*fotUso;
  const cmUsoUSDpesos = cmUsoUSD*usd;
  const cmUso = Math.max(cmUsoVF, cmUsoUSDpesos);
  const totalPlus = cmSuperficies + (incPH?cmPH:0) + (incUso?cmUso:0);

  const avisoSup = supLote<zona.supMin;
  const avisoFrente = frente>0 && frente<zona.anchoMin;

    return (
    <div className="aof-root">
      <style>{CSS}</style>

      <header className="aof-head">
        <div className="aof-brand">
          {/* Logo embebido como data-URI base64; next/image no aplica. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="aof-logo" src={LOGO_SI} alt="SI Inmobiliaria" />
          <span className="aof-brand-div" />
          <div className="aof-brand-text">
            <span className="aof-eyebrow">Asistente municipal</span>
            <h1>Obras Particulares · Funes</h1>
          </div>
        </div>
      </header>

      <main className="aof-wizard">
        <div className="aof-steps">
          <div className={"aof-step"+(paso>=1?" on":"")}><span className="aof-stepnum">1</span>Tu lote</div>
          <div className="aof-stepline" />
          <div className={"aof-step"+(paso>=2?" on":"")}><span className="aof-stepnum">2</span>Tu proyecto</div>
          <div className="aof-stepline" />
          <div className={"aof-step"+(paso>=3?" on":"")}><span className="aof-stepnum">3</span>Resultado</div>
        </div>

        {paso===1 && (
          <section className="aof-card aof-wcard">
            <h2 className="aof-h2">Paso 1 · Tu lote</h2>
            <p className="aof-wsub">Contanos dónde está y qué medidas tiene el terreno. Si no sabés la zona exacta, no te preocupes: la confirmamos nosotros.</p>
            <label className="aof-field">
              <span>Zona urbana</span>
              <select value={zonaId} onChange={(e)=>setZonaId(e.target.value)}>
                {ZONAS.map(z=>(<option key={z.id} value={z.id}>{z.nombre}</option>))}
              </select>
            </label>
            <p className="aof-hint">{zona.detalle}</p>
            <label className="aof-field"><span>Superficie del lote (m²)</span>
              <NumInput value={supLote} onChange={setSupLote} /></label>
            <div className="aof-row">
              <label className="aof-field"><span>Frente (m)</span>
                <input type="number" step="0.01" min="0" value={frente} onChange={(e)=>setFrente(+e.target.value||0)} /></label>
              <label className="aof-field"><span>Fondo (m)</span>
                <input type="number" step="0.01" min="0" value={fondo} onChange={(e)=>setFondo(+e.target.value||0)} /></label>
            </div>
            {frente>0 && fondo>0 && (
              <button className="aof-link aof-fxf" onClick={()=>setSupLote(Math.round(frente*fondo))}>↳ frente × fondo = {nf.format(Math.round(frente*fondo))} m² · usar como superficie</button>
            )}
            {avisoSup && <div className="aof-warn">El lote ({nf.format(supLote)} m²) es menor a la superficie mínima de la zona ({nf.format(zona.supMin)} m²).</div>}
            {avisoFrente && <div className="aof-warn">El frente ({nf1.format(frente)} m) es menor al ancho mínimo ({nf1.format(zona.anchoMin)} m).</div>}
            <div className="aof-nav">
              <button className="aof-btn aof-btn-primary" onClick={()=>setPaso(2)}>Siguiente →</button>
            </div>
          </section>
        )}

        {paso===2 && (
          <section className="aof-card aof-wcard">
            <h2 className="aof-h2">Paso 2 · Tu proyecto</h2>
            <p className="aof-wsub">¿Cuántos metros cuadrados pensás construir? No hace falta que sepas de índices ni de FOT: con esto nosotros hacemos toda la cuenta.</p>
            <div className="aof-row">
              <label className="aof-field"><span>m² en planta baja</span>
                <NumInput value={m2PB} onChange={setM2PB} /></label>
              <label className="aof-field"><span>m² en planta alta</span>
                <NumInput value={m2PA} onChange={setM2PA} /></label>
            </div>
            <p className="aof-recap">Lote: <b>{zona.nombre}</b> · {nf.format(supLote)} m²</p>
            <div className="aof-nav">
              <button className="aof-btn" onClick={()=>setPaso(1)}>← Atrás</button>
              <button className="aof-btn aof-btn-primary" onClick={()=>setPaso(3)}>Ver mi resultado →</button>
            </div>
          </section>
        )}

        {paso===3 && (
          <>
            <section className="aof-card aof-wcard aof-recap-card">
              <span className="aof-eyebrow2">Tu resultado</span>
              <p className="aof-recap-line">En <b>{zona.nombre}</b>, con un lote de <b>{nf.format(supLote)} m²</b>, querés construir <b>{nf.format(m2PB)} m²</b> en planta baja y <b>{nf.format(m2PA)} m²</b> arriba — <b>{nf.format(m2Total)} m²</b> en total.</p>
            </section>

            <section className="aof-card aof-wcard">
              <h2 className="aof-h2">¿Cuánto podés construir?</h2>
              <div className="aof-bignums">
                <div className="aof-bignum">
                  <span className="aof-lbl">Máx. en planta baja</span>
                  <strong>{nf.format(fosMaxPBm2)} <em>m²</em></strong>
                  <small>FOS {zona.fosMax} · vos: {nf.format(m2PB)} m²</small>
                </div>
                <div className="aof-bignum gold">
                  <span className="aof-lbl">Máx. total</span>
                  <strong>{nf.format(fotMaxTotm2)} <em>m²</em></strong>
                  <small>FOT {zona.fotMax} · vos: {nf.format(m2Total)} m²</small>
                </div>
              </div>
              {(m2ExtraFos>0||m2ExtraFot>0) ? (
                <div className="aof-verdict warn">Te excedés{m2ExtraFos>0?(" +"+nf.format(m2ExtraFos)+" m² en planta baja"):""}{(m2ExtraFos>0&&m2ExtraFot>0)?" y":""}{m2ExtraFot>0?(" +"+nf.format(m2ExtraFot)+" m² en el total"):""}. Para construirlo necesitás excepción y se paga plusvalía.</div>
              ) : (
                <div className="aof-verdict ok">Tu proyecto entra dentro de los máximos de la zona. No pagás plusvalía por superficie.</div>
              )}
              <Collapse title="Ver índices, retiros y altura de la zona">
                <p><b>Altura máx.:</b> {zona.alturaTxt} · {zona.alturaM} m</p>
                <p><b>Retiro de frente:</b> {zona.retiroFrente}</p>
                <p><b>Medianeras:</b> {zona.retiroMedianera}</p>
                <p><b>Lote mínimo:</b> {nf.format(zona.supMin)} m² · frente {nf1.format(zona.anchoMin)} m</p>
                {zona.notas.map((n,i)=>(<p key={i}>{n}</p>))}
              </Collapse>
            </section>

            {(m2ExtraFos>0||m2ExtraFot>0) && (
              <section className="aof-card aof-wcard">
                <h2 className="aof-h2">Plusvalía estimada</h2>
                <label className="aof-field"><span>Nº Base ($/m²) · sugerido, podés cambiarlo</span>
                  <NumInput value={numeroBase} onChange={setNumeroBase} /></label>
                <div className="aof-result">
                  <div className="aof-result-row"><span>Exceso de FOS (planta baja)</span><b>{nf.format(m2ExtraFos)} m²</b></div>
                  <div className="aof-result-row"><span>Exceso de FOT (total)</span><b>{nf.format(m2ExtraFot)} m²</b></div>
                  <div className="aof-result-row"><span>Componente FOS</span><b>{money(cmFos)}</b></div>
                  <div className="aof-result-row"><span>Componente FOT</span><b>{money(cmFot)}</b></div>
                  <div className="aof-result-row total gold"><span>Plusvalía por superficie</span><b>{money(cmSuperficies)}</b></div>
                </div>
                <Collapse title="¿Cómo se calcula?">
                  <p>Solo los m² que se pasan del máximo de tu zona pagan plusvalía.</p>
                  <p>CM = 0,50 × Nº Base × (m² que exceden el FOS) + 0,50 × Nº Base × (m² que exceden el FOT).</p>
                </Collapse>
                <p className="aof-freenote">✓ La tolerancia del 10% no paga plusvalía (no acumulable con excepciones).</p>
              </section>
            )}

            <details className="aof-coll aof-collcard">
              <summary className="aof-coll-sum aof-collcard-sum">¿Sumás PH o cambio de uso?<span className="aof-optlabel">opcional</span></summary>
              <div className="aof-coll-body aof-collcard-body">
                <label className="aof-conchead2">
                  <input type="checkbox" checked={incPH} onChange={(e)=>setIncPH(e.target.checked)} />
                  <span>PH / fraccionamiento</span>
                  <b>{money(incPH?cmPH:0)}</b>
                </label>
                {incPH && (
                  <div className="aof-sub">
                    <label className="aof-field"><span>Monto de obra total ($)</span>
                      <NumInput value={montoObraPH} onChange={setMontoObraPH} /></label>
                    <Collapse title="¿Qué es y cómo se calcula?">
                      <p>Es la contribución por subdividir en unidades (propiedad horizontal) o fraccionar. CM = 0,40 × monto de obra. El Concejo puede ajustar ese 40% según el caso.</p>
                      <p>Consultá el monto de obra con tu arquitecto o con nosotros.</p>
                    </Collapse>
                  </div>
                )}
                <label className="aof-conchead2">
                  <input type="checkbox" checked={incUso} onChange={(e)=>setIncUso(e.target.checked)} />
                  <span>Cambio de uso de suelo</span>
                  <b>{money(incUso?cmUso:0)}</b>
                </label>
                {incUso && (
                  <div className="aof-sub">
                    <Collapse title="¿Cuándo aplica?">
                      <p>Solo cuando el Concejo cambia el uso o destino permitido del suelo (incorporar tierra rural al área urbana, recategorizar una zona). Es para desarrollos especiales, no para una obra común.</p>
                    </Collapse>
                    <label className="aof-field"><span>Valuación fiscal del terreno · API ($)</span>
                      <NumInput value={valFiscal} onChange={setValFiscal} /></label>
                    <div className="aof-row">
                      <label className="aof-field"><span>FOS otorgado</span>
                        <input type="number" step="0.01" min="0" value={fosUso} onChange={(e)=>setFosUso(+e.target.value||0)} /></label>
                      <label className="aof-field"><span>FOT otorgado</span>
                        <input type="number" step="0.01" min="0" value={fotUso} onChange={(e)=>setFotUso(+e.target.value||0)} /></label>
                    </div>
                    <label className="aof-field"><span>Cotización u$s</span>
                      <NumInput value={usd} onChange={setUsd} /></label>
                    <div className="aof-result">
                      <div className="aof-result-row"><span>Cota por valuación fiscal</span><b>{money(cmUsoVF)}</b></div>
                      <div className="aof-result-row"><span>Piso en pesos</span><b>{money(cmUsoUSDpesos)}</b></div>
                      <div className="aof-result-row total gold"><span>CM (la mayor)</span><b>{money(cmUso)}</b></div>
                    </div>
                  </div>
                )}
              </div>
            </details>

            <section className="aof-card aof-wcard aof-total-card">
              <span>Total estimado de plusvalía</span>
              <b>{money(totalPlus)}</b>
            </section>

            <details className="aof-coll aof-collcard">
              <summary className="aof-coll-sum aof-collcard-sum">Tasa de edificación<span className="aof-optlabel">opcional</span></summary>
              <div className="aof-coll-body aof-collcard-body">
                <label className="aof-field"><span>Superficie a construir (m²)</span>
                  <NumInput value={supConstruir} onChange={setSupConstruir} /></label>
                <label className="aof-field"><span>Monto de obra total ($)</span>
                  <NumInput value={montoObraTasa} onChange={setMontoObraTasa} /></label>
                <Collapse title="¿De dónde sale el monto de obra?">
                  <p>El municipio aplica la tasa sobre un monto de obra que surge del cómputo y presupuesto del Colegio (figura en el legajo). Consultalo con tu arquitecto o con nosotros.</p>
                </Collapse>
                <div className="aof-result">
                  <div className="aof-result-row"><span>Alícuota (según superficie)</span><b>{tramoTexto(supConstruir)}</b></div>
                  <div className="aof-result-row"><span>Monto de obra</span><b>{money(montoObra)}</b></div>
                  <div className="aof-result-row total"><span>Tasa de edificación</span><b>{money(tasa)}</b></div>
                </div>
              </div>
            </details>

            <details className="aof-coll aof-collcard">
              <summary className="aof-coll-sum aof-collcard-sum">¿Qué papeles necesito?<span className="aof-optlabel">trámite</span></summary>
              <div className="aof-coll-body aof-collcard-body">
                <div className="aof-tabs">
                  {(Object.entries(TRAMITES) as [keyof typeof TRAMITES, { label: string; items: string[] }][]).map(([k,v])=>(
                    <button key={k} className={"aof-tab"+(tramite===k?" on":"")} onClick={()=>setTramite(k)}>{v.label}</button>
                  ))}
                </div>
                <ul className="aof-doclist">
                  {TRAMITES[tramite].items.map((it,idx)=>(<li key={idx}>{it}</li>))}
                </ul>
                <p className="aof-hint">Trámite online en tramitesonline.org.ar/funes · PDF hasta 300 dpi.</p>
              </div>
            </details>

            <Collapse title="¿Cómo se paga la plusvalía?">
              <p>El tributo nace cuando se otorga el mayor aprovechamiento. El recibo de pago es requisito para inscribir transferencias de dominio.</p>
              <p>Todos los valores son una estimación orientativa: la liquidación exacta la emite el Municipio.</p>
            </Collapse>

            <div className="aof-nav">
              <button className="aof-btn" onClick={()=>setPaso(1)}>← Modificar datos</button>
            </div>
          </>
        )}
      </main>

      <footer className="aof-foot">
        Estimación orientativa · Instructivo de Obras Particulares de Funes (04/2025), Ord. 288/85 y modif., Ord. 1213/19.
        No reemplaza la liquidación formal de la Secretaría de Planeamiento.
      </footer>
    </div>
  );
}

// ---- ESTILOS ---------------------------------------------------------------
const CSS = `

.aof-root{
  --verde:#2F603F; --verde-d:#21472f; --dorado:#D4A24C; --dorado-d:#b07f2c;
  --tinta:#1c2521; --gris:#5d6b63; --linea:#e4e8e4; --fondo:#f6f8f5; --blanco:#fff;
  font-family:'Poppins',system-ui,sans-serif; color:var(--tinta);
  background:var(--fondo); min-height:100%; padding:0 0 40px;
}
.aof-root *{box-sizing:border-box;}
.aof-head{background:#fff; padding:20px 20px 17px; border-bottom:1px solid var(--linea); position:relative;}
.aof-head::after{content:''; position:absolute; left:0; right:0; bottom:-1px; height:3px;
  background:linear-gradient(90deg,var(--verde) 0%,var(--verde) 58%,var(--dorado) 58%,var(--dorado) 100%);}
.aof-brand{display:flex; align-items:center; gap:18px; max-width:1180px; margin:0 auto;}
.aof-logo{height:42px; width:auto; display:block;}
.aof-brand-div{width:1px; height:36px; background:var(--linea); flex:none;}
.aof-brand-text{display:flex; flex-direction:column; gap:1px;}
.aof-eyebrow{font-family:'Poppins'; font-size:9.5px; font-weight:600; letter-spacing:1.6px; text-transform:uppercase; color:var(--dorado-d);}
.aof-brand-text h1{font-family:'Raleway'; font-weight:700; font-size:18px; margin:0; color:var(--verde); line-height:1.15;}
@media(max-width:520px){ .aof-brand{gap:12px;} .aof-logo{height:34px;} .aof-brand-div{height:30px;} .aof-brand-text h1{font-size:14.5px;} }

.aof-grid{max-width:1180px; margin:22px auto 0; padding:0 18px;
  display:grid; gap:18px; grid-template-columns:repeat(3,1fr); align-items:start;}
.aof-full{grid-column:1 / -1;}
.aof-span2{grid-column:span 2;}
@media(max-width:920px){ .aof-span2{grid-column:auto;} }
@media(max-width:920px){ .aof-grid{grid-template-columns:1fr;} }

.aof-card{background:var(--blanco); border:1px solid var(--linea); border-radius:16px;
  padding:19px 19px 21px; box-shadow:0 2px 12px rgba(33,71,47,.05);}
.aof-h2{font-family:'Raleway'; font-weight:700; font-size:15px; margin:0 0 14px;
  color:var(--verde); display:flex; align-items:center; gap:8px;}
.aof-h2::before{content:''; width:18px; height:3px; background:var(--dorado); border-radius:2px;}

.aof-field{display:flex; flex-direction:column; gap:5px; margin-bottom:12px; flex:1;}
.aof-field span{font-size:11.5px; font-weight:500; color:var(--gris); letter-spacing:.2px;}
.aof-field input,.aof-field select{font-family:'Poppins'; font-size:14px; font-variant-numeric:tabular-nums;
  padding:9px 11px; border:1.5px solid var(--linea); border-radius:9px;
  background:#fbfdfb; color:var(--tinta); width:100%; transition:border-color .15s;}
.aof-field input:focus,.aof-field select:focus{outline:none; border-color:var(--verde);}
.aof-field input.aof-ro{background:#eef2ef; color:var(--gris); cursor:not-allowed;}
.aof-row{display:flex; gap:12px;}
.aof-hint{font-size:11.5px; color:var(--gris); margin:-2px 0 12px; line-height:1.45;}
.aof-microhint{font-size:10.5px; color:var(--gris); margin:-6px 0 12px; line-height:1.4;}

.aof-check{display:flex; align-items:flex-start; gap:8px; font-size:12px; cursor:pointer; margin:2px 0 4px;}
.aof-check input{margin-top:2px; accent-color:var(--verde);}
.aof-freenote{font-size:11px; color:var(--verde); margin:-2px 0 6px; padding-left:24px; line-height:1.4; font-weight:500;}

.aof-warn{background:#fef3e6; border:1px solid #f4d3a3; color:#8a5a12;
  font-size:12px; padding:9px 11px; border-radius:9px; margin:8px 0; line-height:1.4;}
.aof-ok{background:#eaf5ee; border:1px solid #bfe0cc; color:var(--verde-d);
  font-size:12px; padding:9px 11px; border-radius:9px; margin:8px 0;}

.aof-ficha{margin-top:16px; border-top:1px dashed var(--linea); padding-top:14px;}
.aof-ficha h3{font-family:'Raleway'; font-size:12.5px; font-weight:700; margin:0 0 10px; color:var(--verde);}
.aof-ficha dl{margin:0; display:grid; gap:9px;}
.aof-ficha dl > div{display:grid; grid-template-columns:88px 1fr; gap:8px; align-items:baseline;}
.aof-ficha dt{font-size:11px; color:var(--gris); font-weight:500;}
.aof-ficha dd{margin:0; font-size:12.5px; line-height:1.4;}
.aof-nota{font-size:11.5px; color:#8a5a12; background:#fef3e6; padding:8px 10px; border-radius:8px; margin:10px 0 0; line-height:1.4;}

.aof-bignums{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
@media(max-width:520px){ .aof-bignums{grid-template-columns:1fr;} }
.aof-bignum{background:linear-gradient(160deg,#f1f7f3,#e7f1ea); border:1px solid #d6e6dc;
  border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:3px;}
.aof-bignum.gold{background:linear-gradient(160deg,#fbf4e6,#f6ecd5); border-color:#ecd8ad;}
.aof-lbl{font-size:10.5px; font-weight:600; color:var(--verde-d); text-transform:uppercase; letter-spacing:.5px;}
.aof-bignum.gold .aof-lbl{color:var(--dorado-d);}
.aof-bignum strong{font-family:'Poppins'; font-weight:700; font-size:24px; font-variant-numeric:tabular-nums; line-height:1.05;}
.aof-bignum strong em{font-style:normal; font-size:12px; font-weight:500; color:var(--gris);}
.aof-bignum small{font-size:10.5px; color:var(--gris);}
.aof-mins{font-size:12px; color:var(--gris); margin:12px 0 0; line-height:1.5;}
.aof-mins b{color:var(--tinta); font-variant-numeric:tabular-nums;}
.aof-defs{margin-top:14px; border-top:1px dashed var(--linea); padding-top:12px; display:grid; gap:7px;}
.aof-defs p{margin:0; font-size:11.5px; color:var(--gris); line-height:1.45;}
.aof-defs b{color:var(--verde);}
.aof-mini{margin-top:14px; background:#f3f6f4; border-radius:10px; padding:11px 12px;}
.aof-mini h3{font-family:'Raleway'; font-size:12px; font-weight:700; margin:0 0 5px; color:var(--verde);}
.aof-mini p{margin:0; font-size:11.5px; color:var(--gris); line-height:1.45;}

.aof-result{border:1px solid var(--linea); border-radius:11px; overflow:hidden; margin:8px 0 4px;}
.aof-result-row{display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 13px; font-size:12.5px; border-bottom:1px solid var(--linea);}
.aof-result-row:last-child{border-bottom:none;}
.aof-result-row span{color:var(--gris);}
.aof-result-row b{font-variant-numeric:tabular-nums; font-weight:600;}
.aof-result-row.total{background:#eaf5ee;}
.aof-result-row.total b{color:var(--verde-d); font-size:15px;}
.aof-result-row.total.gold{background:#fbf4e6;}
.aof-result-row.total.gold b{color:var(--dorado-d);}


.aof-hint-top{margin-top:-4px; margin-bottom:16px;}
.aof-concepto{border:1px solid var(--linea); border-radius:11px; margin-bottom:10px; overflow:hidden; background:#fff;}
.aof-conchead{display:flex; align-items:center; gap:11px; padding:13px 15px; cursor:pointer; background:#fbfdfb;}
.aof-conchead input{accent-color:var(--verde); width:16px; height:16px; flex:none; cursor:pointer;}
.aof-concname{font-family:'Raleway'; font-weight:600; font-size:13.5px; color:var(--tinta); flex:1;}
.aof-concval{font-variant-numeric:tabular-nums; font-weight:600; font-size:13.5px; color:var(--verde-d);}
.aof-concbody{padding:14px 15px 16px; border-top:1px solid var(--linea);}
.aof-plustotal{display:flex; justify-content:space-between; align-items:center; gap:12px;
  background:linear-gradient(160deg,#fbf4e6,#f6ecd5); border:1px solid #ecd8ad; border-radius:12px;
  padding:15px 17px; margin-top:14px;}
.aof-plustotal span{font-family:'Raleway'; font-weight:700; font-size:14px; color:var(--dorado-d);}
.aof-plustotal b{font-family:'Poppins'; font-weight:700; font-size:22px; font-variant-numeric:tabular-nums; color:var(--dorado-d);}

/* desplegables */
.aof-coll{border:1px solid var(--linea); border-radius:10px; background:#fbfdfb; overflow:hidden; margin:10px 0 0;}
.aof-coll-sum{list-style:none; cursor:pointer; padding:11px 14px; font-size:12.5px; font-weight:600;
  color:var(--verde); display:flex; align-items:center; gap:9px; font-family:'Raleway'; user-select:none;}
.aof-coll-sum::-webkit-details-marker{display:none;}
.aof-coll-sum::before{content:'+'; font-family:'Poppins'; font-size:15px; line-height:1; color:var(--dorado-d); font-weight:700; width:14px; text-align:center; flex:none;}
.aof-coll[open] .aof-coll-sum::before{content:'−';}
.aof-coll-sum:hover{background:#f1f5f2;}
.aof-coll-body{padding:2px 14px 13px 37px; font-size:11.5px; color:var(--gris); line-height:1.55;}
.aof-coll-body p{margin:0 0 8px;}
.aof-coll-body p:last-child{margin-bottom:0;}
.aof-coll-body b{color:var(--verde);}
/* card colapsable de ancho completo (tasa) */
.aof-collcard{background:#fff; border:1px solid var(--linea); border-radius:14px; margin:0; box-shadow:0 2px 10px rgba(33,71,47,.05);}
.aof-collcard-sum{padding:17px 18px; font-size:15px; color:var(--verde); font-weight:700;}
.aof-collcard-sum::before{font-size:18px;}
.aof-collcard-sum:hover{background:#fbfdfb;}
.aof-collcard-body{padding:4px 18px 20px;}
.aof-optlabel{font-family:'Poppins'; font-size:9.5px; font-weight:500; color:var(--gris); background:#eef2ef; padding:2px 9px; border-radius:10px; letter-spacing:.4px; text-transform:uppercase; margin-left:auto;}

/* plusvalía */
.aof-seg{display:flex; flex-wrap:wrap; gap:7px; margin-bottom:16px;}
.aof-segbtn{font-family:'Poppins'; font-size:12.5px; font-weight:500; cursor:pointer;
  padding:9px 15px; border-radius:9px; border:1.5px solid var(--linea);
  background:#fbfdfb; color:var(--gris); transition:all .15s;}
.aof-segbtn:hover{border-color:var(--verde);}
.aof-segbtn.on{background:var(--verde); border-color:var(--verde); color:#fff;}
.aof-plusgrid{display:grid; grid-template-columns:1fr 1fr; gap:18px; align-items:start;}
@media(max-width:760px){ .aof-plusgrid{grid-template-columns:1fr;} }
.aof-formula{font-family:'Poppins'; font-size:11.5px; color:var(--verde-d); background:#eef4f0;
  padding:10px 12px; border-radius:8px; line-height:1.6; margin:0 0 14px; border-left:3px solid var(--dorado);}
.aof-fxf{margin:-2px 0 12px;}
.aof-link{background:none; border:none; color:var(--verde); font-family:'Poppins'; font-size:11.5px;
  cursor:pointer; padding:0; margin:-6px 0 12px; text-align:left; text-decoration:underline; text-decoration-color:var(--dorado);}
.aof-disc{font-size:11.5px; color:#8a5a12; background:#fef3e6; padding:11px 13px; border-radius:9px; margin:14px 0 0; line-height:1.55;}
.aof-disc u{text-decoration-color:var(--dorado-d);}

.aof-tabs{display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px;}
.aof-tab{font-family:'Poppins'; font-size:12px; font-weight:500; cursor:pointer;
  padding:7px 13px; border-radius:20px; border:1.5px solid var(--linea); background:#fbfdfb; color:var(--gris); transition:all .15s;}
.aof-tab:hover{border-color:var(--verde);}
.aof-tab.on{background:var(--verde); border-color:var(--verde); color:#fff;}
.aof-doclist{margin:0; padding:0; list-style:none; display:grid; gap:8px; grid-template-columns:1fr 1fr;}
@media(max-width:680px){ .aof-doclist{grid-template-columns:1fr;} }
.aof-doclist li{position:relative; padding:10px 12px 10px 32px; background:#f6f8f5; border-radius:9px; font-size:12.5px; line-height:1.45;}
.aof-doclist li::before{content:'✓'; position:absolute; left:11px; top:10px; color:var(--dorado-d); font-weight:700; font-size:13px;}

.aof-foot{max-width:1180px; margin:18px auto 0; padding:0 18px; font-size:11px; color:var(--gris); line-height:1.5; text-align:center;}

/* wizard */
.aof-wizard{max-width:720px; margin:24px auto 0; padding:0 18px; display:flex; flex-direction:column; gap:16px;}
.aof-steps{display:flex; align-items:center; justify-content:center; gap:7px; margin-bottom:2px; flex-wrap:wrap;}
.aof-step{display:flex; align-items:center; gap:7px; font-family:'Raleway'; font-size:12px; font-weight:600; color:var(--gris);}
.aof-stepnum{width:24px; height:24px; border-radius:50%; background:#e8ece9; color:var(--gris); display:grid; place-items:center; font-family:'Poppins'; font-size:12px; font-weight:700; flex:none; transition:all .2s;}
.aof-step.on{color:var(--verde);}
.aof-step.on .aof-stepnum{background:var(--verde); color:#fff;}
.aof-stepline{width:22px; height:2px; background:#e8ece9; border-radius:1px; flex:none;}
@media(max-width:460px){ .aof-step{font-size:0; gap:0;} }
.aof-wcard{width:100%;}
.aof-wsub{font-size:13px; color:var(--gris); margin:-4px 0 16px; line-height:1.55;}
.aof-recap{font-size:12px; color:var(--gris); background:#f3f6f4; padding:10px 12px; border-radius:9px; margin:14px 0 0;}
.aof-recap b{color:var(--tinta);}
.aof-recap-card{background:linear-gradient(135deg,var(--verde),var(--verde-d)); border:none;}
.aof-eyebrow2{font-family:'Poppins'; font-size:10px; font-weight:600; letter-spacing:1.6px; text-transform:uppercase; color:var(--dorado); display:block; margin-bottom:7px;}
.aof-recap-line{font-family:'Raleway'; font-size:15.5px; line-height:1.5; color:#fff; margin:0; font-weight:500;}
.aof-recap-line b{color:#fff; font-weight:700;}
.aof-verdict{border-radius:10px; padding:12px 14px; font-size:13px; line-height:1.5; margin-top:14px; font-weight:500;}
.aof-verdict.warn{background:#fef3e6; border:1px solid #f4d3a3; color:#8a5a12;}
.aof-verdict.ok{background:#eaf5ee; border:1px solid #bfe0cc; color:var(--verde-d);}
.aof-nav{display:flex; gap:10px; align-items:center; margin-top:8px;}
.aof-btn{font-family:'Raleway'; font-weight:600; font-size:14px; padding:12px 22px; border-radius:10px; border:1.5px solid var(--linea); background:#fff; color:var(--gris); cursor:pointer; transition:all .15s;}
.aof-btn:hover{border-color:var(--verde); color:var(--verde);}
.aof-btn-primary{background:var(--verde); border-color:var(--verde); color:#fff; margin-left:auto;}
.aof-btn-primary:hover{background:var(--verde-d); color:#fff; border-color:var(--verde-d);}
.aof-conchead2{display:flex; align-items:center; gap:10px; padding:11px 0; cursor:pointer; font-family:'Raleway'; font-weight:600; font-size:13px; color:var(--tinta); border-top:1px solid var(--linea);}
.aof-conchead2:first-child{border-top:none;}
.aof-conchead2 input{accent-color:var(--verde); width:16px; height:16px; flex:none;}
.aof-conchead2 span{flex:1;}
.aof-conchead2 b{font-variant-numeric:tabular-nums; color:var(--verde-d);}
.aof-sub{padding:2px 0 12px;}
.aof-total-card{display:flex; justify-content:space-between; align-items:center; gap:12px; background:linear-gradient(160deg,#fbf4e6,#f6ecd5); border:1px solid #ecd8ad;}
.aof-total-card span{font-family:'Raleway'; font-weight:700; font-size:14.5px; color:var(--dorado-d);}
.aof-total-card b{font-family:'Poppins'; font-weight:700; font-size:23px; font-variant-numeric:tabular-nums; color:var(--dorado-d);}
`;

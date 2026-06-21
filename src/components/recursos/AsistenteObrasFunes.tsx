'use client'

import React, { useState, useMemo } from "react";


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

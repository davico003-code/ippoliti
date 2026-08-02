'use client'

import React, { useState, useMemo, useEffect } from "react";


/* =========================================================================
   ASISTENTE DE OBRAS PARTICULARES — FUNES
   Fuentes:
   · Instructivo Obras Particulares Funes 04/2025 (Ord. 288/85 y modif.)
   · Ord. 1213/19 — Contribución por Mejoras / Mayor Aprovechamiento Urbanístico
   Hecho para SI INMOBILIARIA · atención al cliente
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

// ---- MAPEO familia del mapa interactivo → zona del asistente ---------------
// El mapa de zonificación (/recursos/mapa-funes) manda ?zona=<familia> al hacer
// clic en "Calculá tu plusvalía". Acá traducimos esa familia a un id de ZONAS.
const FAM_TO_ZONA: Record<string, string> = {
  "AR3": "residencial-3",
  "ALR3": "residencial-3",
  "AR4": "residencial-4",
  "ALR4": "residencial-4",
  "AC": "central",
  "EJES AC": "eje-central",
  "AN1-1": "norte-2122",
  "AN2-1": "norte-2122",
  "AN2-3": "funes-norte",
};

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

  // Si venís del mapa interactivo con ?zona=<familia>, preseleccionamos la zona.
  useEffect(()=>{
    const fam = new URLSearchParams(window.location.search).get("zona");
    const id = fam ? FAM_TO_ZONA[fam] : undefined;
    if(id) setZonaId(id);
  },[]);

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
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

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
/* Asistente de obras — rediseño estilo Apple (Raleway). Aire, tipografía
   grande, cards blancas con sombra suave, radios amplios, controles limpios. */
.aof-root{
  --verde:#1A5C38; --verde-d:#0F3F26; --verde-tint:#eef5f0;
  --dorado:#B8935A; --dorado-d:#8a6a36; --dorado-tint:#f7f1e7;
  --tinta:#1d1d1f; --gris:#6e6e73; --gris2:#86868b;
  --linea:rgba(0,0,0,.08); --fondo:#f5f5f7; --blanco:#fff;
  font-family:var(--font-raleway),'Raleway',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  color:var(--tinta); background:var(--fondo); min-height:100%;
  padding:0 0 64px; -webkit-font-smoothing:antialiased;
}
.aof-root *{box-sizing:border-box; font-family:inherit;}

/* wizard */
.aof-wizard{max-width:760px; margin:32px auto 0; padding:0 20px; display:flex; flex-direction:column; gap:20px;}
.aof-steps{display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:6px; flex-wrap:wrap;}
.aof-step{display:flex; align-items:center; gap:9px; font-size:14px; font-weight:600; color:var(--gris2); letter-spacing:-.01em;}
.aof-stepnum{width:30px; height:30px; border-radius:50%; background:#e8e8ed; color:var(--gris2); display:grid; place-items:center; font-size:14px; font-weight:700; flex:none; transition:all .25s cubic-bezier(.2,.8,.2,1);}
.aof-step.on{color:var(--tinta);}
.aof-step.on .aof-stepnum{background:var(--verde); color:#fff; box-shadow:0 4px 12px rgba(26,92,56,.32);}
.aof-stepline{width:30px; height:2px; background:#e0e0e6; border-radius:2px; flex:none;}
@media(max-width:480px){ .aof-step{font-size:0; gap:0;} .aof-stepline{width:20px;} }

/* cards */
.aof-grid{max-width:1180px; margin:24px auto 0; padding:0 20px; display:grid; gap:20px; grid-template-columns:repeat(3,1fr); align-items:start;}
.aof-full{grid-column:1 / -1;}
.aof-span2{grid-column:span 2;}
@media(max-width:920px){ .aof-span2,.aof-grid{grid-column:auto; grid-template-columns:1fr;} }
.aof-card{background:var(--blanco); border:none; border-radius:22px; padding:28px;
  box-shadow:0 1px 2px rgba(0,0,0,.04), 0 12px 40px rgba(0,0,0,.05);}
.aof-wcard{width:100%;}
.aof-h2{font-weight:700; font-size:21px; letter-spacing:-.02em; margin:0 0 18px; color:var(--tinta); display:flex; align-items:center; gap:0;}
.aof-h2::before{display:none;}
.aof-wsub{font-size:16px; color:var(--gris); margin:-8px 0 22px; line-height:1.5; letter-spacing:-.01em;}

/* campos */
.aof-field{display:flex; flex-direction:column; gap:8px; margin-bottom:16px; flex:1;}
.aof-field span{font-size:13px; font-weight:600; color:var(--gris); letter-spacing:-.01em;}
.aof-field input,.aof-field select{font-size:16px; font-variant-numeric:tabular-nums; font-weight:500;
  padding:13px 15px; border:1px solid var(--linea); border-radius:14px; background:#fff; color:var(--tinta);
  width:100%; transition:border-color .18s, box-shadow .18s; -webkit-appearance:none; appearance:none;}
.aof-field select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236e6e73' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:40px;}
.aof-field input:focus,.aof-field select:focus{outline:none; border-color:var(--verde); box-shadow:0 0 0 4px rgba(26,92,56,.12);}
.aof-field input.aof-ro{background:#f5f5f7; color:var(--gris2); cursor:not-allowed;}
.aof-row{display:flex; gap:14px;}
.aof-hint{font-size:13.5px; color:var(--gris); margin:-4px 0 16px; line-height:1.5;}
.aof-microhint{font-size:12.5px; color:var(--gris2); margin:-8px 0 14px; line-height:1.45;}

.aof-check{display:flex; align-items:flex-start; gap:10px; font-size:14px; cursor:pointer; margin:4px 0 6px; color:var(--tinta);}
.aof-check input{margin-top:2px; accent-color:var(--verde); width:18px; height:18px;}
.aof-freenote{font-size:12.5px; color:var(--verde); margin:-2px 0 8px; padding-left:28px; line-height:1.45; font-weight:500;}

/* avisos */
.aof-warn{background:var(--dorado-tint); border:1px solid rgba(184,147,90,.3); color:var(--dorado-d);
  font-size:13.5px; padding:13px 15px; border-radius:14px; margin:10px 0; line-height:1.5;}
.aof-ok{background:var(--verde-tint); border:1px solid rgba(26,92,56,.22); color:var(--verde-d);
  font-size:13.5px; padding:13px 15px; border-radius:14px; margin:10px 0; line-height:1.5;}

/* big nums (resultado) */
.aof-bignums{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
@media(max-width:520px){ .aof-bignums{grid-template-columns:1fr;} }
.aof-bignum{background:var(--verde-tint); border:none; border-radius:18px; padding:20px; display:flex; flex-direction:column; gap:5px;}
.aof-bignum.gold{background:var(--dorado-tint);}
.aof-lbl{font-size:12px; font-weight:700; color:var(--verde-d); text-transform:uppercase; letter-spacing:.4px;}
.aof-bignum.gold .aof-lbl{color:var(--dorado-d);}
.aof-bignum strong{font-weight:800; font-size:32px; font-variant-numeric:tabular-nums; line-height:1.05; letter-spacing:-.03em;}
.aof-bignum strong em{font-style:normal; font-size:14px; font-weight:600; color:var(--gris);}
.aof-bignum small{font-size:12.5px; color:var(--gris);}

/* veredicto */
.aof-verdict{border-radius:16px; padding:16px 18px; font-size:15px; line-height:1.5; margin-top:18px; font-weight:600; letter-spacing:-.01em;}
.aof-verdict.warn{background:var(--dorado-tint); border:1px solid rgba(184,147,90,.3); color:var(--dorado-d);}
.aof-verdict.ok{background:var(--verde-tint); border:1px solid rgba(26,92,56,.22); color:var(--verde-d);}

/* tablas de resultado */
.aof-result{border:1px solid var(--linea); border-radius:16px; overflow:hidden; margin:10px 0 4px;}
.aof-result-row{display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px; font-size:14.5px; border-bottom:1px solid var(--linea);}
.aof-result-row:last-child{border-bottom:none;}
.aof-result-row span{color:var(--gris);}
.aof-result-row b{font-variant-numeric:tabular-nums; font-weight:700;}
.aof-result-row.total{background:var(--verde-tint);}
.aof-result-row.total b{color:var(--verde-d); font-size:17px;}
.aof-result-row.total.gold{background:var(--dorado-tint);}
.aof-result-row.total.gold b{color:var(--dorado-d);}

/* recap card (paso resultado) */
.aof-recap{font-size:14px; color:var(--gris); background:#f5f5f7; padding:14px 16px; border-radius:14px; margin:16px 0 0; line-height:1.5;}
.aof-recap b{color:var(--tinta);}
.aof-recap-card{background:linear-gradient(140deg,var(--verde),var(--verde-d)); border:none; box-shadow:0 12px 40px rgba(15,63,38,.28);}
.aof-eyebrow2{font-size:12px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:rgba(255,255,255,.7); display:block; margin-bottom:10px;}
.aof-recap-line{font-size:19px; line-height:1.45; color:#fff; margin:0; font-weight:500; letter-spacing:-.01em;}
.aof-recap-line b{color:#fff; font-weight:800;}

/* desplegables */
.aof-coll{border:1px solid var(--linea); border-radius:16px; background:#fff; overflow:hidden; margin:12px 0 0;}
.aof-coll-sum{list-style:none; cursor:pointer; padding:15px 18px; font-size:14.5px; font-weight:600; color:var(--tinta); display:flex; align-items:center; gap:11px; user-select:none; letter-spacing:-.01em;}
.aof-coll-sum::-webkit-details-marker{display:none;}
.aof-coll-sum::before{content:'+'; font-size:18px; line-height:1; color:var(--verde); font-weight:600; width:16px; text-align:center; flex:none; transition:transform .2s;}
.aof-coll[open] .aof-coll-sum::before{content:'−';}
.aof-coll-sum:hover{background:#fafafa;}
.aof-coll-body{padding:2px 18px 16px 45px; font-size:14px; color:var(--gris); line-height:1.6;}
.aof-coll-body p{margin:0 0 10px;}
.aof-coll-body p:last-child{margin-bottom:0;}
.aof-coll-body b{color:var(--tinta);}
.aof-collcard{background:#fff; border:none; border-radius:22px; margin:0; box-shadow:0 1px 2px rgba(0,0,0,.04), 0 12px 40px rgba(0,0,0,.05);}
.aof-collcard-sum{padding:24px 28px; font-size:18px; color:var(--tinta); font-weight:700; letter-spacing:-.02em;}
.aof-collcard-sum::before{font-size:20px;}
.aof-collcard-sum:hover{background:#fafafa;}
.aof-collcard-body{padding:6px 28px 26px;}
.aof-optlabel{font-size:11px; font-weight:600; color:var(--gris2); background:#f0f0f3; padding:4px 11px; border-radius:20px; letter-spacing:.3px; text-transform:uppercase; margin-left:auto;}

/* sub-conceptos (PH / uso) */
.aof-conchead2{display:flex; align-items:center; gap:12px; padding:15px 0; cursor:pointer; font-weight:600; font-size:15px; color:var(--tinta); border-top:1px solid var(--linea); letter-spacing:-.01em;}
.aof-conchead2:first-child{border-top:none;}
.aof-conchead2 input{accent-color:var(--verde); width:18px; height:18px; flex:none;}
.aof-conchead2 span{flex:1;}
.aof-conchead2 b{font-variant-numeric:tabular-nums; color:var(--verde-d); font-weight:700;}
.aof-sub{padding:4px 0 14px;}

/* total card */
.aof-total-card{display:flex; justify-content:space-between; align-items:center; gap:14px; background:linear-gradient(140deg,var(--verde),var(--verde-d)); border:none; box-shadow:0 12px 40px rgba(15,63,38,.26); padding:24px 28px;}
.aof-total-card span{font-weight:700; font-size:16px; color:rgba(255,255,255,.82); letter-spacing:-.01em;}
.aof-total-card b{font-weight:800; font-size:30px; font-variant-numeric:tabular-nums; color:#fff; letter-spacing:-.02em;}

/* formula / link */
.aof-formula{font-size:13.5px; color:var(--verde-d); background:var(--verde-tint); padding:13px 15px; border-radius:14px; line-height:1.6; margin:0 0 16px; border:none;}
.aof-link{background:none; border:none; color:var(--verde); font-size:13.5px; cursor:pointer; padding:0; margin:-2px 0 14px; text-align:left; text-decoration:none; font-weight:600;}
.aof-link:hover{text-decoration:underline;}
.aof-fxf{margin:-2px 0 14px;}

/* segmentado / tabs (Apple style) */
.aof-seg{display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px;}
.aof-segbtn{font-size:14px; font-weight:600; cursor:pointer; padding:11px 18px; border-radius:13px; border:1px solid var(--linea); background:#fff; color:var(--gris); transition:all .18s; letter-spacing:-.01em;}
.aof-segbtn:hover{border-color:var(--verde); color:var(--verde);}
.aof-segbtn.on{background:var(--verde); border-color:var(--verde); color:#fff; box-shadow:0 4px 12px rgba(26,92,56,.28);}
.aof-plusgrid{display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;}
@media(max-width:760px){ .aof-plusgrid{grid-template-columns:1fr;} }

.aof-tabs{display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;}
.aof-tab{font-size:13.5px; font-weight:600; cursor:pointer; padding:9px 16px; border-radius:100px; border:1px solid var(--linea); background:#fff; color:var(--gris); transition:all .18s; letter-spacing:-.01em;}
.aof-tab:hover{border-color:var(--verde); color:var(--verde);}
.aof-tab.on{background:var(--verde); border-color:var(--verde); color:#fff; box-shadow:0 4px 12px rgba(26,92,56,.28);}
.aof-doclist{margin:0; padding:0; list-style:none; display:grid; gap:10px; grid-template-columns:1fr 1fr;}
@media(max-width:680px){ .aof-doclist{grid-template-columns:1fr;} }
.aof-doclist li{position:relative; padding:14px 14px 14px 42px; background:#f5f5f7; border-radius:14px; font-size:14px; line-height:1.5;}
.aof-doclist li::before{content:'✓'; position:absolute; left:15px; top:14px; color:var(--verde); font-weight:800; font-size:14px;}

/* botones nav */
.aof-nav{display:flex; gap:12px; align-items:center; margin-top:10px;}
.aof-btn{font-weight:600; font-size:16px; padding:14px 26px; border-radius:100px; border:1px solid var(--linea); background:#fff; color:var(--tinta); cursor:pointer; transition:all .18s; letter-spacing:-.01em;}
.aof-btn:hover{background:#f5f5f7;}
.aof-btn-primary{background:var(--verde); border-color:var(--verde); color:#fff; margin-left:auto; box-shadow:0 6px 18px rgba(26,92,56,.3);}
.aof-btn-primary:hover{background:var(--verde-d); border-color:var(--verde-d);}

/* notas varias */
.aof-nota{font-size:13px; color:var(--dorado-d); background:var(--dorado-tint); padding:12px 14px; border-radius:14px; margin:12px 0 0; line-height:1.5;}
.aof-disc{font-size:13px; color:var(--dorado-d); background:var(--dorado-tint); padding:14px 16px; border-radius:14px; margin:16px 0 0; line-height:1.6;}
.aof-disc u{text-decoration:none; font-weight:700;}
.aof-mins{font-size:13.5px; color:var(--gris); margin:14px 0 0; line-height:1.6;}
.aof-mins b{color:var(--tinta); font-variant-numeric:tabular-nums;}
.aof-defs{margin-top:16px; border-top:1px solid var(--linea); padding-top:14px; display:grid; gap:9px;}
.aof-defs p{margin:0; font-size:13.5px; color:var(--gris); line-height:1.5;}
.aof-defs b{color:var(--tinta);}
.aof-mini{margin-top:16px; background:#f5f5f7; border-radius:16px; padding:14px 16px;}
.aof-mini h3{font-size:14px; font-weight:700; margin:0 0 6px; color:var(--tinta);}
.aof-mini p{margin:0; font-size:13.5px; color:var(--gris); line-height:1.5;}

/* footer del componente */
.aof-foot{max-width:760px; margin:24px auto 0; padding:0 20px; font-size:12.5px; color:var(--gris2); line-height:1.6; text-align:center;}
`;

// HTML autocontenido de las calculadoras de comisiones (diseño + lógica de
// David, 1:1). Se montan dentro de un <iframe srcDoc> en ComisionesCalculadoras
// para aislar su CSS global (`*{}`, `body{}`) y su <script> del resto del panel.
//
// Para editar una calculadora: reemplazá el string correspondiente por el HTML
// nuevo. No hace falta tocar el componente.

export const VENTAS_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Calculadora de comisiones — SI INMOBILIARIA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Raleway:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--verde:#1A5C38;--verde2:#00754A;--azul:#3C72D4;--coral:#DD7349;--violeta:#7460D4;
    --gris:#9a9488;--tinta:#1c1c1e;--line:#ececec;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Raleway',-apple-system,sans-serif;color:var(--tinta);background:#ffffff;padding:26px 14px;line-height:1.4;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:760px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.06);padding:28px 28px 26px;}
  .num{font-family:'Poppins',sans-serif;font-variant-numeric:tabular-nums;}
  .head{text-align:center;margin-bottom:22px;}
  .head .eyebrow{font-family:'Poppins',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--azul);font-weight:600;}
  .head h1{font-family:'Poppins',sans-serif;font-size:24px;color:var(--verde);font-weight:800;line-height:1.1;margin-top:5px;}
  .head p{font-size:12.5px;color:#6b6b6b;margin-top:5px;}

  .price-line{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--line);padding-bottom:8px;margin-bottom:18px;}
  .price-line .plab{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8478;font-weight:600;white-space:nowrap;}
  .price-line .pcur{font-family:'Poppins',sans-serif;font-weight:600;color:#bbb;font-size:15px;}
  .price-line input{flex:1;min-width:0;font-family:'Poppins',sans-serif;font-size:23px;font-weight:700;color:var(--tinta);border:none;outline:none;background:transparent;}

  .qlabel{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8478;font-weight:700;margin:16px 0 8px;}
  .modes{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;}
  .mode{border:2px solid var(--line);background:#fff;border-radius:12px;padding:13px 10px;cursor:pointer;text-align:center;transition:.15s;}
  .mode .ic{font-size:24px;line-height:1;}
  .mode .t{font-family:'Poppins',sans-serif;font-size:12.5px;font-weight:600;margin-top:6px;}
  .mode .s{font-size:10.5px;color:#999;margin-top:2px;}
  .mode.on{border-color:var(--verde);background:#f3f9f5;box-shadow:0 2px 10px rgba(14,90,60,.10);}
  .mode.on .t{color:var(--verde);}
  .modes3{grid-template-columns:repeat(3,1fr);}
  .chk#chkOtra.on{border-color:var(--gris);background:#f6f5f3;}
  .chk#chkOtra.on .box{background:var(--gris);border-color:var(--gris);}

  .extras{display:flex;gap:9px;margin-top:10px;flex-wrap:wrap;}
  .chk{flex:1;min-width:200px;border:2px solid var(--line);background:#fff;border-radius:12px;padding:11px 13px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.15s;}
  .chk .ic{font-size:20px;}
  .chk .tx{flex:1;}
  .chk .tx b{font-family:'Poppins',sans-serif;font-size:12.5px;font-weight:600;display:block;}
  .chk .tx span{font-size:10.5px;color:#999;}
  .chk .box{width:22px;height:22px;border-radius:6px;border:2px solid #ccc4b4;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;}
  .chk#chkRef.on{border-color:var(--coral);background:#fdf2ec;}
  .chk#chkRef.on .box{background:var(--coral);border-color:var(--coral);}
  .chk#chkCol.on{border-color:var(--violeta);background:#f4f1fb;}
  .chk#chkCol.on .box{background:var(--violeta);border-color:var(--violeta);}

  .puntas{display:flex;align-items:stretch;gap:10px;margin:20px 0 6px;}
  .punta{flex:1;background:#fff;border:1px solid var(--line);border-radius:14px;padding:15px 12px;text-align:center;transition:.2s;}
  .punta.off{opacity:.3;filter:grayscale(.6);}
  .punta .ic{font-size:40px;line-height:1;}
  .punta .who{font-family:'Poppins',sans-serif;font-size:12.5px;font-weight:600;margin-top:6px;}
  .punta .desc{font-size:10.5px;color:#999;margin-top:2px;min-height:26px;}
  .punta .pays{margin-top:8px;font-family:'Poppins',sans-serif;font-weight:700;color:var(--verde);font-size:15px;}
  .punta .paysl{font-size:9.5px;color:#aaa;text-transform:uppercase;letter-spacing:.5px;}
  .plus{display:flex;align-items:center;font-family:'Poppins',sans-serif;font-size:24px;color:var(--azul);font-weight:700;}

  .arrow{text-align:center;font-size:20px;color:#d8d3ca;margin:2px 0;}
  .pozo{background:var(--azul);color:#fff;border-radius:12px;padding:13px;text-align:center;margin-bottom:4px;}
  .pozo .l{font-size:10.5px;text-transform:uppercase;letter-spacing:1px;opacity:.9;}
  .pozo .v{font-family:'Poppins',sans-serif;font-size:26px;font-weight:800;}

  .qlabel2{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8478;font-weight:700;margin:18px 0 10px;text-align:center;}
  .cascada{display:flex;flex-direction:column;gap:8px;}
  .ben{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;border-left:5px solid var(--gris);animation:pop .35s ease;}
  @keyframes pop{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
  .ben .ic{font-size:26px;width:34px;text-align:center;flex-shrink:0;}
  .ben .info{flex:1;min-width:0;}
  .ben .info b{font-family:'Poppins',sans-serif;font-size:13.5px;display:block;}
  .ben .info span{font-size:10.5px;color:#8a8478;}
  .ben .bar{height:7px;border-radius:4px;background:#f0f0f0;margin-top:6px;overflow:hidden;}
  .ben .bar i{display:block;height:100%;border-radius:4px;width:0;transition:width .6s cubic-bezier(.22,1,.36,1);}
  .ben .amt{font-family:'Poppins',sans-serif;font-weight:800;font-size:18px;text-align:right;flex-shrink:0;min-width:92px;}
  .ben .amt small{display:block;font-size:10px;font-weight:600;color:#aaa;}

  .narra{background:#f3f9f5;border:1px solid #d5e8dd;border-radius:12px;padding:14px 16px;margin-top:18px;font-size:13px;line-height:1.55;color:#2a4a3a;}
  .narra b{color:var(--verde);}

  .reglas{margin-top:14px;background:#fafafa;border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-size:11.5px;color:#666;line-height:1.6;}
  .reglas b{color:var(--tinta);}
  .reglas .ti{font-family:'Poppins',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--azul);font-weight:600;margin-bottom:6px;}

  .adv{margin-top:14px;}
  .adv summary{cursor:pointer;font-size:11.5px;color:#8a8478;font-weight:600;list-style:none;}
  .adv summary::-webkit-details-marker{display:none;}
  .adv summary:before{content:"\\2699 ";}
  .advgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;padding:14px;background:#fafafa;border:1px solid var(--line);border-radius:10px;}
  .advgrid .f{font-size:11px;}
  .advgrid .f label{display:block;color:#7a7468;margin-bottom:4px;font-weight:600;}
  .advgrid .f .rr{display:flex;align-items:center;gap:8px;}
  .advgrid input[type=range]{flex:1;-webkit-appearance:none;height:4px;border-radius:3px;background:#e2ddd2;}
  .advgrid input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:var(--verde);cursor:pointer;}
  .advgrid .vv{font-family:'Poppins',sans-serif;font-weight:700;color:var(--verde);min-width:42px;text-align:right;font-size:11px;}
  .advgrid .f.dim{opacity:.3;pointer-events:none;}
  @media(max-width:560px){.wrap{padding:22px 16px;}.modes{grid-template-columns:1fr;}.advgrid{grid-template-columns:1fr;}.head h1{font-size:20px;}.price-line input{font-size:20px;}.ben .amt{font-size:15px;min-width:78px;}}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <h1>Calculadora de comisiones</h1>
    <p>Movés las opciones y ves quién se lleva cuánta plata en cada venta</p>
  </div>

  <div class="price-line">
    <span class="plab">Precio de la propiedad</span><span class="pcur">USD</span><input type="text" id="precioInput" inputmode="numeric" value="150.000">
  </div>

  <div class="qlabel">1 · ¿Qué punta tenés?</div>
  <div class="modes modes3" id="modes">
    <div class="mode" data-v="vende"><div class="ic">🏠</div><div class="t">Tengo la casa</div><div class="s">la punta del vendedor</div></div>
    <div class="mode" data-v="compra"><div class="ic">💰</div><div class="t">Traigo al comprador</div><div class="s">la punta del comprador</div></div>
    <div class="mode on" data-v="dos"><div class="ic">🏠💰</div><div class="t">Las dos puntas</div><div class="s">todo mío</div></div>
  </div>

  <div class="qlabel">2 · ¿Pasó algo de esto?</div>
  <div class="extras">
    <div class="chk" id="chkOtra"><div class="ic">🤝</div><div class="tx"><b>La otra punta la tiene otra inmobiliaria</b><span>se tilda solo si tenés una sola punta</span></div><div class="box">✓</div></div>
    <div class="chk" id="chkRef"><div class="ic">📞</div><div class="tx"><b>Alguien me pasó el dato</b><span>cobra 30% sobre el 3% de su cliente</span></div><div class="box">✓</div></div>
    <div class="chk" id="chkCol"><div class="ic">👥</div><div class="tx"><b>Lo trabajé con un colega</b><span>se lleva 2% del 6% total</span></div><div class="box">✓</div></div>
  </div>

  <div class="puntas">
    <div class="punta" id="pVende"><div class="ic">🏠</div><div class="who">Cliente vendedor</div><div class="desc">Pone la casa en venta</div><div class="paysl">paga</div><div class="pays num" id="payV">USD 4.500</div></div>
    <div class="plus" id="plus">+</div>
    <div class="punta" id="pCompra"><div class="ic">💰</div><div class="who">Cliente comprador</div><div class="desc">Pone la plata y compra</div><div class="paysl">paga</div><div class="pays num" id="payC">USD 4.500</div></div>
  </div>
  <div class="arrow">↓</div>
  <div class="pozo"><div class="l">Comisión total de la venta</div><div class="v num" id="pozo">USD 9.000</div></div>

  <div class="qlabel2">así se reparte esa plata</div>
  <div class="cascada" id="cascada"></div>

  <div class="narra" id="narra"></div>

  <div class="reglas">
    <div class="ti">Cómo se calcula (las reglas)</div>
    <b>1.</b> Cada cliente paga el <b>3%</b>. Si tenés las dos puntas, son 6%.<br>
    <b>2.</b> Si alguien pasó el dato, ese referente cobra el <b>30% sobre el 3% del cliente que refirió</b> (no sobre toda la comisión). Ejemplo: en una propiedad de USD 150.000, el 3% de esa punta son USD 4.500, y el referente se lleva el 30% de eso = <b>USD 1.350</b>.<br>
    <b>3.</b> Si trabajás en conjunto con un colega, se lleva el <b>2% del 6% total</b>. Ese descuento, igual que el del referente, <b>sale del neto producido primero</b>. Recién lo que queda (el saldo) se divide <b>45% para el agente y 55% para la inmobiliaria</b>.
  </div>

  <details class="adv">
    <summary>Ajustar los porcentajes (avanzado)</summary>
    <div class="advgrid">
      <div class="f"><label>Comisión punta vendedor</label><div class="rr"><input type="range" id="aV" min="1" max="5" step="0.5" value="3"><span class="vv" id="aVv">3%</span></div></div>
      <div class="f"><label>Comisión punta comprador</label><div class="rr"><input type="range" id="aC" min="1" max="5" step="0.5" value="3"><span class="vv" id="aCv">3%</span></div></div>
      <div class="f"><label>Reparto agente / inmobiliaria</label><div class="rr"><input type="range" id="aS" min="30" max="60" step="5" value="45"><span class="vv" id="aSv">45/55</span></div></div>
      <div class="f"><label>Referencia (sobre el 3% de la punta)</label><div class="rr"><input type="range" id="aR" min="10" max="40" step="5" value="30"><span class="vv" id="aRv">30%</span></div></div>
      <div class="f"><label>Lo que se lleva el colega (del total)</label><div class="rr"><input type="range" id="aCol" min="1" max="3" step="0.5" value="2"><span class="vv" id="aColv">2%</span></div></div>
    </div>
  </details>
</div>

<script>
var S={precio:150000,modo:"dos",otra:false,ref:false,col:false,pctV:3,pctC:3,pctRef:30,pctCol:2,splitAg:45};
var $=function(id){return document.getElementById(id);};
function f(n){return "USD "+Math.round(n).toLocaleString("es-AR");}

function calc(){
  var P=S.precio, neto=0;
  if(S.modo==="vende"){neto=S.pctV/100*P;}
  else if(S.modo==="compra"){neto=S.pctC/100*P;}
  else {neto=(S.pctV+S.pctC)/100*P;}
  var otra=(S.modo!=="dos"&&S.otra)?0.03*P:0;
  var hon=neto+otra;
  var dRef=S.ref?S.pctRef/100*(S.pctV/100*P):0;
  var dCol=S.col?S.pctCol/100*P:0;
  var saldo=neto-dRef-dCol;
  var agente=S.splitAg/100*saldo;
  var inmob=saldo-agente;
  return {P:P,hon:hon,neto:neto,otra:otra,dRef:dRef,dCol:dCol,saldo:saldo,agente:agente,inmob:inmob};
}

function render(){
  var siV=(S.modo==="vende"||S.modo==="dos");   // SI tiene la punta vendedora
  var siC=(S.modo==="compra"||S.modo==="dos");   // SI tiene la punta compradora
  var otraActiva=(S.modo!=="dos"&&S.otra);
  // dibujo de las dos puntas
  function setPunta(el,owner,side){
    var ic=el.querySelector(".ic"),who=el.querySelector(".who"),desc=el.querySelector(".desc"),pay=el.querySelector(".pays");
    if(owner==="si"){
      el.classList.remove("off");
      ic.textContent= side==="V"?"🏠":"💰";
      who.textContent= side==="V"?"Cliente vendedor":"Cliente comprador";
      desc.textContent= side==="V"?"Pone la casa en venta":"Pone la plata y compra";
      pay.textContent=f(0.03*S.precio);
    } else if(owner==="otra"){
      el.classList.remove("off");
      ic.textContent="🤝";
      who.textContent="Otra inmobiliaria";
      desc.textContent="Tiene esta punta";
      pay.textContent=f(0.03*S.precio);
    } else {
      el.classList.add("off");
      ic.textContent= side==="V"?"🏠":"💰";
      who.textContent= side==="V"?"Cliente vendedor":"Cliente comprador";
      desc.textContent="—";
      pay.textContent="—";
    }
  }
  setPunta($("pVende"), siV?"si":(otraActiva?"otra":"none"), "V");
  setPunta($("pCompra"), siC?"si":(otraActiva?"otra":"none"), "C");
  $("plus").style.opacity=1;

  var r=calc();
  $("pozo").textContent=f(r.hon);
  var rows=[];
  if(r.otra>0) rows.push(["🤝","Otra inmobiliaria","cobra su punta (3%) por separado",r.otra,"var(--gris)"]);
  if(r.dRef>0) rows.push(["📞","El que pasó el dato","30% sobre el 3% de su cliente",r.dRef,"var(--coral)"]);
  if(r.dCol>0) rows.push(["👥","El colega","se lleva "+String(S.pctCol).replace(".",",")+"% del total",r.dCol,"var(--violeta)"]);
  rows.push(["🧑‍💼","El agente (vos)",S.splitAg+"% del saldo",r.agente,"var(--azul)"]);
  rows.push(["🏛️","Inmobiliaria SI",(100-S.splitAg)+"% del saldo",r.inmob,"var(--verde)"]);
  var maxv=Math.max.apply(null,rows.map(function(x){return x[3];}));
  var c=$("cascada");c.innerHTML="";
  rows.forEach(function(x){
    var pct=(x[3]/r.hon*100);
    var d=document.createElement("div");d.className="ben";d.style.borderLeftColor=x[4];
    d.innerHTML='<div class="ic">'+x[0]+'</div><div class="info"><b>'+x[1]+'</b><span>'+x[2]+'</span><div class="bar"><i data-w="'+(x[3]/maxv*100)+'" style="background:'+x[4]+'"></i></div></div><div class="amt num">'+f(x[3])+'<small>'+pct.toFixed(0)+'% del total</small></div>';
    c.appendChild(d);
  });
  setTimeout(function(){c.querySelectorAll(".bar i").forEach(function(e){e.style.width=e.getAttribute("data-w")+"%";});},60);
  var desc=[];
  if(r.dRef>0)desc.push("el que pasó el dato cobra "+f(r.dRef));
  if(r.dCol>0)desc.push("el colega se lleva "+f(r.dCol));
  var pre = desc.length? "Primero se descuentan los aportes ("+desc.join(" y ")+"). De lo que queda, " : "De ahí, ";
  var n;
  if(otraActiva){
    n="Tenés una sola punta y la otra la tiene otra inmobiliaria. La comisión total de la operación es <b>"+f(r.hon)+"</b>: la otra inmobiliaria cobra su "+f(r.otra)+" y a SI le entran <b>"+f(r.neto)+"</b>. "+pre+"la inmobiliaria se queda con <b>"+f(r.inmob)+"</b> y vos cobrás <b>"+f(r.agente)+"</b>.";
  } else {
    var puntas=S.modo==="dos"?"con las dos puntas":"con una sola punta";
    n="En una venta de <b>"+f(S.precio)+"</b> "+puntas+", la comisión para SI es <b>"+f(r.neto)+"</b>. "+pre+"la inmobiliaria se queda con <b>"+f(r.inmob)+"</b> y vos cobrás <b>"+f(r.agente)+"</b>.";
  }
  $("narra").innerHTML=n;
}

var pin=$("precioInput");
pin.addEventListener("input",function(){
  var dg=this.value.replace(/\\D/g,"");
  if(dg===""){S.precio=0;render();return;}
  var v=parseInt(dg,10); if(v>2000000)v=2000000;
  S.precio=v; this.value=v.toLocaleString("es-AR"); render();
});
function setOtraChk(){$("chkOtra").classList.toggle("on",S.modo!=="dos"&&S.otra);}
document.querySelectorAll("#modes .mode").forEach(function(m){
  m.onclick=function(){
    document.querySelectorAll("#modes .mode").forEach(function(x){x.classList.remove("on");});
    m.classList.add("on");S.modo=m.dataset.v;
    S.otra=(S.modo!=="dos"); // una sola punta -> otra inmobiliaria tildada automaticamente
    setOtraChk();render();
  };
});
$("chkOtra").onclick=function(){ if(S.modo==="dos")return; S.otra=!S.otra; setOtraChk(); render(); };
$("chkRef").onclick=function(){S.ref=!S.ref;this.classList.toggle("on",S.ref);render();};
$("chkCol").onclick=function(){S.col=!S.col;this.classList.toggle("on",S.col);render();};
function adv(id,key,fmt){$(id).oninput=function(){S[key]=+this.value;$(id+"v").textContent=fmt(this.value);render();};}
adv("aV","pctV",function(v){return v+"%";});
adv("aC","pctC",function(v){return v+"%";});
adv("aS","splitAg",function(v){return v+"/"+(100-v);});
adv("aR","pctRef",function(v){return v+"%";});
adv("aCol","pctCol",function(v){return v+"%";});
setOtraChk();render();
</script>
</body>
</html>`

export const ALQUILERES_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Calculadora de alquileres — SI INMOBILIARIA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Raleway:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--verde:#1A5C38;--verde2:#00754A;--azul:#3C72D4;--coral:#DD7349;--violeta:#7460D4;
    --gris:#9a9488;--tinta:#1c1c1e;--line:#ececec;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Raleway',-apple-system,sans-serif;color:var(--tinta);background:#ffffff;padding:26px 14px;line-height:1.4;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:760px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.06);padding:28px 28px 26px;}
  .num{font-family:'Poppins',sans-serif;font-variant-numeric:tabular-nums;}
  .head{text-align:center;margin-bottom:20px;}
  .head h1{font-family:'Poppins',sans-serif;font-size:24px;color:var(--verde);font-weight:800;line-height:1.1;}
  .head p{font-size:12.5px;color:#6b6b6b;margin-top:5px;}

  .price-line{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--line);padding-bottom:8px;margin-bottom:18px;}
  .price-line .plab{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8478;font-weight:600;white-space:nowrap;}
  .price-line .pcur{font-family:'Poppins',sans-serif;font-weight:600;color:#bbb;font-size:15px;}
  .price-line input{flex:1;min-width:0;font-family:'Poppins',sans-serif;font-size:23px;font-weight:700;color:var(--tinta);border:none;outline:none;background:transparent;}

  .qlabel{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8478;font-weight:700;margin:16px 0 8px;}
  .seg{display:flex;gap:9px;}
  .seg button{flex:1;border:2px solid var(--line);background:#fff;border-radius:12px;padding:12px 10px;cursor:pointer;font-family:'Raleway',sans-serif;transition:.15s;text-align:center;}
  .seg button b{font-family:'Poppins',sans-serif;font-size:16px;display:block;color:var(--tinta);}
  .seg button small{font-size:10px;color:#999;}
  .seg button.on{border-color:var(--verde);background:#f3f9f5;box-shadow:0 2px 10px rgba(14,90,60,.10);}
  .seg button.on b{color:var(--verde);}
  .seg.tipo button.on{border-color:var(--azul);background:#eef3fc;}
  .seg.tipo button.on b{color:var(--azul);}

  .calcrow{display:flex;align-items:center;justify-content:center;gap:10px;margin:20px 0 6px;flex-wrap:wrap;}
  .chip{background:#fafafa;border:1px solid var(--line);border-radius:12px;padding:11px 16px;text-align:center;}
  .chip .l{font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#aaa;}
  .chip .v{font-family:'Poppins',sans-serif;font-weight:700;font-size:15px;color:var(--tinta);margin-top:2px;}
  .op{font-family:'Poppins',sans-serif;font-size:18px;color:var(--gris);font-weight:700;}

  .arrow{text-align:center;font-size:20px;color:#d8d3ca;margin:2px 0;}
  .pozo{background:var(--azul);color:#fff;border-radius:12px;padding:13px;text-align:center;margin-bottom:4px;}
  .pozo .l{font-size:10.5px;text-transform:uppercase;letter-spacing:1px;opacity:.9;}
  .pozo .v{font-family:'Poppins',sans-serif;font-size:26px;font-weight:800;}
  .pozo .s{font-size:10.5px;opacity:.85;margin-top:1px;}

  .qlabel2{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8478;font-weight:700;margin:18px 0 10px;text-align:center;}
  .cascada{display:flex;flex-direction:column;gap:8px;}
  .ben{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;border-left:5px solid var(--gris);animation:pop .35s ease;}
  @keyframes pop{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
  .ben .ic{font-size:26px;width:34px;text-align:center;flex-shrink:0;}
  .ben .info{flex:1;min-width:0;}
  .ben .info b{font-family:'Poppins',sans-serif;font-size:13.5px;display:block;}
  .ben .info span{font-size:10.5px;color:#8a8478;}
  .ben .bar{height:7px;border-radius:4px;background:#f0f0f0;margin-top:6px;overflow:hidden;}
  .ben .bar i{display:block;height:100%;border-radius:4px;width:0;transition:width .6s cubic-bezier(.22,1,.36,1);}
  .ben .amt{font-family:'Poppins',sans-serif;font-weight:800;font-size:18px;text-align:right;flex-shrink:0;min-width:96px;}
  .ben .amt small{display:block;font-size:10px;font-weight:600;color:#aaa;}

  .narra{background:#f3f9f5;border:1px solid #d5e8dd;border-radius:12px;padding:14px 16px;margin-top:18px;font-size:13px;line-height:1.55;color:#2a4a3a;}
  .narra b{color:var(--verde);}

  .reglas{margin-top:14px;background:#fafafa;border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-size:11.5px;color:#666;line-height:1.6;}
  .reglas b{color:var(--tinta);}
  .reglas .ti{font-family:'Poppins',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--azul);font-weight:600;margin-bottom:6px;}
  @media(max-width:560px){.wrap{padding:22px 16px;}.head h1{font-size:20px;}.price-line input{font-size:20px;}.ben .amt{font-size:15px;min-width:84px;}}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <h1>Calculadora de alquileres</h1>
    <p>Locación permanente · honorario del 5% del contrato</p>
  </div>

  <div class="price-line">
    <span class="plab">Alquiler mensual</span><span class="pcur">$</span><input type="text" id="alqInput" inputmode="numeric" value="1.000.000">
  </div>

  <div class="qlabel">Plazo del contrato</div>
  <div class="seg" id="meses">
    <button data-m="24" class="on"><b>24</b><small>meses</small></button>
    <button data-m="36"><b>36</b><small>meses</small></button>
    <button data-m="48"><b>48</b><small>meses</small></button>
  </div>

  <div class="qlabel">¿Es nueva o renovación?</div>
  <div class="seg tipo" id="tipo">
    <button data-t="nueva" class="on"><b>Propiedad nueva</b><small>captación / ingreso nuevo</small></button>
    <button data-t="renov"><b>Renovación</b><small>hay que mostrarla de nuevo</small></button>
  </div>

  <div class="calcrow">
    <div class="chip"><div class="l">Alquiler</div><div class="v num" id="cAlq">$1.000.000</div></div>
    <div class="op">×</div>
    <div class="chip"><div class="l">Meses</div><div class="v num" id="cMes">24</div></div>
    <div class="op">=</div>
    <div class="chip"><div class="l">Total del contrato</div><div class="v num" id="cTot">$24.000.000</div></div>
  </div>
  <div class="arrow">↓</div>
  <div class="pozo"><div class="l">Honorario de SI</div><div class="v num" id="pozo">$1.200.000</div><div class="s" id="pozoS">5% del total del contrato</div></div>

  <div class="qlabel2">así se reparte el honorario</div>
  <div class="cascada" id="cascada"></div>

  <div class="narra" id="narra"></div>

  <div class="reglas">
    <div class="ti">Cómo se calcula (las reglas)</div>
    <b>1.</b> El honorario es el <b>5% del total del contrato</b> (alquiler mensual × cantidad de meses).<br>
    <b>2.</b> En una <b>propiedad nueva</b>, ese honorario se reparte: <b>40% el agente</b> que la captó, <b>10% administración</b> (mes a mes) y <b>50% la inmobiliaria</b>.<br>
    <b>3.</b> En una <b>renovación</b>, como no es captación nueva, el agente cobra <b>la mitad (20%)</b>. La administración mantiene su 10% y el resto (70%) queda para la inmobiliaria.
  </div>
</div>

<script>
var S={alquiler:1000000,meses:24,nueva:true};
var $=function(id){return document.getElementById(id);};
function f(n){return "$"+Math.round(n).toLocaleString("es-AR");}

function calc(){
  var total=S.alquiler*S.meses;
  var hon=0.05*total;
  var ag = S.nueva?0.40:0.20;
  var adm=0.10;
  var inm = S.nueva?0.50:0.70;
  return {total:total,hon:hon,agente:hon*ag,admin:hon*adm,inmob:hon*inm,agp:ag*100,inmp:inm*100};
}

function render(){
  $("cAlq").textContent=f(S.alquiler);
  $("cMes").textContent=S.meses;
  var r=calc();
  $("cTot").textContent=f(r.total);
  $("pozo").textContent=f(r.hon);
  var rows=[
    ["🧑‍💼","El agente"+(S.nueva?" (captó)":" (renovó)"),r.agp+"% del honorario",r.agente,"var(--azul)"],
    ["📋","Administración","10% · se reparte mes a mes",r.admin,"var(--violeta)"],
    ["🏛️","Inmobiliaria SI",r.inmp+"% del honorario",r.inmob,"var(--verde)"]
  ];
  var maxv=Math.max(r.agente,r.admin,r.inmob);
  var c=$("cascada");c.innerHTML="";
  rows.forEach(function(x){
    var pct=(x[3]/r.hon*100);
    var d=document.createElement("div");d.className="ben";d.style.borderLeftColor=x[4];
    d.innerHTML='<div class="ic">'+x[0]+'</div><div class="info"><b>'+x[1]+'</b><span>'+x[2]+'</span><div class="bar"><i data-w="'+(x[3]/maxv*100)+'" style="background:'+x[4]+'"></i></div></div><div class="amt num">'+f(x[3])+'<small>'+pct.toFixed(0)+'% del honorario</small></div>';
    c.appendChild(d);
  });
  setTimeout(function(){c.querySelectorAll(".bar i").forEach(function(e){e.style.width=e.getAttribute("data-w")+"%";});},60);
  var tipo = S.nueva?"una propiedad nueva":"una renovación";
  $("narra").innerHTML="En "+tipo+", un alquiler de <b>"+f(S.alquiler)+"</b> por <b>"+S.meses+" meses</b> hace un contrato de <b>"+f(r.total)+"</b>. El honorario del 5% es <b>"+f(r.hon)+"</b>: el agente cobra <b>"+f(r.agente)+"</b> ("+r.agp+"%), administración "+f(r.admin)+" y la inmobiliaria <b>"+f(r.inmob)+"</b>.";
}

var ain=$("alqInput");
ain.addEventListener("input",function(){
  var dg=this.value.replace(/\\D/g,"");
  if(dg===""){S.alquiler=0;render();return;}
  var v=parseInt(dg,10);
  S.alquiler=v; this.value=v.toLocaleString("es-AR"); render();
});
document.querySelectorAll("#meses button").forEach(function(b){
  b.onclick=function(){document.querySelectorAll("#meses button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");S.meses=parseInt(b.dataset.m,10);render();};
});
document.querySelectorAll("#tipo button").forEach(function(b){
  b.onclick=function(){document.querySelectorAll("#tipo button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");S.nueva=(b.dataset.t==="nueva");render();};
});
render();
</script>
</body>
</html>`

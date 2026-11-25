/* eslint-disable */
// @ts-nocheck
// Motor de la experiencia de Dock Garden: maqueta con pisos tocables (Torre 2),
// plano real por piso, ficha de la unidad y galeria por tipologia. Es el script
// de la pagina de prueba que aprobo David (25-nov-2026), portado tal cual; solo
// cambian las rutas, la limpieza al salir y que precio y estado de cada unidad
// llegan en vivo de Brickfy (script #dgxVivo que escribe la pagina).
export function iniciar(){

var $=function(i){return document.getElementById(i)},NS='http://www.w3.org/2000/svg';
var TEL='5493413340916';
function wa(t){return 'https://wa.me/'+TEL+'?text='+encodeURIComponent(t)}
function usd(n){return 'USD '+n.toLocaleString('es-AR')}
var quieto=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var BANDAS={"t2":{"dx":[[1984,932],[2030,838],[2673,1096],[2810,1022],[2854,1110],[2673,1208]],"3":[[1984,932],[2673,1208],[2854,1110],[2854,1170],[2673,1268],[1984,992]],"2":[[1984,992],[2673,1268],[2854,1170],[2854,1228],[2673,1326],[1984,1050]],"1":[[1984,1050],[2673,1326],[2854,1228],[2854,1284],[2673,1382],[1984,1106]],"pb":[[1984,1106],[2673,1382],[2854,1284],[2854,1339],[2673,1437],[1984,1161]]}};
var NIV=[{k:'pb',n:0,t:'Planta baja',s:'Paseo comercial'},{k:'1',n:1,t:'Piso 1'},{k:'2',n:2,t:'Piso 2'},{k:'3',n:3,t:'Piso 3'},{k:'dx',n:4,t:'Dúplex',s:'Pisos 4 y 5'}];
var TIP={'1d':'1 dormitorio','2d':'2 dormitorios','3d':'3 dormitorios',duplex:'Dúplex de 3 dormitorios'};
var P3=[[2620,186],[3210,186],[3210,796],[3336,796],[3336,1152],[3210,1152],[3210,1180],[2610,1180],[2610,890],[2720,890],[2720,448],[2620,448]];
var PC=[[1822,176],[1822,577],[1866,578],[1866,692],[2169,692],[2170,575],[2461,577],[2463,595],[2593,594],[2593,176]];
var CD='Cochera doble',DP='Departamento';
var U=[
 {id:'2-1-1',c:'01.01',p:1,t:'3d',pol:[[78,176],[78,618],[225,619],[225,1208],[864,1208],[863,908],[754,907],[756,509],[863,508],[864,176]],et:[474,466],s:[[DP,'156,70'],[CD,'26,60']],tot:'183,30',$:340000,pref:1,e:'d',f:7268088},
 {id:'2-1-4',c:'01.04',p:1,t:'3d',pol:P3,et:[2976,919],s:[[DP,'156,70'],[CD,'23,30']],tot:'180,00',$:365000,e:'d',f:900000589},
 {id:'2-1-6',c:'01.06',p:1,t:'1d',pol:[[1582,695],[1278,694],[1277,812],[1257,812],[1256,809],[987,809],[986,791],[856,791],[856,1211],[1625,1211],[1625,809],[1582,808]],et:[1240,1010],s:[[DP,'80,10'],['Cochera','13,80']],tot:'93,90',$:178000,e:'v'},
 {id:'2-2-3',c:'02.03',p:2,t:'2d',pol:PC,et:[2200,396],s:[[DP,'81,80'],['Cochera','13,80']],tot:'95,60',$:206000,e:'d',f:7407995},
 {id:'2-3-3',c:'03.03',p:3,t:'1d',pol:PC,et:[2200,396],s:[[DP,'80,10'],['Cochera','13,80']],tot:'93,90',$:197200,e:'d',f:900000591},
 {id:'2-3-4',c:'03.04',p:3,t:'3d',pol:P3,et:[2976,919],s:[[DP,'156,70'],[CD,'26,10']],tot:'182,80',$:397000,e:'d',f:900000590},
 {id:'2-4-1',c:'04.01',p:4,t:'duplex',pol:[[230,683],[230,1199],[1731,1199],[1731,798],[1724,797],[1724,683],[1286,683],[1285,798],[763,798],[762,683]],et:[980,990],s:[[DP,'127,20'],['Terrazas y balcón','92,60'],[CD,'26,10']],tot:'245,90',$:410000,e:'d',f:900000592},
 {id:'2-4-3',c:'04.03',p:4,t:'duplex',pol:[[1732,165],[1732,567],[1738,568],[1739,682],[2177,682],[2178,567],[2700,567],[2701,682],[3233,681],[3232,165]],et:[2480,400],s:[[DP,'127,20'],['Terrazas y balcón','92,60'],[CD,'26,10']],tot:'245,90',$:375000,pref:1,e:'d',f:7268078}
];
var vivo=null;try{vivo=JSON.parse(($('dgxVivo')||{}).textContent||'null')}catch(_){}
if(vivo){U.forEach(function(u){var v=vivo[u.id];if(!v){u.e='v';return}u.$=v.p;u.pref=v.pref?1:0;u.e=v.e})}
var TOURS={'1d':[['h83cT','Estar-comedor','1d-estar'],['h83cx','Dormitorio','1d-dormitorio']],'3d':[['h83XP','Estar-comedor','3d-estar'],['h83XG','Dormitorio','3d-dormitorio']],duplex:[['h83FW','Estar-comedor','duplex-estar'],['h83Fz','Dormitorio','duplex-dormitorio'],['h839P','Terraza con parrillero','duplex-terraza']]};
function urlTour(id){return 'https://kuula.co/share/'+id+'?logo=1&info=1&fs=1&vr=0&thumbs=1'}
var GAL={'1d':[['1d-living','Estar-comedor'],['1d-cocina','Cocina'],['1d-dormitorio','Dormitorio']],'3d':[['3d-punta-living','Estar'],['3d-punta-living-2','Estar al balcón'],['3d-punta-comedor','Comedor'],['3d-punta-cocina','Cocina'],['3d-punta-dormitorio','Dormitorio']],duplex:[['duplex-comedor','Estar-comedor'],['duplex-dormitorio','Dormitorio'],['duplex-terraza','Terraza con parrillero']],'2d':[['2-dormitorios','Plano de 2 dormitorios']]};

var torre=2,piso=-1,uSel=null,tocado=false;
var msgBase='Hola, estoy viendo Dock Garden y quiero consultar.';
function ponerWa(t){$('fija').href=wa(t);$('uWa').href=wa(t)}
ponerWa(msgBase);$('cierreWa').href=wa(msgBase);

/* maqueta: franjas por piso en las cuatro torres */
var g=$('bandas');g.innerHTML='';$('pisos').innerHTML='';$('tabs').innerHTML='';
Object.keys(BANDAS).forEach(function(tk){var tn=+tk.slice(1);NIV.forEach(function(nv){
  var e=document.createElementNS(NS,'polygon');e.setAttribute('class','f');e.setAttribute('points',BANDAS[tk][nv.k].map(function(q){return q.join(',')}).join(' '));
  e.dataset.t=tn;e.dataset.n=nv.n;e.addEventListener('click',function(){tocado=true;elegir(tn,nv.n,true)});g.appendChild(e)})});
var TN={},gt=$('torresN');
Object.keys(TN).forEach(function(k){var t=document.createElementNS(NS,'text');t.setAttribute('class','torre-n');t.setAttribute('x',TN[k][0]);t.setAttribute('y',TN[k][1]);t.setAttribute('text-anchor','middle');t.textContent='TORRE '+k;gt.appendChild(t)});
function luz(t,n,cls){[].forEach.call(g.children,function(e){e.classList.toggle(cls,+e.dataset.t===t&&+e.dataset.n===n)})}

/* en el celu, la maqueta se acerca a los edificios */
var mq=window.matchMedia('(max-width:640px)');
function encuadre(){var c=mq.matches;$('axo').setAttribute('viewBox',c?'300 560 3060 1460':'0 -300 3840 2700');$('rot').style.display=c?'none':''}
encuadre();if(mq.addEventListener)mq.addEventListener('change',encuadre);

/* botones de piso */
var disp=function(n){return U.filter(function(u){return u.p===n&&u.e==='d'}).length};
NIV.forEach(function(nv){var b=document.createElement('button');b.type='button';b.dataset.n=nv.n;b.setAttribute('aria-pressed','false');
  var d=nv.n===0?(nv.s):(disp(nv.n)?disp(nv.n)+(disp(nv.n)>1?' en venta':' en venta'):'Sin unidades en venta');
  b.innerHTML='<b>'+nv.t+'</b><small>'+(nv.n===0?'Locales':d)+'</small>';
  b.addEventListener('click',function(){tocado=true;elegir(2,nv.n,false)});$('pisos').appendChild(b)});

/* invitación: los pisos de la Torre 2 se iluminan solos hasta que tocan uno */
var paso=0;
function recorre(){if(tocado||quieto)return;luz(2,paso%5,'luz');paso++;setTimeout(function(){if(tocado)return;if(paso%5===0){luz(-1,-1,'luz');setTimeout(recorre,900)}else recorre()},650)}
if('IntersectionObserver' in window){var ob=new IntersectionObserver(function(en){if(en[0].isIntersecting){ob.disconnect();recorre()}},{threshold:.4});ob.observe($('axo'))}else recorre();

function elegir(t,n,desdeMaqueta){
  torre=t;piso=n;luz(-1,-1,'luz');luz(t,n,'on');
  [].forEach.call($('pisos').children,function(b){b.setAttribute('aria-pressed',String(t===2&&+b.dataset.n===n))});
  var nv=NIV[n],nombre='Torre '+t+' · '+nv.t+(n===4?' (pisos 4 y 5)':'');
  $('axoEt').hidden=true;
  if(t!==2){mostrarCartel(nombre,'Hoy las unidades en venta están en la Torre 2. Por la Torre '+t+' consultanos y te contamos qué hay.','Hola, estoy viendo Dock Garden. Quiero consultar por la Torre '+t+', '+nv.t.toLowerCase()+'.');return}
  if(n===0){mostrarCartel('Planta baja: paseo comercial y cocheras','Locales a la calle sobre La República, frente al arroyo. Detrás, las cocheras de los departamentos.','Hola, estoy viendo Dock Garden y quiero consultar por los locales del paseo comercial.');return}
  if(!disp(n)&&!U.some(function(u){return u.p===n})){mostrarCartel(nombre,'En este piso no quedan unidades a la venta.',msgBase);return}
  $('cartel').hidden=true;$('zonaPlanta').hidden=false;
  $('pTit').textContent=nombre;$('plImg').setAttribute('href','/images/dockgarden/x/torre2-piso-'+n+'.webp');
  dibujarPlanta(n);
  var lista=U.filter(function(u){return u.p===n}),prim=lista.filter(function(u){return u.e==='d'})[0]||lista[0];
  verUnidad(prim,false);
  if(desdeMaqueta||true){setTimeout(function(){$('pisos').scrollIntoView({behavior:quieto?'auto':'smooth',block:'start'})},60)}
}
function mostrarCartel(t,x,m){$('cFoto').hidden=!/^Planta baja/.test(t);$('zonaPlanta').hidden=true;$('cartel').hidden=false;$('cTit').textContent=t;$('cTxt').textContent=x;$('cWa').href=wa(m);ponerWa(m)}

function dibujarPlanta(n){
  var gp=$('plU');gp.innerHTML='';var ch=$('chips');ch.innerHTML='';
  U.filter(function(u){return u.p===n}).forEach(function(u){
    var e=document.createElementNS(NS,'polygon');e.setAttribute('points',u.pol.map(function(q){return q.join(',')}).join(' '));
    e.setAttribute('class','u '+(u.e==='d'?'disp':'vend'));e.dataset.id=u.id;e.addEventListener('click',function(){verUnidad(u,true)});gp.appendChild(e);
    var t=document.createElementNS(NS,'text');t.setAttribute('x',u.et[0]);t.setAttribute('y',u.et[1]);t.setAttribute('text-anchor','middle');t.dataset.id=u.id;t.textContent=u.c;gp.appendChild(t);
    var b=document.createElement('button');b.type='button';b.dataset.id=u.id;b.setAttribute('aria-pressed','false');
    b.innerHTML='Unidad '+u.c+'<small>'+(u.e==='d'?TIP[u.t].replace('Dúplex de 3 dormitorios','Dúplex'):(u.e==='r'?'Reservada':'Vendida'))+'</small>';
    b.addEventListener('click',function(){verUnidad(u,true)});ch.appendChild(b)});
}
function verUnidad(u,toque){
  uSel=u;
  [].forEach.call($('plU').children,function(e){e.classList.toggle('on',e.dataset.id===u.id)});
  [].forEach.call($('chips').children,function(b){b.setAttribute('aria-pressed',String(b.dataset.id===u.id))});
  $('uNom').innerHTML='Unidad <span class="num">'+u.c+'</span>';
  $('uTipo').textContent=TIP[u.t]+' · Torre 2 · '+(u.p===4?'pisos 4 y 5':'piso '+u.p);
  $('uPrecio').innerHTML=u.e==='d'?'<b>'+usd(u.$)+'</b>'+(u.pref?'<span>Valor preferencial SI</span>':''):'<span class="gris">'+(u.e==='r'?'Reservada':'Vendida')+'</span>';
  $('uDatos').innerHTML=u.s.map(function(s){return '<div><dt>'+s[0]+'</dt><dd>'+s[1]+' m²</dd></div>'}).join('')+'<div class="total"><dt>Superficie total</dt><dd>'+u.tot+' m²</dd></div>';
  var tr=TOURS[u.t]||[];$('uTours').innerHTML=tr.map(function(r){return '<a href="'+urlTour(r[0])+'" target="_blank" rel="noopener"><img src="/images/dockgarden/x/360-'+r[2]+'.webp" alt="">360° '+r[1]+'</a>'}).join('');
  $('uLam').src='/images/dockgarden/x/lam-'+u.id+'.webp';$('uLam').alt='Lámina de VERS de la unidad '+u.c+' con su plano y ubicación';
  $('uFicha').hidden=!u.f;if(u.f)$('uFicha').href='/propiedades/'+u.f;
  var m=u.e==='d'?'Hola, estoy viendo Dock Garden y me interesa la unidad '+u.c+' ('+TIP[u.t]+', Torre 2).':'Hola, estoy viendo Dock Garden. Vi que la '+u.c+' ya no está disponible, ¿hay algo parecido?';
  ponerWa(m);
  if(GAL[u.t])tipologia(u.t==='2d'?'1d':u.t);
  var sc=document.querySelector('.planta-scroll');if(sc.scrollWidth>sc.clientWidth){var cx=(u.et[0]-30)/3380*sc.scrollWidth;sc.scrollTo({left:Math.max(0,cx-sc.clientWidth/2),behavior:toque&&!quieto?'smooth':'auto'})}
  if(toque&&window.innerWidth<900)setTimeout(function(){$('unidad').scrollIntoView({behavior:quieto?'auto':'smooth',block:'start'})},60);
}
$('agrandar').addEventListener('click',function(){$('vImg').src=$('uLam').src;$('visor').hidden=false});
$('vCerrar').addEventListener('click',function(){$('visor').hidden=true});
$('visor').addEventListener('click',function(e){if(e.target===this)this.hidden=true});
var alEsc=function(e){if(e.key==='Escape'){var v=$('visor');if(v)v.hidden=true}};document.addEventListener('keydown',alEsc);

/* adentro */
var TABS=[['1d','1 dormitorio'],['3d','3 dormitorios'],['duplex','Dúplex']];
TABS.forEach(function(t){var b=document.createElement('button');b.type='button';b.dataset.t=t[0];b.textContent=t[1];b.addEventListener('click',function(){tipologia(t[0])});$('tabs').appendChild(b)});
function tipologia(t){
  [].forEach.call($('tabs').children,function(b){b.setAttribute('aria-pressed',String(b.dataset.t===t))});
  var L=GAL[t];$('gMini').innerHTML='';
  L.forEach(function(f,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label',f[1]);b.setAttribute('aria-pressed',String(i===0));b.innerHTML='<img src="/images/dockgarden/x/'+f[0]+'-900.webp" alt="" loading="lazy">';
    b.addEventListener('click',function(){foto(f);[].forEach.call($('gMini').children,function(x){x.setAttribute('aria-pressed',String(x===b))})});$('gMini').appendChild(b)});
  foto(L[0]);
  $('gTours').innerHTML=(TOURS[t]||[]).map(function(r){return '<a href="'+urlTour(r[0])+'" target="_blank" rel="noopener"><img src="/images/dockgarden/x/360-'+r[2]+'.webp" alt=""><span><b>Recorrer en 360°</b><small>'+r[1]+'</small></span></a>'}).join('');
}
function foto(f){$('gImg').src='/images/dockgarden/x/'+f[0]+'-900.webp';$('gImg').alt=f[1]}
tipologia('1d');
return function(){tocado=true;document.removeEventListener('keydown',alEsc);if(mq.removeEventListener)mq.removeEventListener('change',encuadre)};
}

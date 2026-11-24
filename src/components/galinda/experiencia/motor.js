/* eslint-disable */
// @ts-nocheck
// Motor de la experiencia de Galinda!: explorador por pisos, plano tocable de
// locales, modelo 3D por unidad (three.js r128, se baja recien cuando hace
// falta), plano en grande con lupa. Es el script de la pagina de prueba que
// aprobo David (22-nov-2026), portado tal cual; solo cambian las rutas, la
// limpieza al salir de la pagina y que los datos viven en ./datos.
import { U } from './datos'
import { GAL_WA_PHONE } from '@/lib/galinda'

var B='/emprendimientos/galinda/x/';
var THREE_URL='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

/** Arranca la experiencia sobre el HTML ya dibujado. Devuelve la limpieza. */
export function iniciar(){
  var ac=new AbortController(),sg=ac.signal,muerto=false,obs=[];
  ['pisos','zonas','amTabs','axoB','amb','marcas','selector'].forEach(function(k){var e=document.getElementById(k);if(e)e.innerHTML=''});
  var WA=GAL_WA_PHONE;
  function wa(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)}
  function $(id){return document.getElementById(id)}
  var quieto=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- portada ---------- */
  var vp=$('vPort'),otra=$('otraVez'),chico=window.matchMedia&&matchMedia('(max-width: 640px)').matches;
  
  // El video arranca despues de la foto: recien con la pagina cargada, y no se
  // baja si el celular pide ahorrar datos o la conexion es lenta.
  var red=navigator.connection||{},lenta=red.saveData||/(^|-)2g|3g/.test(red.effectiveType||'');
  vp.addEventListener('playing',function(){vp.classList.add('va')},{signal:sg});
  function arrancaVideo(){if(muerto)return;vp.src=chico?B+'clip/portada-m.mp4':B+'clip/portada.mp4';var pp=vp.play();if(pp&&pp.catch)pp.catch(function(){otra.hidden=false;otra.textContent='Ver el video'})}
  if(!quieto){
    if(lenta){otra.hidden=false;otra.addEventListener('click',function(){if(!vp.getAttribute('src'))vp.src=chico?B+'clip/portada-m.mp4':B+'clip/portada.mp4'},{once:true,signal:sg})}
    else if(document.readyState==='complete')setTimeout(arrancaVideo,300);else window.addEventListener('load',function(){setTimeout(arrancaVideo,300)},{once:true,signal:sg});
    
    otra.addEventListener('click',function(){otra.hidden=true;vp.currentTime=0;var q=vp.play();if(q&&q.catch)q.catch(function(){})});
  }
  function baja(id){var e=$(id);if(e)e.scrollIntoView({behavior:quieto?'auto':'smooth',block:'start'})}
  $('irUnidades').addEventListener('click',function(){baja('explorar')});
  var fija=$('fijaWa');fija.href=wa('Hola, estoy viendo Galinda! y quiero consultar.');
  function barra(){var c=$('cWa'),abajo=c&&c.getBoundingClientRect().top<window.innerHeight;fija.classList.toggle('ver',window.scrollY>window.innerHeight*0.6&&!abajo)}
  window.addEventListener('scroll',barra,{passive:true,signal:sg});barra();

  /* ---------- conjunto ---------- */
  var Z={
    oficinas:{t:'Oficinas',img:B+'img/of-oficina.webp',alt:'Interior de una oficina de Galinda',p:['Edificio propio, sobre el ingreso del lado de la autopista.','<strong>Entrega estimada: enero de 2027.</strong>','Queda una sola oficina disponible: la 03-02, de <span class="num">51 m²</span>, con orientación norte.']},
    viviendas:{t:'Viviendas',img:B+'img/sr2-living-balcon.webp',alt:'Living con salida al balcón en el showroom',p:['Departamentos de 2 y 3 dormitorios, de <span class="num">107</span> a <span class="num">140 m²</span>, todos con balcón.','<strong>Entrega estimada: marzo-abril de 2027.</strong>','Más abajo las ves piso por piso, cada una con su planta.']},
    parque:{t:'Parque de las viviendas',img:B+'img/sr2-balcon.webp',alt:'Vista al parque desde un balcón',p:['Detrás de los edificios, de uso de quienes viven en Galinda. El proyecto de Fundar incluye piscina y solárium.','Los balcones del contrafrente miran a este verde.']},
    locales:{t:'Locales',img:B+'img/obra2-paseo.webp',alt:'Paseo de locales en planta baja',p:['Paseo comercial en planta baja, sobre Av. Galindo.','La disponibilidad se consulta por WhatsApp.']}
  };
  var zonas=$('zonas'),zona=$('zona'),pins=[].slice.call(document.querySelectorAll('.pin'));
  Object.keys(Z).forEach(function(k,i){var b=document.createElement('button');b.type='button';b.dataset.z=k;b.innerHTML='<span class="num">'+(i+1)+'</span> · '+Z[k].t;b.addEventListener('click',function(){verZona(k)});zonas.appendChild(b)});
  pins.forEach(function(p){p.addEventListener('click',function(){verZona(p.dataset.z)})});
  function verZona(k){
    var z=Z[k];
    pins.concat([].slice.call(zonas.children)).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.z===k?'true':'false')});
    zona.innerHTML='<img src="'+z.img+'" alt="'+z.alt+'"><div><h3>'+z.t+'</h3>'+z.p.map(function(x){return '<p>'+x+'</p>'}).join('')+'</div>';
  }
  verZona('viviendas');
  function modo(hoy){
    $('mHoy').setAttribute('aria-pressed',hoy?'true':'false');$('mPro').setAttribute('aria-pressed',hoy?'false':'true');
    $('imgHoy').classList.toggle('oculta',!hoy);pins.forEach(function(p){p.hidden=!hoy});$('imgPro').classList.toggle('oculta',hoy);
    $('notaMapa').textContent=hoy?'Foto de dron del 2 de octubre de 2026.':'Render de Fundar: el conjunto terminado, visto desde Av. Galindo.';
  }
  $('mHoy').addEventListener('click',function(){modo(true)});$('mPro').addEventListener('click',function(){modo(false)});

  /* ---------- explorador por pisos ---------- */
  var PISOS=[{n:0,t:'Planta baja',d:'Paseo de locales'},{n:1,t:'Piso 1',d:'Sin unidades disponibles'},{n:2,t:'Piso 2',d:'7 viviendas'},{n:3,t:'Piso 3',d:'5 viviendas y 1 oficina'}];
  var losa='<svg viewBox="0 0 86 56" aria-hidden="true"><path class="canto" d="M3 26 L43 44 L83 26 L83 33 L43 51 L3 33 Z"/><path class="losa" d="M3 26 L43 8 L83 26 L43 44 Z"/></svg>';
  var pisos=$('pisos'),marcas=$('marcas'),sel=$('selector'),escena=$('escena'),imgU=$('imgU'),uSel=U[0],pisoSel=3,en3d=true,giro=false,visto3d=false;
  var MOD={"02-04":{"n":1283,"mpp":0.01305,"bb":[68.3,414.7,1086.3,1010.5],"rects":[[72,414,33,21],[588,414,123,30],[825,414,120,30],[1059,414,27,30],[69,417,3,6],[105,417,3,129],[108,429,3,129],[75,435,30,9],[111,438,3,129],[78,444,27,12],[588,444,24,120],[834,444,9,294],[1068,444,18,12],[114,447,3,132],[81,456,24,9],[1071,456,15,501],[117,459,3,129],[1068,459,3,231],[84,465,21,9],[120,468,3,126],[87,474,18,12],[123,480,3,114],[843,480,6,48],[90,486,15,9],[126,489,3,102],[93,495,12,9],[129,501,3,90],[96,504,9,12],[132,510,3,81],[99,516,6,9],[135,522,3,66],[102,525,3,12],[138,531,3,57],[141,540,3,24],[144,552,3,12],[603,564,9,168],[141,570,3,18],[144,582,3,6],[156,645,9,78],[147,648,9,45],[138,651,9,9],[165,654,3,99],[141,660,6,12],[168,663,3,102],[144,672,3,9],[171,675,3,99],[174,684,3,102],[150,693,6,9],[177,696,3,99],[153,702,3,9],[180,705,3,99],[183,717,3,99],[159,723,6,9],[612,723,159,9],[828,723,6,9],[186,726,3,99],[771,726,3,6],[1068,729,3,6],[162,732,3,12],[189,735,3,99],[1068,738,3,6],[192,747,3,99],[195,756,3,102],[198,768,3,99],[201,777,3,99],[204,786,3,102],[207,798,3,90],[834,798,9,9],[1068,798,3,21],[693,801,12,9],[882,801,75,6],[1017,801,51,9],[210,807,3,81],[885,807,6,150],[945,807,12,3],[693,810,9,147],[213,819,3,69],[216,831,150,9],[216,840,6,48],[357,840,9,36],[222,849,3,36],[1068,852,3,105],[225,861,3,24],[228,870,3,15],[360,876,6,3],[831,924,54,33],[891,924,54,33],[555,933,54,12],[690,933,3,15],[687,936,3,9],[243,942,6,69],[231,945,12,36],[249,945,3,66],[555,945,48,3],[702,945,129,12],[945,945,123,12],[225,948,6,12],[252,948,15,63],[555,948,45,63],[552,951,3,60],[228,960,3,9],[234,981,9,9],[237,990,6,12],[267,996,285,15],[240,1002,3,9]]},"02-07":{"n":1353,"mpp":0.01321,"bb":[70.7,444.6,1227.5,1035.2],"rects":[[105,447,21,105],[489,447,117,27],[720,447,120,27],[1083,447,141,27],[126,450,3,33],[954,462,18,12],[489,474,27,120],[735,474,9,291],[957,474,9,291],[1209,474,15,513],[102,483,3,222],[126,486,3,12],[729,510,6,48],[966,510,9,48],[99,540,3,219],[105,552,18,45],[96,591,3,225],[492,594,24,3],[105,597,6,3],[507,597,9,168],[105,600,3,51],[93,642,3,231],[90,696,3,231],[87,750,3,285],[744,753,3,12],[516,756,156,9],[732,756,3,9],[807,756,150,6],[810,762,147,3],[846,765,9,3],[84,801,3,234],[846,828,9,12],[657,831,63,9],[780,831,66,9],[855,831,66,9],[981,831,111,9],[1161,831,48,9],[720,834,3,6],[1092,834,3,6],[657,840,12,147],[849,840,6,147],[1032,840,15,111],[846,843,3,144],[81,858,3,177],[93,879,3,12],[96,882,147,9],[234,891,9,21],[78,909,3,126],[90,939,3,96],[1035,951,12,36],[855,954,54,33],[1032,954,3,33],[792,957,54,30],[654,963,3,24],[75,966,3,69],[477,966,51,12],[603,966,51,12],[669,975,123,12],[909,975,123,12],[1047,975,162,12],[477,978,39,57],[606,978,48,9],[474,981,3,54],[72,1020,3,12],[93,1026,381,9]]},"02-11":{"n":1054,"mpp":0.01301,"bb":[234.7,57.1,832.2,997.9],"rects":[[237,57,66,30],[366,57,246,27],[675,57,156,27],[234,60,3,450],[303,60,3,24],[672,60,3,24],[387,84,9,156],[462,84,141,3],[681,84,150,9],[237,87,15,426],[366,231,21,9],[252,471,45,42],[297,474,15,39],[681,486,150,27],[513,504,168,9],[300,513,12,3],[513,513,9,156],[804,513,27,90],[300,594,12,21],[288,603,12,393],[312,603,135,12],[438,615,9,54],[513,669,6,3],[804,717,27,147],[720,723,45,18],[438,726,6,144],[765,726,3,15],[444,729,3,135],[513,729,9,12],[447,732,3,9],[510,732,3,9],[522,732,198,9],[768,732,36,9],[300,738,21,117],[321,792,3,9],[435,792,3,9],[324,795,111,6],[300,855,3,3],[438,927,9,24],[438,951,6,45],[804,975,12,21],[300,978,3,18],[435,978,3,18],[801,978,3,18],[303,981,132,15],[444,981,357,15]]},"02-12":{"n":1053,"mpp":0.01301,"bb":[219.0,57.1,818.0,995.9],"rects":[[222,57,156,36],[639,57,45,27],[747,57,69,27],[219,60,3,30],[639,84,24,24],[798,84,18,3],[801,87,15,426],[642,108,21,99],[639,111,3,96],[222,195,24,177],[219,198,3,174],[246,198,3,174],[237,372,9,3],[741,471,60,42],[738,474,3,39],[222,486,24,117],[219,489,3,111],[246,489,3,108],[285,495,45,15],[282,498,3,12],[330,498,3,12],[249,504,33,9],[333,504,204,6],[342,510,54,3],[450,510,30,3],[528,510,9,3],[531,513,6,159],[741,513,9,3],[738,594,12,21],[606,603,132,12],[750,603,12,393],[606,615,9,54],[528,651,3,21],[222,714,24,147],[219,717,3,144],[246,720,3,138],[282,726,51,15],[531,726,3,15],[606,726,9,144],[528,729,3,12],[534,729,3,12],[249,732,33,9],[333,732,195,9],[537,732,9,6],[600,732,6,9],[537,738,6,3],[729,738,21,117],[615,792,114,9],[726,801,3,3],[747,855,3,3],[222,861,15,3],[609,924,3,72],[606,927,3,69],[612,927,3,39],[237,975,9,21],[234,978,3,18],[246,978,3,18],[603,978,3,18],[612,978,3,18],[747,978,3,18],[249,981,354,15],[615,981,132,15]]},"02-14":{"n":1400,"mpp":0.01342,"bb":[75.2,526.4,1325.5,1056.8],"rects":[[75,528,399,12],[546,528,330,12],[876,531,3,57],[879,534,3,54],[882,537,3,51],[75,540,18,516],[213,540,114,21],[447,540,24,33],[861,540,15,45],[885,540,3,48],[888,543,3,45],[891,546,3,42],[894,549,3,39],[897,555,3,33],[900,558,3,30],[267,561,6,120],[903,561,3,27],[906,564,3,24],[909,567,3,24],[912,570,3,24],[447,573,15,3],[915,573,3,24],[447,576,12,105],[918,576,3,24],[921,582,3,21],[864,585,12,3],[924,585,3,21],[927,588,3,24],[930,591,3,24],[933,594,3,24],[936,597,3,24],[939,600,3,24],[942,603,3,24],[945,606,3,24],[948,612,3,21],[951,615,3,90],[954,618,3,87],[957,621,3,84],[960,624,3,81],[963,627,3,78],[966,630,3,75],[969,633,3,72],[972,639,3,66],[975,642,3,63],[978,645,3,60],[981,648,3,57],[984,651,3,54],[786,654,9,51],[987,654,3,51],[990,657,3,48],[993,660,3,45],[996,663,3,42],[999,669,3,36],[93,672,51,9],[198,672,69,6],[273,672,69,6],[396,672,51,9],[1002,672,3,33],[1005,675,3,30],[201,678,66,3],[273,678,66,3],[1008,678,3,27],[306,681,9,3],[1011,681,3,24],[1014,684,3,24],[1017,687,3,24],[1020,690,3,24],[948,696,3,9],[1023,696,3,21],[795,699,153,6],[1026,699,3,24],[1029,702,3,24],[1032,705,3,24],[1035,708,3,24],[1038,711,3,24],[1041,714,3,24],[1044,717,3,24],[1047,720,3,24],[1050,726,3,24],[1053,729,3,24],[1056,732,3,24],[1059,735,3,24],[1062,738,3,24],[306,741,9,315],[1065,741,3,24],[1068,744,3,24],[315,747,6,6],[375,747,156,6],[1071,747,3,24],[315,753,3,3],[378,753,129,3],[522,753,9,303],[1074,753,3,21],[1077,756,3,24],[1080,759,3,24],[1083,762,3,24],[1086,765,3,24],[1089,768,3,24],[1092,771,3,24],[1095,774,3,24],[1098,780,3,21],[1101,783,3,21],[1104,786,3,24],[1107,789,3,24],[1110,792,3,24],[1113,795,3,24],[1116,798,3,24],[1119,801,3,24],[1122,804,3,24],[1125,810,3,21],[1128,813,3,24],[1131,816,3,24],[1134,819,3,24],[1137,822,3,24],[1140,825,3,24],[1143,828,3,24],[1146,831,3,24],[1149,837,3,21],[1152,840,3,24],[1155,843,3,24],[1158,846,3,24],[1161,849,3,24],[1164,852,3,24],[1167,855,3,24],[1170,858,3,24],[1173,861,3,24],[1176,867,3,24],[1179,870,3,24],[1182,873,3,24],[1185,876,3,24],[1188,879,3,24],[1191,882,3,39],[1194,885,3,39],[1197,888,3,39],[1200,891,3,39],[1203,897,3,36],[1206,900,3,36],[1209,903,3,36],[1188,906,3,15],[1212,906,3,36],[753,909,15,84],[1185,909,3,12],[1215,909,3,36],[768,912,3,6],[1182,912,3,9],[1218,912,3,39],[1221,915,3,39],[1224,918,3,39],[1227,924,3,36],[1230,927,3,36],[1233,930,3,36],[1236,933,3,36],[1239,936,3,36],[1242,939,3,39],[1245,942,3,39],[1248,945,3,39],[300,948,6,45],[531,948,6,45],[1251,948,3,39],[1254,954,3,36],[1257,957,3,36],[1260,960,3,36],[1263,963,3,36],[1266,966,3,39],[1269,969,3,39],[1272,972,3,39],[1275,975,3,39],[1278,981,3,36],[1281,984,3,36],[1284,987,3,36],[1287,990,3,36],[1290,993,3,36],[1293,996,3,36],[1296,999,3,39],[1299,1002,3,39],[1302,1008,3,36],[1305,1011,3,36],[1308,1014,3,36],[1311,1017,3,36],[1314,1020,3,36],[1317,1023,3,33],[1320,1026,3,30],[93,1029,6,27],[213,1029,93,27],[315,1029,9,27],[435,1029,87,27],[531,1029,111,27],[1323,1029,3,27],[99,1035,3,21],[210,1035,3,21]]},"02-15":{"n":1400,"mpp":0.01355,"bb":[75.2,524.3,1325.5,1050.7],"rects":[[534,525,330,12],[936,525,390,12],[531,531,3,54],[528,534,3,51],[525,537,3,48],[534,537,15,48],[939,537,21,36],[1080,537,114,18],[1314,537,12,513],[522,540,3,45],[519,543,3,42],[516,546,3,39],[513,549,3,36],[510,552,3,33],[507,555,3,30],[1083,555,111,3],[1134,558,9,120],[504,561,3,24],[501,564,3,24],[498,567,3,24],[495,570,3,24],[492,573,3,24],[948,573,12,102],[489,576,3,24],[486,579,3,24],[483,582,3,24],[480,585,3,24],[477,591,3,24],[474,594,3,24],[471,597,3,24],[468,600,3,24],[465,603,3,24],[462,606,3,24],[459,609,3,93],[456,612,3,90],[453,618,3,84],[450,621,3,81],[447,624,3,78],[444,627,3,75],[441,630,3,72],[438,633,3,69],[435,636,3,66],[432,639,3,63],[429,642,3,60],[426,648,3,54],[423,651,3,51],[615,651,9,51],[420,654,3,48],[417,657,3,45],[414,660,3,42],[411,663,3,39],[408,666,3,36],[405,669,3,33],[960,669,54,9],[1068,669,66,9],[1143,669,63,9],[1263,669,51,9],[402,675,3,27],[951,675,9,3],[399,678,3,24],[1092,678,9,3],[396,681,3,24],[393,684,3,24],[390,687,3,24],[387,690,3,24],[384,693,3,24],[462,693,3,9],[507,693,45,9],[381,696,3,24],[465,696,42,6],[552,696,63,6],[378,699,3,24],[375,705,3,24],[372,708,3,24],[369,711,3,24],[366,714,3,24],[363,717,3,24],[360,720,3,24],[357,723,3,24],[354,726,3,24],[351,732,3,21],[348,735,3,24],[1095,735,6,315],[345,738,3,24],[1092,738,3,312],[342,741,3,24],[879,741,78,9],[975,741,54,9],[339,744,3,24],[957,744,18,6],[1029,744,3,6],[1089,744,3,6],[336,747,3,24],[333,750,3,24],[879,750,9,261],[330,753,3,24],[327,756,3,24],[324,762,3,24],[321,765,3,24],[318,768,3,24],[315,771,3,24],[312,774,3,24],[309,777,3,24],[306,780,3,24],[303,783,3,24],[300,789,3,21],[297,792,3,24],[294,795,3,24],[291,798,3,24],[288,801,3,24],[285,804,3,24],[282,807,3,24],[279,810,3,24],[276,813,3,24],[273,819,3,21],[270,822,3,24],[267,825,3,24],[264,828,3,24],[261,831,3,24],[258,834,3,24],[255,837,3,24],[252,840,3,24],[249,846,3,21],[246,849,3,24],[243,852,3,24],[240,855,3,24],[237,858,3,24],[234,861,3,24],[231,864,3,24],[228,867,3,24],[225,870,3,24],[222,876,3,39],[219,879,3,36],[216,882,3,36],[213,885,3,36],[210,888,3,36],[207,891,3,39],[204,894,3,39],[201,897,3,39],[198,903,3,36],[225,903,3,12],[195,906,3,36],[228,906,3,9],[633,906,24,144],[192,909,3,36],[189,912,3,36],[186,915,3,36],[183,918,3,36],[180,921,3,39],[177,924,3,39],[174,930,3,36],[171,933,3,36],[168,936,3,36],[165,939,3,36],[162,942,3,36],[870,942,9,45],[1101,942,6,48],[159,945,3,36],[1107,945,3,42],[156,948,3,36],[153,951,3,39],[150,954,3,39],[147,960,3,36],[144,963,3,36],[141,966,3,36],[138,969,3,36],[135,972,3,36],[132,975,3,36],[129,978,3,36],[126,981,3,39],[123,984,3,39],[873,987,6,3],[120,990,3,36],[117,993,3,36],[114,996,3,36],[111,999,3,36],[108,1002,3,36],[105,1005,3,36],[102,1008,3,39],[99,1011,3,39],[879,1011,6,39],[96,1014,3,36],[885,1014,3,36],[93,1020,3,30],[90,1023,3,27],[657,1023,96,27],[861,1023,18,27],[888,1023,87,27],[1086,1023,6,27],[1101,1023,96,27],[1308,1023,6,27],[87,1026,3,24],[1305,1026,3,24],[84,1029,3,21],[81,1032,3,18],[78,1035,3,15],[75,1038,3,9]]},"02-27":{"n":1365,"mpp":0.01317,"bb":[74.6,450.6,1205.0,1039.1],"rects":[[726,450,477,9],[726,459,42,45],[1176,459,27,54],[75,498,561,9],[726,504,39,15],[75,507,423,3],[567,507,69,3],[714,507,12,12],[75,510,48,3],[237,510,252,3],[612,510,27,9],[75,513,15,525],[237,513,12,141],[372,513,117,15],[612,519,24,3],[612,522,21,21],[372,528,63,3],[426,531,9,126],[633,537,3,6],[612,543,15,60],[999,573,6,30],[1176,573,27,246],[1005,594,171,9],[615,603,12,48],[612,633,3,21],[249,645,51,9],[357,645,69,6],[435,645,66,9],[561,645,51,9],[360,651,66,3],[615,651,9,3],[426,717,9,12],[312,720,114,9],[435,720,36,9],[528,720,18,9],[603,720,138,9],[471,723,3,6],[312,729,9,15],[531,729,9,309],[732,729,9,309],[312,744,6,294],[318,777,3,210],[1176,882,27,156],[741,888,15,150],[1170,888,6,150],[756,891,3,147],[303,927,9,48],[525,927,6,48],[318,990,3,12],[318,1005,3,33],[90,1008,3,30],[309,1008,3,30],[540,1008,3,30],[93,1011,87,27],[294,1011,15,27],[321,1011,81,27],[516,1011,15,27],[543,1011,66,27],[723,1011,9,27]]},"03-02":{"n":1008,"mpp":0.01311,"bb":[146.7,345.0,954.4,662.5],"rects":[[156,345,654,18],[153,348,3,15],[156,585,33,75],[153,627,3,33],[852,642,3,18],[189,645,663,15],[855,645,3,15]]},"03-11":{"n":1054,"mpp":0.01302,"bb":[234.7,56.6,833.2,996.4],"rects":[[237,57,69,27],[369,57,243,27],[672,57,159,27],[366,60,3,24],[237,84,18,3],[264,84,3,3],[276,84,24,3],[387,84,12,3],[681,84,150,9],[237,87,15,426],[387,87,9,3],[390,90,6,150],[387,102,3,138],[366,231,21,9],[252,471,60,42],[684,486,147,27],[681,489,3,24],[513,504,168,6],[513,510,21,3],[543,510,18,3],[564,510,6,3],[573,510,108,3],[300,513,12,3],[513,513,9,156],[804,513,27,9],[300,594,12,21],[291,603,9,393],[312,603,135,12],[300,615,3,381],[438,615,9,54],[804,633,9,117],[813,636,18,114],[720,723,48,18],[438,726,9,144],[513,729,9,12],[447,732,6,9],[510,732,3,9],[522,732,198,9],[768,732,36,9],[303,738,18,117],[321,792,3,12],[324,795,114,6],[804,864,27,132],[438,927,9,33],[438,960,6,36],[444,978,3,18],[303,981,135,15],[447,981,357,15]]},"03-12":{"n":1053,"mpp":0.01302,"bb":[220.1,57.1,818.5,995.9],"rects":[[222,57,156,36],[639,57,48,27],[747,57,69,27],[639,84,27,15],[801,84,15,429],[642,99,21,108],[663,102,3,105],[639,111,3,57],[639,171,3,36],[222,321,27,201],[756,471,45,42],[741,474,15,39],[285,495,48,18],[249,504,36,9],[333,504,207,6],[333,510,147,3],[528,510,12,3],[531,513,9,156],[741,513,9,3],[741,594,9,21],[606,603,135,12],[750,603,12,393],[606,615,9,54],[222,636,27,114],[531,669,6,3],[285,723,48,18],[531,726,6,15],[606,726,9,144],[537,729,3,12],[249,732,36,9],[333,732,198,9],[540,732,6,9],[600,732,6,9],[732,738,18,117],[729,741,3,114],[615,792,114,9],[240,861,6,135],[222,864,18,132],[246,864,3,132],[606,927,9,69],[249,981,357,15],[615,981,135,15]]},"03-15":{"n":1400,"mpp":0.01352,"bb":[75.9,456.0,1327.5,983.7],"rects":[[537,456,324,12],[936,456,387,12],[534,459,3,57],[1323,459,3,522],[531,462,3,54],[528,465,3,51],[525,468,3,48],[537,468,15,3],[939,468,21,36],[1080,468,114,21],[1314,468,9,513],[522,471,3,45],[537,471,12,45],[519,474,3,42],[516,477,3,39],[513,480,3,36],[510,483,3,33],[507,489,3,27],[1134,489,6,120],[504,492,3,24],[501,495,3,24],[498,498,3,24],[495,501,3,24],[492,504,3,24],[948,504,12,105],[489,507,3,24],[486,510,3,24],[483,513,3,24],[480,519,3,21],[477,522,3,24],[474,525,3,24],[471,528,3,24],[468,531,3,24],[465,534,3,24],[462,537,3,24],[459,540,3,93],[456,546,3,87],[453,549,3,84],[450,552,3,81],[447,555,3,78],[444,558,3,75],[441,561,3,72],[438,564,3,69],[435,567,3,66],[432,570,3,63],[429,576,3,57],[426,579,3,54],[423,582,3,51],[615,582,9,51],[420,585,3,48],[417,588,3,45],[414,591,3,42],[411,594,3,39],[408,597,3,36],[960,600,51,9],[1068,600,66,9],[1140,600,66,9],[1263,600,51,9],[405,603,3,30],[1011,603,3,6],[1260,603,3,3],[402,606,3,27],[399,609,3,24],[1092,609,9,3],[396,612,3,24],[393,615,3,24],[390,618,3,24],[387,621,3,24],[384,624,3,24],[462,627,153,6],[381,630,3,21],[378,633,3,24],[375,636,3,24],[372,639,3,24],[369,642,3,24],[366,645,3,24],[363,648,3,24],[360,651,3,24],[357,657,3,21],[354,660,3,21],[351,663,3,24],[348,666,3,24],[345,669,3,24],[1092,669,9,312],[342,672,3,24],[339,675,3,24],[879,675,153,6],[1086,675,6,6],[336,678,3,24],[333,681,3,24],[879,681,18,3],[900,681,129,3],[1089,681,3,3],[879,684,6,297],[330,687,3,21],[327,690,3,24],[324,693,3,24],[876,693,3,39],[321,696,3,24],[318,699,3,24],[315,702,3,24],[312,705,3,24],[309,708,3,24],[306,711,3,24],[303,717,3,21],[300,720,3,24],[297,723,3,24],[294,726,3,24],[291,729,3,24],[288,732,3,24],[285,735,3,24],[282,738,3,24],[279,744,3,21],[276,747,3,21],[273,750,3,24],[270,753,3,24],[267,756,3,24],[264,759,3,24],[261,762,3,24],[876,762,3,159],[258,765,3,24],[255,768,3,24],[252,774,3,21],[249,777,3,24],[246,780,3,24],[243,783,3,24],[240,786,3,24],[237,789,3,24],[234,792,3,24],[231,795,3,24],[228,801,3,21],[225,804,3,21],[222,807,3,24],[219,810,3,39],[216,813,3,36],[213,816,3,36],[210,819,3,39],[207,822,3,39],[204,825,3,39],[201,831,3,36],[198,834,3,36],[222,834,3,15],[195,837,3,36],[225,837,3,12],[642,837,15,84],[192,840,3,36],[639,840,3,6],[189,843,3,36],[186,846,3,36],[183,849,3,39],[180,852,3,39],[177,858,3,36],[174,861,3,36],[171,864,3,36],[168,867,3,36],[165,870,3,36],[162,873,3,36],[870,873,6,48],[1101,873,6,48],[159,876,3,39],[156,879,3,39],[153,882,3,39],[150,888,3,36],[147,891,3,36],[144,894,3,36],[141,897,3,36],[138,900,3,36],[135,903,3,36],[132,906,3,39],[129,909,3,39],[126,915,3,36],[123,918,3,36],[120,921,3,36],[117,924,3,36],[114,927,3,36],[111,930,3,36],[108,933,3,36],[105,936,3,39],[102,939,3,39],[99,945,3,36],[96,948,3,33],[93,951,3,30],[90,954,3,27],[768,954,111,27],[885,954,6,27],[1005,954,87,27],[1101,954,6,27],[1218,954,96,27],[87,957,3,24],[891,957,3,24],[1002,957,3,24],[84,960,3,21],[81,963,3,18],[78,966,3,15],[75,969,3,12]]},"03-21":{"n":1391,"mpp":0.01311,"bb":[74.7,455.7,1284.4,1051.4],"rects":[[804,456,477,15],[804,471,42,60],[1254,471,27,54],[75,510,639,12],[75,522,18,9],[237,522,12,144],[372,522,117,21],[612,522,15,42],[702,522,15,12],[795,522,9,9],[75,531,15,519],[798,531,45,3],[426,543,9,126],[615,564,12,102],[612,567,3,99],[1077,585,6,33],[1257,585,24,249],[1083,588,3,30],[1254,588,3,243],[1086,609,168,6],[1086,615,156,3],[249,657,51,9],[363,657,63,9],[435,657,66,9],[561,657,51,9],[300,660,3,6],[360,660,3,6],[429,669,6,3],[426,729,9,12],[90,732,3,279],[435,732,3,9],[318,735,108,6],[438,735,48,6],[543,735,18,6],[621,735,156,6],[318,741,9,309],[546,741,12,3],[768,741,9,309],[549,744,9,306],[1254,894,30,156],[777,903,18,147],[1248,903,6,147],[312,939,6,48],[540,939,9,48],[546,987,3,3],[90,1014,3,36],[93,1023,6,27],[216,1023,102,27],[327,1023,9,27],[453,1023,96,27],[558,1023,6,27],[681,1023,87,27],[99,1026,3,24],[213,1026,3,24],[450,1026,3,24],[564,1026,3,24],[678,1026,3,24]]},"03-27":{"n":1355,"mpp":0.01312,"bb":[73.4,436.7,1204.2,1034.1],"rects":[[723,438,480,15],[723,453,42,60],[1173,453,30,54],[72,492,561,12],[72,504,51,3],[234,504,252,3],[612,504,27,9],[711,504,12,12],[72,507,18,3],[234,507,12,141],[369,507,117,18],[72,510,15,522],[612,513,24,3],[723,513,39,3],[612,516,21,24],[423,525,9,57],[612,540,12,108],[996,567,9,33],[1173,570,30,243],[426,582,6,69],[423,585,3,66],[1005,591,168,6],[1005,597,135,3],[1149,597,24,3],[246,639,54,9],[357,639,66,9],[432,639,66,9],[561,639,51,9],[498,642,3,6],[558,642,3,6],[432,648,3,3],[426,711,6,12],[423,714,3,9],[432,714,3,9],[87,717,3,315],[309,717,114,6],[435,717,36,6],[528,717,15,6],[600,717,141,6],[309,723,9,309],[531,723,9,309],[729,723,12,3],[732,726,9,138],[1176,813,24,3],[732,864,6,168],[738,867,3,165],[1173,876,30,156],[741,885,15,147],[1167,885,6,147],[303,921,6,48],[525,921,6,48],[522,924,3,45],[90,1005,9,27],[213,1005,96,27],[318,1005,9,27],[441,1005,90,27],[540,1005,9,27],[663,1005,69,27]]}};
  PISOS.forEach(function(p){var b=document.createElement('button');b.type='button';b.dataset.n=p.n;b.innerHTML=losa+'<span><b>'+p.t+'</b><small>'+p.d+'</small></span>';b.addEventListener('click',function(){tocoPiso=true;verPiso(p.n,true)});pisos.appendChild(b)});
  var AXO={"3":[[[840,1123],[1280,1347],[1280,1387],[840,1168]],[[1280,1347],[1500,1258],[1700,1190],[1900,1100],[2100,1008],[2350,900],[2350,945],[2100,1052],[1900,1143],[1700,1232],[1500,1299],[1280,1387]],[[2271,760],[2508,834],[2508,874],[2271,800]],[[2508,834],[2971,621],[2971,665],[2508,874]],[[2289,468],[2584,617],[2541,637],[2289,510]],[[560,1437],[867,1592],[867,1625],[560,1462]],[[867,1592],[1100,1495],[1100,1530],[867,1625]]],"2":[[[840,1168],[1280,1387],[1280,1428],[840,1212]],[[1280,1387],[1500,1299],[1700,1232],[1900,1143],[2100,1052],[2350,945],[2350,990],[2100,1096],[1900,1186],[1700,1274],[1500,1340],[1280,1428]],[[2271,800],[2508,874],[2508,914],[2271,840]],[[2508,874],[2971,665],[2971,709],[2508,914]],[[2289,510],[2541,637],[2494,658],[2289,555]],[[370,1385],[560,1462],[867,1625],[867,1672],[560,1512],[370,1425]],[[867,1625],[1100,1530],[1100,1575],[867,1672]]],"1":[[[840,1212],[1280,1428],[1280,1468],[840,1255]],[[1280,1428],[1500,1340],[1700,1274],[1900,1186],[2100,1096],[2350,990],[2350,1035],[2100,1140],[1900,1229],[1700,1316],[1500,1381],[1280,1468]],[[2271,840],[2508,914],[2508,954],[2392,918],[2271,858]],[[2508,914],[2971,709],[2971,752],[2508,954]],[[2289,555],[2494,658],[2453,677],[2289,594]]],"0":[[[946,1306],[1280,1468],[1280,1509],[1004,1377]],[[1280,1468],[1500,1381],[1700,1316],[1900,1229],[2100,1140],[2350,1035],[2350,1080],[2100,1184],[1900,1272],[1700,1358],[1500,1423],[1280,1509]],[[2392,918],[2508,954],[2508,975]],[[2508,954],[2971,752],[2971,795],[2508,994]],[[2289,594],[2453,677],[2410,697],[2289,636]],[[370,1425],[560,1512],[867,1672],[867,1715],[560,1556],[370,1465]],[[867,1672],[1100,1575],[1100,1617],[867,1715]]]},axoB=$('axoB'),tocoPiso=false,NS='http://www.w3.org/2000/svg';
  Object.keys(AXO).forEach(function(k){AXO[k].forEach(function(pg){var e=document.createElementNS(NS,'polygon');e.setAttribute('points',pg.map(function(q){return q.join(',')}).join(' '));e.dataset.n=k;e.addEventListener('click',function(){tocoPiso=true;verPiso(+k,true)});axoB.appendChild(e)})});
  function luzPiso(n,cls){[].forEach.call(axoB.children,function(e){e.classList.toggle(cls,+e.dataset.n===n)})}
  function recorre(){
    if(quieto)return;var sec=[0,1,2,3,-1,-1],i=0;
    (function paso(){if(muerto)return;if(tocoPiso){luzPiso(-1,'luz');return}luzPiso(sec[i%sec.length],'luz');i++;setTimeout(paso,800)})();
  }
  if('IntersectionObserver' in window){var ob=new IntersectionObserver(function(en){if(en[0].isIntersecting){ob.disconnect();recorre()}},{threshold:0.5});ob.observe($('axo'));obs.push(ob)}
  Object.keys(MOD).forEach(function(k){MOD[k].alt=1});
  // Locales: al tocar una silueta, el panel muestra planta baja, entrepiso y total de ese local.
  var locBs=[].slice.call(document.querySelectorAll('.galx .gx-loc-b')),locSel=null;
  function verLocal(b){
    locSel=b;var d=b.dataset;locBs.forEach(function(x){x.classList.toggle('on',x===b)});
    $('locNombre').textContent='Local '+d.id;$('locTxt').hidden=true;
    $('locDatos').innerHTML=dato('Planta baja',d.pb+' m²')+dato('Entrepiso',d.ep+' m²')+dato('Superficie total',d.t+' m²')+dato('Valor','Consultar');$('locDatos').hidden=false;$('locNota').hidden=false;
    var m=wa('Hola, vi el local '+d.id+' de Galinda! y quiero consultar el valor.');
    $('locWa').href=m;$('locWa').textContent='Consultar por el local '+d.id;$('fijaWa').href=m;$('fijaWa').textContent='Consultar por el local '+d.id;
  }
  locBs.forEach(function(b){b.addEventListener('click',function(){verLocal(b);var d=$('locDatos').getBoundingClientRect();if(d.bottom>innerHeight-90)$('locNombre').scrollIntoView({behavior:quieto?'auto':'smooth',block:'center'})},{signal:sg});b.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();verLocal(b)}},{signal:sg})});
  var pisoPrimera=true;
  function dato(k,v){return '<div><dt>'+k+'</dt><dd class="num">'+v+'</dd></div>'}
  function nombre(u){return (u.of?'Oficina ':'Unidad ')+u.id}
  function verPiso(n,elige){
    pisoSel=n;tocoPiso=true;luzPiso(-1,'luz');luzPiso(n,'on');$('axoEt').hidden=true;$('selector').hidden=false;var pp=PISOS.filter(function(x){return x.n===n})[0];$('axoEt').textContent=pp.t+': '+pp.d.charAt(0).toLowerCase()+pp.d.slice(1)+(n<2?'':' en venta');
    [].forEach.call(pisos.children,function(b){b.setAttribute('aria-pressed',+b.dataset.n===n?'true':'false')});
    var lista=U.filter(function(u){return u.piso===n});
    marcas.innerHTML='';sel.innerHTML='';
    $('plPb').hidden=n!==1;$('locales').hidden=n!==0;document.querySelector('.planta-caja').hidden=n===0;if(pisoPrimera){pisoPrimera=false;setTimeout(function(){var d=$('pisos');if(d)d.scrollIntoView({behavior:quieto?'auto':'smooth',block:'start'})},60)}if(n===0){if(locSel)verLocal(locSel);else{$('fijaWa').href=wa('Hola, quiero consultar por un local en Galinda!');$('fijaWa').textContent='Consultar por locales'}}if(n===1){$('fijaWa').href=wa('Hola, estoy viendo Galinda! y quiero consultar.');$('fijaWa').textContent='Consultar'}$('planta').classList.toggle('pb',n<2);$('pbTit').textContent=n===1?'Piso 1: sin unidades disponibles':'Planta baja: paseo de locales';$('pbTxt').textContent=n===1?'Hoy las unidades en venta están en los pisos 2 y 3.':'La disponibilidad se consulta por WhatsApp.';$('pbWa').hidden=n===1;
    $('notaPlanta').textContent=n<2?'':'En verde, las unidades en venta de este piso, con la silueta exacta de las fichas de Fundar. Tocá una acá o elegila en la lista.';
    lista.forEach(function(u){
      var m=document.createElement('button');m.type='button';m.className='marca-u'+(u.pos[0]>85?' der':'');m.dataset.id=u.id;m.style.cssText='left:'+u.pos[0]+'%;top:'+u.pos[1]+'%;width:'+u.pos[2]+'%;height:'+u.pos[3]+'%';
      m.setAttribute('aria-label',nombre(u)+', '+u.tipo+', '+u.m2+' m²');m.innerHTML='<span>'+u.id+' · '+u.m2+' m²</span>';
      var sl=document.createElement('div');sl.className='silueta';sl.dataset.id=u.id;sl.style.webkitMaskImage=sl.style.maskImage='url('+B+'img/m-'+u.id+'.png)';marcas.appendChild(sl);
      m.addEventListener('pointerenter',function(){sl.classList.add('sobre')});m.addEventListener('pointerleave',function(){sl.classList.remove('sobre')});
      m.addEventListener('click',function(){verU(u);var q=escena.getBoundingClientRect();if(q.top>window.innerHeight*0.75)escena.scrollIntoView({behavior:quieto?'auto':'smooth',block:'center'})});marcas.appendChild(m);
      var b=document.createElement('button');b.type='button';b.dataset.id=u.id;b.innerHTML='<small>'+u.tipo+' · '+u.id+'</small><span>'+u.m2+' m²</span>';b.addEventListener('click',function(){verU(u)});sel.appendChild(b);
    });
    $('unidad').hidden=$('adentro').hidden=n<2;
    if(n>1&&!window.THREE&&!document.getElementById('galxThree')){var lk=document.createElement('link');lk.id='galxThree';lk.rel='preload';lk.as='script';lk.href=THREE_URL;document.head.appendChild(lk)}
    if(n>1&&(elige||uSel.piso!==n))verU(lista[0]);
  }
  /* ---------- modelo 3D real (paredes del plano) ---------- */
  var giro3d=(function(){
    var cv=$('lienzo3d'),listo=false,cargando=false,R,esc,cam,grupo=null,idAct=null,vivo=false,raf=0;
    var cargado=null,base=25,base0=25,fAsp=1,az=-0.6,pol=0.8,dist=25,tAz=-0.6,tPol=0.8,tDist=25,auto=!quieto,x0=null,y0=0,a0=0,p0=0;
    function script(src,ok){if(window.THREE)return ok();var e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=falla;document.head.appendChild(e)}
    function falla(){$('v360').hidden=true;giro=false;visto3d=false;MOD={};pintaU()}
    function prepara(ok){
      if(listo)return ok();if(cargando)return;cargando=true;
      script(THREE_URL,function(){
        if(muerto)return;
        try{
          R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
          R.outputEncoding=THREE.sRGBEncoding;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
          esc=new THREE.Scene();cam=new THREE.PerspectiveCamera(32,1.5,0.1,200);
          esc.add(new THREE.HemisphereLight(0xffffff,0xb9c4c0,0.62));
          var sol=new THREE.DirectionalLight(0xfff4e6,0.55);sol.position.set(7,15,5);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);
          var c=sol.shadow.camera;c.left=-12;c.right=12;c.top=12;c.bottom=-12;c.near=1;c.far=40;sol.shadow.bias=-0.0006;sol.shadow.radius=4;esc.add(sol);
          var piso=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:0.16}));piso.rotation.x=-Math.PI/2;piso.position.y=-0.02;piso.receiveShadow=true;esc.add(piso);
          listo=true;ok();
        }catch(e){falla()}
      });
    }
    function arma(id){
      if(grupo){esc.remove(grupo)}
      var d=MOD[id],k=d.mpp,N=d.n,cx=(d.bb[0]+d.bb[2])/2,cy=(d.bb[1]+d.bb[3])/2,H=0.95;
      grupo=new THREE.Group();base=Math.max(d.bb[2]-d.bb[0],d.bb[3]-d.bb[1])*k*1.75+4;fAsp=1;base0=base;tDist=dist=base;tPol=0.8;$('zTop').textContent='Desde arriba';
      cv.style.visibility='hidden';cargado=null;var tx=new THREE.TextureLoader().load(B+'img/top-'+id+'.webp',function(){cargado=id;cv.style.visibility='';if(giro&&uSel.id===id)imgU.hidden=true});tx.encoding=THREE.sRGBEncoding;tx.anisotropy=R.capabilities.getMaxAnisotropy();
      var seg=d.alt?384:1,geo=new THREE.PlaneGeometry(N*k,N*k,seg,seg);
      var suelo=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tx,transparent:true,alphaTest:0.5,roughness:0.92,metalness:0}));
      if(d.alt){var ai=new Image();ai.onload=function(){try{var c=document.createElement('canvas');c.width=c.height=seg+1;var x=c.getContext('2d');x.drawImage(ai,0,0,seg+1,seg+1);var px=x.getImageData(0,0,seg+1,seg+1).data,pos=geo.attributes.position;for(var i=0;i<pos.count;i++)pos.setZ(i,px[i*4]/255*1.05);pos.needsUpdate=true;geo.computeVertexNormals();suelo.castShadow=true}catch(e){}};ai.src=B+'img/alt-'+id+'.png'}
      suelo.rotation.x=-Math.PI/2;suelo.position.set((N/2-cx)*k,0,(N/2-cy)*k);suelo.receiveShadow=true;grupo.add(suelo);
      var mat=new THREE.MeshStandardMaterial({color:0xe9e5dc,roughness:0.9,metalness:0});
      d.rects.forEach(function(q){var m=new THREE.Mesh(new THREE.BoxGeometry(q[2]*k,H,q[3]*k),mat);m.position.set((q[0]+q[2]/2-cx)*k,H/2,(q[1]+q[3]/2-cy)*k);m.castShadow=true;m.receiveShadow=true;grupo.add(m)});
      esc.add(grupo);idAct=id;
    }
    function mide(){var r=cv.getBoundingClientRect();if(!r.width)return;R.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();var f=Math.max(1,1.35/cam.aspect);if(cam.aspect<1)f*=0.76;if(f!==fAsp){tDist=tDist/fAsp*f;dist=dist/fAsp*f;base0=base*f;fAsp=f}}
    function cuadro(){
      if(!vivo)return;
      if(auto&&x0===null)tAz+=0.0035;
      az+=(tAz-az)*0.12;pol+=(tPol-pol)*0.12;dist+=(tDist-dist)*0.12;
      cam.position.set(dist*Math.sin(pol)*Math.sin(az),dist*Math.cos(pol),dist*Math.sin(pol)*Math.cos(az));cam.lookAt(0,0.2,0);
      R.render(esc,cam);raf=requestAnimationFrame(cuadro);
    }
    cv.addEventListener('pointerdown',function(e){x0=e.clientX;y0=e.clientY;a0=tAz;p0=tPol;auto=false;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
    cv.addEventListener('pointermove',function(e){if(x0===null)return;tAz=a0-(e.clientX-x0)*0.008;if(e.pointerType!=='touch')tPol=Math.max(0.05,Math.min(1.25,p0-(e.clientY-y0)*0.006))});
    function suelta(){x0=null}cv.addEventListener('pointerup',suelta,{signal:sg});cv.addEventListener('pointercancel',suelta,{signal:sg});
    $('zMas').addEventListener('click',function(){auto=false;tDist=Math.max(base0*0.4,tDist-base0*0.18)});
    $('zMen').addEventListener('click',function(){auto=false;tDist=Math.min(base0*1.5,tDist+base0*0.18)});
    $('zTop').addEventListener('click',function(){auto=false;var arriba=tPol>0.3;tPol=arriba?0.05:0.8;$('zTop').textContent=arriba?'En perspectiva':'Desde arriba'});
    window.addEventListener('resize',function(){if(vivo)mide()},{signal:sg});
    return {
      cargo:function(id){return cargado===id},
      abre:function(id){prepara(function(){if(!giro)return;if(idAct!==id)arma(id);mide();if(!vivo){vivo=true;raf=requestAnimationFrame(cuadro)}})},
      cierra:function(){vivo=false;cancelAnimationFrame(raf)},
      suelta:function(){vivo=false;cancelAnimationFrame(raf);if(!R)return;try{if(esc)esc.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});R.dispose()}catch(_){}}
    };
  })();

  function pintaU(){
    escena.classList.toggle('plano',!en3d);escena.classList.toggle('giro',giro);
    $('lienzo3d').hidden=$('zoom3d').hidden=!giro;imgU.hidden=giro&&giro3d.cargo(uSel.id);$('v360').hidden=!MOD[uSel.id];
    $('v360').setAttribute('aria-pressed',giro?'true':'false');
    if(giro)giro3d.abre(uSel.id);else giro3d.cierra();
    var src=B+'img/'+(en3d?'u-':'plano-')+uSel.id+'.webp';
    if(imgU.getAttribute('src')!==src){imgU.classList.add('cargando');imgU.onload=imgU.onerror=function(){imgU.classList.remove('cargando')};imgU.src=src}
    imgU.alt=(en3d?'Planta en 3D de la ':'Plano de la ')+nombre(uSel).toLowerCase();
    $('v3d').setAttribute('aria-pressed',en3d&&!giro?'true':'false');$('v2d').setAttribute('aria-pressed',en3d?'false':'true');
    $('ilusAbajo').textContent=$('ilus').textContent=giro?'Paredes del plano de Fundar. Muebles ilustrativos.':en3d?'Ilustrativa. Vale el plano de Fundar.':'Plano de Fundar.';
    escena.style.setProperty('--rx','0deg');escena.style.setProperty('--ry','0deg');
  }
  function verU(u){
    uSel=u;giro=visto3d&&!!MOD[u.id];en3d=true;
    [].forEach.call(sel.children,function(b){b.setAttribute('aria-pressed',b.dataset.id===u.id?'true':'false')});
    [].forEach.call(marcas.children,function(b){if(b.className.indexOf('silueta')===0)b.classList.toggle('on',b.dataset.id===u.id);else b.setAttribute('aria-pressed',b.dataset.id===u.id?'true':'false')});
    $('uNombre').innerHTML=(u.of?'Oficina ':'Unidad ')+'<span>'+u.id+'</span>';
    $('uTipo').textContent=u.tipo+' · '+u.frente;
    $('uDatos').innerHTML=dato('Superficie total',u.m2+' m²')+dato('Superficie exclusiva',u.prop+' m²')+dato('Piso',String(u.piso))+dato('Entrega estimada',u.of?'Enero 2027':'Marzo-abril 2027');
    $('uWa').href=wa('Hola, vi la '+nombre(u).toLowerCase()+' de Galinda! ('+u.m2+' m²) y quiero saber el precio.');
    $('uFicha').hidden=!u.ficha;if(u.ficha)$('uFicha').href='/propiedades/'+u.ficha;
    $('fijaWa').href=$('uWa').href;$('fijaWa').textContent='Consultar por la '+nombre(u).toLowerCase();
    pintaU();ambientes(u);
  }
  $('v3d').addEventListener('click',function(){en3d=true;giro=false;pintaU()});$('v2d').addEventListener('click',function(){en3d=false;giro=false;pintaU()});
  $('v360').addEventListener('click',function(){en3d=true;giro=true;pintaU()});
  function inclina(e){
    if(!en3d||giro||quieto)return;var r=escena.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    escena.style.setProperty('--ry',(x*30).toFixed(1)+'deg');escena.style.setProperty('--rx',(-y*22).toFixed(1)+'deg');
  }
  escena.addEventListener('pointermove',inclina,{signal:sg});escena.addEventListener('pointerdown',inclina,{signal:sg});
  escena.addEventListener('pointerleave',function(e){if(e.pointerType==='touch')return;escena.style.setProperty('--rx','0deg');escena.style.setProperty('--ry','0deg')});
  if(quieto)document.querySelector('.escena .ayuda').hidden=true;

  /* ---------- por dentro ---------- */
  var AV=[['Living','sr2-living','Living comedor de un departamento de Galinda!, Funes','living'],['Cocina','sr2-cocina','Cocina de un departamento de Galinda!, Funes','cocina'],['Dormitorio','sr2-dormitorio','Dormitorio de un departamento de Galinda!, Funes','dormitorio'],['Baño','sr2-bano','Baño del showroom','bano'],['Balcón','sr2-balcon','Balcón con vista al parque','balcon']];
  var AO=[['Oficina','of-oficina','Interior de una oficina de Galinda',null]];
  var VID={living:1,cocina:1,dormitorio:1,bano:1,balcon:1};
  var amb=$('amb'),imgAmb=$('imgAmb'),vidAmb=$('vidAmb'),tipoAmb=null;
  var ambPend=null,ambVisto=!('IntersectionObserver' in window);
  function ambAnda(){if(!ambPend)return;if(vidAmb.getAttribute('src')!==ambPend)vidAmb.src=ambPend;var p=vidAmb.play();if(p&&p.catch)p.catch(function(){vidAmb.hidden=true;imgAmb.hidden=false})}
  if(!ambVisto){var oa=new IntersectionObserver(function(en){ambVisto=en[0].isIntersecting;if(ambVisto)ambAnda();else vidAmb.pause()},{rootMargin:'150px'});oa.observe($('fotoCaja'));obs.push(oa)}
  function muestra(a,b){
    [].forEach.call(amb.children,function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    imgAmb.src=B+'img/'+a[1]+'.webp';imgAmb.alt=a[2];
    var v=a[3]&&VID[a[3]]&&!quieto;
    vidAmb.hidden=!v;imgAmb.hidden=!!v;
    if(v){vidAmb.poster=B+'img/'+a[1]+'.webp';ambPend=B+'clip/in-'+a[3]+'.mp4';if(ambVisto)ambAnda();else{vidAmb.pause();vidAmb.removeAttribute('src')}}else{ambPend=null;vidAmb.pause();vidAmb.removeAttribute('src')}
  }
  function ambientes(u){
    var t=u.of?'of':'viv';if(t===tipoAmb)return;tipoAmb=t;
    var L=u.of?AO:AV;amb.innerHTML='';
    $('adNota').textContent=u.of?'Foto real de una oficina de Galinda, tomada el 17 de noviembre de 2026.':'Es el showroom, la unidad modelo de Galinda. Imágenes animadas a partir de fotos reales del 17 de noviembre de 2026. La distribución de cada unidad es la de su plano.';
    L.forEach(function(a,i){var b=document.createElement('button');b.type='button';b.textContent=a[0];b.addEventListener('click',function(){muestra(a,b)});amb.appendChild(b);if(i===0)muestra(a,b)});
  }
  (function sinPiso(){
    ['selector','unidad','adentro','locales'].forEach(function(k){$(k).hidden=true});
    document.querySelector('.planta-caja').hidden=true;
    $('axoEt').textContent='Tocá un piso para ver sus unidades';$('axoEt').classList.add('invita');
  })();
  if('IntersectionObserver' in window&&!quieto){var o3=new IntersectionObserver(function(en){if(en[0].isIntersecting){o3.disconnect();visto3d=true;if(en3d&&MOD[uSel.id]){giro=true;pintaU()}}},{threshold:0.35});o3.observe(escena);obs.push(o3)}else{visto3d=!quieto}
  if('IntersectionObserver' in window){var oe=new IntersectionObserver(function(en){if(!giro)return;if(en[0].isIntersecting)giro3d.abre(uSel.id);else giro3d.cierra()},{threshold:0.01});oe.observe(escena);obs.push(oe)}
  $('pbWa').href=wa('Hola, quiero consultar por un local en Galinda!');

  /* ---------- plano en grande ---------- */
  (function(){
    var L=$('lupa'),im=$('lupaImg'),s=1,s0=1,tx=0,ty=0,pts={},ini=null,ult=0,antes=null;
    function aplica(){im.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')'}
    function limita(){
      var W=L.clientWidth,H=L.clientHeight,w=im.naturalWidth*s,h=im.naturalHeight*s;
      tx=w<=W?(W-w)/2:Math.min(0,Math.max(W-w,tx));ty=h<=H?(H-h)/2:Math.min(0,Math.max(H-h,ty));
    }
    function encaja(){var W=Math.max(L.clientWidth,1),H=Math.max(L.clientHeight-130,1);s0=s=Math.min(W/im.naturalWidth,H/im.naturalHeight);tx=0;ty=0;limita();ty=Math.max(ty,64);aplica()}
    function zoom(f,cx,cy){
      var n=Math.max(s0,Math.min(s0*7,s*f));if(cx==null){cx=L.clientWidth/2;cy=L.clientHeight/2}
      tx=cx-(cx-tx)*n/s;ty=cy-(cy-ty)*n/s;s=n;limita();aplica();
    }
    function abre(){
      antes=document.activeElement;$('lupaTit').textContent='Plano de la '+nombre(uSel).toLowerCase();
      im.alt='Plano de Fundar de la '+nombre(uSel).toLowerCase()+', con medidas';
      L.hidden=false;document.documentElement.style.overflow='hidden';
      var src=B+'img/plano-hd-'+uSel.id+'.webp';
      if(im.getAttribute('src')!==src){im.style.visibility='hidden';im.onload=function(){im.style.visibility='';encaja()};im.onerror=function(){im.onerror=null;im.src=B+'img/plano-'+uSel.id+'.webp'};im.src=src}else encaja();
      $('lupaX').focus();
    }
    function cierra(){L.hidden=true;document.documentElement.style.overflow='';pts={};if(antes)antes.focus()}
    $('agrandar').addEventListener('click',function(){if(en3d){en3d=false;giro=false;pintaU()}abre()});
    imgU.addEventListener('click',function(){if(!en3d)abre()});
    $('lupaX').addEventListener('click',cierra,{signal:sg});
    $('lupaMas').addEventListener('click',function(){zoom(1.6)});$('lupaMen').addEventListener('click',function(){zoom(1/1.6)});
    document.addEventListener('keydown',function(e){if(L.hidden)return;if(e.key==='Escape')cierra();else if(e.key==='+'||e.key==='=')zoom(1.4);else if(e.key==='-')zoom(1/1.4)},{signal:sg});
    L.addEventListener('wheel',function(e){e.preventDefault();zoom(Math.exp(-e.deltaY*0.0022),e.clientX,e.clientY)},{passive:false});
    im.addEventListener('pointerdown',function(e){
      e.preventDefault();try{im.setPointerCapture(e.pointerId)}catch(_){}pts[e.pointerId]={x:e.clientX,y:e.clientY};im.classList.add('arrastra');
      var k=Object.keys(pts);
      if(k.length===1){var ahora=Date.now();if(ahora-ult<300){zoom(s>s0*1.2?s0/s:2.5,e.clientX,e.clientY);ult=0}else ult=ahora}
      ini=null;
    });
    im.addEventListener('pointermove',function(e){
      var p=pts[e.pointerId];if(!p)return;var k=Object.keys(pts);
      if(k.length===1){tx+=e.clientX-p.x;ty+=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;limita();aplica();return}
      p.x=e.clientX;p.y=e.clientY;var a=pts[k[0]],b=pts[k[1]],d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
      if(ini){zoom(d/ini.d,cx,cy);tx+=cx-ini.cx;ty+=cy-ini.cy;limita();aplica()}
      ini={d:d,cx:cx,cy:cy};
    });
    function suelta(e){delete pts[e.pointerId];ini=null;if(!Object.keys(pts).length)im.classList.remove('arrastra')}
    im.addEventListener('pointerup',suelta,{signal:sg});im.addEventListener('pointercancel',suelta,{signal:sg});
    window.addEventListener('resize',function(){if(!L.hidden)encaja()},{signal:sg});
  })();

  var clips=[].slice.call(document.querySelectorAll('.galx .clips video'));
  function cargaClip(v){if(v.dataset.src){v.src=v.dataset.src;v.removeAttribute('data-src')}}
  // De a uno: anda solo el video que se está viendo; el resto queda en pausa (en el celu van en fila, uno por pantalla).
  var pts=$('clipsPts');if(pts){pts.textContent='';clips.forEach(function(){pts.appendChild(document.createElement('i'))})}
  if('IntersectionObserver' in window){var oc=new IntersectionObserver(function(en){en.forEach(function(x){var v=x.target,n=clips.indexOf(v);if(pts&&pts.children[n])pts.children[n].classList.toggle('on',x.isIntersecting);if(!x.isIntersecting){v.pause();return}cargaClip(v);if(!quieto&&!v.dataset.pausado){var p=v.play();if(p&&p.catch)p.catch(function(){})}})},{threshold:0.6});clips.forEach(function(v){oc.observe(v)});obs.push(oc)}else clips.forEach(cargaClip);
  // El dibujo del conjunto, en el celu, va más grande que la pantalla: arranca centrado y se recorre con el dedo.
  (function(){var mv=$('axoMov'),pi=$('axoPista');if(!mv)return;function centra(){if(mv.scrollWidth>mv.clientWidth+4)mv.scrollLeft=(mv.scrollWidth-mv.clientWidth)*0.42}
    centra();window.addEventListener('load',centra,{signal:sg,once:true});
    mv.addEventListener('scroll',function(){if(pi&&Math.abs(mv.scrollLeft-(mv.scrollWidth-mv.clientWidth)*0.42)>24)pi.classList.add('fuera')},{signal:sg,passive:true})})();
  clips.forEach(function(v){v.addEventListener('click',function(){cargaClip(v);if(v.paused){delete v.dataset.pausado;var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v.dataset.pausado='1';v.pause()}})});
  var AM=[['Parque','am-parque','Parque del condominio Galinda! en Funes, render de Fundar','El parque de las viviendas y las cocheras cubiertas'],['Gimnasio','am-gimnasio','Gimnasio del condominio Galinda! en Funes, render de Fundar','Gimnasio con vista al parque'],['Balcones','am-balcon','Render de un balcón con vista al parque','Balcones que miran al parque'],['Plazoleta','am-plazoleta','Render de la plazoleta de ingreso','La plazoleta, entre las oficinas y las viviendas'],['Paseo de locales','am-paseo','Render del paseo comercial','Paseo de locales en planta baja'],['Ingreso','am-ingreso','Render del ingreso a las viviendas','Ingreso a las viviendas'],['Oficinas','am-oficinas','Render de una sala de reuniones','Sala de reuniones del edificio de oficinas']];
  var amT=$('amTabs');
  AM.forEach(function(a,i){var b=document.createElement('button');b.type='button';b.textContent=a[0];b.setAttribute('aria-pressed',i===0?'true':'false');b.addEventListener('click',function(){[].forEach.call(amT.children,function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});$('amImg').src=B+'img/'+a[1]+'.webp';$('amImg').alt=a[2];$('amPie').textContent=a[3]});amT.appendChild(b)});
  $('amPie').textContent=AM[0][3];
  $('cWa').href=wa('Hola, quiero coordinar una visita a Galinda!');
  return function(){muerto=true;ac.abort();obs.forEach(function(o){o.disconnect()});giro3d.suelta();document.documentElement.style.overflow=''};
}

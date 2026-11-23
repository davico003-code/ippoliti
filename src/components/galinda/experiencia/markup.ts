// HTML de la experiencia de Galinda! (lo dibuja el servidor; motor.js lo anima).
// Sale de la pagina de prueba aprobada por David (22-nov-2026). Fechas, avance
// y telefono vienen de lib/galinda.ts; los enlaces de WhatsApp ya salen con su
// destino (el motor despues les pone el mensaje de la unidad elegida).

import { GAL_AVANCE, GAL_FECHA_FOTOS, galWhatsappUrl } from '@/lib/galinda'

export const GALX_ARRIBA = `<header class="portada">
  <picture><source media="(max-width: 640px)" srcset="/emprendimientos/galinda/x/img/portada-m.webp"><img class="pposter" src="/emprendimientos/galinda/x/img/portada-fin.webp" alt="Condominio Galinda! en Funes visto desde el aire, sobre Av. Galindo" fetchpriority="high" decoding="async"></picture>
  <video id="vPort" muted playsinline loop preload="none" aria-hidden="true"></video>
  <div class="velo"></div>
  <div class="wrap pcont">
    <h1 class="marca pm">Galinda!<span class="sr-only"> · Condominio con departamentos en venta en Funes</span></h1>
    <div class="pabajo">
      <p class="lema">Vivir, trabajar y pasear<br>sin moverte de casa.</p>
      <p class="plugar">Departamentos, oficinas y locales en la entrada de Funes.</p>
      <div class="pbot">
        <button type="button" class="btn pri" id="irUnidades">Elegir mi unidad</button>
      </div>
    </div>
  </div>
  <button type="button" class="otra" id="otraVez" hidden>Ver el video</button>
</header>

<section id="explorar"><div class="wrap">
  <p class="rotulo">Tu departamento</p>
  <h2>Elegí el piso y tocá tu unidad</h2>
  <p class="bajada">Tocá un piso en el dibujo y después tu unidad. Cada una se abre en 3D para girarla.</p>
  <div class="axo">
    <div class="axo-mov" id="axoMov">
    <svg id="axo" viewBox="120 280 3260 1700" role="group" aria-label="Dibujo del conjunto según el proyecto de Fundar. Tocá un piso para ver sus unidades.">
      <image href="/emprendimientos/galinda/x/img/axo-hd.webp" x="0" y="0" width="3504" height="2336"/>
      <g id="axoB"></g>
      <g class="axo-rot" aria-hidden="true">
        <path d="M733 870V1290M2146 420V965M1594 660V985M1927 1275V1770"/>
        <text x="715" y="892" text-anchor="end">OFICINAS</text>
        <text x="2128" y="442" text-anchor="end">VIVIENDAS</text>
        <text x="1576" y="682" text-anchor="end">PARQUE</text>
        <text x="1948" y="1786">LOCALES</text>
        <text class="calle" x="2292" y="1560" transform="rotate(-25 2292 1560)">AV. GALINDO</text>
        <text class="calle" x="1250" y="1945" transform="rotate(-25 1250 1945)">◀ AUTOPISTA</text>
        <text class="calle" x="3120" y="1105" transform="rotate(-25 3120 1105)">FUNES ▶</text>
      </g>
    </svg>
    </div>
    <span class="axo-pista" id="axoPista" aria-hidden="true">Deslizá para recorrerlo</span>
    <p class="axo-et" id="axoEt" aria-live="polite"></p>
  </div>
  <div class="explora">
    <div class="pisos" id="pisos" role="group" aria-label="Pisos"></div>
    <div class="planta-caja" hidden>
      <div class="planta-scroll">
        <div class="planta" id="planta">
          <img loading="lazy" decoding="async" src="/emprendimientos/galinda/x/img/planta-base.png" alt="Planta del conjunto: edificio de oficinas a la izquierda y dos edificios de viviendas">
          <span class="pl-rot" style="left:1.5%;top:38%;width:14%">Oficinas</span>
          <span class="pl-rot" style="left:44%;top:14%">Parque</span>
          <span class="pl-rot pl-calle" style="left:38%;bottom:-2%">Av. Galindo</span>
          <div id="marcas"></div>
          <div class="pl-pb" id="plPb" hidden><strong id="pbTit">Planta baja: paseo de locales</strong><span id="pbTxt">La disponibilidad se consulta por WhatsApp.</span><a class="btn wa" id="pbWa" href="${galWhatsappUrl('Hola, quiero consultar por un local en Galinda!')}" target="_blank" rel="noopener">Consultar por un local</a></div>
        </div>
      </div>
      <p class="nota" id="notaPlanta"></p>
    </div>
  </div>
  <div class="locales" id="locales" hidden>
    <div class="loc-aviso">
      <p class="rotulo" style="margin-bottom:6px">Planta baja</p>
      <h3>Paseo de locales</h3>
      <p class="bajada">Un paseo de locales comerciales sobre Av. Galindo. La disponibilidad y las condiciones se consultan por WhatsApp.</p>
      <a class="btn wa" id="locWa" href="${galWhatsappUrl('Hola, quiero consultar por un local en Galinda!')}" target="_blank" rel="noopener">Consultar por locales</a>
    </div>
    <div class="loc-fotos">
      <figure><img src="/emprendimientos/galinda/x/img/am-local.webp" alt="Render de un local gastronómico en esquina" loading="lazy"><figcaption>Render de Fundar: local en esquina</figcaption></figure>
      <figure><img src="/emprendimientos/galinda/x/img/am-paseo.webp" alt="Render del paseo de locales con pérgolas" loading="lazy"><figcaption>Render de Fundar: el paseo</figcaption></figure>
      <figure><img src="/emprendimientos/galinda/x/img/obra2-locales.webp" alt="Foto real del interior de un local en obra" loading="lazy"><figcaption>Foto real, 17 de noviembre de 2026</figcaption></figure>
    </div>
  </div>
  <div class="selector" id="selector" hidden role="group" aria-label="Unidades de este piso"></div>

  <div class="unidad" id="unidad" hidden>
    <div>
      <div class="escena" id="escena">
        <img id="imgU" loading="lazy" src="/emprendimientos/galinda/x/img/u-03-12.webp" alt="Planta en 3D de la unidad 03-12">
        <canvas id="lienzo3d" hidden aria-label="Modelo 3D de la unidad. Deslizá hacia los costados para girarlo."></canvas>
        <div class="zoom" id="zoom3d" hidden><button type="button" id="zMas" aria-label="Acercar">+</button><button type="button" id="zMen" aria-label="Alejar">−</button><button type="button" id="zTop">Desde arriba</button></div>
        <div class="vista" role="group" aria-label="Tipo de vista">
          <button type="button" id="v360" aria-pressed="false" hidden>Girar 360°</button>
          <button type="button" id="v3d" aria-pressed="true">Imagen</button>
          <button type="button" id="v2d" aria-pressed="false">Plano</button>
        </div>
        <span class="ilus" id="ilus"></span>
        <span class="ayuda">Mové para inclinarla</span>
        <button type="button" class="agrandar" id="agrandar" aria-label="Ver el plano en grande"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>Ver plano en grande</button>
      </div>
      <p class="nota ilus-abajo" id="ilusAbajo"></p>
    </div>
    <div class="ficha" aria-live="polite">
      <h3 id="uNombre"></h3>
      <p class="tipo" id="uTipo"></p>
      <dl class="datos" id="uDatos"></dl>
      <a class="btn wa" id="uWa" href="${galWhatsappUrl('Hola, estoy viendo Galinda! y quiero consultar.')}" target="_blank" rel="noopener">Consultar</a>
      <a class="btn sec" id="uFicha">Ver la ficha completa</a>
    </div>
  </div>

  <div class="adentro" id="adentro" hidden>
    <h3 class="sub">Entrá a verlo</h3>
    <p class="bajada" id="adNota"></p>
    <div class="amb" id="amb" role="group" aria-label="Ambientes"></div>
    <div class="foto" id="fotoCaja"><img id="imgAmb" loading="lazy" src="/emprendimientos/galinda/x/img/sr2-living.webp" alt="Living comedor de un departamento de Galinda!, Funes"><video id="vidAmb" muted loop playsinline preload="none" hidden></video></div>
  </div>
</div></section>

<section id="vivir"><div class="wrap">
  <p class="rotulo">Vivir en Galinda</p>
  <h2>Parque propio, piscina, gimnasio y todo a mano</h2>
  <p class="bajada">Un condominio con viviendas, oficinas y un paseo de locales en un mismo lugar, en la entrada de Funes. Con seguridad permanente y cocheras cubiertas.</p>
  <div class="amb" id="amTabs" role="group" aria-label="Espacios comunes"></div>
  <div class="foto ancha"><img loading="lazy" decoding="async" id="amImg" src="/emprendimientos/galinda/x/img/am-parque.webp" alt="Parque del condominio Galinda! en Funes, render de Fundar"><p class="pie-foto" id="amPie"></p></div>
  <ul class="amen" aria-label="Amenidades">
    <li>Piscina</li><li>Solárium</li><li>Parque</li><li>Gimnasio</li><li>Salón de usos múltiples</li><li>Parrillero</li><li>Lavadero</li><li>Bicicletero</li><li>Cocheras cubiertas</li><li>Grupo electrógeno</li><li>Seguridad permanente</li>
  </ul>
  <p class="nota">Renders y amenidades del proyecto de Fundar.</p>
</div></section>

<section class="conjunto" id="conjunto"><div class="wrap">
  <p class="rotulo">El conjunto</p>
  <h2>Tres edificios, un parque y un paseo de locales</h2>
  <p class="bajada">Tocá un punto para ver qué hay en cada parte. Podés comparar la obra real con el proyecto terminado.</p>
  <div class="modo" role="group" aria-label="Qué imagen ver">
    <button type="button" id="mHoy" aria-pressed="true">La obra real</button>
    <button type="button" id="mPro" aria-pressed="false">El proyecto</button>
  </div>
  <div class="mapa">
    <img loading="lazy" decoding="async" id="imgPro" class="oculta" src="/emprendimientos/galinda/x/img/am-frente.webp" alt="Render de Fundar: el condominio Galinda! terminado, visto desde Av. Galindo, Funes">
    <img loading="lazy" decoding="async" id="imgHoy" src="/emprendimientos/galinda/x/img/conjunto.webp" alt="Foto aérea real del condominio Galinda! sobre Av. Galindo, Funes">
    <button class="pin" type="button" data-z="oficinas" style="left:29%;top:68%"><i>1</i><b>Oficinas</b></button>
    <button class="pin" type="button" data-z="viviendas" style="left:41%;top:59%"><i>2</i><b>Viviendas</b></button>
    <button class="pin" type="button" data-z="parque" style="left:47%;top:52%"><i>3</i><b>Parque</b></button>
    <button class="pin" type="button" data-z="locales" style="left:50%;top:66%"><i>4</i><b>Locales</b></button>
  </div>
  <p class="nota" id="notaMapa">Foto de dron del 2 de octubre de 2026.</p>
  <div class="zonas" id="zonas" role="group" aria-label="Partes del conjunto"></div>
  <div class="zona" id="zona" aria-live="polite"></div>
</div></section>

<section class="obra"><div class="wrap">
  <p class="rotulo">La obra hoy</p>
  <h2>La obra hoy, filmada el 17 de noviembre</h2>
  <p class="bajada">Recorrida por adentro y por el paseo. Tocá un video para pausarlo.</p>
  <div class="clips" id="clips">
    <figure><video data-src="/emprendimientos/galinda/x/clip/balcon.mp4" poster="/emprendimientos/galinda/x/clip/balcon.webp" muted loop playsinline preload="none"></video><figcaption>El parque desde el balcón</figcaption></figure>
    <figure><video data-src="/emprendimientos/galinda/x/clip/cocina.mp4" poster="/emprendimientos/galinda/x/clip/cocina.webp" muted loop playsinline preload="none"></video><figcaption>Cocina y lavadero</figcaption></figure>
    <figure><video data-src="/emprendimientos/galinda/x/clip/dormitorio.mp4" poster="/emprendimientos/galinda/x/clip/dormitorio.webp" muted loop playsinline preload="none"></video><figcaption>Dormitorio con placard</figcaption></figure>
    <figure><video data-src="/emprendimientos/galinda/x/clip/paseo.mp4" poster="/emprendimientos/galinda/x/clip/paseo.webp" muted loop playsinline preload="none"></video><figcaption>El paseo de locales</figcaption></figure>
  </div>
  <div class="clips-pts" id="clipsPts" aria-hidden="true"></div>
</div></section>

<section><div class="wrap">
  <p class="rotulo">Fechas y forma de pago</p>
  <h2>Lo que hay que saber</h2>
  <div class="cifras" style="margin-top:20px">
    <div><b>${GAL_AVANCE} %</b><span>de avance de obra, según Fundar al ${GAL_FECHA_FOTOS}</span></div>
    <div><b>Enero 2027</b><span>entrega estimada de las oficinas, según Fundar</span></div>
    <div><b>Marzo-abril 2027</b><span>entrega estimada de las viviendas, según Fundar</span></div>
    <div><b>30 % de anticipo</b><span>y el saldo en 12 o 24 cuotas; pueden ser en pesos, ajustadas por índice CAC</span></div>
  </div>
</div></section>

`

export const GALX_ABAJO = `<section class="cierre"><div class="wrap">
  <div class="caja">
    <img loading="lazy" decoding="async" src="/emprendimientos/galinda/x/img/atardecer.webp" alt="Fachada del condominio Galinda! en Funes con las luces encendidas al atardecer">
    <div class="texto">
      <h2>Vení a verlo en persona</h2>
      <a class="btn linea" id="cWa" href="${galWhatsappUrl('Hola, quiero coordinar una visita a Galinda!')}" target="_blank" rel="noopener">Coordinar una visita</a>
      <span class="tel">341 334-0916</span>
    </div>
  </div>
  <p class="nota">Imagen ilustrativa, generada sobre la foto de la fachada real.</p>
</div></section>

<div class="lupa" id="lupa" role="dialog" aria-modal="true" aria-label="Plano en grande" hidden>
  <img id="lupaImg" alt="" draggable="false">
  <div class="lupa-arriba"><strong id="lupaTit"></strong><button type="button" id="lupaX" aria-label="Cerrar">✕</button></div>
  <div class="lupa-abajo"><button type="button" id="lupaMen" aria-label="Alejar">−</button><button type="button" id="lupaMas" aria-label="Acercar">+</button><span id="lupaAyuda">Pellizcá o hacé doble toque para acercar</span></div>
</div>
<a class="fija" id="fijaWa" href="${galWhatsappUrl('Hola, estoy viendo Galinda! y quiero consultar.')}" target="_blank" rel="noopener">Consultar</a>
`

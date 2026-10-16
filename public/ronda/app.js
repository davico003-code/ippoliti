// Ronda Funes Roldán — la pantalla (verficha.casa/ronda).
//
// Página estática sin framework: habla con /api/ronda/*. La grilla es de todos;
// en el teléfono solo queda el pase del agente (quién sos) y tus notas privadas.
(() => {
  'use strict'

  const DIA = 86_400_000
  const MAX_POR_INMOBILIARIA = 3
  const CLAVES = { acceso: 'ronda.acceso.v1', sesion: 'ronda.sesion.v1', guia: 'ronda.guia.v1', notas: 'ronda.notas.v1' }

  const $ = (sel, raiz = document) => raiz.querySelector(sel)
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)]
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

  function leerLocal(clave, defecto) {
    try {
      return JSON.parse(localStorage.getItem(clave)) ?? defecto
    } catch {
      return defecto
    }
  }
  function guardarLocal(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      // Navegación privada: se sigue sin recordar.
    }
  }

  // ── Estado ────────────────────────────────────────────────────────────
  /** El pase que da la clave de acceso: sin él el servidor no entrega nada. */
  let acceso = leerLocal(CLAVES.acceso, null)
  if (typeof acceso !== 'string') acceso = null
  let sesion = leerLocal(CLAVES.sesion, null)
  if (!sesion?.token || !sesion?.agente?.id || !sesion?.inmobiliaria?.id) sesion = null
  /** null = cargando · 'error' = no se pudo · [] = la grilla */
  let publicaciones = null
  let inmobiliarias = []
  let ultimaCarga = 0
  /** El contador del mes que manda el servidor: { mes, contactos, fichas, colegas, inmobiliarias }. */
  let actividad = null
  // Lo que este teléfono acaba de publicar o bajar: la grilla pasa por un caché
  // de unos segundos y sin esto la tarjeta nueva desaparecería un instante.
  const recienPublicadas = new Map()
  const recienBajadas = new Map()

  const filtro = (() => {
    const q = new URLSearchParams(location.search)
    const tipo = q.get('tipo')
    const ciudad = q.get('ciudad')
    const orden = q.get('orden')
    return {
      tipo: ['Casa', 'Lote', 'Departamento'].includes(tipo) ? tipo : '',
      ciudad: ciudad === 'Funes' ? 'Funes' : sinTildes(ciudad) === 'roldan' ? 'Roldán' : '',
      orden: ['precio-asc', 'precio-desc'].includes(orden) ? orden : '',
      texto: (q.get('q') || '').slice(0, 80),
    }
  })()

  function filtroALaUrl() {
    const q = new URLSearchParams()
    if (filtro.tipo) q.set('tipo', filtro.tipo)
    if (filtro.ciudad) q.set('ciudad', filtro.ciudad)
    if (filtro.orden) q.set('orden', filtro.orden)
    if (filtro.texto) q.set('q', filtro.texto)
    const s = q.toString()
    history.replaceState(null, '', s ? `${location.pathname}?${s}` : location.pathname)
  }

  // ── Servidor ──────────────────────────────────────────────────────────
  async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
    const headers = {}
    if (cuerpo) headers['content-type'] = 'application/json'
    if (acceso) headers['x-ronda-acceso'] = acceso
    if (metodo !== 'GET' && sesion?.token) headers.authorization = `Bearer ${sesion.token}`
    let res
    try {
      res = await fetch(`/api/ronda/${ruta}`, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined })
    } catch {
      throw Object.assign(new Error('Sin conexión. Revisá tu internet y probá de nuevo.'), { status: 0 })
    }
    const datos = await res.json().catch(() => ({}))
    // La clave cambió (o nunca se puso): se vuelve a pedir.
    if (res.status === 401 && datos.acceso && ruta !== 'entrar') pedirClave()
    if (!res.ok) throw Object.assign(new Error(datos.error || 'Algo salió mal. Probá de nuevo.'), { status: res.status, datos })
    return datos
  }

  /**
   * Un contacto por WhatsApp o una ficha mandada a un cliente: suma al contador
   * del mes. Sale aunque la página se vaya a WhatsApp (keepalive) y nunca frena nada.
   */
  function anotar(tipo, id) {
    if (!sesion?.token || !id) return
    fetch('/api/ronda/actividad', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json', ...(acceso ? { 'x-ronda-acceso': acceso } : {}), authorization: `Bearer ${sesion.token}` },
      body: JSON.stringify({ tipo, id }),
    }).catch(() => {})
  }

  async function cargar({ fresco = false } = {}) {
    try {
      const datos = await api(fresco ? `publicaciones?t=${Date.now()}` : 'publicaciones')
      const ahora = Date.now()
      for (const [id, cuando] of recienBajadas) if (ahora - cuando > 90_000) recienBajadas.delete(id)
      for (const [id, p] of recienPublicadas) if (ahora - p.creada > 90_000) recienPublicadas.delete(id)
      const lista = (datos.publicaciones || []).filter((p) => !recienBajadas.has(p.id))
      for (const p of recienPublicadas.values()) if (!lista.some((x) => x.id === p.id)) lista.unshift(p)
      publicaciones = lista
      if (datos.actividad) actividad = datos.actividad
      ultimaCarga = ahora
    } catch (err) {
      if (err.datos?.acceso) return
      if (!Array.isArray(publicaciones)) publicaciones = 'error'
    }
    pintar()
  }

  // ── Formatos ──────────────────────────────────────────────────────────
  const vigentes = () => (Array.isArray(publicaciones) ? publicaciones.filter((p) => p.vence > Date.now()) : [])

  function precio(p) {
    if (!p.precio) return 'Precio a consultar'
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: p.moneda || 'USD', maximumFractionDigits: 0 }).format(p.precio)
  }
  function quedan(p) {
    const dias = Math.ceil((p.vence - Date.now()) / DIA)
    return dias <= 1 ? 'Último día' : `Quedan ${dias} días`
  }
  const numero = (n) => new Intl.NumberFormat('es-AR').format(n)

  /** Las fotos de la oportunidad (la galería completa; las viejas, solo la portada). */
  function galeria(p) {
    if (p.detalle?.fotos?.length) return p.detalle.fotos
    return p.foto ? [p.foto] : []
  }

  /** Los datos con su nombre: "Terreno 546 m²", "Dormitorios 3"… solo los que hay. */
  function fichaTecnica(p) {
    const d = p.detalle
    if (!d) return p.m2 ? [['Superficie', `${numero(p.m2)}&nbsp;m²`]] : []
    return [
      d.m2Terreno ? ['Terreno', `${numero(d.m2Terreno)}&nbsp;m²`] : null,
      d.m2Cubiertos ? ['Cubiertos', `${numero(d.m2Cubiertos)}&nbsp;m²`] : null,
      d.ambientes ? ['Ambientes', d.ambientes] : null,
      p.dormitorios ? ['Dormitorios', p.dormitorios] : null,
      p.banos ? ['Baños', p.banos] : null,
      d.cocheras ? ['Cocheras', d.cocheras] : null,
    ].filter(Boolean)
  }

  /** En un lote, el precio por m² de terreno: lo primero que mira un colega. */
  function porMetro(p) {
    const terreno = p.detalle?.m2Terreno ?? (p.grupo === 'Lote' ? p.m2 : null)
    if (p.grupo !== 'Lote' || !p.precio || !terreno) return ''
    return `${p.moneda === 'ARS' ? '$' : 'US$'}&nbsp;${numero(Math.round(p.precio / terreno))}/m²`
  }

  const fichaHtml = (p) => {
    const filas = fichaTecnica(p)
    return filas.length ? `<dl class="ficha-tecnica">${filas.map(([r, v]) => `<div><dt>${r}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''
  }

  function imagen(url, { tamanos, urgente = false, anchoBase = 640 }) {
    const juego = [360, 640, 828, 1080].map((w) => `${optimizada(url, w)} ${w}w`).join(', ')
    return `<img src="${esc(optimizada(url, anchoBase))}" srcset="${esc(juego)}" sizes="${tamanos}" data-original="${esc(url)}" alt="" width="640" height="480" decoding="async" ${urgente ? 'fetchpriority="high"' : 'loading="lazy"'}>`
  }

  /** Las fotos que se deslizan con el dedo (y con flechas en la compu); un toque las abre grandes. */
  /**
   * `abreFicha`: en la tarjeta, tocar la foto abre la ficha de la propiedad
   * (David, 14-oct-2026); las flechas y el dedo siguen pasando las fotos. En
   * el detalle, la foto se abre grande en el visor.
   */
  function carrusel(p, { tamanos, urgente = false, abreFicha = false }) {
    const fotos = galeria(p)
    if (fotos.length === 0) return `<div class="sin-foto" aria-hidden="true">${esc(p.tipo)}</div>`
    const n = fotos.length
    const foto = (u, i) => imagen(u, { tamanos, urgente: urgente && i === 0 })
    return `<div class="carrusel">
      <div class="carrusel-pista">${fotos
        .map((u, i) =>
          abreFicha && p.ficha
            ? `<a class="carrusel-foto" href="${esc(p.ficha)}" target="_blank" rel="noopener" aria-label="Abrir la ficha (foto ${i + 1} de ${n})">${foto(u, i)}</a>`
            : `<button type="button" class="carrusel-foto" data-accion="visor" data-indice="${i}" aria-label="Ver la foto ${i + 1} de ${n}">${foto(u, i)}</button>`,
        )
        .join('')}</div>
      ${n > 1 ? `<span class="contador">1/${n}</span><button type="button" class="flecha anterior" data-mover="-1" aria-label="Foto anterior">‹</button><button type="button" class="flecha siguiente" data-mover="1" aria-label="Foto siguiente">›</button>` : ''}
    </div>`
  }

  // El contador "3/8" sigue al dedo.
  document.addEventListener(
    'scroll',
    (e) => {
      const pista = e.target
      if (!(pista instanceof Element) || !pista.matches('.carrusel-pista, .visor-pista')) return
      const total = pista.children.length
      const actual = Math.min(total, Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth)) + 1)
      const contador = pista.matches('.visor-pista') ? $('#visorContador') : pista.parentElement.querySelector('.contador')
      if (contador) contador.textContent = `${actual}/${total}`
    },
    true,
  )

  const esNueva = (p) => Date.now() - p.creada < 2 * DIA

  function datos(p) {
    return [
      p.m2 ? `${new Intl.NumberFormat('es-AR').format(p.m2)}&nbsp;m²` : '',
      p.dormitorios ? `${p.dormitorios}&nbsp;dorm.` : '',
      p.banos ? `${p.banos}&nbsp;${p.banos === 1 ? 'baño' : 'baños'}` : '',
    ].filter(Boolean)
  }
  const iniciales = (nombre) =>
    String(nombre || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0] || '').join('').toUpperCase()
  const esMia = (p) => Boolean(sesion && p.agente.id === sesion.agente.id)
  /** Para eliminar alcanza con ser la misma persona en otro teléfono (mismo WhatsApp). */
  const puedoEliminar = (p) => Boolean(sesion && (esMia(p) || p.agente.whatsapp === sesion.agente.whatsapp))

  function enlaceWhatsapp(p) {
    const primerNombre = String(p.agente.nombre).trim().split(/\s+/)[0]
    const quien = sesion ? ` Soy ${sesion.agente.nombre}, de ${sesion.inmobiliaria.nombre}.` : ''
    const texto = `Hola ${primerNombre}.${quien} Vi tu propiedad en la Ronda Funes Roldán: ${p.titulo} (${precio(p)}). ¿Sigue disponible?`
    return `https://wa.me/549${p.agente.whatsapp}?text=${encodeURIComponent(texto)}`
  }

  const optimizada = (url, ancho) => `/_next/image?url=${encodeURIComponent(url)}&w=${ancho}&q=70`
  function foto(p, { tamanos, urgente = false }) {
    if (!p.foto) return `<div class="sin-foto" aria-hidden="true">${esc(p.tipo)}</div>`
    const juego = [360, 640, 828].map((w) => `${optimizada(p.foto, w)} ${w}w`).join(', ')
    return `<img src="${esc(optimizada(p.foto, 640))}" srcset="${esc(juego)}" sizes="${tamanos}" data-original="${esc(p.foto)}" alt="" width="640" height="480" decoding="async" ${urgente ? 'fetchpriority="high"' : 'loading="lazy"'}>`
  }
  // Si el optimizador no puede con una foto, se muestra la original.
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target
      if (!(img instanceof HTMLImageElement) || !img.dataset.original) return
      const original = img.dataset.original
      delete img.dataset.original
      img.removeAttribute('srcset')
      img.src = original
    },
    true,
  )

  const ICONO_PIN =
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.5" fill="currentColor"/></svg>'
  /** La dirección exacta: solo para los colegas (la ficha del cliente no la lleva). */
  const direccionHtml = (p) => (p.direccion ? `<p class="direccion">${ICONO_PIN}<span>${esc(p.direccion)}</span></p>` : '')
  const ICONO_WHATSAPP =
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 3a9 9 0 0 0-7.800 13.500L3 21l4.700-1.200A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'

  // ── Grilla ────────────────────────────────────────────────────────────
  function filtradas() {
    const texto = sinTildes(filtro.texto)
    const lista = vigentes().filter(
      (p) =>
        (!filtro.tipo || p.grupo === filtro.tipo) &&
        (!filtro.ciudad || p.ciudad === filtro.ciudad) &&
        (!texto || sinTildes(`${p.titulo} ${p.tipo} ${p.oportunidad} ${p.direccion ?? ''} ${p.agente.nombre} ${p.inmobiliaria.nombre}`).includes(texto)),
    )
    if (!filtro.orden) return lista.sort((a, b) => b.creada - a.creada)
    const signo = filtro.orden === 'precio-asc' ? 1 : -1
    // Las que no tienen precio van al final en los dos órdenes.
    return lista.sort((a, b) => {
      if (Boolean(a.precio) !== Boolean(b.precio)) return a.precio ? -1 : 1
      if (!a.precio) return b.creada - a.creada
      return signo * (a.precio - b.precio) || b.creada - a.creada
    })
  }

  function tarjeta(p, indice) {
    const mia = esMia(p)
    const metro = porMetro(p)
    return `<article class="tarjeta" data-id="${esc(p.id)}">
      <div class="tarjeta-foto">
        ${carrusel(p, { tamanos: '(min-width: 1000px) 370px, (min-width: 640px) 50vw, 100vw', urgente: indice < 2, abreFicha: true })}
        <span class="insignia">${esc(p.tipo)} · ${esc(p.operacion)}</span>
        <span class="insignia tiempo">${esNueva(p) ? 'Nueva · ' : ''}${quedan(p)}</span>
      </div>
      <div class="tarjeta-cuerpo">
        <div><h3>${esc(p.titulo)}</h3>${direccionHtml(p)}</div>
        <p class="precio">${precio(p)}${metro ? ` <small>${metro}</small>` : ''}</p>
        ${fichaHtml(p) || '<div aria-hidden="true"></div>'}
        ${p.oportunidad ? `<div class="oportunidad"><b>Por qué es oportunidad</b><p>${esc(p.oportunidad)}</p><button type="button" class="enlace ver-mas" data-ver-mas aria-expanded="false" hidden>Ver más</button></div>` : '<div aria-hidden="true"></div>'}
        <div class="colega">
          <span class="avatar" aria-hidden="true">${esc(iniciales(p.agente.nombre))}</span>
          <div><small class="rotulo-publica">Publica</small><strong>${esc(p.agente.nombre)}</strong><small>${esc(p.inmobiliaria.nombre)}</small></div>
          ${mia ? '<span class="tuya">Tuya</span>' : ''}
        </div>
        <div class="acciones">
          ${
            mia
              ? '<button type="button" class="boton suave" data-accion="reemplazar">Reemplazar (arranca de cero)</button>'
              : `<a class="boton whatsapp" href="${esc(enlaceWhatsapp(p))}" target="_blank" rel="noopener">${ICONO_WHATSAPP}Consultarle al colega</a>
          <button type="button" class="boton suave" data-accion="copiar">Copiar ficha para mi cliente</button>`
          }
          ${puedoEliminar(p) ? `<button type="button" class="boton suave" data-baja="${esc(p.id)}">Eliminar</button>` : ''}
          <button type="button" class="enlace" data-accion="detalle">Ver todo</button>
        </div>
      </div>
    </article>`
  }

  /**
   * En la tarjeta el motivo muestra 3 renglones (David, 15-oct-2026: "comprimí el
   * cuadro… y poné ver más"): el "Ver más" aparece solo si el texto no entra.
   */
  function marcarMotivosLargos() {
    for (const caja of $$('.tarjeta .oportunidad')) {
      const texto = $('p', caja)
      const boton = $('[data-ver-mas]', caja)
      if (!texto || !boton || caja.classList.contains('abierta')) continue
      boton.hidden = texto.scrollHeight <= texto.clientHeight + 1
    }
  }
  let medirMotivos = 0
  window.addEventListener('resize', () => {
    clearTimeout(medirMotivos)
    medirMotivos = setTimeout(marcarMotivosLargos, 150)
  })

  const esqueleto = () =>
    Array.from({ length: 3 }, () => '<div class="tarjeta esqueleto" aria-hidden="true"><div class="tarjeta-foto"></div><div class="tarjeta-cuerpo"><i></i><i></i><i></i></div></div>').join('')

  /** Actividad real del mes, arriba de la grilla (David, 14-oct-2026). Sin datos del servidor, no se muestra. */
  function pintarActividad() {
    const caja = $('#actividad')
    if (!actividad || !Array.isArray(publicaciones)) {
      caja.hidden = true
      return
    }
    const mes = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(`${actividad.mes}-15T12:00:00`))
    const activas = vigentes().length
    const { colegas, inmobiliarias } = actividad
    const datos = [
      [activas, activas === 1 ? 'oportunidad activa' : 'oportunidades activas'],
      [actividad.contactos, `${actividad.contactos === 1 ? 'contacto' : 'contactos'} entre colegas en ${mes}`],
      [actividad.fichas, `${actividad.fichas === 1 ? 'ficha enviada' : 'fichas enviadas'} a clientes en ${mes}`],
      [colegas, `${colegas === 1 ? 'colega' : 'colegas'} de ${numero(inmobiliarias)} ${inmobiliarias === 1 ? 'inmobiliaria' : 'inmobiliarias'}`],
    ]
    caja.innerHTML = datos.map(([n, rotulo]) => `<div><dt>${esc(rotulo)}</dt><dd>${numero(n)}</dd></div>`).join('')
    caja.hidden = false
  }

  function pintar() {
    pintarActividad()
    const grilla = $('#grilla')
    const conteo = $('#conteo')
    for (const b of $$('#filtroTipo button')) b.setAttribute('aria-pressed', String(b.dataset.tipo === filtro.tipo))
    for (const b of $$('#filtroCiudad button')) b.setAttribute('aria-pressed', String(b.dataset.ciudad === filtro.ciudad))

    if (publicaciones === null) {
      conteo.textContent = 'Cargando…'
      grilla.innerHTML = esqueleto()
      return
    }
    if (publicaciones === 'error') {
      conteo.textContent = ''
      grilla.innerHTML =
        '<div class="vacio"><strong>No se pudo cargar la ronda</strong><p>Revisá tu conexión y probá de nuevo.</p><button type="button" class="boton primario" data-reintentar>Reintentar</button></div>'
      return
    }
    const todas = vigentes()
    const lista = filtradas()
    conteo.textContent = todas.length === 0 ? '' : lista.length === 1 ? '1 oportunidad' : `${lista.length} oportunidades`
    if (lista.length > 0) {
      grilla.innerHTML = lista.map(tarjeta).join('')
      marcarMotivosLargos()
    } else if (todas.length === 0) {
      grilla.innerHTML =
        '<div class="vacio"><strong>Todavía no hay oportunidades este mes</strong><p>Publicá la primera: pegás el enlace del aviso, contás por qué es una oportunidad y queda 30 días a la vista de los colegas.</p><button type="button" class="boton primario" data-publicar>+ Publicar oportunidad</button></div>'
    } else {
      grilla.innerHTML =
        '<div class="vacio"><strong>No hay oportunidades con esos filtros</strong><p>Probá con otra ciudad u otro tipo.</p><button type="button" class="boton suave" data-quitar-filtros>Quitar filtros</button></div>'
    }
  }

  // ── Avisos y portapapeles ─────────────────────────────────────────────
  function avisar(texto) {
    const el = $('#aviso')
    el.textContent = texto
    el.classList.add('visible')
    clearTimeout(avisar.reloj)
    avisar.reloj = setTimeout(() => el.classList.remove('visible'), 4200)
  }

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      const campo = Object.assign(document.createElement('textarea'), { value: texto })
      campo.setAttribute('readonly', '')
      campo.style.cssText = 'position:fixed;opacity:0'
      // Dentro de un diálogo abierto el resto de la página está inerte.
      ;(document.querySelector('dialog[open]') || document.body).append(campo)
      campo.select()
      const ok = document.execCommand('copy')
      campo.remove()
      return ok
    }
  }

  async function copiarFicha(p) {
    if (await copiar(p.ficha)) {
      anotar('ficha', p.id)
      avisar('Enlace de la ficha copiado. Pegalo en el WhatsApp de tu cliente.')
    } else {
      avisar(`No se pudo copiar. La ficha es ${p.ficha}`)
    }
  }

  function ocupado(boton, si) {
    boton.disabled = si
    boton.classList.toggle('cargando', si)
    boton.setAttribute('aria-busy', String(si))
  }

  function error(id, texto) {
    const el = $(`#${id}`)
    el.textContent = texto || ''
    el.hidden = !texto
  }

  function abrir(dialogo) {
    if (!dialogo.open) dialogo.showModal()
  }

  // ── Ingreso: quién sos ────────────────────────────────────────────────
  const ingreso = $('#ingreso')
  const formIngreso = $('#ingresoForm')
  /** La inmobiliaria elegida de la lista, o null si se está registrando una nueva. */
  let elegida = null

  function normalizarWhatsapp(crudo) {
    let d = String(crudo ?? '').replace(/\D/g, '')
    if (d.length > 10 && d.startsWith('54')) d = d.slice(2)
    if (d.length > 10 && d.startsWith('9')) d = d.slice(1)
    if (d.length > 10 && d.startsWith('0')) d = d.slice(1)
    if (d.length === 12) {
      for (const largo of [2, 3, 4]) {
        if (d.slice(largo, largo + 2) === '15') {
          d = d.slice(0, largo) + d.slice(largo + 2)
          break
        }
      }
    }
    return /^[1-9]\d{9}$/.test(d) ? d : null
  }

  function elegirInmobiliaria(inmo) {
    elegida = inmo
    const caja = $('#inmoElegida')
    $('#inmoNombre').hidden = Boolean(inmo)
    caja.hidden = !inmo
    $('#inmoLista').hidden = true
    $('#inmoNombre').setAttribute('aria-expanded', 'false')
    if (inmo) {
      $('strong', caja).textContent = inmo.nombre
      $('small', caja).textContent = `Matriculado a cargo: ${inmo.matriculado} · Mat. ${inmo.matricula}`
      $('#inmoNueva').hidden = true
      error('inmoError', '')
    }
  }

  function sugerir() {
    const campo = $('#inmoNombre')
    const lista = $('#inmoLista')
    const texto = campo.value.trim()
    const termino = sinTildes(texto)
    const coinciden = (termino ? inmobiliarias.filter((i) => sinTildes(i.nombre).includes(termino)) : inmobiliarias).slice(0, 8)
    const exacta = inmobiliarias.some((i) => sinTildes(i.nombre) === termino)
    const filas = coinciden.map(
      (i) =>
        `<button type="button" role="option" data-id="${esc(i.id)}"><strong>${esc(i.nombre)}</strong><small>Matriculado: ${esc(i.matriculado)}</small></button>`,
    )
    if (texto.length >= 2 && !exacta) {
      filas.push(`<button type="button" role="option" class="nueva" data-nueva>+ Registrar «${esc(texto)}» como inmobiliaria nueva</button>`)
    }
    lista.innerHTML = filas.join('')
    lista.hidden = filas.length === 0
    campo.setAttribute('aria-expanded', String(filas.length > 0))
  }

  function registrarNueva() {
    $('#inmoLista').hidden = true
    $('#inmoNombre').setAttribute('aria-expanded', 'false')
    $('#inmoNueva').hidden = false
  }

  $('#inmoNombre').addEventListener('input', () => {
    $('#inmoNueva').hidden = true
    error('inmoError', '')
    sugerir()
  })
  $('#inmoNombre').addEventListener('focus', sugerir)
  $('#inmoNombre').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      $('#inmoLista button')?.focus()
    }
  })
  $('#inmoLista').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const botones = $$('#inmoLista button')
    const i = botones.indexOf(document.activeElement) + (e.key === 'ArrowDown' ? 1 : -1)
    ;(botones[i] || (i < 0 ? $('#inmoNombre') : botones[botones.length - 1])).focus()
  })
  $('#inmoLista').addEventListener('click', (e) => {
    const boton = e.target.closest('button')
    if (!boton) return
    if (boton.hasAttribute('data-nueva')) {
      registrarNueva()
      $('#matriculado').focus()
      return
    }
    const inmo = inmobiliarias.find((i) => i.id === boton.dataset.id)
    if (inmo) {
      elegirInmobiliaria(inmo)
      $('#nombre').focus()
    }
  })
  $('#inmoCambiar').addEventListener('click', () => {
    elegirInmobiliaria(null)
    const campo = $('#inmoNombre')
    campo.value = ''
    campo.focus()
  })

  async function abrirIngreso() {
    const editar = Boolean(sesion)
    $('#ingresoTitulo').textContent = editar ? 'Tus datos' : 'Antes de entrar, contanos quién sos'
    $('#ingresoAyuda').textContent = editar
      ? 'Si cambiás tu WhatsApp, tus publicaciones se actualizan solas.'
      : 'Lo cargás una sola vez. Los colegas te van a escribir a ese WhatsApp.'
    $('button[type="submit"]', formIngreso).textContent = editar ? 'Guardar' : 'Entrar a la ronda'
    $('[data-cerrar]', ingreso).hidden = !editar
    for (const id of ['inmoError', 'matriculadoError', 'matriculaError', 'nombreError', 'whatsappError', 'ingresoError']) error(id, '')
    formIngreso.reset()
    $('#inmoNueva').hidden = true
    elegirInmobiliaria(editar ? sesion.inmobiliaria : null)
    if (editar) {
      $('#nombre').value = sesion.agente.nombre
      $('#whatsapp').value = sesion.agente.whatsapp
    }
    abrir(ingreso)
    try {
      inmobiliarias = (await api('inmobiliarias')).inmobiliarias || []
    } catch {
      // Sin la lista se puede registrar igual: el servidor no duplica nombres.
    }
  }

  // Sin datos no se entra: Esc no cierra la primera vez.
  ingreso.addEventListener('cancel', (e) => {
    if (!sesion) e.preventDefault()
  })
  ingreso.addEventListener('close', () => {
    if (!sesion && acceso) abrir(ingreso)
  })

  formIngreso.addEventListener('submit', async (e) => {
    e.preventDefault()
    const boton = $('button[type="submit"]', formIngreso)
    const nombreInmo = $('#inmoNombre').value.trim()
    const nombre = $('#nombre').value.trim()
    const whatsapp = normalizarWhatsapp($('#whatsapp').value)

    // Si escribió el nombre exacto de una que ya está, es esa.
    if (!elegida && nombreInmo) {
      const exacta = inmobiliarias.find((i) => sinTildes(i.nombre) === sinTildes(nombreInmo))
      if (exacta) elegirInmobiliaria(exacta)
    }
    const nueva = !elegida
    // No estaba en la lista y todavía no vio los datos del matriculado: se los pedimos.
    if (nueva && nombreInmo.length >= 2 && $('#inmoNueva').hidden) {
      registrarNueva()
      $('#matriculado').focus()
      return
    }

    const errores = [
      ['inmoError', 'inmoNombre', nueva && nombreInmo.length < 2 ? 'Escribí el nombre de tu inmobiliaria y elegila de la lista.' : ''],
      ['matriculadoError', 'matriculado', nueva && nombreInmo.length >= 2 && $('#matriculado').value.trim().length < 3 ? 'Escribí el nombre del matriculado a cargo.' : ''],
      ['matriculaError', 'matricula', nueva && nombreInmo.length >= 2 && !$('#matricula').value.trim() ? 'Escribí el número de matrícula.' : ''],
      ['nombreError', 'nombre', nombre.length < 3 ? 'Escribí tu nombre y apellido.' : ''],
      ['whatsappError', 'whatsapp', whatsapp ? '' : 'Escribilo con característica, sin 0 y sin 15. Ejemplo: 3413340916'],
    ]
    for (const [id, , texto] of errores) error(id, texto)
    error('ingresoError', '')
    const primero = errores.find(([, , texto]) => texto)
    if (primero) {
      const campo = $(`#${primero[1]}`)
      campo.focus({ preventScroll: true })
      campo.closest('.campo').scrollIntoView({ block: 'center' })
      return
    }

    ocupado(boton, true)
    try {
      const primeraVez = !sesion
      const datos = await api('ingresar', {
        metodo: 'POST',
        cuerpo: {
          nombre,
          whatsapp,
          ...(elegida
            ? { inmobiliariaId: elegida.id }
            : { inmobiliaria: { nombre: nombreInmo, matriculado: $('#matriculado').value.trim(), matricula: $('#matricula').value.trim() } }),
        },
      })
      sesion = { token: datos.token, agente: datos.agente, inmobiliaria: datos.inmobiliaria }
      guardarLocal(CLAVES.sesion, sesion)
      ingreso.close()
      pintarPerfil()
      pintar()
      if (primeraVez) {
        if (!leerLocal(CLAVES.guia, false)) abrir($('#guia'))
        avisar(`¡Listo, ${nombre.split(/\s+/)[0]}! Ya estás en la ronda.`)
      } else {
        avisar('Datos guardados.')
        cargar({ fresco: true })
      }
    } catch (err) {
      // La inmobiliaria elegida ya no existe: se vuelve a elegir.
      if (err.status === 404) elegirInmobiliaria(null)
      error('ingresoError', err.message)
    } finally {
      ocupado(boton, false)
    }
  })

  function pintarPerfil() {
    const boton = $('#abrirPerfil')
    boton.hidden = !sesion
    if (sesion) {
      boton.textContent = iniciales(sesion.agente.nombre)
      boton.setAttribute('aria-label', `Mis datos: ${sesion.agente.nombre}, ${sesion.inmobiliaria.nombre}`)
    }
  }
  $('#abrirPerfil').addEventListener('click', abrirIngreso)

  function sesionVencida() {
    sesion = null
    guardarLocal(CLAVES.sesion, null)
    pintarPerfil()
    for (const d of $$('dialog[open]')) if (d !== ingreso) d.close()
    abrirIngreso()
  }

  // ── Clave de acceso ───────────────────────────────────────────────────
  const dialogoClave = $('#clave')

  function pedirClave() {
    acceso = null
    guardarLocal(CLAVES.acceso, null)
    for (const d of $$('dialog[open]')) if (d !== dialogoClave) d.close()
    error('claveError', '')
    abrir(dialogoClave)
  }

  // Sin clave no se entra: Esc no la cierra.
  dialogoClave.addEventListener('cancel', (e) => e.preventDefault())
  dialogoClave.addEventListener('close', () => {
    if (!acceso) abrir(dialogoClave)
  })

  $('#claveForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const campo = $('#claveCampo')
    const clave = campo.value.trim()
    if (!clave) {
      error('claveError', 'Escribí la clave de acceso.')
      campo.focus()
      return
    }
    const boton = $('button[type="submit"]', e.target)
    error('claveError', '')
    ocupado(boton, true)
    try {
      const datos = await api('entrar', { metodo: 'POST', cuerpo: { clave } })
      acceso = datos.acceso
      guardarLocal(CLAVES.acceso, acceso)
      campo.value = ''
      dialogoClave.close()
      publicaciones = null
      pintar()
      cargar()
      if (!sesion) abrirIngreso()
    } catch (err) {
      error('claveError', err.message)
      campo.focus()
    } finally {
      ocupado(boton, false)
    }
  })

  // ── Guía ──────────────────────────────────────────────────────────────
  $('#abrirGuia').addEventListener('click', () => abrir($('#guia')))
  $('#guia').addEventListener('close', () => guardarLocal(CLAVES.guia, true))

  // ── Publicar ──────────────────────────────────────────────────────────
  const publicar = $('#publicar')
  const pasoEnlace = $('#pasoEnlace')
  const pasoConfirmar = $('#pasoConfirmar')
  /** El aviso ya leído (paso 2) y su link. */
  let revisado = null
  /** La oportunidad propia que se está reemplazando (la nueva arranca de cero y esta sale). */
  let reemplazando = null

  function origenDeLink(url) {
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:' || u.username || u.password || u.port) return null
      const host = u.hostname.toLowerCase()
      if (/(^|\.)ficha\.info$/.test(host) && u.pathname.startsWith('/p/')) return 'tokko'
      if (/(^|\.)siinmobiliaria\.com$/.test(host) && /^\/propiedades\/\d+/.test(u.pathname)) return 'web'
      // Zonaprop: se convierte solo si ya lo teníamos leído; el servidor avisa si no.
      if (/(^|\.)zonaprop\.com\.ar$/.test(host) && /-\d{6,12}\.html$/.test(u.pathname)) return 'zonaprop'
    } catch {
      // no es un enlace
    }
    return null
  }

  const deMiInmobiliaria = () => (sesion ? vigentes().filter((p) => p.inmobiliaria.id === sesion.inmobiliaria.id) : [])

  function pintarCupo() {
    const usadas = deMiInmobiliaria().filter((p) => p.id !== reemplazando?.id)
    const lleno = usadas.length >= MAX_POR_INMOBILIARIA
    const nota = $('#reemplazoNota')
    nota.hidden = !reemplazando
    nota.textContent = reemplazando ? `Vas a reemplazar «${reemplazando.titulo}». La nueva arranca con 30 días y la anterior sale de la ronda.` : ''
    $('#cupo').textContent = `${sesion.inmobiliaria.nombre} usa ${usadas.length} de ${MAX_POR_INMOBILIARIA} lugares en la ronda.`
    $('#pasoLleno').hidden = !lleno
    $('#llenoNota').textContent = `Tu inmobiliaria ya tiene ${MAX_POR_INMOBILIARIA} oportunidades en la ronda, que es el máximo. Para publicar otra, reemplazá una (la nueva arranca de cero) o dala de baja.`
    if (lleno) {
      pasoEnlace.hidden = true
      pasoConfirmar.hidden = true
      $('#propias').innerHTML = usadas
        .map(
          (p) =>
            `<li><div><strong>${esc(p.titulo)}</strong><small>${esc(p.agente.nombre)} · ${quedan(p).toLowerCase()}</small></div>${
              esMia(p) ? `<span class="botones-propias"><button type="button" class="boton suave" data-reemplazar="${esc(p.id)}">Reemplazar</button><button type="button" class="enlace" data-baja="${esc(p.id)}">Eliminar</button></span>` : ''
            }</li>`,
        )
        .join('')
    }
    return lleno
  }

  function mostrarPasoEnlace() {
    revisado = null
    pasoConfirmar.hidden = true
    pasoEnlace.hidden = false
    error('enlaceError', '')
    $('#leyendo').hidden = true
  }

  function abrirPublicar(opciones = {}) {
    if (!sesion) {
      abrirIngreso()
      return
    }
    reemplazando = opciones.reemplaza || null
    $('#publicarTitulo').textContent = reemplazando ? 'Reemplazar una oportunidad' : 'Publicar una oportunidad'
    pasoEnlace.reset()
    pasoConfirmar.reset()
    mostrarPasoEnlace()
    pintarCupo()
    abrir(publicar)
  }

  publicar.addEventListener('close', () => {
    reemplazando = null
  })

  if (navigator.clipboard?.readText) {
    const pegar = $('#pegar')
    pegar.hidden = false
    pegar.addEventListener('click', async () => {
      try {
        const texto = (await navigator.clipboard.readText()).trim()
        if (texto) $('#enlace').value = texto
      } catch {
        // Sin permiso: se pega a mano.
      }
      $('#enlace').focus()
    })
  }

  function publicada(publicacion, reemplazada) {
    recienPublicadas.set(publicacion.id, publicacion)
    if (reemplazada) {
      recienBajadas.set(reemplazada, Date.now())
      recienPublicadas.delete(reemplazada)
    }
    publicaciones = [publicacion, ...vigentes().filter((p) => p.id !== publicacion.id && p.id !== reemplazada)]
    publicar.close()
    if (detalle.open) detalle.close()
    pintar()
    avisar(reemplazada ? 'Listo. La reemplazaste: la nueva queda 30 días en la ronda.' : 'Listo. Tu oportunidad queda en la ronda por 30 días.')
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  pasoEnlace.addEventListener('submit', async (e) => {
    e.preventDefault()
    const url = $('#enlace').value.trim()
    // Se publica SOLO pegando el link (David, 14-oct-2026): no hay carga a mano.
    if (!origenDeLink(url)) {
      error('enlaceError', url ? 'Ese enlace no se puede leer. Pegá el aviso de Zonaprop o la ficha de Tokko.' : 'Pegá el enlace de la propiedad.')
      $('#enlace').focus()
      return
    }
    error('enlaceError', '')
    const boton = $('button[type="submit"]', pasoEnlace)
    ocupado(boton, true)
    $('#leyendo').hidden = false
    try {
      const { aviso } = await api('leer', { metodo: 'POST', cuerpo: { url, reemplaza: reemplazando?.id } })
      revisado = { url, aviso }
      const hechos = datos(aviso)
      $('#vista').innerHTML = `
        ${foto(aviso, { tamanos: '(min-width: 700px) 500px, 100vw', urgente: true })}
        <div>
          <strong>${esc(aviso.tipo)} en ${esc(String(aviso.operacion).toLowerCase())}${aviso.barrio ? ` · ${esc(aviso.barrio)}` : ''}</strong>
          <p class="precio">${precio(aviso)}</p>
          <ul class="datos">${[...hechos, `${aviso.fotos}&nbsp;fotos`].map((d) => `<li>${d}</li>`).join('')}</ul>
        </div>`
      pasoConfirmar.reset()
      for (const radio of $$('input[name="ciudad"]', pasoConfirmar)) radio.checked = radio.value === aviso.ciudad
      const deTokko = origenDeLink(url) === 'tokko'
      $('#comoSeComparte').textContent = deTokko
        ? 'Es una ficha de Tokko: a tus colegas les llega tal cual, la ficha original.'
        : 'Se convierte sola en una ficha neutra, sin logos ni datos tuyos, para que cualquier colega se la mande a su cliente.'
      for (const id of ['ciudadError', 'motivoError', 'publicarError']) error(id, '')
      // Copia guardada (Zonaprop): puede tener un precio viejo, se deja corregir.
      $('#campoPrecio').hidden = !aviso.leidoEl
      if (aviso.leidoEl) {
        $('#precioLeido').value = aviso.precio ? new Intl.NumberFormat('es-AR').format(aviso.precio) : ''
        $('#precioMoneda').textContent = aviso.moneda === 'ARS' ? '$' : 'US$'
        $('#precioAyuda').textContent = `Leímos este aviso el ${fechaCorta(new Date(aviso.leidoEl))}. Si cambió el precio, corregilo acá.`
      }
      pasoEnlace.hidden = true
      pasoConfirmar.hidden = false
      $('#publicando').hidden = true
      ;(aviso.ciudad ? $('#oportunidad') : $('input[name="ciudad"]', pasoConfirmar)).focus({ preventScroll: true })
    } catch (err) {
      if (err.status === 401) return err.datos?.acceso ? undefined : sesionVencida()
      if (err.datos?.limite) {
        await cargar({ fresco: true })
        pintarCupo()
      } else if (err.datos?.aMano) {
        error('enlaceError', `${err.message} Probá con otro enlace: el aviso vigente de Zonaprop o la ficha de Tokko.`)
      } else {
        error('enlaceError', err.message)
      }
    } finally {
      ocupado(boton, false)
      $('#leyendo').hidden = true
    }
  })

  $('#cambiarEnlace').addEventListener('click', () => {
    mostrarPasoEnlace()
    $('#enlace').focus()
  })


  const MOTIVO_MINIMO = 25
  /** El motivo de la oportunidad es obligatorio (regla de David). Devuelve el error o ''. */
  function errorDeMotivo(texto) {
    if (!texto) return 'Escribí por qué es una oportunidad: es obligatorio.'
    if (texto.length < MOTIVO_MINIMO) return 'Contá un poco más por qué es una oportunidad (precio, urgencia del dueño, permuta…).'
    return ''
  }

  // Apenas escribe el motivo, se va el aviso de que falta.
  $('#oportunidad').addEventListener('input', () => error('motivoError', ''))

  pasoConfirmar.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!revisado) return
    const ciudad = $('input[name="ciudad"]:checked', pasoConfirmar)?.value
    if (!ciudad) {
      error('ciudadError', 'Elegí si está en Funes o en Roldán.')
      $('input[name="ciudad"]', pasoConfirmar).focus()
      return
    }
    const faltaMotivo = errorDeMotivo($('#oportunidad').value.replace(/\s+/g, ' ').trim())
    error('motivoError', faltaMotivo)
    if (faltaMotivo) {
      $('#oportunidad').focus()
      return
    }
    for (const id of ['ciudadError', 'publicarError']) error(id, '')
    const boton = $('button[type="submit"]', pasoConfirmar)
    ocupado(boton, true)
    $('#publicando').hidden = false
    try {
      const { publicacion, reemplazada } = await api('publicaciones', {
        metodo: 'POST',
        cuerpo: {
          url: revisado.url,
          reemplaza: reemplazando?.id,
          ciudad,
          oportunidad: $('#oportunidad').value.trim(),
          ...(revisado.aviso.leidoEl ? { precio: $('#precioLeido').value.replace(/\D/g, '') } : {}),
        },
      })
      publicada(publicacion, reemplazada)
    } catch (err) {
      if (err.status === 401) return err.datos?.acceso ? undefined : sesionVencida()
      if (err.datos?.limite) {
        await cargar({ fresco: true })
        pintarCupo()
      } else if (err.datos?.aMano) {
        error('publicarError', `${err.message} Probá con otro enlace: el aviso vigente de Zonaprop o la ficha de Tokko.`)
      } else {
        error('publicarError', err.message)
      }
    } finally {
      ocupado(boton, false)
      $('#publicando').hidden = true
    }
  })

  // ── Una propiedad ─────────────────────────────────────────────────────
  const detalle = $('#detalle')
  let abierta = null

  const notas = () => leerLocal(CLAVES.notas, {})
  function fechaCorta(ms) {
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(ms)
  }

  function pintarDetalle(p) {
    abierta = p.id
    const mia = esMia(p)
    const mias = notas()[p.id] || []
    const metro = porMetro(p)
    const descripcion = p.detalle?.descripcion || ''
    $('#detalleCuerpo').innerHTML = `
      <div class="hoja-cabeza">
        <div>
          <p class="antetitulo">${esc(p.tipo)} · ${esc(p.operacion)} · ${quedan(p)}</p>
          <h2 id="detalleTitulo">${esc(p.titulo)}</h2>
          ${direccionHtml(p)}
        </div>
        <button type="button" class="cerrar" data-cerrar aria-label="Cerrar">×</button>
      </div>
      <div class="detalle-foto">${carrusel(p, { tamanos: '(min-width: 700px) 520px, 100vw', urgente: true })}</div>
      <p class="precio grande">${precio(p)}${metro ? ` <small>${metro}</small>` : ''}</p>
      ${fichaHtml(p)}
      ${p.oportunidad ? `<div class="oportunidad"><b>Por qué es oportunidad</b><p>${esc(p.oportunidad)}</p></div>` : ''}
      ${descripcion ? `<details class="bloque descripcion"><summary>Descripción</summary><p>${esc(descripcion)}</p></details>` : ''}
      <div class="bloque">
        <h3>Publica</h3>
        <div class="colega amplio">
          <span class="avatar" aria-hidden="true">${esc(iniciales(p.agente.nombre))}</span>
          <div>
            <strong>${esc(p.agente.nombre)}</strong>
            <small>${esc(p.inmobiliaria.nombre)}</small>
            <small>Matriculado a cargo: ${esc(p.inmobiliaria.matriculado)} · Mat. ${esc(p.inmobiliaria.matricula)}</small>
          </div>
        </div>
      </div>
      <div class="acciones">
        ${mia ? '<button type="button" class="boton primario" data-accion="reemplazar">Reemplazar (arranca de cero)</button>' : `<a class="boton whatsapp" href="${esc(enlaceWhatsapp(p))}" target="_blank" rel="noopener">${ICONO_WHATSAPP}Consultarle al colega</a>`}
        <button type="button" class="boton suave" data-accion="${navigator.share ? 'compartir' : 'copiar'}">${navigator.share ? 'Enviar la ficha a mi cliente' : 'Copiar ficha para mi cliente'}</button>
        <a class="boton suave" href="${esc(p.ficha)}" target="_blank" rel="noopener">${p.origen === 'Tokko' ? 'Ver la ficha de Tokko (tal cual)' : 'Ver la ficha neutra para clientes'}</a>
        ${p.urlOriginal ? `<a class="enlace" href="${esc(p.urlOriginal)}" target="_blank" rel="noopener noreferrer">Ver el aviso original</a>` : ''}
      </div>
      <form class="notas" id="notasForm">
        <h3>Mis notas</h3>
        <p class="ayuda chica">Solo las ves vos, en este teléfono.</p>
        <div class="con-boton">
          <input name="nota" maxlength="140" autocomplete="off" placeholder="Ej.: se la mandé a Laura…" aria-label="Nota nueva">
          <button class="boton suave">Guardar</button>
        </div>
        ${mias.length ? `<ul>${mias.slice().reverse().map((n) => `<li>${esc(n.nota)} <small>${fechaCorta(n.cuando)}</small></li>`).join('')}</ul>` : ''}
      </form>
      ${puedoEliminar(p) ? `<button type="button" class="boton peligro-suave" data-baja="${esc(p.id)}">Eliminar de la ronda</button>` : ''}`
  }

  // ── Fotos a pantalla completa ─────────────────────────────────────────
  const visor = $('#visor')
  function abrirVisor(p, indice) {
    const fotos = galeria(p)
    if (fotos.length === 0) return
    $('#visorPista').innerHTML = fotos
      .map((u, i) => `<div class="visor-foto">${imagen(u, { tamanos: '100vw', urgente: i === indice, anchoBase: 1080 })}</div>`)
      .join('')
    $('#visorContador').textContent = `${indice + 1}/${fotos.length}`
    abrir(visor)
    requestAnimationFrame(() => {
      const pista = $('#visorPista')
      pista.scrollLeft = indice * pista.clientWidth
    })
  }

  function abrirDetalle(p) {
    pintarDetalle(p)
    abrir(detalle)
    $('#detalleCuerpo').scrollTop = 0
  }

  detalle.addEventListener('submit', (e) => {
    if (e.target.id !== 'notasForm') return
    e.preventDefault()
    const p = vigentes().find((x) => x.id === abierta)
    const nota = String(new FormData(e.target).get('nota') || '').trim()
    if (!p || !nota) return
    const todas = notas()
    todas[p.id] = [...(todas[p.id] || []), { nota, cuando: Date.now() }].slice(-30)
    guardarLocal(CLAVES.notas, todas)
    pintarDetalle(p)
    avisar('Nota guardada.')
  })

  // ── Dar de baja ───────────────────────────────────────────────────────
  const baja = $('#baja')
  let paraBajar = null

  $('#confirmarBaja').addEventListener('click', async () => {
    if (!paraBajar) return
    const boton = $('#confirmarBaja')
    error('bajaError', '')
    ocupado(boton, true)
    try {
      await api(`publicaciones/${encodeURIComponent(paraBajar)}`, { metodo: 'DELETE' })
      recienBajadas.set(paraBajar, Date.now())
      recienPublicadas.delete(paraBajar)
      publicaciones = vigentes().filter((p) => p.id !== paraBajar)
      paraBajar = null
      baja.close()
      if (detalle.open) detalle.close()
      if (publicar.open) {
        mostrarPasoEnlace()
        pintarCupo()
      }
      pintar()
      avisar('Listo, la eliminaste de la ronda.')
    } catch (err) {
      if (err.status === 401) return err.datos?.acceso ? undefined : sesionVencida()
      error('bajaError', err.message)
    } finally {
      ocupado(boton, false)
    }
  })

  // ── Toques ────────────────────────────────────────────────────────────
  document.addEventListener('click', async (e) => {
    const t = e.target
    if (!(t instanceof Element)) return

    const cerrar = t.closest('[data-cerrar]')
    if (cerrar) {
      cerrar.closest('dialog')?.close()
      return
    }
    if (t.closest('[data-publicar]')) {
      abrirPublicar()
      return
    }
    if (t.closest('[data-reintentar]')) {
      publicaciones = null
      pintar()
      cargar({ fresco: true })
      return
    }
    if (t.closest('[data-quitar-filtros]')) {
      Object.assign(filtro, { tipo: '', ciudad: '', texto: '' })
      $('#buscar').value = ''
      filtroALaUrl()
      pintar()
      return
    }
    const verMas = t.closest('[data-ver-mas]')
    if (verMas) {
      const caja = verMas.closest('.oportunidad')
      const abierta = caja.classList.toggle('abierta')
      verMas.textContent = abierta ? 'Ver menos' : 'Ver más'
      verMas.setAttribute('aria-expanded', String(abierta))
      return
    }
    const mover = t.closest('[data-mover]')
    if (mover) {
      const pista = mover.closest('.carrusel')?.querySelector('.carrusel-pista')
      if (pista) pista.scrollBy({ left: Number(mover.dataset.mover) * pista.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      return
    }
    const aReemplazar = t.closest('[data-reemplazar]')
    if (aReemplazar) {
      const p = vigentes().find((x) => x.id === aReemplazar.dataset.reemplazar)
      // Ya está abierta la hoja de publicar: se rearma para el reemplazo (cerrarla borraría el estado).
      if (p) abrirPublicar({ reemplaza: p })
      return
    }
    const paraBaja = t.closest('[data-baja]')
    if (paraBaja) {
      paraBajar = paraBaja.dataset.baja
      error('bajaError', '')
      abrir(baja)
      return
    }
    // WhatsApp al colega: suma al contador y el enlace sigue su camino.
    const whatsapp = t.closest('a.whatsapp')
    if (whatsapp) {
      anotar('contacto', whatsapp.closest('[data-id]')?.dataset.id || abierta)
      return
    }
    const accion = t.closest('[data-accion]')
    if (!accion) return
    const id = accion.closest('[data-id]')?.dataset.id || abierta
    const p = vigentes().find((x) => x.id === id)
    if (!p) return
    if (accion.dataset.accion === 'detalle') abrirDetalle(p)
    if (accion.dataset.accion === 'visor') abrirVisor(p, Number(accion.dataset.indice) || 0)
    if (accion.dataset.accion === 'reemplazar') {
      if (detalle.open) detalle.close()
      abrirPublicar({ reemplaza: p })
    }
    if (accion.dataset.accion === 'copiar') copiarFicha(p)
    if (accion.dataset.accion === 'compartir') {
      try {
        await navigator.share({ title: p.titulo, url: p.ficha })
        anotar('ficha', p.id)
      } catch (err) {
        // Cerró la hoja de compartir: nada. Si el teléfono no pudo, se copia.
        if (err?.name !== 'AbortError') copiarFicha(p)
      }
    }
  })

  // Un toque en el fondo cierra las hojas que se pueden cerrar.
  for (const d of $$('dialog')) {
    d.addEventListener('click', (e) => {
      if (e.target === d && d !== dialogoClave && !(d === ingreso && !sesion)) d.close()
    })
  }

  // ── Filtros ───────────────────────────────────────────────────────────
  $('#filtroTipo').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tipo]')
    if (!b) return
    filtro.tipo = b.dataset.tipo
    filtroALaUrl()
    pintar()
  })
  $('#filtroCiudad').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ciudad]')
    if (!b) return
    filtro.ciudad = b.dataset.ciudad
    filtroALaUrl()
    pintar()
  })
  $('#orden').addEventListener('change', (e) => {
    filtro.orden = e.target.value
    filtroALaUrl()
    pintar()
  })
  $('#buscar').addEventListener('input', (e) => {
    filtro.texto = e.target.value.trim().slice(0, 80)
    filtroALaUrl()
    pintar()
  })

  // ── Arranque ──────────────────────────────────────────────────────────
  function semana() {
    const mes = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date())
    return `Ronda mensual · ${mes}`
  }

  $('#semana').textContent = semana()
  $('#buscar').value = filtro.texto
  $('#orden').value = filtro.orden
  pintarPerfil()
  pintar()
  // La Ronda puede estar abierta, sin clave (David, 15-oct-2026): se carga igual y,
  // si el servidor pide la clave, `api` abre esa ventana y no se pide el ingreso.
  cargar().then(() => {
    if (!sesion && !dialogoClave.open) abrirIngreso()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - ultimaCarga > 30_000) cargar()
  })
  setInterval(() => {
    if (document.visibilityState === 'visible' && !$('dialog[open]')) cargar()
  }, 120_000)
})()

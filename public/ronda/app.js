// Ronda Funes Roldán — la pantalla (verficha.casa/ronda).
//
// Página estática sin framework: habla con /api/ronda/*. La grilla es de todos;
// en el teléfono solo queda el pase del agente (quién sos) y tus notas privadas.
(() => {
  'use strict'

  const DIA = 86_400_000
  const MAX_POR_INMOBILIARIA = 3
  const CLAVES = { sesion: 'ronda.sesion.v1', guia: 'ronda.guia.v1', notas: 'ronda.notas.v1' }

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
  let sesion = leerLocal(CLAVES.sesion, null)
  if (!sesion?.token || !sesion?.agente?.id || !sesion?.inmobiliaria?.id) sesion = null
  /** null = cargando · 'error' = no se pudo · [] = la grilla */
  let publicaciones = null
  let inmobiliarias = []
  let ultimaCarga = 0
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
    // Las lecturas van sin pase: así las puede cachear el CDN.
    if (metodo !== 'GET' && sesion?.token) headers.authorization = `Bearer ${sesion.token}`
    let res
    try {
      res = await fetch(`/api/ronda/${ruta}`, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined })
    } catch {
      throw Object.assign(new Error('Sin conexión. Revisá tu internet y probá de nuevo.'), { status: 0 })
    }
    const datos = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(datos.error || 'Algo salió mal. Probá de nuevo.'), { status: res.status, datos })
    return datos
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
      ultimaCarga = ahora
    } catch {
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

  const ICONO_WHATSAPP =
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 3a9 9 0 0 0-7.800 13.500L3 21l4.700-1.200A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'

  // ── Grilla ────────────────────────────────────────────────────────────
  function filtradas() {
    const texto = sinTildes(filtro.texto)
    const lista = vigentes().filter(
      (p) =>
        (!filtro.tipo || p.grupo === filtro.tipo) &&
        (!filtro.ciudad || p.ciudad === filtro.ciudad) &&
        (!texto || sinTildes(`${p.titulo} ${p.tipo} ${p.oportunidad} ${p.agente.nombre} ${p.inmobiliaria.nombre}`).includes(texto)),
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
    const hechos = datos(p)
    return `<article class="tarjeta" data-id="${esc(p.id)}">
      <button type="button" class="tarjeta-foto" data-accion="detalle" aria-label="Ver ${esc(p.titulo)}">
        ${foto(p, { tamanos: '(min-width: 1000px) 370px, (min-width: 640px) 50vw, 100vw', urgente: indice < 2 })}
        <span class="insignia">${esc(p.tipo)} · ${esc(p.operacion)}</span>
        <span class="insignia tiempo">${quedan(p)}</span>
      </button>
      <div class="tarjeta-cuerpo">
        <h3>${esc(p.titulo)}</h3>
        <p class="precio">${precio(p)}</p>
        ${hechos.length ? `<ul class="datos">${hechos.map((d) => `<li>${d}</li>`).join('')}</ul>` : ''}
        ${p.oportunidad ? `<div class="oportunidad"><b>Oportunidad comercial</b><p>${esc(p.oportunidad)}</p></div>` : ''}
        <div class="colega">
          <span class="avatar" aria-hidden="true">${esc(iniciales(p.agente.nombre))}</span>
          <div><strong>${esc(p.agente.nombre)}</strong><small>${esc(p.inmobiliaria.nombre)}</small></div>
          ${mia ? '<span class="tuya">Tu publicación</span>' : ''}
        </div>
        <div class="acciones">
          ${mia ? '' : `<a class="boton whatsapp" href="${esc(enlaceWhatsapp(p))}" target="_blank" rel="noopener">${ICONO_WHATSAPP}WhatsApp</a>`}
          <button type="button" class="boton suave" data-accion="copiar">Copiar ficha para mi cliente</button>
          <button type="button" class="enlace" data-accion="detalle">Ver más</button>
        </div>
      </div>
    </article>`
  }

  const esqueleto = () =>
    Array.from({ length: 3 }, () => '<div class="tarjeta esqueleto" aria-hidden="true"><div class="tarjeta-foto"></div><div class="tarjeta-cuerpo"><i></i><i></i><i></i></div></div>').join('')

  function pintar() {
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
    conteo.textContent = todas.length === 0 ? '' : lista.length === 1 ? '1 propiedad' : `${lista.length} propiedades`
    if (lista.length > 0) {
      grilla.innerHTML = lista.map(tarjeta).join('')
    } else if (todas.length === 0) {
      grilla.innerHTML =
        '<div class="vacio"><strong>Todavía no hay propiedades esta semana</strong><p>Publicá la primera: pegás el enlace del aviso y queda 7 días a la vista de los colegas.</p><button type="button" class="boton primario" data-publicar>+ Publicar propiedad</button></div>'
    } else {
      grilla.innerHTML =
        '<div class="vacio"><strong>No hay propiedades con esos filtros</strong><p>Probá con otra ciudad u otro tipo.</p><button type="button" class="boton suave" data-quitar-filtros>Quitar filtros</button></div>'
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
    if (await copiar(p.ficha)) avisar('Enlace de la ficha copiado. Pegalo en el WhatsApp de tu cliente.')
    else avisar(`No se pudo copiar. La ficha es ${p.ficha}`)
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
    if (!sesion) abrir(ingreso)
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

  // ── Guía ──────────────────────────────────────────────────────────────
  $('#abrirGuia').addEventListener('click', () => abrir($('#guia')))
  $('#guia').addEventListener('close', () => guardarLocal(CLAVES.guia, true))

  // ── Publicar ──────────────────────────────────────────────────────────
  const publicar = $('#publicar')
  const pasoEnlace = $('#pasoEnlace')
  const pasoConfirmar = $('#pasoConfirmar')
  const pasoManual = $('#pasoManual')
  /** El aviso ya leído (paso 2) y su link. */
  let revisado = null

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

  /**
   * Lo que ya dice el enlace de un aviso ("…/casa-en-venta-de-3-dorm.-en-funes-123.html"):
   * tipo, operación, dormitorios y ciudad. Ahorra tipeo cuando hay que cargarla a mano.
   */
  function pistasDelEnlace(url) {
    let texto = ''
    try {
      texto = ` ${sinTildes(decodeURIComponent(new URL(url).pathname)).replace(/[^a-z0-9]+/g, ' ')} `
    } catch {
      return {}
    }
    const TIPOS = [
      ['Casa', / (casas?|chalet|duplex) /],
      ['Lote', / (terrenos?|lotes?) /],
      ['Departamento', / (departamentos?|depto|monoambiente) /],
      ['PH', / ph /],
      ['Local', / local(es)? /],
      ['Oficina', / oficinas? /],
      ['Galpón', / galpon(es)? /],
      ['Quinta', / quintas? /],
    ]
    // Gana el tipo que aparece primero ("casa … con terreno de 540 m" es una casa).
    const tipo = TIPOS.map(([nombre, re]) => [nombre, texto.search(re)]).filter(([, i]) => i >= 0).sort((x, y) => x[1] - y[1])[0]?.[0]
    const funes = / funes /.test(texto)
    const roldan = / roldan /.test(texto)
    return {
      tipo,
      operacion: / alquiler /.test(texto) && !/ venta /.test(texto) ? 'Alquiler' : 'Venta',
      dormitorios: / (\d{1,2}) dorm/.exec(texto)?.[1],
      ciudad: funes === roldan ? null : funes ? 'Funes' : 'Roldán',
    }
  }

  /** Portales que no dejan leer sus avisos: esas propiedades se cargan a mano. */
  function portalSinLectura(url) {
    try {
      const host = new URL(url).hostname.toLowerCase()
      if (/(^|\.)zonaprop\.com\.ar$/.test(host)) return 'Zonaprop'
      if (/(^|\.)argenprop\.com$/.test(host)) return 'Argenprop'
      if (/(^|\.)mercadolibre\.com(\.ar)?$/.test(host)) return 'Mercado Libre'
    } catch {
      // no es un enlace
    }
    return null
  }

  const deMiInmobiliaria = () => (sesion ? vigentes().filter((p) => p.inmobiliaria.id === sesion.inmobiliaria.id) : [])

  function pintarCupo() {
    const usadas = deMiInmobiliaria()
    const lleno = usadas.length >= MAX_POR_INMOBILIARIA
    $('#cupo').textContent = `${sesion.inmobiliaria.nombre} usa ${usadas.length} de ${MAX_POR_INMOBILIARIA} lugares esta semana.`
    $('#pasoLleno').hidden = !lleno
    $('#llenoNota').textContent = `Tu inmobiliaria ya tiene ${MAX_POR_INMOBILIARIA} propiedades en la ronda, que es el máximo. Para publicar otra, dá de baja una o esperá a que venza.`
    if (lleno) {
      pasoEnlace.hidden = true
      pasoConfirmar.hidden = true
      pasoManual.hidden = true
      $('#propias').innerHTML = usadas
        .map(
          (p) =>
            `<li><div><strong>${esc(p.titulo)}</strong><small>${esc(p.agente.nombre)} · ${quedan(p).toLowerCase()}</small></div>${
              esMia(p) ? `<button type="button" class="boton suave" data-baja="${esc(p.id)}">Dar de baja</button>` : ''
            }</li>`,
        )
        .join('')
    }
    return lleno
  }

  function mostrarPasoEnlace() {
    revisado = null
    pasoConfirmar.hidden = true
    pasoManual.hidden = true
    pasoEnlace.hidden = false
    error('enlaceError', '')
    $('#leyendo').hidden = true
  }

  function abrirPublicar() {
    if (!sesion) {
      abrirIngreso()
      return
    }
    pasoEnlace.reset()
    pasoConfirmar.reset()
    reiniciarManual()
    mostrarPasoEnlace()
    pintarCupo()
    abrir(publicar)
  }

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

  function publicada(publicacion) {
    recienPublicadas.set(publicacion.id, publicacion)
    publicaciones = [publicacion, ...vigentes().filter((p) => p.id !== publicacion.id)]
    publicar.close()
    pintar()
    avisar('Listo. Tu propiedad queda en la ronda por 7 días.')
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  pasoEnlace.addEventListener('submit', async (e) => {
    e.preventDefault()
    const url = $('#enlace').value.trim()
    if (!origenDeLink(url)) {
      // Un aviso de portal que no se convierte solo: se guarda el enlace y se pasa a la carga a mano.
      const portal = portalSinLectura(url)
      if (portal) {
        irAManual(url, `${portal} no deja leer ese aviso. Te dejamos cargado lo que dice el enlace: completá el resto y sumá las fotos.`)
        return
      }
      error('enlaceError', url ? 'Ese enlace no lo podemos leer. Pegá la ficha de Tokko o el aviso de Zonaprop, o cargala a mano.' : 'Pegá el enlace de la propiedad.')
      $('#enlace').focus()
      return
    }
    error('enlaceError', '')
    const boton = $('button[type="submit"]', pasoEnlace)
    ocupado(boton, true)
    $('#leyendo').hidden = false
    try {
      const { aviso } = await api('leer', { metodo: 'POST', cuerpo: { url } })
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
      for (const id of ['ciudadError', 'publicarError']) error(id, '')
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
      if (err.status === 401) return sesionVencida()
      if (err.datos?.limite) {
        await cargar({ fresco: true })
        pintarCupo()
      } else if (err.datos?.aMano) {
        irAManual(url, `${err.message} Te dejamos cargado lo que dice el enlace: completá el resto y sumá las fotos.`)
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

  pasoConfirmar.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!revisado) return
    const ciudad = $('input[name="ciudad"]:checked', pasoConfirmar)?.value
    if (!ciudad) {
      error('ciudadError', 'Elegí si está en Funes o en Roldán.')
      $('input[name="ciudad"]', pasoConfirmar).focus()
      return
    }
    for (const id of ['ciudadError', 'publicarError']) error(id, '')
    const boton = $('button[type="submit"]', pasoConfirmar)
    ocupado(boton, true)
    $('#publicando').hidden = false
    try {
      const { publicacion } = await api('publicaciones', {
        metodo: 'POST',
        cuerpo: {
          url: revisado.url,
          ciudad,
          oportunidad: $('#oportunidad').value.trim(),
          ...(revisado.aviso.leidoEl ? { precio: $('#precioLeido').value.replace(/\D/g, '') } : {}),
        },
      })
      publicada(publicacion)
    } catch (err) {
      if (err.status === 401) return sesionVencida()
      if (err.datos?.limite) {
        await cargar({ fresco: true })
        pintarCupo()
      } else if (err.datos?.aMano) {
        pasoConfirmar.hidden = true
        irAManual(revisado.url, `${err.message} Completá los datos y sumá las fotos desde tu teléfono.`)
      } else {
        error('publicarError', err.message)
      }
    } finally {
      ocupado(boton, false)
      $('#publicando').hidden = true
    }
  })

  // ── Publicar a mano (fotos del teléfono) ──────────────────────────────
  const MAX_FOTOS = 10
  /** { id, vista, url, subiendo } — la primera es la portada. */
  let fotosManual = []

  // El teléfono achica la foto antes de subirla: una de 8 MB queda en ~300 KB.
  async function achicar(archivo) {
    let imagen
    try {
      imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
    } catch {
      imagen = await new Promise((ok, mal) => {
        const img = new Image()
        img.onload = () => ok(img)
        img.onerror = () => mal(new Error('imagen'))
        img.src = URL.createObjectURL(archivo)
      })
    }
    const escala = Math.min(1, 1600 / Math.max(imagen.width, imagen.height))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(imagen.width * escala)
    lienzo.height = Math.round(imagen.height * escala)
    lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
    return new Promise((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error('imagen'))), 'image/jpeg', 0.82))
  }

  async function subirFoto(blob) {
    let res
    try {
      res = await fetch('/api/ronda/fotos', {
        method: 'POST',
        headers: { 'content-type': 'image/jpeg', authorization: `Bearer ${sesion.token}` },
        body: blob,
      })
    } catch {
      throw Object.assign(new Error('Sin conexión. Revisá tu internet y probá de nuevo.'), { status: 0 })
    }
    const datos = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(datos.error || 'No se pudo subir la foto.'), { status: res.status })
    return datos.url
  }

  function pintarFotos() {
    const caja = $('#fotos')
    for (const el of $$('.foto-chica', caja)) el.remove()
    $('#agregarFoto').insertAdjacentHTML(
      'beforebegin',
      fotosManual
        .map(
          (f, i) =>
            `<div class="foto-chica${f.subiendo ? ' subiendo' : ''}"><img src="${esc(f.vista)}" alt="Foto ${i + 1}${i === 0 ? ' (portada)' : ''}"><button type="button" data-quitar-foto="${esc(f.id)}" aria-label="Quitar la foto ${i + 1}">×</button></div>`,
        )
        .join(''),
    )
    $('#agregarFoto').hidden = fotosManual.length >= MAX_FOTOS
  }

  function reiniciarManual() {
    for (const f of fotosManual) URL.revokeObjectURL(f.vista)
    fotosManual = []
    pasoManual.reset()
    pintarFotos()
    for (const id of ['fotosError', 'tipoError', 'ciudadManualError', 'manualError']) error(id, '')
    $('#publicandoManual').hidden = true
  }

  $('#elegirFotos').addEventListener('change', async (e) => {
    const archivos = [...e.target.files].slice(0, MAX_FOTOS - fotosManual.length)
    e.target.value = ''
    error('fotosError', '')
    for (const archivo of archivos) {
      const foto = { id: `f${Date.now()}${Math.random().toString(36).slice(2, 7)}`, vista: URL.createObjectURL(archivo), url: null, subiendo: true }
      fotosManual.push(foto)
      pintarFotos()
      try {
        foto.url = await subirFoto(await achicar(archivo))
        foto.subiendo = false
      } catch (err) {
        fotosManual = fotosManual.filter((f) => f !== foto)
        URL.revokeObjectURL(foto.vista)
        if (err.status === 401) return sesionVencida()
        error('fotosError', err.message === 'imagen' ? 'Esa foto no se pudo abrir. Probá con otra.' : err.message)
      }
      pintarFotos()
    }
  })

  $('#fotos').addEventListener('click', (e) => {
    const quitar = e.target.closest('[data-quitar-foto]')
    if (!quitar) return
    const foto = fotosManual.find((f) => f.id === quitar.dataset.quitarFoto)
    if (foto) URL.revokeObjectURL(foto.vista)
    fotosManual = fotosManual.filter((f) => f !== foto)
    pintarFotos()
  })

  /** El enlace del aviso en su portal, cuando la carga a mano empezó pegando uno. */
  let enlaceManual = null

  function irAManual(enlace, nota) {
    enlaceManual = enlace
    const aviso = $('#manualNota')
    aviso.textContent = nota || ''
    aviso.hidden = !nota
    const pistas = enlace ? pistasDelEnlace(enlace) : {}
    if (pistas.tipo) $('#tipoManual').value = pistas.tipo
    if (pistas.dormitorios) $('#dormManual').value = pistas.dormitorios
    for (const r of $$('input[name="operacion"]', pasoManual)) r.checked = r.value === (pistas.operacion || 'Venta')
    for (const r of $$('input[name="ciudadManual"]', pasoManual)) r.checked = r.value === pistas.ciudad
    pasoEnlace.hidden = true
    pasoManual.hidden = false
    publicar.scrollTop = 0
  }

  $('#irAManual').addEventListener('click', () => irAManual(null, ''))
  $('#volverDeManual').addEventListener('click', mostrarPasoEnlace)

  pasoManual.addEventListener('submit', async (e) => {
    e.preventDefault()
    const f = new FormData(pasoManual)
    const listas = fotosManual.filter((x) => x.url)
    const subiendo = fotosManual.some((x) => x.subiendo)
    const errores = [
      ['fotosError', 'agregarFoto', subiendo ? 'Esperá a que terminen de subir las fotos.' : listas.length === 0 ? 'Agregá al menos una foto.' : ''],
      ['tipoError', 'tipoManual', f.get('tipo') ? '' : 'Elegí el tipo de propiedad.'],
      ['ciudadManualError', null, f.get('ciudadManual') ? '' : 'Elegí si está en Funes o en Roldán.'],
    ]
    for (const [id, , texto] of errores) error(id, texto)
    error('manualError', '')
    const primero = errores.find(([, , texto]) => texto)
    if (primero) {
      const campo = primero[1] ? $(`#${primero[1]}`) : $('input[name="ciudadManual"]', pasoManual)
      campo.closest('.campo').scrollIntoView({ block: 'center' })
      if (primero[1] !== 'agregarFoto') campo.focus({ preventScroll: true })
      return
    }
    const boton = $('button[type="submit"]', pasoManual)
    ocupado(boton, true)
    $('#publicandoManual').hidden = false
    try {
      const { publicacion } = await api('publicaciones', {
        metodo: 'POST',
        cuerpo: {
          ciudad: f.get('ciudadManual'),
          oportunidad: String(f.get('oportunidad') || '').trim(),
          manual: {
            tipo: f.get('tipo'),
            operacion: f.get('operacion'),
            barrio: String(f.get('barrio') || '').trim(),
            precio: String(f.get('precio') || '').replace(/\D/g, ''),
            moneda: f.get('moneda'),
            m2: String(f.get('m2') || '').replace(/\D/g, ''),
            dormitorios: String(f.get('dormitorios') || '').replace(/\D/g, ''),
            banos: String(f.get('banos') || '').replace(/\D/g, ''),
            descripcion: String(f.get('descripcion') || '').trim(),
            fotos: listas.map((x) => x.url),
            enlace: enlaceManual,
          },
        },
      })
      publicada(publicacion)
    } catch (err) {
      if (err.status === 401) return sesionVencida()
      if (err.datos?.limite) {
        await cargar({ fresco: true })
        pintarCupo()
      } else {
        error('manualError', err.message)
      }
    } finally {
      ocupado(boton, false)
      $('#publicandoManual').hidden = true
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
    const hechos = datos(p)
    const mias = notas()[p.id] || []
    $('#detalleCuerpo').innerHTML = `
      <div class="hoja-cabeza">
        <div>
          <p class="antetitulo">${esc(p.tipo)} · ${esc(p.operacion)} · ${quedan(p)}</p>
          <h2 id="detalleTitulo">${esc(p.titulo)}</h2>
        </div>
        <button type="button" class="cerrar" data-cerrar aria-label="Cerrar">×</button>
      </div>
      <div class="detalle-foto">${foto(p, { tamanos: '(min-width: 700px) 520px, 100vw', urgente: true })}</div>
      <p class="precio grande">${precio(p)}</p>
      ${hechos.length ? `<ul class="datos">${hechos.map((d) => `<li>${d}</li>`).join('')}</ul>` : ''}
      ${p.oportunidad ? `<div class="oportunidad"><b>Oportunidad comercial</b><p>${esc(p.oportunidad)}</p></div>` : ''}
      <div class="colega amplio">
        <span class="avatar" aria-hidden="true">${esc(iniciales(p.agente.nombre))}</span>
        <div>
          <strong>${esc(p.agente.nombre)}</strong>
          <small>${esc(p.inmobiliaria.nombre)}</small>
          <small>Matriculado a cargo: ${esc(p.inmobiliaria.matriculado)} · Mat. ${esc(p.inmobiliaria.matricula)}</small>
        </div>
      </div>
      <div class="acciones">
        ${mia ? '' : `<a class="boton whatsapp" href="${esc(enlaceWhatsapp(p))}" target="_blank" rel="noopener">${ICONO_WHATSAPP}Escribirle por WhatsApp</a>`}
        <button type="button" class="boton ${mia ? 'primario' : 'suave'}" data-accion="${navigator.share ? 'compartir' : 'copiar'}">${navigator.share ? 'Enviar la ficha a mi cliente' : 'Copiar ficha para mi cliente'}</button>
        <a class="boton suave" href="${esc(p.ficha)}" target="_blank" rel="noopener">Ver la ficha para clientes</a>
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
      ${mia ? `<button type="button" class="boton peligro-suave" data-baja="${esc(p.id)}">Dar de baja</button>` : ''}`
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
      avisar('Propiedad dada de baja.')
    } catch (err) {
      if (err.status === 401) return sesionVencida()
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
    const paraBaja = t.closest('[data-baja]')
    if (paraBaja) {
      paraBajar = paraBaja.dataset.baja
      error('bajaError', '')
      abrir(baja)
      return
    }
    const accion = t.closest('[data-accion]')
    if (!accion) return
    const id = accion.closest('[data-id]')?.dataset.id || abierta
    const p = vigentes().find((x) => x.id === id)
    if (!p) return
    if (accion.dataset.accion === 'detalle') abrirDetalle(p)
    if (accion.dataset.accion === 'copiar') copiarFicha(p)
    if (accion.dataset.accion === 'compartir') {
      try {
        await navigator.share({ title: p.titulo, url: p.ficha })
      } catch (err) {
        // Cerró la hoja de compartir: nada. Si el teléfono no pudo, se copia.
        if (err?.name !== 'AbortError') copiarFicha(p)
      }
    }
  })

  // Un toque en el fondo cierra las hojas que se pueden cerrar.
  for (const d of $$('dialog')) {
    d.addEventListener('click', (e) => {
      if (e.target === d && !(d === ingreso && !sesion)) d.close()
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
    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    const mes = (d) => new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(d).replace('.', '')
    const desde = lunes.getMonth() === domingo.getMonth() ? `${lunes.getDate()}` : `${lunes.getDate()} ${mes(lunes)}`
    return `Ronda semanal · ${desde} al ${domingo.getDate()} ${mes(domingo)}`
  }

  $('#semana').textContent = semana()
  $('#buscar').value = filtro.texto
  $('#orden').value = filtro.orden
  pintarPerfil()
  pintar()
  cargar()
  if (!sesion) abrirIngreso()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - ultimaCarga > 30_000) cargar()
  })
  setInterval(() => {
    if (document.visibilityState === 'visible' && !$('dialog[open]')) cargar()
  }, 120_000)
})()

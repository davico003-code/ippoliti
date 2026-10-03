// Parser del cuerpo de las notas del blog → árbol que renderiza
// components/blog/ContenidoNota.tsx con elementos React (nada de
// dangerouslySetInnerHTML: el texto lo escapa React).
//
// Cubre el markdown que generan el cron y la reescritura (oct-2026) y el texto
// plano de las notas estáticas: títulos ##/###, párrafos (un salto simple es
// <br>, así la firma sale en dos líneas), listas - y 1., citas >, separador
// ---, imagen sola en su bloque, **negrita**, *cursiva* y [texto](url).
//
// Links: solo rutas del sitio ("/...") o https. Lo demás (javascript:, http:,
// "//host", "/\host") se muestra como texto, sin link y sin el markdown crudo.

export type Inline =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'salto' }
  | { tipo: 'negrita'; hijos: Inline[] }
  | { tipo: 'cursiva'; hijos: Inline[] }
  // href null = URL no permitida: se renderiza solo el texto.
  | { tipo: 'link'; href: string | null; externo: boolean; original: string; hijos: Inline[] }

export type Bloque =
  | { tipo: 'titulo'; nivel: 2 | 3; hijos: Inline[] }
  | { tipo: 'parrafo'; hijos: Inline[] }
  | { tipo: 'imagen'; alt: string; src: string }
  | { tipo: 'lista'; ordenada: boolean; inicio: number; items: Inline[][] }
  | { tipo: 'cita'; parrafos: Inline[][] }
  | { tipo: 'separador' }

const DOMINIO_PROPIO = /^(www\.)?siinmobiliaria\.com$/i

/**
 * Valida y normaliza el destino de un link. Rutas relativas del sitio quedan
 * internas; https://siinmobiliaria.com/... se pasa a relativa; otro https es
 * externo. Cualquier otra cosa devuelve null.
 */
export function normalizarHref(raw: string): { href: string; externo: boolean } | null {
  const url = raw.trim()
  // Espacios, controles o barra invertida: "/\evil.com" el navegador lo toma
  // como "//evil.com" (otro host).
  if (!url || /[\s\\\u0000-\u001f\u007f]/.test(url)) return null
  if (url.startsWith('/')) {
    if (url.startsWith('//')) return null
    return { href: url, externo: false }
  }
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password) return null
  if (DOMINIO_PROPIO.test(u.hostname)) {
    return { href: `${u.pathname}${u.search}${u.hash}` || '/', externo: false }
  }
  return { href: u.toString(), externo: true }
}

// ── Inline ────────────────────────────────────────────────────────────────

// Busca el cierre de "(" del destino del link respetando paréntesis anidados
// (URLs tipo Wikipedia). Devuelve el índice del ")" o -1.
function cierreParentesis(s: string, desde: number): number {
  let prof = 0
  for (let i = desde; i < s.length; i++) {
    const c = s[i]
    if (c === '\\') { i++; continue }
    if (c === '\n') return -1
    if (c === '(') prof++
    else if (c === ')') {
      if (prof === 0) return i
      prof--
    }
  }
  return -1
}

// Cierre de "[" del texto del link (admite [corchetes] anidados balanceados).
function cierreCorchete(s: string, desde: number): number {
  let prof = 0
  for (let i = desde; i < s.length; i++) {
    const c = s[i]
    if (c === '\\') { i++; continue }
    if (c === '[') prof++
    else if (c === ']') {
      if (prof === 0) return i
      prof--
    }
  }
  return -1
}

// Destino "(url "título")": se queda con la URL y descarta el título opcional.
function destinoDeLink(dentro: string): string {
  const m = dentro.trim().match(/^<?([^\s>]*)>?(?:\s+["'(].*["')])?$/)
  return m ? m[1] : dentro.trim()
}

const PUNTUACION_ESCAPABLE = /[\\`*_{}[\]()#+\-.!|>~]/

export function parsearInline(s: string, conLinks = true): Inline[] {
  const out: Inline[] = []
  let buf = ''
  const flush = () => {
    if (buf) out.push({ tipo: 'texto', valor: buf })
    buf = ''
  }

  let i = 0
  while (i < s.length) {
    const c = s[i]

    // Escape: \* → "*" literal
    if (c === '\\' && i + 1 < s.length && PUNTUACION_ESCAPABLE.test(s[i + 1])) {
      buf += s[i + 1]
      i += 2
      continue
    }

    // Imagen dentro de un párrafo: queda su texto alternativo (las imágenes
    // se renderizan solo como bloque propio).
    if (c === '!' && s[i + 1] === '[') {
      const fin = cierreCorchete(s, i + 2)
      if (fin !== -1 && s[fin + 1] === '(') {
        const cierre = cierreParentesis(s, fin + 2)
        if (cierre !== -1) {
          buf += s.slice(i + 2, fin)
          i = cierre + 1
          continue
        }
      }
    }

    // Link: [texto](url)
    if (c === '[' && conLinks) {
      const fin = cierreCorchete(s, i + 1)
      if (fin !== -1 && s[fin + 1] === '(') {
        const cierre = cierreParentesis(s, fin + 2)
        if (cierre !== -1) {
          const texto = s.slice(i + 1, fin)
          const original = destinoDeLink(s.slice(fin + 2, cierre))
          const destino = normalizarHref(original)
          flush()
          out.push({
            tipo: 'link',
            href: destino?.href ?? null,
            externo: destino?.externo ?? false,
            original,
            // Sin links anidados dentro del texto de un link.
            hijos: parsearInline(texto, false),
          })
          i = cierre + 1
          continue
        }
      }
    }

    // Negrita: **texto** (también __texto__ a borde de palabra)
    if ((c === '*' && s[i + 1] === '*') || (c === '_' && s[i + 1] === '_' && !/\w/.test(s[i - 1] ?? ''))) {
      const marca = c + c
      const fin = s.indexOf(marca, i + 2)
      if (fin > i + 2 && !/\s/.test(s[i + 2]) && !/\s/.test(s[fin - 1])) {
        flush()
        out.push({ tipo: 'negrita', hijos: parsearInline(s.slice(i + 2, fin), conLinks) })
        i = fin + 2
        continue
      }
    }

    // Cursiva: *texto* (el "_" suelto no, para no romper nombres_con_guion)
    if (c === '*' && s[i + 1] !== '*' && s[i + 1] && !/\s/.test(s[i + 1])) {
      let fin = -1
      for (let j = i + 1; j < s.length; j++) {
        if (s[j] === '\\') { j++; continue }
        if (s[j] === '*' && s[j + 1] !== '*' && s[j - 1] !== '*' && !/\s/.test(s[j - 1])) { fin = j; break }
      }
      if (fin !== -1) {
        flush()
        out.push({ tipo: 'cursiva', hijos: parsearInline(s.slice(i + 1, fin), conLinks) })
        i = fin + 1
        continue
      }
    }

    // Salto de línea dentro del párrafo → <br> (la firma va en dos líneas).
    // Se descartan los dos espacios del "hard break" de markdown.
    if (c === '\n') {
      buf = buf.replace(/[ \t]+$/, '')
      flush()
      out.push({ tipo: 'salto' })
      i++
      while (s[i] === ' ' || s[i] === '\t') i++
      continue
    }

    buf += c
    i++
  }
  flush()
  return out
}

// ── Bloques ──────────────────────────────────────────────────────────────

const RE_TITULO = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/
const RE_ITEM_UL = /^\s{0,3}[-*+•]\s+(.*)$/
const RE_ITEM_OL = /^\s{0,3}(\d{1,9})[.)]\s+(.*)$/
const RE_CITA = /^\s{0,3}>\s?(.*)$/
const RE_SEPARADOR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/
const RE_IMAGEN = /^!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^"']*["'])?\s*\)$/

// Heurística de subtítulo para las notas estáticas (texto plano sin marcado):
// línea corta que arranca en mayúscula, sin punto y sin coma. Solo se aplica
// si la nota no trae ningún título markdown; en las de markdown el subtítulo
// siempre viene con ##.
function pareceSubtitulo(linea: string): boolean {
  return /^[A-ZÁÉÍÓÚÑ¿¡]/.test(linea) && linea.length < 70 && !linea.includes('.') && !linea.includes(',')
}

export function parsearNota(contenido: string): Bloque[] {
  const lineas = contenido.replace(/\r\n?/g, '\n').split('\n')
  const esMarkdown = lineas.some((l) => RE_TITULO.test(l))
  const bloques: Bloque[] = []

  let i = 0
  while (i < lineas.length) {
    const linea = lineas[i]

    if (!linea.trim()) { i++; continue }

    const titulo = linea.match(RE_TITULO)
    if (titulo) {
      bloques.push({ tipo: 'titulo', nivel: titulo[1].length <= 2 ? 2 : 3, hijos: parsearInline(titulo[2]) })
      i++
      continue
    }

    if (RE_SEPARADOR.test(linea)) {
      bloques.push({ tipo: 'separador' })
      i++
      continue
    }

    const imagen = linea.trim().match(RE_IMAGEN)
    if (imagen) {
      const destino = normalizarHref(imagen[2])
      if (destino) bloques.push({ tipo: 'imagen', alt: imagen[1].trim(), src: destino.href })
      i++
      continue
    }

    if (RE_CITA.test(linea)) {
      const parrafos: string[][] = [[]]
      while (i < lineas.length && RE_CITA.test(lineas[i])) {
        const dentro = lineas[i].match(RE_CITA)![1]
        if (dentro.trim()) parrafos[parrafos.length - 1].push(dentro)
        else if (parrafos[parrafos.length - 1].length) parrafos.push([])
        i++
      }
      bloques.push({
        tipo: 'cita',
        parrafos: parrafos.filter((p) => p.length).map((p) => parsearInline(p.join('\n'))),
      })
      continue
    }

    const ul = linea.match(RE_ITEM_UL)
    const ol = linea.match(RE_ITEM_OL)
    if (ul || ol) {
      const ordenada = !ul
      const reItem = ordenada ? RE_ITEM_OL : RE_ITEM_UL
      const items: string[] = []
      while (i < lineas.length && lineas[i].trim()) {
        const l = lineas[i]
        const m = l.match(reItem)
        if (m) items.push(ordenada ? m[2] : m[1])
        // Una línea que arranca otro tipo de bloque corta la lista.
        else if (RE_TITULO.test(l) || RE_CITA.test(l) || RE_ITEM_UL.test(l) || RE_ITEM_OL.test(l)) break
        // Continuación del ítem (texto que siguió en la línea de abajo).
        else items[items.length - 1] += `\n${l.trim()}`
        i++
      }
      bloques.push({
        tipo: 'lista',
        ordenada,
        inicio: ordenada ? parseInt(ol![1], 10) : 1,
        items: items.map((t) => parsearInline(t)),
      })
      continue
    }

    // Párrafo: líneas seguidas hasta una vacía o hasta que arranque otro bloque
    // (ej.: "**Casas en Roldán:**" con la lista pegada abajo).
    const acumuladas: string[] = []
    while (i < lineas.length && lineas[i].trim()) {
      const l = lineas[i]
      if (acumuladas.length && (RE_TITULO.test(l) || RE_ITEM_UL.test(l) || RE_ITEM_OL.test(l) || RE_CITA.test(l) || RE_SEPARADOR.test(l))) break
      acumuladas.push(l)
      i++
    }
    const texto = acumuladas.join('\n').trim()
    if (!esMarkdown && acumuladas.length === 1 && pareceSubtitulo(texto)) {
      bloques.push({ tipo: 'titulo', nivel: 2, hijos: parsearInline(texto) })
    } else {
      bloques.push({ tipo: 'parrafo', hijos: parsearInline(texto) })
    }
  }
  return bloques
}

// ── Texto plano (schema FAQ, validaciones) ───────────────────────────────

export function inlineAPlano(hijos: Inline[]): string {
  return hijos
    .map((n) => {
      if (n.tipo === 'texto') return n.valor
      if (n.tipo === 'salto') return ' '
      return inlineAPlano(n.hijos)
    })
    .join('')
}

export function bloqueAPlano(b: Bloque): string {
  switch (b.tipo) {
    case 'titulo':
    case 'parrafo':
      return inlineAPlano(b.hijos)
    case 'lista':
      return b.items.map(inlineAPlano).join(' ')
    case 'cita':
      return b.parrafos.map(inlineAPlano).join(' ')
    case 'imagen':
      return b.alt
    case 'separador':
      return ''
  }
}

function linksDe(hijos: Inline[]): Extract<Inline, { tipo: 'link' }>[] {
  return hijos.flatMap((n) => {
    if (n.tipo === 'link') return [n, ...linksDe(n.hijos)]
    if (n.tipo === 'negrita' || n.tipo === 'cursiva') return linksDe(n.hijos)
    return []
  })
}

function inlinesDe(b: Bloque): Inline[][] {
  switch (b.tipo) {
    case 'titulo':
    case 'parrafo':
      return [b.hijos]
    case 'lista':
      return b.items
    case 'cita':
      return b.parrafos
    default:
      return []
  }
}

/**
 * Lo que el renderer del blog no va a poder mostrar bien. Lo usa la validación
 * del cron (writer/validaciones.ts) para rechazar el draft antes de publicarlo.
 */
export function problemasDeRender(contenido: string): string[] {
  const problemas: string[] = []
  const bloques = parsearNota(contenido)

  for (const b of bloques) {
    for (const hijos of inlinesDe(b)) {
      for (const l of linksDe(hijos)) {
        if (!l.href) {
          problemas.push(`link con URL no permitida: "${l.original}". Usá rutas del sitio (/ruta) o https://`)
        }
      }
    }
  }

  const plano = bloques.map(bloqueAPlano).join('\n')
  if (/\[[^\]]+\]\([^)]*\)/.test(plano)) problemas.push('hay un link markdown mal armado que quedaría crudo en la nota')
  if (/\*\*|__/.test(plano)) problemas.push('hay una negrita (**) sin cerrar que quedaría cruda en la nota')
  if (/<\/?[a-z][^>]*>/i.test(plano)) problemas.push('hay HTML en el contenido: el blog lo muestra como texto. Usá solo markdown')
  if (/^\s*```/m.test(contenido)) problemas.push('el blog no muestra bloques de código (```)')
  if (/^\s*\|.*\|\s*$/m.test(contenido)) problemas.push('el blog no muestra tablas markdown: pasalas a lista con guiones')
  return problemas
}

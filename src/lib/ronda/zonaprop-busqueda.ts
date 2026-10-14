// Lectura de UN aviso de Zonaprop por su número, en el momento.
//
// Portado del lector de Hilo (si-crm/src/lib/zonaprop.ts, 7-oct-2026):
// www.zonaprop.com.ar pide una verificación que un servidor no pasa, pero la
// búsqueda por número en api.zonaprop.com.ar (`/q-<id>.html`) es una página
// pública que responde a un pedido común y trae el aviso embebido en
// `window.__PRELOADED_STATE__`: precio, m², ambientes, ubicación, descripción,
// inmobiliaria y las primeras 8 fotos. El pedido se identifica con su nombre
// (no se hace pasar por un navegador ni por otro servicio).
//
// Es lectura PUNTUAL del link que pega un colega: nunca usarla para recorrer
// avisos. Es markup de un tercero: ante cualquier duda devuelve `caida`.

const BUSQUEDA = 'https://api.zonaprop.com.ar'
const UA = 'RondaFunesRoldan/1.0 (+https://verficha.casa/ronda)'

type NodoUbicacion = { name?: string | null; label?: string | null; parent?: NodoUbicacion | null }

/** Un aviso tal como viene en la búsqueda (`listStore.listPostings`). Solo lo que se usa. */
export type PostingZonaprop = {
  postingId: string
  title?: string | null
  descriptionNormalized?: string | null
  priceOperationTypes?: Array<{
    operationType?: { name?: string | null } | null
    prices?: Array<{ amount?: number | null; currency?: string | null }> | null
  }> | null
  mainFeatures?: Record<string, { label?: string | null; value?: string | null }> | null
  realEstateType?: { name?: string | null } | null
  reserved?: boolean | null
  publisher?: { name?: string | null } | null
  postingLocation?: {
    address?: { name?: string | null } | null
    location?: NodoUbicacion | null
  } | null
  visiblePictures?: { pictures?: Array<{ url730x532?: string | null; url360x266?: string | null }> | null } | null
}

/** `caida` = Zonaprop no respondió o cambió la página (NO es "el aviso no está publicado"); `motivo` dice cuál. */
export type BusquedaZonaprop = { posting: PostingZonaprop | null; caida: boolean; motivo?: string }

function caida(motivo: string): BusquedaZonaprop {
  console.warn(`[ronda] zonaprop: la búsqueda por número de aviso no anduvo: ${motivo}`)
  return { posting: null, caida: true, motivo }
}

/** El objeto JSON que empieza en `inicio` (un '{'), respetando strings y escapes. */
function objetoJsonDesde(s: string, inicio: number): string | null {
  if (inicio < 0) return null
  let prof = 0
  let enString = false
  let escape = false
  for (let i = inicio; i < s.length; i++) {
    const c = s[i]
    if (enString) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === '"') enString = false
      continue
    }
    if (c === '"') enString = true
    else if (c === '{') prof++
    else if (c === '}') {
      prof--
      if (prof === 0) return s.slice(inicio, i + 1)
    }
  }
  return null
}

/** `posting: null` sin caída = el aviso no está publicado (pausado o vendido). */
export async function avisoZonapropPorBusqueda(id: string, timeoutMs = 15000): Promise<BusquedaZonaprop> {
  let html: string
  try {
    const res = await fetch(`${BUSQUEDA}/q-${encodeURIComponent(id)}.html`, {
      headers: { 'user-agent': UA, 'accept-language': 'es-AR,es;q=0.9' },
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    })
    if (!res.ok) return caida(`respondió ${res.status}`)
    html = await res.text()
  } catch (e) {
    return caida(`no respondió (${(e as Error).message})`)
  }
  const marca = html.indexOf('window.__PRELOADED_STATE__')
  const json = marca < 0 ? null : objetoJsonDesde(html, html.indexOf('{', marca))
  if (!json) return caida('la página no trae el estado embebido (¿cambió?)')
  let postings: PostingZonaprop[] | null | undefined
  try {
    postings = (JSON.parse(json) as { listStore?: { listPostings?: PostingZonaprop[] | null } | null }).listStore?.listPostings
  } catch {
    return caida('el estado embebido no es JSON válido')
  }
  if (!Array.isArray(postings)) return caida('el estado embebido no trae la lista de avisos')
  return { posting: postings.find((p) => String(p.postingId) === id) ?? null, caida: false }
}

/** Fotos del aviso en 1200×1200 (la búsqueda las da en 720×532; el CDN sirve el mismo id en grande). */
export function fotosDePosting(p: PostingZonaprop): string[] {
  const fotos: string[] = []
  for (const f of p.visiblePictures?.pictures ?? []) {
    const u = (f.url730x532 || f.url360x266 || '').replace(/\?.*$/, '').replace(/\/\d+x\d+\//, '/1200x1200/')
    if (/^https:\/\/imgar\.zonapropcdn\.com\//i.test(u) && !fotos.includes(u)) fotos.push(u)
  }
  return fotos
}

/** Número de una característica principal por su etiqueta ("Dormitorios", "Superficie total"…). */
export function numeroDePosting(p: PostingZonaprop, etiqueta: RegExp): number | null {
  for (const f of Object.values(p.mainFeatures ?? {})) {
    if (f?.label && etiqueta.test(f.label)) {
      const n = parseInt(String(f.value ?? '').replace(/[^\d]/g, ''), 10)
      return Number.isFinite(n) && n > 0 ? n : null
    }
  }
  return null
}

/** La operación que manda (venta si hay; si no, la primera) con su precio. */
export function precioDePosting(p: PostingZonaprop): { operacion: string; precio: number | null; moneda: 'USD' | 'ARS' } {
  const ops = p.priceOperationTypes ?? []
  const op = ops.find((o) => /venta/i.test(o.operationType?.name ?? '')) ?? ops[0]
  const precio = op?.prices?.[0]
  const monto = Number(precio?.amount)
  return {
    operacion: op?.operationType?.name?.trim() || 'Venta',
    precio: Number.isFinite(monto) && monto > 0 ? monto : null,
    moneda: /usd|u\$s/i.test(precio?.currency ?? '') ? 'USD' : 'ARS',
  }
}

/**
 * Ciudad y barrio desde el árbol de Zonaprop ("ZONA:Kentucky < CIUDAD:Funes <
 * PROVINCIA:Santa Fe"). Las "Zona N" son divisiones internas, no barrios.
 */
export function ubicacionDePosting(p: PostingZonaprop): { ciudad: string | null; barrio: string | null } {
  const cadena: NodoUbicacion[] = []
  for (let n = p.postingLocation?.location; n && cadena.length < 10; n = n.parent) cadena.push(n)
  const nombre = (n?: NodoUbicacion) => n?.name?.replace(/\s+/g, ' ').trim() || null
  const iCiudad = cadena.findIndex((n) => n.label === 'CIUDAD')
  const barrio = iCiudad > 0 ? cadena.slice(0, iCiudad).map(nombre).find((x) => x && !/^zona\s*\d+$/i.test(x)) : null
  return { ciudad: nombre(cadena[iCiudad]), barrio: barrio ?? null }
}

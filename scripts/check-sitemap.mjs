// Auditoría COMPLETA del sitemap contra un sitio en vivo: cada URL tiene que
// responder 200 (sin redirigir), sin noindex y con canonical a sí misma. Es lo
// que Search Console marca cuando falla ("excluida por noindex", "página con
// redirección", "no encontrada"). Sale con código 1 si algo falla.
//
//   node scripts/check-sitemap.mjs                          → producción
//   BASE_URL=https://<preview>.vercel.app node scripts/check-sitemap.mjs
//
// El canonical se compara contra https://siinmobiliaria.com aunque se audite un
// preview (las páginas siempre declaran el dominio real).

const BASE = (process.env.BASE_URL || 'https://siinmobiliaria.com').replace(/\/$/, '')
const CANONICO = 'https://siinmobiliaria.com'
const EN_PARALELO = 6

const pedir = async (url, intentos = 3) => {
  for (let i = 0; i < intentos; i++) {
    try {
      return await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'SI-check-sitemap/1.0' }, signal: AbortSignal.timeout(45_000) })
    } catch {
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
  return null
}

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
const entradas = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1]?.replace(/&amp;/g, '&'),
  lastmod: (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] ?? null,
}))
const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
const fallas = []
let i = 0
async function trabajar() {
  while (i < entradas.length) {
    const { loc } = entradas[i++]
    const ruta = loc.replace(CANONICO, '')
    const res = await pedir(`${BASE}${ruta}`)
    if (!res) { fallas.push(`SIN RESPUESTA  ${ruta}`); continue }
    if (res.status >= 300 && res.status < 400) { fallas.push(`REDIRIGE ${res.status}  ${ruta} → ${res.headers.get('location')}`); continue }
    if (res.status !== 200) { fallas.push(`ESTADO ${res.status}  ${ruta}`); continue }
    const html = await res.text()
    // En un preview, Vercel le pone X-Robots-Tag: noindex a TODO: ahí solo cuenta la etiqueta de la página.
    const cabecera = BASE === CANONICO ? (res.headers.get('x-robots-tag') ?? '') : ''
    const robots = [...html.matchAll(/<meta name="robots" content="([^"]*)"/g)].map((m) => m[1]).join(' ') + ' ' + cabecera
    if (/noindex/i.test(robots)) fallas.push(`NOINDEX  ${ruta}`)
    const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1]
    if (canonical !== loc) fallas.push(`CANONICAL  ${ruta} → ${canonical ?? '(no tiene)'}`)
    if (/<title>[^<]*no encontrad/i.test(html)) fallas.push(`DADA DE BAJA  ${ruta}`)
  }
}
await Promise.all(Array.from({ length: EN_PARALELO }, trabajar))

const sinFecha = entradas.filter((e) => !e.lastmod)
const deHoy = entradas.filter((e) => e.lastmod?.slice(0, 10) === hoy)
console.log(`${entradas.length} URLs en el sitemap de ${BASE}`)
console.log(`lastmod: ${entradas.length - sinFecha.length} con fecha · ${sinFecha.length} sin fecha · ${deHoy.length} con la fecha de hoy`)
if (sinFecha.length) console.log('  sin fecha (muestra):', sinFecha.slice(0, 8).map((e) => e.loc.replace(CANONICO, '')).join(', '))
if (fallas.length) {
  console.log(`\n✗ ${fallas.length} URLs con problemas:`)
  for (const f of fallas.sort()) console.log('  ' + f)
  process.exit(1)
}
console.log('✓ todas responden 200, sin noindex, sin redirección y con canonical a sí mismas')

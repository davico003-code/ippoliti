// Vigía de la Ronda (David, 14-oct-2026: "dejá un vigía que funcione bien esto
// de convertir el link siempre").
//
// Dos miradas, sin tocar la grilla ni crear fichas:
//  1. Sonda: convierte EN EL MOMENTO un aviso de Zonaprop y una ficha de Tokko
//     de verdad (los que hay en la grilla y, si no, los de prueba de abajo) y
//     mira que llegue lo que la Ronda necesita: tipo, operación y una foto que
//     se pueda traer. En Zonaprop se mira la lectura EN VIVO: la copia guardada
//     taparía una rotura.
//  2. Uso real: lo que anotó /api/ronda/leer de los links que pegaron los
//     colegas en las últimas 48 h (`lecturasRecientes`).
//
// Lo consulta el vigía diario de Hilo (salud-canales, 9 ART), que manda UN mail
// cuando aparece un problema, no lo repite y avisa cuando se arregla.

import { lecturasRecientes, listarPublicaciones } from './almacen'
import { leerAviso, type AvisoRonda } from './aviso'
import { idDeZonaprop } from './reglas'
import { avisoZonapropPorBusqueda } from './zonaprop-busqueda'

/**
 * Avisos propios de SI que estaban publicados el 14-oct-2026. Si un día se dan
 * todos de baja, el vigía lo dice ("ninguno figura publicado") y hay que
 * cambiarlos por otros vigentes.
 */
const ZONAPROP_DE_PRUEBA = [
  'https://www.zonaprop.com.ar/propiedades/clasificado/veclcain-casa-en-venta-de-3-dorm.-apta-credito-60185992.html',
  'https://www.zonaprop.com.ar/propiedades/clasificado/vecltrin-lotes-en-venta-en-distrito-roldan-barrio-abierto-con-58148229.html',
  'https://www.zonaprop.com.ar/propiedades/clasificado/veclcain-casa-en-venta-de-3-dorm.-con-pileta-en-vida-barrio-59318668.html',
]
const TOKKO_DE_PRUEBA = ['https://ficha.info/p/89885e7a15e542ac9f6d59ca2aec6936', 'https://ficha.info/p/6fb658bbaf374090a8f361c7f1ded4a7']
/** Cuántos de cada portal se prueban como mucho (son pedidos a un tercero: los justos). */
const INTENTOS = 2
const UA = 'RondaFunesRoldan/1.0 (+https://verficha.casa/ronda)'

export type SondaRonda = { ok: boolean; probado: string | null; detalle: string }
export type SaludRonda = { ok: boolean; problemas: string[]; sondas: { zonaprop: SondaRonda; tokko: SondaRonda }; uso: Record<string, number> }

/** Lo que le falta a un aviso convertido para servir en la Ronda, o null. */
export function faltante(a: Pick<AvisoRonda, 'tipo' | 'operacion' | 'fotos'>): string | null {
  if (!a.tipo || a.tipo === 'Propiedad') return 'el tipo de propiedad'
  if (!a.operacion) return 'la operación'
  if (a.fotos.length === 0) return 'fotos'
  return null
}

async function fotoResponde(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, range: 'bytes=0-2047' }, cache: 'no-store', signal: AbortSignal.timeout(10_000) })
    return res.ok && (res.headers.get('content-type') || '').startsWith('image/')
  } catch {
    return false
  }
}

/** Convierte el aviso como lo haría la Ronda y dice si sirve. */
async function convertir(url: string): Promise<{ ok: boolean; detalle: string }> {
  const aviso = await leerAviso(url)
  const falta = faltante(aviso)
  if (falta) return { ok: false, detalle: `se lee pero llega sin ${falta}` }
  if (!(await fotoResponde(aviso.fotos[0]))) return { ok: false, detalle: 'se lee pero sus fotos no se pueden traer (la ficha saldría sin fotos)' }
  return { ok: true, detalle: `${aviso.tipo} en ${aviso.operacion.toLowerCase()} · ${aviso.fotos.length} fotos` }
}

async function sondaZonaprop(candidatos: string[]): Promise<SondaRonda> {
  const caidas: string[] = []
  for (const url of candidatos.slice(0, INTENTOS)) {
    const id = idDeZonaprop(url)
    if (!id) continue
    const busqueda = await avisoZonapropPorBusqueda(id, 10_000)
    if (busqueda.caida) {
      caidas.push(busqueda.motivo ?? 'no respondió')
      continue
    }
    if (!busqueda.posting) continue
    try {
      const r = await convertir(url)
      return { ok: r.ok, probado: id, detalle: r.detalle }
    } catch (e) {
      return { ok: false, probado: id, detalle: `se encontró pero no se pudo convertir (${(e as Error).message})` }
    }
  }
  if (caidas.length > 0) {
    return { ok: false, probado: null, detalle: `Zonaprop no responde la lectura en vivo (${caidas[0]}): los links solo se convierten si el aviso está en la copia guardada, con el precio de cuando se guardó` }
  }
  return { ok: false, probado: null, detalle: 'ninguno de los avisos de prueba figura publicado: o se dieron de baja (cambiarlos en src/lib/ronda/salud.ts) o Zonaprop cambió su página' }
}

async function sondaTokko(candidatos: string[]): Promise<SondaRonda> {
  const fallas: string[] = []
  for (const url of candidatos.slice(0, INTENTOS)) {
    try {
      const r = await convertir(url)
      if (r.ok) return { ok: true, probado: url, detalle: r.detalle }
      fallas.push(r.detalle)
    } catch (e) {
      fallas.push((e as Error).message)
    }
  }
  return { ok: false, probado: null, detalle: `no se pudo convertir ninguna ficha de prueba (${fallas[0] ?? 'sin fichas para probar'})` }
}

/** Pura: qué del uso real merece un aviso. `uso` = { "zonaprop:ok": 3, … } de las últimas 48 h. */
export function problemasDeUso(uso: Record<string, number>): string[] {
  const n = (k: string) => uso[k] ?? 0
  const problemas: string[] = []
  for (const [origen, nombre] of [
    ['zonaprop', 'Zonaprop'],
    ['tokko', 'Tokko'],
  ] as const) {
    const fallas = n(`${origen}:error`) + n(`${origen}:caida`)
    if (fallas > 0) problemas.push(`${fallas} link(s) de ${nombre} que pegaron los colegas no se pudieron convertir en las últimas 48 h`)
  }
  if (n('zonaprop:no-reconocido') > 0) {
    problemas.push(`${n('zonaprop:no-reconocido')} link(s) de avisos de Zonaprop con un formato que la Ronda no reconoce (hay que sumar ese formato)`)
  }
  // Muchos "ya no figura" y ninguno bien: puede ser la lectura rota, no los links.
  if (n('zonaprop:no-figura') >= 3 && n('zonaprop:ok') === 0) {
    problemas.push(`${n('zonaprop:no-figura')} links de Zonaprop dieron "ya no figura publicado" y ninguno se leyó en vivo: revisar la lectura`)
  }
  return problemas
}

export async function chequearRonda(): Promise<SaludRonda> {
  // Primero los links reales de la grilla: son los que los colegas usan de verdad.
  const grilla = await listarPublicaciones().catch(() => [])
  const deLaGrilla = (origen: string) => grilla.filter((p) => p.origen === origen && p.urlOriginal).map((p) => p.urlOriginal)
  const [zonaprop, tokko, uso] = await Promise.all([
    sondaZonaprop(Array.from(new Set([...deLaGrilla('Zonaprop'), ...ZONAPROP_DE_PRUEBA]))),
    sondaTokko(Array.from(new Set([...deLaGrilla('Tokko'), ...TOKKO_DE_PRUEBA]))),
    lecturasRecientes(2).catch(() => ({}) as Record<string, number>),
  ])
  const problemas = [
    ...(zonaprop.ok ? [] : [`links de Zonaprop: ${zonaprop.probado ? `el aviso ${zonaprop.probado} ` : ''}${zonaprop.detalle}`]),
    ...(tokko.ok ? [] : [`fichas de Tokko: ${tokko.detalle}`]),
    ...problemasDeUso(uso),
  ]
  return { ok: problemas.length === 0, problemas, sondas: { zonaprop, tokko }, uso }
}

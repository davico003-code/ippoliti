// "Avisame cuando entre algo así" en el buscador (David, 6-nov-2026): con los
// filtros que tiene puestos (zona + tipo) se arma la misma búsqueda que deja
// "Recibí las nuevas por mail" del Tinder; Hilo le manda por mail cada
// propiedad en venta nueva que calce. Solo venta y solo con zona: sin zona,
// Hilo no manda nada (sería un mail por día). El precio no viaja: en el
// buscador es un "hasta" y en la búsqueda guardada es un valor ±20 %.

import type { CriteriosBusqueda, TipoHogar } from '@/lib/feed-en-red'
import { ZONAS } from '@/lib/zonas'

const CIUDADES: Record<string, string> = { roldan: 'Roldán', rosario: 'Rosario', funes: 'Funes' }

const TIPOS: Record<string, TipoHogar> = {
  casa: 'house',
  'casa-quinta': 'house',
  terreno: 'lot',
  departamento: 'apartment',
  ph: 'apartment',
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export function criteriosDelBuscador(f: { operation: string; type: string; location: string; search: string }): CriteriosBusqueda | null {
  if (f.operation === 'alquiler' || f.operation === 'temporario') return null
  // Tipo elegido que no es casa, lote ni depto (oficina, galpón…): no hay búsqueda que guardar.
  const tipo = f.type === 'todos' ? null : TIPOS[f.type] ?? undefined
  if (tipo === undefined) return null
  const q = norm(f.search)
  const barrio = q ? ZONAS.find((z) => norm(z.nombre) === q || (z.aliases ?? []).some((a) => norm(a) === q)) : undefined
  const zona = barrio?.nombre ?? CIUDADES[f.location] ?? null
  if (!zona) return null
  return { zona, tipo, topeUsd: null, origen: 'buscador' }
}

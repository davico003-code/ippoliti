import { buscar, type Indice } from '@/lib/busqueda-propiedades'
import { ZONAS } from '@/lib/zonas'

/**
 * Las zonas del catálogo que hoy tienen propiedades publicadas: las únicas que
 * el buscador sugiere. Una zona cuenta si buscarla por su nombre trae algo SIN
 * aflojar (las subzonas que caen a la ciudad entera, como "Roldán Sur", no
 * cuentan) y sin ignorar palabras del nombre.
 */
export function idsDeZonasVivas(indice: Indice): string[] {
  return ZONAS.filter((z) => {
    const r = buscar(indice, z.nombre)
    return !!r && r.ids.length > 0 && !r.aproximado && r.interpretacion.ignoradas.length === 0
  }).map((z) => z.id)
}

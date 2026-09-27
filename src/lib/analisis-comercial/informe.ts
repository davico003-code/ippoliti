// Tipos del informe mensual del Análisis comercial de Funes.
// Fase 1: el informe vive en src/data/analisis-comercial/informe.json (base
// OpenStreetMap depurada + relevamiento del equipo). Fase 2 lo va a generar
// un cron mensual con Google Places + Claude y guardarlo en Vercel Blob con
// esta misma forma.

import type { ZonaKey } from './zonas'

export interface Oportunidad {
  rubro: string
  /** Regex (string) contra el campo "detalle" de cada comercio, para "Ver en el mapa". */
  re: string
  icono: string
  abiertos: number
  esperado: number
  faltan: number
  porque: string
  donde: string
  confianza: 'alta' | 'media' | 'baja'
}

export interface Cuidado {
  rubro: string
  re: string
  abiertos: number
  esperado: number
  porque: string
}

export interface ZonaInforme {
  k: ZonaKey
  nombre: string
  comercios: number
  libres: number
  perfil: string
  nota: string
}

export interface Viene {
  nombre: string
  zona: string
  estado: string
  nota: string
}

export interface Informe {
  periodo: string
  generado: string
  titular: string
  resumen: string[]
  numeros: {
    habitantesHoy: number
    habitantes2030: number
    relevados: number
    libres: number
    vienen: number
  }
  oportunidades: Oportunidad[]
  cuidado: Cuidado[]
  zonas: ZonaInforme[]
  viene: Viene[]
  verificar: string[]
  supuestos: string
}

export const POBLACION = { censo2022: 38274, censo2010: 23520, crecimientoAnual: 0.041, anioProyeccion: 2030 }

export function habitantes(anio: number): number {
  return POBLACION.censo2022 * Math.pow(1 + POBLACION.crecimientoAnual, anio - 2022)
}

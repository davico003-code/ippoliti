// Distancias reales desde Distrito Roldán (manuales, no salen de OSRM). Módulo
// aparte y sin 'use client' porque lo leen el mapa y el título de Ubicación.

export type DestKey = 'rosario' | 'funes' | 'roldan'

export const DESTINOS: Record<DestKey, { nombre: string; coords: [number, number]; km: number; min: number }> = {
  roldan: { nombre: 'Centro de Roldán', coords: [-32.899, -60.902], km: 3, min: 2 },
  funes: { nombre: 'Funes', coords: [-32.9168, -60.8092], km: 10, min: 12 },
  rosario: { nombre: 'Rosario centro', coords: [-32.9468, -60.6396], km: 20, min: 25 },
}

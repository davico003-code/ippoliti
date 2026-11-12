// Indicadores por zona de Funes, para la tabla de /recursos/mapa-funes (va en el
// HTML: el mapa interactivo es client-only y Google/las IA no lo leen).
// Copiados del cuadro FAM de components/recursos/MapaFunesInteractivo.tsx (cuadro
// oficial de zonificación de la Ciudad de Funes): si cambia uno, cambiar el otro.

export type ZonaFunes = {
  codigo: string
  nombre: string
  fos: string
  fot: string
  frente: string
  superficie: string
  altura: string
  retiro: string
  nota?: string
}

export const ZONAS_FUNES: ZonaFunes[] = [
  { codigo: 'AC', nombre: 'Área Central (AC 1-1 y 1-2)', fos: '0,5', fot: '1,0', frente: '12,50 m', superficie: '250 m²', altura: 'PB + 2', retiro: '—' },
  { codigo: 'AN1-1', nombre: 'Área AN 1-1', fos: '0,4', fot: '0,8', frente: '12,50 m', superficie: '250 m²', altura: 'PB + 2', retiro: '—' },
  { codigo: 'AN2-1', nombre: 'Área AN 2-1', fos: '0,4', fot: '0,8', frente: '12,50 m', superficie: '250 m²', altura: 'PB + 1', retiro: '—' },
  { codigo: 'AN2-3', nombre: 'Área AN 2-3', fos: '0,25', fot: '0,5', frente: '15 m', superficie: '500 m²', altura: 'PB + 1', retiro: '3 m' },
  { codigo: 'AR3', nombre: 'Área Residencial AR3', fos: '0,3', fot: '0,6', frente: '15 m', superficie: '500 m²', altura: 'PB + 1', retiro: '4 m' },
  { codigo: 'AR4', nombre: 'Área Residencial AR4', fos: '0,25', fot: '0,5', frente: '25 m', superficie: '1.000 m²', altura: 'PB + 1', retiro: '5 m' },
  { codigo: 'ALR4', nombre: 'Área ALR4', fos: '0,25', fot: '0,5', frente: '25 m', superficie: '1.000 m²', altura: 'PB + 1', retiro: '5 m' },
  {
    codigo: 'AE', nombre: 'Área Especial', fos: '0,5', fot: '1,0', frente: '25 m', superficie: '2.500 m²', altura: '—', retiro: '—',
    nota: 'En manzanas consolidadas con viviendas rigen los índices del área AR3.',
  },
]

import { NextResponse } from 'next/server'

// Bloquea las rutas de DESARROLLO de placas en producción. Son endpoints de
// prueba (renderizan PNGs, sin clientes) que no deberían estar expuestos en el
// sitio en vivo. Se pueden habilitar puntualmente con ENABLE_PLACAS_DEV=1.
export function blockPlacasDevInProd(): NextResponse | null {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PLACAS_DEV !== '1') {
    return new NextResponse('Not found', { status: 404 })
  }
  return null
}

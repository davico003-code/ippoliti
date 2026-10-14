// POST /api/ronda/ingresar
//
// La primera vez que un colega entra a la Ronda: elige su inmobiliaria (o la
// registra con el matriculado a cargo) y carga su nombre y su WhatsApp. Devuelve
// el pase firmado que queda en su teléfono. Con un pase previo, actualiza sus
// datos y sus publicaciones vigentes lo siguen.

import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { nanoid } from 'nanoid'
import { rateLimit } from '@/lib/feedback'
import { actualizarContacto, crearInmobiliaria, guardarAgente, inmobiliariaPorId } from '@/lib/ronda/almacen'
import { normalizarWhatsapp, type Inmobiliaria } from '@/lib/ronda/reglas'
import { firmarSesion, ipDe, sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const limpio = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
const error = (mensaje: string, status = 400) => NextResponse.json({ error: mensaje }, { status })

export async function POST(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return error('Datos inválidos.')
  }

  if (!(await rateLimit(ipDe(req), 'ronda-ingresar', 12, 600))) {
    return error('Demasiados intentos. Probá de nuevo en unos minutos.', 429)
  }

  const nombre = limpio(body.nombre, 60)
  if (nombre.length < 3 || !/[a-záéíóúñ]/i.test(nombre)) return error('Escribí tu nombre y apellido.')

  const whatsapp = normalizarWhatsapp(body.whatsapp)
  if (!whatsapp) return error('Escribí tu WhatsApp con característica, sin 0 y sin 15. Ejemplo: 3413340916')

  try {
    let inmobiliaria: Inmobiliaria | null
    const elegida = limpio(body.inmobiliariaId, 40)
    if (elegida) {
      inmobiliaria = await inmobiliariaPorId(elegida)
      if (!inmobiliaria) return error('Esa inmobiliaria ya no está en la lista. Elegila de nuevo.', 404)
    } else {
      const nueva = (body.inmobiliaria ?? {}) as Record<string, unknown>
      const datos = {
        nombre: limpio(nueva.nombre, 80),
        matriculado: limpio(nueva.matriculado, 80),
        matricula: limpio(nueva.matricula, 40),
      }
      if (datos.nombre.length < 2) return error('Escribí el nombre de tu inmobiliaria.')
      if (datos.matriculado.length < 3) return error('Escribí el nombre del matriculado a cargo.')
      if (!datos.matricula) return error('Escribí el número de matrícula.')
      inmobiliaria = await crearInmobiliaria(datos)
    }

    const previa = sesionDe(req)
    const agente = { id: previa?.aid ?? nanoid(12), nombre, whatsapp }
    await guardarAgente({ ...agente, inmobiliariaId: inmobiliaria.id, alta: Date.now() })
    if (previa) await actualizarContacto(agente)

    const { id, nombre: nombreInmo, matriculado, matricula } = inmobiliaria
    return NextResponse.json({
      token: firmarSesion({ aid: agente.id, iid: id, nombre, whatsapp }),
      agente,
      inmobiliaria: { id, nombre: nombreInmo, matriculado, matricula },
    })
  } catch {
    return error('No se pudieron guardar tus datos. Probá de nuevo.', 503)
  }
}

// POST /api/ronda/pedidos — publica un pedido de búsqueda (David, 16-oct-2026):
// qué busca el cliente de un colega, dónde, con qué presupuesto y cómo puede
// cerrar. Dura 30 días; hasta 5 por inmobiliaria. La lista sale con la grilla
// (GET /api/ronda/publicaciones), ya cruzada con las oportunidades.

import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { guardarPedido, inmobiliariaPorId, limpiarPedidosVencidos, listarPedidos } from '@/lib/ronda/almacen'
import { DIA_MS, DIAS_PUBLICACION, leerPedido, MAX_PEDIDOS_POR_INMOBILIARIA, type Pedido } from '@/lib/ronda/reglas'
import { ciudadesDe, salaDe } from '@/lib/ronda/sala'
import { sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const error = (mensaje: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error: mensaje, ...extra }, { status })

export async function POST(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado
  const sesion = sesionDe(req)
  if (!sesion) return error('Primero cargá tus datos para entrar a la ronda.', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return error('Datos inválidos.')
  }
  const sala = salaDe(req)
  const leido = leerPedido(body, ciudadesDe(sala))
  if ('error' in leido) return error(leido.error)

  try {
    const inmobiliaria = await inmobiliariaPorId(sesion.iid)
    if (!inmobiliaria) return error('Tu inmobiliaria ya no está en la lista. Volvé a cargar tus datos.', 401)
    await limpiarPedidosVencidos(sala)
    const vigentes = await listarPedidos(true, sala)
    // En una sala el tope es por agente (2 búsquedas cada uno, instructivo de la reunión).
    if (sala && vigentes.filter((p) => p.agente.id === sesion.aid).length >= sala.maxPedidosPorAgente) {
      return error(`Ya presentaste ${sala.maxPedidosPorAgente} búsquedas, que es el máximo de esta ronda. Eliminá una para presentar otra.`, 409, { limite: true })
    }
    const suyos = vigentes.filter((p) => p.inmobiliaria.id === inmobiliaria.id)
    if (!sala && suyos.length >= MAX_PEDIDOS_POR_INMOBILIARIA) {
      return error(`Tu inmobiliaria ya tiene ${MAX_PEDIDOS_POR_INMOBILIARIA} pedidos en la ronda. Eliminá uno para publicar otro.`, 409, { limite: true })
    }
    const ahora = Date.now()
    const pedido: Pedido = {
      id: nanoid(10),
      ...leido.pedido,
      agente: { id: sesion.aid, nombre: sesion.nombre, whatsapp: sesion.whatsapp },
      inmobiliaria: { id: inmobiliaria.id, nombre: inmobiliaria.nombre, matriculado: inmobiliaria.matriculado, matricula: inmobiliaria.matricula },
      creada: ahora,
      vence: ahora + DIAS_PUBLICACION * DIA_MS,
    }
    await guardarPedido(pedido, sala)
    return NextResponse.json({ pedido }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return error('No se pudo publicar el pedido. Probá de nuevo.', 503)
  }
}

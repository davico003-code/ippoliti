import { NextResponse } from 'next/server'
import { getSeleccion, getReacciones } from '@/lib/redis'

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const session = await getSeleccion(params.token)
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const reactions = await getReacciones(params.token)
  return NextResponse.json({ session, reactions })
}

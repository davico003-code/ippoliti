import { NextResponse } from 'next/server'
import { patchReaccion } from '@/lib/redis'

export async function PATCH(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { propertyId, liked, wantVisit, comment } = await req.json()
    if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

    await patchReaccion(params.token, propertyId, { liked, wantVisit, comment })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

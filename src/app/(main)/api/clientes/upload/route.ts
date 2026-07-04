import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { assertTeamCode } from '@/lib/team-auth'

// Solo imágenes: evita que se suban SVG con script u otros tipos arbitrarios a
// un blob público servido desde el dominio propio.
const MIME_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])

export async function POST(req: Request) {
  const denied = assertTeamCode(req)
  if (denied) return denied
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    if (!MIME_PERMITIDOS.has(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido (solo imágenes)' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen es muy grande, máximo 5MB' }, { status: 400 })
    }

    const blob = await put(`clientes/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json({ error: 'Algo salió mal, intentá de nuevo' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

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

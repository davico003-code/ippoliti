import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { redis } from '@/lib/redis'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'
const BASE_URL = 'https://siinmobiliaria.com'
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'multipart inválido' }, { status: 400 })
  }

  const slug = String(form.get('slug') ?? '').trim()
  const file = form.get('file')
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })
  if (!(file instanceof File)) return NextResponse.json({ error: 'Falta file' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Imagen supera 5MB' }, { status: 400 })
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const blob = await put(`blog-overrides/${slug}.${ext}`, file, {
    access: 'public',
    contentType: file.type,
    token: process.env.BLOG_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  })

  await redis.hset('blog:image_override', { [slug]: blob.url })

  const secret = process.env.REVALIDATE_SECRET
  if (secret) {
    try {
      await fetch(`${BASE_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ slug }),
      })
    } catch {
      /* no crítico */
    }
  }

  return NextResponse.json({ ok: true, url: blob.url })
}

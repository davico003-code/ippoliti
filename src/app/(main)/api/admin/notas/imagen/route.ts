import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { redis } from '@/lib/redis'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'
const BASE_URL = 'https://siinmobiliaria.com'
const MAX_BYTES = 5 * 1024 * 1024

// Portada OG estándar: 1.91:1, 1200×630, center-crop, WebP q80.
const OG_W = 1200
const OG_H = 630
const WEBP_QUALITY = 80

// Solo JPG/PNG de entrada (lo que pidió David). El output siempre es WebP.
const TIPOS_ACEPTADOS = ['image/jpeg', 'image/jpg', 'image/png']

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
  if (!TIPOS_ACEPTADOS.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se aceptan imágenes JPG o PNG' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Imagen supera 5MB' }, { status: 400 })
  }

  // Procesar con sharp: center-crop a 1200×630 (cover recorta el exceso desde
  // el centro) y convertir a WebP comprimido.
  let webp: Buffer
  try {
    const input = Buffer.from(await file.arrayBuffer())
    webp = await sharp(input)
      .rotate() // respeta orientación EXIF antes de recortar
      .resize(OG_W, OG_H, { fit: 'cover', position: 'centre' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la imagen' }, { status: 400 })
  }

  // Guardar en el store del blog. addRandomSuffix para invalidar la CDN cuando
  // David reemplaza la portada (cada subida es un objeto nuevo); el override en
  // Redis apunta siempre a la última URL.
  const blob = await put(`blog-overrides/${slug}.webp`, webp, {
    access: 'public',
    contentType: 'image/webp',
    token: process.env.BLOG_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  })

  // Mismo mecanismo de override que ya existe: prioridad sobre el hash de
  // afinidad semántica.
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

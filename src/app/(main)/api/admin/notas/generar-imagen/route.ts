import { NextResponse } from 'next/server'
import { list, type ListBlobResultBlob } from '@vercel/blob'
import { assertTeamCode } from '@/lib/team-auth'
import { posts as estaticos } from '@/lib/blog'
import { elegirPortadaReal, type DatosPortada } from '@/agents/blog/writer/elegir-portada'

export const dynamic = 'force-dynamic'
// Elegir + bajar + optimizar la foto tarda unos segundos.
export const maxDuration = 60

interface NotaBlob {
  titulo: string
  slug: string
  bajada?: string
  imagen_sugerida?: string
  categoria?: string
}

// Mismo lookup que /api/admin/notas/editar: pathname determinístico en el
// store del blog.
async function findBlob(slug: string): Promise<ListBlobResultBlob | null> {
  const token = process.env.BLOG_READ_WRITE_TOKEN
  const path = `blog-posts/${slug}.json`
  let cursor: string | undefined
  do {
    const result = await list({ prefix: path, cursor, token })
    const exact = result.blobs.find((b) => b.pathname === path)
    if (exact) return exact
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)
  return null
}

// POST { slug } → elige otra portada real del banco de fotos y la deja como
// override (misma prioridad que la subida manual). Sirve para dinámicas Y estáticas: en ambos
// casos el override pisa la imagen por defecto en el display.
export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let body: { slug?: string; fotoId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const slug = (body.slug ?? '').trim()
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  let datos: DatosPortada | null = null

  const blob = await findBlob(slug)
  if (blob) {
    try {
      const res = await fetch(blob.url, { cache: 'no-store' })
      if (res.ok) {
        const nota = (await res.json()) as NotaBlob
        datos = {
          slug,
          titulo: nota.titulo,
          imagen_sugerida: nota.imagen_sugerida,
          bajada: nota.bajada,
          categoria: nota.categoria,
        }
      }
    } catch {
      /* cae al 500 de abajo */
    }
    if (!datos) return NextResponse.json({ error: 'No se pudo leer la nota' }, { status: 500 })
  } else {
    const est = estaticos.find((p) => p.slug === slug)
    if (!est) return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
    datos = { slug, titulo: est.title, bajada: est.summary, categoria: est.category }
  }

  // fotoId: foto puntual del banco (backfill curado a mano); sin él la elige Claude.
  const resultado = await elegirPortadaReal(datos, { fotoId: body.fotoId?.trim() || undefined })
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, url: resultado.url })
}

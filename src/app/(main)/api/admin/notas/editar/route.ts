import { NextResponse } from 'next/server'
import { list, put, type ListBlobResultBlob } from '@vercel/blob'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'
const BASE_URL = 'https://siinmobiliaria.com'

// Solo se editan notas DINÁMICAS (las que viven en el Blob blog-posts/).
// Las estáticas (lib/blog.ts) son código y no se tocan desde el panel.
// El registro guarda el contenido como markdown en contenido_markdown.

interface NotaBlob {
  titulo: string
  slug: string
  meta_description: string
  bajada: string
  contenido_markdown: string
  [k: string]: unknown
}

async function findBlob(slug: string): Promise<ListBlobResultBlob | null> {
  const token = process.env.BLOG_READ_WRITE_TOKEN
  const path = `blog-posts/${slug}.json`
  // El pathname es determinístico, pero puede tener sufijo de versión; filtramos
  // por prefijo exacto del slug.
  let cursor: string | undefined
  do {
    const result = await list({ prefix: path, cursor, token })
    const exact = result.blobs.find((b) => b.pathname === path)
    if (exact) return exact
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)
  return null
}

async function fetchNota(blob: ListBlobResultBlob): Promise<NotaBlob | null> {
  try {
    const res = await fetch(blob.url, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as NotaBlob
  } catch {
    return null
  }
}

async function revalidar(slug: string) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return
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

// GET ?slug= → devuelve los campos editables de la nota.
export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const slug = new URL(req.url).searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  const blob = await findBlob(slug)
  if (!blob) {
    return NextResponse.json(
      { error: 'No es una nota dinámica editable (las estáticas viven en código)' },
      { status: 404 },
    )
  }
  const nota = await fetchNota(blob)
  if (!nota) return NextResponse.json({ error: 'No se pudo leer la nota' }, { status: 500 })

  return NextResponse.json({
    ok: true,
    slug: nota.slug,
    titulo: nota.titulo,
    meta_description: nota.meta_description ?? '',
    bajada: nota.bajada ?? '',
    contenido_markdown: nota.contenido_markdown ?? '',
  })
}

// POST { slug, contenido_markdown, titulo?, meta_description?, bajada? }
// Persiste sobre el MISMO registro (mismo slug, misma fecha de publicación).
export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let body: {
    slug?: string
    contenido_markdown?: string
    titulo?: string
    meta_description?: string
    bajada?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const slug = (body.slug ?? '').trim()
  const contenido = (body.contenido_markdown ?? '').trim()
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })
  // Validación mínima para no romper el render: contenido no vacío.
  if (contenido.length < 50) {
    return NextResponse.json({ error: 'El contenido es demasiado corto' }, { status: 400 })
  }

  const blob = await findBlob(slug)
  if (!blob) {
    return NextResponse.json({ error: 'Nota dinámica no encontrada' }, { status: 404 })
  }
  const nota = await fetchNota(blob)
  if (!nota) return NextResponse.json({ error: 'No se pudo leer la nota' }, { status: 500 })

  // Merge: se actualiza contenido y, si vienen, título/meta/bajada. Todo lo
  // demás (slug, fecha_publicacion, cta, keywords, imagen) se conserva.
  const actualizada: NotaBlob = {
    ...nota,
    contenido_markdown: contenido,
    ...(body.titulo?.trim() ? { titulo: body.titulo.trim() } : {}),
    ...(body.meta_description?.trim() ? { meta_description: body.meta_description.trim() } : {}),
    ...(body.bajada?.trim() ? { bajada: body.bajada.trim() } : {}),
  }

  // Re-put en el MISMO pathname (overwrite); mismo store del blog.
  await put(`blog-posts/${slug}.json`, JSON.stringify(actualizada), {
    access: 'public',
    contentType: 'application/json',
    token: process.env.BLOG_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  await revalidar(slug)
  return NextResponse.json({ ok: true, slug })
}

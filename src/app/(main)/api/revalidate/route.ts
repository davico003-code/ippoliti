import { revalidatePath, revalidateTag } from 'next/cache'
import {
  CACHE_TAG_LISTA,
  CACHE_TAG_DETALLE,
  CACHE_TAG_LISTA_ESTABLE,
  cacheTagPropiedad,
} from '@/lib/tokko'

export const dynamic = 'force-dynamic'

const DEFAULT_PATHS = ['/', '/propiedades', '/emprendimientos']
const DEFAULT_TAGS = [CACHE_TAG_LISTA]
// Sin propertyId (ni slug de blog, ni tags explícitos) el pedido es "refrescá
// todo": ahí sí caen todas las fichas. Con propertyId —lo que manda HILO en
// cada edición— cae el listado y SOLO la ficha de esa propiedad.
const TAGS_TODO = [CACHE_TAG_LISTA, CACHE_TAG_DETALLE, CACHE_TAG_LISTA_ESTABLE]

type Body = {
  paths?: string[]
  tags?: string[]
  propertyId?: string | number
  slug?: string
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  const header = req.headers.get('x-revalidate-secret')
  if (header === secret) return true
  return false
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body = {}
  try {
    body = (await req.json()) as Body
  } catch {
    body = {}
  }

  const tienePropiedad =
    body.propertyId !== undefined && body.propertyId !== null && String(body.propertyId).length > 0
  const pathsRaw = body.paths?.length ? body.paths : DEFAULT_PATHS
  const tagsRaw = body.tags?.length
    ? body.tags
    : tienePropiedad || body.slug
      ? DEFAULT_TAGS
      : TAGS_TODO

  const extraPaths: string[] = []
  const extraTags: string[] = []
  if (tienePropiedad) {
    extraPaths.push(`/propiedades/${body.propertyId}`)
    extraTags.push(cacheTagPropiedad(body.propertyId as string | number))
  }
  // Compat blog: si vino slug, revalida la página de blog
  if (body.slug) {
    extraPaths.push('/blog', `/blog/${body.slug}`)
    extraTags.push('blog-posts')
  }

  const dedupe = (xs: string[]) => Array.from(new Set(xs))
  const paths = dedupe([...pathsRaw, ...extraPaths])
  const tags = dedupe([...tagsRaw, ...extraTags])

  const errors: string[] = []
  for (const p of paths) {
    try {
      revalidatePath(p)
    } catch (e) {
      errors.push(`path ${p}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  for (const t of tags) {
    try {
      revalidateTag(t)
    } catch (e) {
      errors.push(`tag ${t}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  if (errors.length > 0) {
    return Response.json(
      { revalidated: false, errors, paths, tags },
      { status: 500 },
    )
  }

  return Response.json({
    revalidated: true,
    paths,
    tags,
    propertyId: body.propertyId ?? null,
    slug: body.slug ?? null,
    timestamp: new Date().toISOString(),
  })
}

import { revalidatePath, revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

const DEFAULT_PATHS = ['/', '/propiedades', '/emprendimientos']
const DEFAULT_TAGS = ['tokko-properties']

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

  const pathsRaw = body.paths?.length ? body.paths : DEFAULT_PATHS
  const tagsRaw = body.tags?.length ? body.tags : DEFAULT_TAGS

  const extraPaths: string[] = []
  const extraTags: string[] = []
  if (body.propertyId !== undefined && body.propertyId !== null && String(body.propertyId).length > 0) {
    extraPaths.push(`/propiedades/${body.propertyId}`)
    extraTags.push(`tokko-property-${body.propertyId}`)
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

import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

const SITE = 'https://siinmobiliaria.com';

/** Convierte una ruta de imagen relativa ("/blog/...") en URL absoluta. */
function absImage(image: string | undefined): string | null {
  if (!image) return null;
  if (/^https?:\/\//.test(image)) return image;
  return `${SITE}${image.startsWith('/') ? '' : '/'}${image}`;
}

/**
 * Feed JSON público de las últimas notas publicadas del blog. Lo consume Hilo
 * (meethilo.com) para armar los emails de "nota del blog". Reusa getAllPosts()
 * (ya oculta borradas y programadas y ordena por fecha desc).
 *   GET /api/blog/feed?limit=20
 */
export async function GET(req: Request): Promise<Response> {
  const limit = Math.min(Math.max(Number(new URL(req.url).searchParams.get('limit') ?? 20) || 20, 1), 50);
  const posts = (await getAllPosts()).slice(0, limit).map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    image: absImage(p.image),
    url: `${SITE}/blog/${p.slug}`,
    date: p.date,
    publishAt: p.publishAt ?? null,
    category: p.category ?? null,
  }));
  return Response.json(
    { posts },
    { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
}
